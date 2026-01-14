type ClientSecretResponse = {
  client_secret: string;
  expires_at: string;
  session_id: string;
};

export type RealtimeStatus =
  | "idle"
  | "connecting"
  | "listening"
  | "speaking"
  | "recovering"
  | "ended"
  | "error";

export interface RealtimeClient {
  status: RealtimeStatus;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  finalize: () => Promise<void>;
  refresh: (forceRefresh?: boolean) => Promise<ClientSecretResponse | void>;
}

export async function fetchClientSecret(
  apiBase: string,
  sessionId: string,
  userId?: string,
  opts?: { forceRefresh?: boolean; status?: string }
): Promise<ClientSecretResponse> {
  const res = await fetch(`${apiBase}/api/realtime/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {})
    },
    body: JSON.stringify({
      session_id: sessionId,
      force_refresh: opts?.forceRefresh ?? false,
      ...(opts?.status ? { status: opts.status } : {})
    })
  });
  if (!res.ok) {
    throw new Error("Failed to fetch client secret");
  }
  return res.json();
}

export function createRealtimeClient(apiBase: string, sessionId: string, userId?: string): RealtimeClient {
  let status: RealtimeStatus = "idle";
  let currentSecret: ClientSecretResponse | null = null;

  async function mint(forceRefresh = false, statusOverride?: string) {
    currentSecret = await fetchClientSecret(apiBase, sessionId, userId, {
      forceRefresh,
      status: statusOverride
    });
    return currentSecret;
  }

  return {
    get status() {
      return status;
    },
    async start() {
      status = "connecting";
      currentSecret = await mint(false, "active");
      if (currentSecret) {
        console.debug("Obtained client secret", currentSecret.client_secret);
      }
      status = "listening";
    },
    async stop() {
      status = "ended";
    },
    async finalize() {
      status = "ended";
    },
    async refresh(forceRefresh = false) {
      status = "recovering";
      const refreshed = await mint(forceRefresh, "recovering");
      status = "listening";
      return refreshed;
    }
  };
}
