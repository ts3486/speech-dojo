import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
  const fetchMock = vi.fn()
    // topics
    .mockResolvedValueOnce({ ok: true, json: async () => ([{ id: "topic-1", title: "Topic One" }]) })
    // create session
    .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "session-1", topic_id: "topic-1", user_id: "user" }) })
    // upload
    .mockResolvedValueOnce({ ok: true, json: async () => ({ storage_url: "http://example.com/audio.webm" }) })
    // finalize
    .mockResolvedValueOnce({ ok: true, json: async () => ({ transcript: [{ speaker: "user", text: "hello world" }], status: "ended" }) });

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
    const select = screen.getByLabelText(/Topic:/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "topic-1" } });

    fireEvent.click(screen.getByText(/Start Session/));
    await waitFor(() => expect(startRealtime).toHaveBeenCalled());

    fireEvent.click(screen.getByText(/End Session/));
    await waitFor(() => expect(stopRecorder).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/hello world/)).toBeInTheDocument());
  });
});
