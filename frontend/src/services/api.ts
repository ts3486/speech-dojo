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
