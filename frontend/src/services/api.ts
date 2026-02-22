import { API_BASE, DEMO_USER } from "../config";

export async function fetchTopics() {
  const res = await fetch(`${API_BASE}/api/topics`, {
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to load topics");
  return (await res.json()) ?? [];
}

export async function fetchSessions() {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to fetch history");
  const data = await res.json();
  return data.sessions || data || [];
}

export async function fetchSessionDetail(id: string) {
  const res = await fetch(`${API_BASE}/api/sessions/${id}`, {
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to load session");
  const data = await res.json();
  return data.session || data;
}

export interface AiFeedback {
  id: string;
  session_id: string;
  overall_score: number;
  clarity_score: number;
  fluency_score: number;
  structure_score: number;
  vocabulary_score: number;
  strengths: string;
  improvements: string;
  suggestions: string;
  created_at: string;
}

export async function fetchAiFeedback(sessionId: string): Promise<AiFeedback | null> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/feedback`, {
    headers: { "x-user-id": DEMO_USER }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load feedback");
  return res.json();
}

export async function generateAiFeedback(sessionId: string): Promise<AiFeedback> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/feedback`, {
    method: "POST",
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to generate feedback");
  return res.json();
}

export type PublicSessionListItem = {
  id: string;
  topic_title: string;
  topic_category?: string | null;
  start_time: string;
  duration_seconds?: number | null;
  speaker_tag: string;
  has_audio: boolean;
  has_transcript: boolean;
  like_count: number;
};

export type CommentItem = {
  id: string;
  speaker_tag: string;
  text: string;
  created_at: string;
};

export type PublicSessionDetail = {
  id: string;
  topic_id: string;
  topic_title: string;
  topic_category?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_seconds?: number | null;
  status: string;
  audio_url?: string | null;
  transcript: { speaker: string; text: string }[];
  speaker_tag: string;
  like_count: number;
  user_has_liked: boolean;
};

export async function fetchPublicSessions(): Promise<PublicSessionListItem[]> {
  const res = await fetch(`${API_BASE}/api/public/sessions`);
  if (!res.ok) throw new Error("Failed to load public sessions");
  const data = await res.json();
  return data.sessions || [];
}

export async function fetchPublicSessionDetail(id: string): Promise<PublicSessionDetail> {
  const res = await fetch(`${API_BASE}/api/public/sessions/${id}`, {
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to load session");
  const data = await res.json();
  return data.session || data;
}

export async function setSessionPrivacy(id: string, privacy: "public" | "private"): Promise<{ id: string; privacy: string }> {
  const res = await fetch(`${API_BASE}/api/sessions/${id}/privacy`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "x-user-id": DEMO_USER },
    body: JSON.stringify({ privacy })
  });
  if (!res.ok) throw new Error("Failed to update privacy");
  return res.json();
}

export async function toggleLike(sessionId: string): Promise<{ like_count: number; user_has_liked: boolean }> {
  const res = await fetch(`${API_BASE}/api/public/sessions/${sessionId}/like`, {
    method: "POST",
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to toggle like");
  return res.json();
}

export async function fetchComments(sessionId: string): Promise<CommentItem[]> {
  const res = await fetch(`${API_BASE}/api/public/sessions/${sessionId}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  const data = await res.json();
  return data.comments || [];
}

export async function postComment(sessionId: string, text: string): Promise<CommentItem> {
  const res = await fetch(`${API_BASE}/api/public/sessions/${sessionId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-user-id": DEMO_USER },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error("Failed to post comment");
  return res.json();
}

export async function deleteComment(sessionId: string, commentId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/public/sessions/${sessionId}/comments/${commentId}`, {
    method: "DELETE",
    headers: { "x-user-id": DEMO_USER }
  });
  if (!res.ok) throw new Error("Failed to delete comment");
}
