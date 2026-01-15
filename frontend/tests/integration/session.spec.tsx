import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SessionPage from "../../src/pages/session";
import React from "react";
import "@testing-library/jest-dom";

const startRecorder = vi.fn();
const stopRecorder = vi.fn();
const startRealtime = vi.fn();

vi.mock("../../src/services/mic", () => ({
  requestMic: vi.fn().mockResolvedValue("granted")
}));

vi.mock("../../src/services/realtime", () => ({
  createRealtimeClient: vi.fn(() => ({
    start: startRealtime,
    stop: vi.fn(),
    finalize: vi.fn(),
    status: "idle"
  }))
}));

vi.mock("../../src/services/recorder", () => ({
  SessionRecorder: vi.fn().mockImplementation(() => ({
    start: startRecorder,
    stop: stopRecorder
  }))
}));

function setupFetchMocks() {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/api/topics")) {
      return Promise.resolve({ ok: true, json: async () => [{ id: "topic-1", title: "Topic One" }] } as any);
    }
    if (url.endsWith("/api/sessions") && init?.method === "POST") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: "session-1", topic_id: "topic-1", user_id: "user" })
      } as any);
    }
    if (url.includes("/api/realtime/session")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          client_secret: "secret-1",
          expires_at: new Date(Date.now() + 60_000).toISOString(),
          session_id: "session-1"
        })
      } as any);
    }
    if (url.endsWith("/upload")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ storage_url: "http://example.com/audio.webm" })
      } as any);
    }
    if (url.endsWith("/finalize")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          transcript: [{ speaker: "user", text: "hello world" }],
          status: "ended"
        })
      } as any);
    }
    return Promise.resolve({ ok: true, json: async () => ({}) } as any);
  });

  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  startRecorder.mockResolvedValue(undefined);
  stopRecorder.mockResolvedValue({ blob: new Blob(["abc"], { type: "audio/webm" }), durationMs: 1000 });
  startRealtime.mockResolvedValue(undefined);
  (navigator as any).mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] })
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("session flow", () => {
  it("starts and ends a session, showing transcript", async () => {
    const fetchMock = setupFetchMocks();

    render(<SessionPage />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const select = screen.getByLabelText(/topic picker/i) as HTMLSelectElement;
    await userEvent.selectOptions(select, "topic-1");

    await userEvent.click(screen.getByRole("button", { name: /start session/i }));
    await waitFor(() => expect(startRealtime).toHaveBeenCalled());

    await userEvent.click(screen.getByRole("button", { name: /end session/i }));
    await waitFor(() => expect(stopRecorder).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText(/hello world/i)).toBeInTheDocument()
    );

    expect(screen.getByLabelText(/session status/i)).toBeInTheDocument();

    // simulate offline to verify alert rendering
    window.dispatchEvent(new Event("offline"));
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent(/network connection lost/i)
    );
  });
});
