'use client';

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createRealtimeClient } from "../../src/services/realtime";
import { requestMic, type MicStatus } from "../../src/services/mic";
import { SessionRecorder } from "../../src/services/recorder";
import { TranscriptView } from "../../src/components/TranscriptView";
import { type SessionAlert } from "../../src/components/SessionAlerts";
import { AlertStack, type Alert } from "../../src/components/AlertStack";
import { Button } from "../../src/components/ui/Button";
import { API_BASE, DEMO_USER } from "../../src/config";
import { fetchTopics, setSessionPrivacy } from "../../src/services/api";

type Topic = {
  id: string;
  title: string;
  difficulty?: string | null;
  prompt_hint?: string | null;
  category?: string | null;
  system_prompt?: string | null;
};
type Session = { id: string; topic_id: string; status: string };

function PlayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <polygon points="7,4 22,13 7,22" fill="currentColor" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2.5" fill="currentColor" />
    </svg>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className={`waveform${active ? " waveform--active" : ""}`} aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          className="waveform__bar"
          style={{ animationDelay: `${(i % 8) * 0.13}s` }}
        />
      ))}
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function SessionPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selected, setSelected] = useState<string>();
  const [mode, setMode] = useState<"solo" | "interactive">("solo");
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
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
  const [showDebug, setShowDebug] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [shareStatus, setShareStatus] = useState<"idle" | "sharing" | "shared" | "error">("idle");
  const recorderRef = useRef<SessionRecorder | null>(null);
  const realtimeRef = useRef<ReturnType<typeof createRealtimeClient> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    data: topics = [],
    error: topicsError
  } = useQuery<Topic[]>({
    queryKey: ["topics"],
    queryFn: fetchTopics,
    staleTime: 30_000
  });

  // Session timer
  useEffect(() => {
    if (status === "listening") {
      setElapsed(0);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (status === "idle") setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (topicsError) {
      setError((topicsError as Error).message);
      pushLog("Failed to load topics");
    }
  }, [topicsError]);

  useEffect(() => {
    if (topics.length > 0) {
      pushLog("Topics loaded");
    }
  }, [topics]);

  useEffect(() => {
    pushLog(`Session mode: ${mode}`);
  }, [mode]);

  useEffect(() => {
    const topicFromUrl = searchParams?.get("topicId");
    const modeFromUrl = searchParams?.get("mode");
    const promptFromUrl = searchParams?.get("systemPrompt");
    if (modeFromUrl === "interactive") setMode("interactive");
    if (promptFromUrl) setSystemPrompt(promptFromUrl);
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

  async function handleSharePublic() {
    if (!session) return;
    setShareStatus("sharing");
    try {
      await setSessionPrivacy(session.id, "public");
      setShareStatus("shared");
    } catch {
      setShareStatus("error");
    }
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
  const topicTitleFromUrl = searchParams?.get("topicTitle") || undefined;
  const topicDisplay = selectedTopic?.title || topicTitleFromUrl || null;
  const isSessionActive = status === "listening" || status === "connecting" || status === "ending";

  const transcriptEmptyMessage =
    status === "listening"
      ? "Your transcript will appear here after the session ends."
      : status === "connecting"
      ? "Connecting…"
      : "Start a session to see your transcript here.";

  return (
    <div className="page page-session">
      {/* Toast overlay for alerts */}
      {alertItems.length > 0 && (
        <div className="toast-overlay" role="region" aria-label="session alerts">
          <AlertStack alerts={alertItems} />
        </div>
      )}

      <div className="page-header">
        <div>
          <p className="eyebrow">Session</p>
          <h2>{topicDisplay ? `Topic: ${topicDisplay}` : "New Session"}</h2>
        </div>
      </div>

      <div className="session-layout">
        <section className="session-main" aria-label="session controls and recording">

          {/* Topic selector */}
          <div className="control-row">
            <label htmlFor="topic">Topic</label>
            {selected && topicDisplay ? (
              <div className="topic-readonly">
                <span className="topic-readonly__name">{topicDisplay}</span>
                {!isSessionActive && (
                  <button
                    type="button"
                    className="topic-readonly__change"
                    onClick={() => setSelected(undefined)}
                  >
                    Change
                  </button>
                )}
              </div>
            ) : (
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
            )}
          </div>

          {error && (
            <p role="status" className="text-danger m-0">
              {error}
            </p>
          )}

          {/* Recording panel */}
          <div className="recording-panel" aria-label="speech recording display">
            {(status === "idle" || status === "error") && (
              <div className="recording-idle">
                {!selected && <p>Select a topic above to get started</p>}
                <button
                  type="button"
                  className="record-btn record-btn--start"
                  onClick={startSession}
                  disabled={!selected}
                  aria-label="Start session"
                >
                  <PlayIcon />
                </button>
                {selected && <p className="record-btn-hint">Tap to start recording</p>}
              </div>
            )}
            {status === "connecting" && (
              <div className="connecting-dots">
                <div className="connecting-dots__row">
                  <div className="connecting-dot" />
                  <div className="connecting-dot" />
                  <div className="connecting-dot" />
                </div>
                <p>Connecting…</p>
              </div>
            )}
            {status === "listening" && (
              <div className="recording-active">
                <Waveform active />
                <div className="session-timer" aria-live="off">{formatTime(elapsed)}</div>
                <button
                  type="button"
                  className="record-btn record-btn--stop"
                  onClick={endSession}
                  disabled={!recorderReady}
                  aria-label="Stop and save session"
                >
                  <StopIcon />
                </button>
              </div>
            )}
            {status === "ending" && (
              <div className="recording-idle">
                <p>Finalizing your session…</p>
              </div>
            )}
            {status === "ended" && (
              <div className="recording-idle">
                <p>Session complete!</p>
                <div className="share-prompt">
                  <p className="share-prompt__title">Share your session?</p>
                  <p className="share-prompt__subtitle">Let the community hear your speech.</p>
                  <div className="share-prompt__actions">
                    {shareStatus === "shared" ? (
                      <span style={{ color: "var(--color-primary)", fontWeight: 600 }}>✓ Shared to Social Hub!</span>
                    ) : (
                      <Button
                        onClick={handleSharePublic}
                        disabled={shareStatus === "sharing"}
                        size="md"
                      >
                        {shareStatus !== "sharing" && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="11" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            <circle cx="11" cy="11.5" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            <circle cx="3" cy="7" r="1.5" stroke="currentColor" strokeWidth="1.4"/>
                            <line x1="4.3" y1="6.2" x2="9.7" y2="3.3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                            <line x1="4.3" y1="7.8" x2="9.7" y2="10.7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                          </svg>
                        )}
                        {shareStatus === "sharing" ? "Sharing…" : "Share to Social Hub"}
                      </Button>
                    )}
                    {session && (
                      <Button variant="secondary" onClick={() => router.push(`/sessions/${session.id}`)}>
                        View Session →
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <aside className="session-side" aria-label="conversation and alerts">
          <div className="side-panel">
            <div className="section-title">Transcript</div>
            <TranscriptView
              segments={transcript}
              emptyMessage={transcriptEmptyMessage}
            />
          </div>

          <div className="side-panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="section-title">Debug</div>
              <button
                type="button"
                className="debug-toggle"
                onClick={() => setShowDebug((v) => !v)}
                aria-expanded={showDebug}
              >
                {showDebug ? "Hide" : "Show"}
              </button>
            </div>
            {showDebug && (
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
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<div className="page page-session"><p>Loading…</p></div>}>
      <SessionPageContent />
    </Suspense>
  );
}
