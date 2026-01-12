import { useEffect, useState } from "react";
import { createRealtimeClient } from "../services/realtime";
import { requestMic } from "../services/mic";
import { SessionRecorder } from "../services/recorder";
import { TranscriptView } from "../components/TranscriptView";
import { useRef } from "react";
import { API_BASE, DEMO_USER } from "../config";

type Topic = { id: string; title: string; difficulty?: string | null; prompt_hint?: string | null };
type Session = { id: string; topic_id: string; status: string };

export default function SessionPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<string>();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState<{ speaker: string; text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recorderReady, setRecorderReady] = useState(false);
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

  function pushLog(message: string) {
    setLog((prev) => [...prev, message]);
    console.info("[session]", message);
  }

  async function startSession() {
    setError(null);
    setRecorderReady(false);
    if (!selected) {
      setError("Select a topic");
      pushLog("Start aborted: no topic selected");
      return;
    }
    const micStatus = await requestMic();
    if (micStatus !== "granted") {
      setError("Microphone permission required");
      pushLog("Mic permission denied");
      return;
    }
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
      realtimeRef.current = client;
      await client.start();

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
      const message = err instanceof Error ? err.message : "Unknown start error";
      setError("Failed to start session");
      pushLog(`Start failed: ${message}`);
    }
  }

  async function endSession() {
    if (!session) return;
    setStatus("ending");
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
      return;
    }

    let audioUrl: string | null = null;
    try {
      const uploadJson = await uploadRes.json();
      audioUrl = uploadJson.storage_url || null;
      pushLog(`Audio uploaded: ${audioUrl ?? "no url"}`);
    } catch (err) {
      pushLog("Upload response parse failed");
    }

    if (!audioUrl) {
      setError("Upload response missing audio URL");
      setStatus("error");
      pushLog("Finalize aborted: missing audio URL");
      return;
    }

    const finalizeRes = await fetch(`${API_BASE}/api/sessions/${session.id}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": DEMO_USER },
      body: JSON.stringify({
        transcript: [],
        status: "ended",
        duration_seconds: Math.round(recording.durationMs / 1000),
        audio_url: audioUrl
      })
    }).catch(() => setError("Finalize failed"));

    if (finalizeRes && finalizeRes.ok) {
      const data = await finalizeRes.json();
      setTranscript((data.transcript || []).map((s: any) => ({ speaker: s.speaker, text: s.text })));
      setStatus(data.status || "ended");
      pushLog("Session finalized and transcript received");
    } else {
      setError("Finalize failed");
      setStatus("error");
      pushLog("Finalize failed");
    }
  }

  return (
    <main>
      <h2>Realtime Session</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <label>
        Topic:
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          <option value="">Select…</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title} {t.difficulty ? `(${t.difficulty})` : ""}
            </option>
          ))}
        </select>
      </label>
      <div style={{ marginTop: "1rem" }}>
        <button onClick={startSession} disabled={status === "listening" || status === "connecting"}>
          Start Session
        </button>
        <button onClick={endSession} disabled={!session || status === "ended" || !recorderReady}>
          End Session
        </button>
        <p>Status: {status}</p>
      </div>
      <section>
        <h3>Transcript</h3>
        <TranscriptView segments={transcript} />
      </section>
      <section>
        <h3>Debug Log</h3>
        {log.length === 0 ? <p>No events yet.</p> : (
          <ul>
            {log.map((line, idx) => (
              <li key={idx}>{line}</li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
