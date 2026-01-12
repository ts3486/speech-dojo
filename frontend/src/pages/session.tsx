import { useEffect, useState } from "react";
import { createRealtimeClient } from "../services/realtime";
import { requestMic } from "../services/mic";
import { SessionRecorder } from "../services/recorder";
import { TranscriptView } from "../components/TranscriptView";

type Topic = { id: string; title: string; difficulty?: string | null; prompt_hint?: string | null };
type Session = { id: string; topic_id: string; status: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const DEMO_USER = "00000000-0000-0000-0000-000000000001";

export default function SessionPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<string>();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState("idle");
  const [transcript, setTranscript] = useState<{ speaker: string; text: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const recorder = new SessionRecorder();

  useEffect(() => {
    fetch(`${API_BASE}/api/topics`)
      .then((r) => r.json())
      .then(setTopics)
      .catch(() => setError("Failed to load topics"));
  }, []);

  async function startSession() {
    setError(null);
    if (!selected) {
      setError("Select a topic");
      return;
    }
    const micStatus = await requestMic();
    if (micStatus !== "granted") {
      setError("Microphone permission required");
      return;
    }
    const media = await navigator.mediaDevices.getUserMedia({ audio: true });
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
      setError("Failed to create session");
      return;
    }
    const sess = await res.json();
    setSession(sess);

    const client = createRealtimeClient(API_BASE, sess.id);
    setStatus("connecting");
    await client.start();
    await recorder.start(media);
    setStatus("listening");
  }

  async function endSession() {
    if (!session) return;
    setStatus("ending");
    const recording = await recorder.stop();
    stream?.getTracks().forEach((t) => t.stop());

    const form = new FormData();
    form.append("file", recording.blob, "audio.webm");
    form.append("duration_seconds", Math.round(recording.durationMs / 1000).toString());
    await fetch(`${API_BASE}/api/sessions/${session.id}/upload`, {
      method: "POST",
      headers: { "x-user-id": DEMO_USER },
      body: form
    }).catch(() => setError("Upload failed"));

    const fakeTranscript = [{ speaker: "user", text: "Hello world", start_ms: 0, end_ms: recording.durationMs }];
    await fetch(`${API_BASE}/api/sessions/${session.id}/finalize`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-user-id": DEMO_USER },
      body: JSON.stringify({
        transcript: fakeTranscript,
        status: "ended",
        duration_seconds: Math.round(recording.durationMs / 1000),
        audio_url: null
      })
    }).catch(() => setError("Finalize failed"));

    setTranscript(fakeTranscript.map((s) => ({ speaker: s.speaker, text: s.text })));
    setStatus("ended");
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
        <button onClick={endSession} disabled={!session || status === "ended"}>
          End Session
        </button>
        <p>Status: {status}</p>
      </div>
      <section>
        <h3>Transcript</h3>
        <TranscriptView segments={transcript} />
      </section>
    </main>
  );
}
