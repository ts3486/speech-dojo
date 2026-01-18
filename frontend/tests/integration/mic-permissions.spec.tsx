import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SessionPage from "../../src/pages/session";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import "@testing-library/jest-dom";

const startRecorder = vi.fn();
const stopRecorder = vi.fn();
const startRealtime = vi.fn();
const requestMicMock = vi.hoisted(() => vi.fn());

vi.mock("../../src/services/mic", () => ({
  requestMic: requestMicMock
}));

vi.mock("../../src/services/realtime", () => ({
  createRealtimeClient: vi.fn(() => ({
    start: startRealtime,
    stop: vi.fn(),
    finalize: vi.fn(),
    refresh: vi.fn(),
    status: "idle"
  }))
}));

vi.mock("../../src/services/recorder", () => ({
  SessionRecorder: vi.fn().mockImplementation(() => ({
    start: startRecorder,
    stop: stopRecorder
  }))
}));

function setupFetchMock() {
  const fetchMock = vi
    .fn()
    // topics
    .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: "topic-1", title: "Topic One" }]) })
    // create session
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "session-1", topic_id: "topic-1", user_id: "user" }) })
    // mint client secret
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        client_secret: "secret-1",
        expires_at: new Date(Date.now() + 60_000).toISOString(),
        session_id: "session-1"
      })
    })
    // upload
    .mockResolvedValueOnce({ ok: true, json: async () => ({ storage_url: "http://example.com/audio.webm" }) })
    // finalize
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        transcript: [{ speaker: "user", text: "mic ok" }],
        status: "ended"
      })
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

describe("mic permission handling", () => {
  it("prompts for mic retry when denied and succeeds on retry", async () => {
    const fetchMock = setupFetchMock();
    requestMicMock.mockResolvedValueOnce("denied").mockResolvedValueOnce("granted");

    render(
      <MemoryRouter>
        <SessionPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const select = screen.getByLabelText(/topic/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "topic-1" } });

    fireEvent.click(screen.getByText(/Start Session/));
    await waitFor(() => {
      const alerts = screen.getAllByText(/microphone permission required/i);
      expect(alerts.length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText(/Retry mic/i));
    await waitFor(() => expect(startRealtime).toHaveBeenCalled());
  });
});
