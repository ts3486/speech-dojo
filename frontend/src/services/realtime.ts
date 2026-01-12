type ClientSecretResponse = {
  client_secret: string;
  expires_at: string;
  session_id: string;
};

export type RealtimeStatus = "idle" | "connecting" | "listening" | "speaking" | "ended" | "error";

export interface RealtimeClient {
  status: RealtimeStatus;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  finalize: () => Promise<void>;
}

export async function fetchClientSecret(
  apiBase: string,
  sessionId: string,
  userId?: string
): Promise<ClientSecretResponse> {
  const res = await fetch(`${apiBase}/api/realtime/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {})
    },
    body: JSON.stringify({ session_id: sessionId })
  });
  if (!res.ok) {
    throw new Error("Failed to fetch client secret");
  }
  return res.json();
}

export function createRealtimeClient(apiBase: string, sessionId: string, userId?: string): RealtimeClient {
  let status: RealtimeStatus = "idle";

  return {
    get status() {
      return status;
    },
    async start() {
      status = "connecting";
      // Placeholder: integrate WebRTC + OpenAI Realtime here using client secret.
      const { client_secret } = await fetchClientSecret(apiBase, sessionId, userId);
      console.debug("Obtained client secret", client_secret);
      status = "listening";
    },
    async stop() {
      status = "ended";
    },
    async finalize() {
      status = "ended";
    }
  };
}
