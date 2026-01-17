import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createRealtimeClient } from "../services/realtime";
import { requestMic, type MicStatus } from "../services/mic";
import { SessionRecorder } from "../services/recorder";
import { TranscriptView } from "../components/TranscriptView";
import { type SessionAlert } from "../components/SessionAlerts";
import { AlertStack, type Alert } from "../components/AlertStack";
import { StatusBar } from "../components/StatusBar";
import { Button } from "../components/ui/Button";
import { API_BASE, DEMO_USER } from "../config";

type Topic = { id: string; title: string; difficulty?: string | null; prompt_hint?: string | null };
type Session = { id: string; topic_id: string; status: string };

export default function SessionPage() {
  const [searchParams] = useSearchParams();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<string>();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState<{ speaker: string; text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorderReady, setRecorderReady] = useState(false);
  const [alerts, setAlerts] = useState<SessionAlert[]>([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [micStatus, setMicStatus] = useState<MicStatus>("idle");
  const [tokenStatus, setTokenStatus] = useState<"idle" | "valid" | "refreshing" | "error">("idle");
  const recorderRef = useRef<SessionRecorder | null>(null);
  const realtimeRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/topics`)
      .then((r) => r.json())
      .then(setTopics)
      .then(() => pushLog("Topics loaded"))
      .catch(() => {
        setError("Failed to load topics");
        pushLog("Failed to load topics");
      });
  }, []);

  useEffect(() => {
    const topicFromUrl = searchParams.get("topicId");
    if (topicFromUrl && topics.length > 0 && !selected) {
      const exists = topics.some((t) => t.id === topicFromUrl);
      if (exists) {
        setSelected(topicFromUrl);
        pushLog(`Preselected topic from link: ${topicFromUrl}`);
      }
    }
  }, [searchParams, topics, selected]);

  function pushLog(message: string) {
    setLog((prev) => [...prev, message]);
    console.info("[session]", message);
  }

  function upsertAlert(alert: SessionAlert) {
    setAlerts((prev) => {
      const filtered = prev.filter((a) => a.type !== alert.type);
      return [...filtered, alert];
    });
  }

  function clearAlert(type?: SessionAlert["type"]) {
    if (!type) {
      setAlerts([]);
    } else {
      setAlerts((prev) => prev.filter((a) => a.type !== type));
    }
  }

  function showNetworkAlert() {
    upsertAlert({
      type: "network",
      message: "Network connection lost. Retry connection or end to save.",
      actions: [
        { label: "Retry connection", onClick: retryConnection },
        { label: "End and save", onClick: endSession }
      ]
    });
  }

  function showTokenAlert() {
    upsertAlert({
      type: "token",
      message: "Realtime token expired. Refresh to continue or end to save.",
      actions: [
        { label: "Retry connection", onClick: retryConnection },
        { label: "End and save", onClick: endSession }
      ]
    });
  }

  function showMicAlert() {
    upsertAlert({
      type: "mic",
      message: "Microphone permission required. Please allow access and retry.",
      actions: [{ label: "Retry mic", onClick: startSession }]
    });
  }

  useEffect(() => {
    function handleOffline() {
      setIsOffline(true);
      showNetworkAlert();
    }
    function handleOnline() {
      setIsOffline(false);
      clearAlert("network");
    }
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [session]);

  async function retryConnection() {
    pushLog("Retrying connection");
    if (!session || !realtimeRef.current) {
      pushLog("Retry skipped: missing session or realtime client");
      return;
    }
    setStatus("connecting");
    setTokenStatus("refreshing");
    try {
      await realtimeRef.current.refresh(true);
      clearAlert("network");
      clearAlert("token");
      pushLog("Realtime connection refreshed");
      setStatus("listening");
      setTokenStatus("valid");
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown retry error";
      setError("Connection retry failed");
      pushLog(`Retry failed: ${message}`);
      showNetworkAlert();
      setTokenStatus("error");
    }
  }

  async function startSession() {
    setError(null);
    setRecorderReady(false);
    clearAlert();
    if (!selected) {
      setError("Select a topic");
      pushLog("Start aborted: no topic selected");
      return;
    }
    if (isOffline || !navigator.onLine) {
      setError("Network connection lost");
      showNetworkAlert();
      return;
    }
    const micPermission = await requestMic();
    setMicStatus(micPermission);
    if (micPermission !== "granted") {
      setError("Microphone permission required");
      pushLog("Mic permission denied");
      showMicAlert();
      return;
    }
    clearAlert("mic");
    let media: MediaStream | null = null;
    try {
      media = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(media);

      const res = await fetch(`${API_BASE}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": DEMO_USER
        },
        body: JSON.stringify({ topic_id: selected })
      });
      if (!res.ok) {
        throw new Error("Failed to create session");
      }
      const sess = await res.json();
      setSession(sess);
      pushLog(`Session created: ${sess.id}`);

      const client = createRealtimeClient(API_BASE, sess.id, DEMO_USER);
      setStatus("connecting");
      setTokenStatus("refreshing");
      realtimeRef.current = client;
      await client.start();
      clearAlert("token");
      clearAlert("network");
      setTokenStatus("valid");

      const recorder = new SessionRecorder();
      recorderRef.current = recorder;
      await recorder.start(media);

      setRecorderReady(true);
      pushLog("Realtime client started and recording began");
      setStatus("listening");
    } catch (err) {
      media?.getTracks().forEach((t) => t.stop());
      setStream(null);
      recorderRef.current = null;
      realtimeRef.current = null;
      setSession(null);
      setStatus("error");
      setTokenStatus("error");
      const message = err instanceof Error ? err.message : "Unknown start error";
      setError("Failed to start session");
      pushLog(`Start failed: ${message}`);
      if (!navigator.onLine || isOffline) {
        showNetworkAlert();
      } else {
        showTokenAlert();
      }
    }
  }

  async function endSession() {
    if (!session) return;
    setError(null);
    setStatus("ending");
    setTokenStatus("refreshing");
    clearAlert("mic");
    const rec = recorderRef.current;
    if (!rec) {
      setError("Recorder not started");
      pushLog("End failed: recorder missing");
      return;
    }
    const recording = await rec.stop();
    setRecorderReady(false);
    stream?.getTracks().forEach((t) => t.stop());
    pushLog("Recording stopped");

    const form = new FormData();
    form.append("file", recording.blob, "audio.webm");
    form.append("duration_seconds", Math.round(recording.durationMs / 1000).toString());
    const uploadRes = await fetch(`${API_BASE}/api/sessions/${session.id}/upload`, {
      method: "POST",
      headers: { "x-user-id": DEMO_USER },
      body: form
    }).catch(() => setError("Upload failed"));

    if (!uploadRes || !uploadRes.ok) {
      setError("Upload failed");
      pushLog("Upload failed");
      setStatus("error");
      setTokenStatus("error");
      showNetworkAlert();
      return;
    }

    let audioUrl: string | null = null;
    try {
      const uploadJson = await uploadRes.json();
      audioUrl = uploadJson.storage_url || uploadJson.audio_url || null;
      pushLog(`Audio uploaded: ${audioUrl ?? "no url"}`);
    } catch (err) {
      pushLog("Upload response parse failed");
    }
    if (!audioUrl) {
      pushLog("Upload response missing audio URL; finalizing without audio reference");
    }

    const finalizeRes = await fetch(`${API_BASE}/api/sessions/${session.id}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": DEMO_USER },
      body: JSON.stringify({
        transcript: [],
        status: "ended",
        duration_seconds: Math.round(recording.durationMs / 1000),
        ...(audioUrl ? { audio_url: audioUrl } : {})
      })
    }).catch(() => setError("Finalize failed"));

    if (finalizeRes && finalizeRes.ok) {
      const data = await finalizeRes.json();
      setTranscript((data.transcript || []).map((s: any) => ({ speaker: s.speaker, text: s.text })));
      setStatus(data.status || "ended");
      clearAlert();
      setTokenStatus("valid");
      pushLog(
        `Session finalized and transcript received (${(data.transcript || []).length} segments)`
      );
    } else {
      setError("Finalize failed");
      setStatus("error");
      setTokenStatus("error");
      pushLog("Finalize failed");
      showNetworkAlert();
    }
  }

  const connectionState =
    status === "listening"
      ? "active"
      : status === "connecting"
      ? "connecting"
      : isOffline
      ? "recovering"
      : status === "error"
      ? "error"
      : "idle";

  const alertItems: Alert[] = alerts.map((a) => ({
    id: a.type,
    tone: a.type === "mic" ? "mic" : a.type === "token" ? "token" : "network",
    message: a.message,
    actions: a.actions
  }));

  const selectedTopic = topics.find((t) => t.id === selected);
  const topicTitleFromUrl = searchParams.get("topicTitle") || undefined;
  const topicDisplay = selectedTopic?.title || topicTitleFromUrl || "Select a topic";

  return (
    <div className="page page-session">
      <div className="page-header">
        <div>
          <p className="eyebrow">Session</p>
          <h2>Topic: {topicDisplay}</h2>
        </div>
        <div className="actions-inline">
          <Button onClick={startSession} disabled={status === "listening" || status === "connecting"}>
            Start Session
          </Button>
          <Button
            variant="secondary"
            onClick={endSession}
            disabled={!session || status === "ended" || !recorderReady}
          >
            End Session
          </Button>
        </div>
      </div>

      <div className="session-layout">
        <section className="session-main" aria-label="session controls and recording">
          <div className="control-row">
            <label htmlFor="topic">Topic</label>
            <select
              id="topic"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              aria-label="topic picker"
            >
              <option value="">Select…</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} {t.difficulty ? `(${t.difficulty})` : ""}
                </option>
              ))}
            </select>
          </div>

          <StatusBar
            status={{
              connection: connectionState,
              mic: micStatus,
              token: tokenStatus,
              info: status === "ending" ? "Finalizing…" : undefined
            }}
          />
          <div className="meta-row" aria-live="polite">
            <span>Status: {status}</span>
            <span>Mic: {micStatus}</span>
          </div>
          {error && (
            <p role="status" style={{ color: "var(--color-danger)", margin: 0 }}>
              {error}
            </p>
          )}

          <div className="recording-panel" aria-label="speech recording display">
            <span>Speech recording display</span>
          </div>
        </section>

        <aside className="session-side" aria-label="conversation and alerts">
          <div className="side-panel">
            <div className="section-title">Conversation log / transcript</div>
            <TranscriptView segments={transcript} />
          </div>
          <div className="side-panel">
            <div className="section-title">Alerts & Debug</div>
            <AlertStack alerts={alertItems} />
            <div className="debug-log" aria-label="debug-log">
              {log.length === 0 ? (
                <p style={{ margin: 0 }}>No events yet.</p>
              ) : (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {log.map((line, idx) => (
                    <li key={idx}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
