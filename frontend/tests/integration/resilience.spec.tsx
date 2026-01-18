import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { act } from "react";
import SessionPage from "../../src/pages/session";
import { MemoryRouter } from "react-router-dom";
import React from "react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

const startRecorder = vi.fn();
const stopRecorder = vi.fn();
const startRealtime = vi.fn();
const refreshRealtime = vi.fn();
const requestMicMock = vi.hoisted(() => vi.fn());

let online = true;

vi.mock("../../src/services/mic", () => ({
  requestMic: requestMicMock
}));

vi.mock("../../src/services/realtime", () => ({
  createRealtimeClient: vi.fn(() => ({
    start: startRealtime,
    stop: vi.fn(),
    finalize: vi.fn(),
    refresh: refreshRealtime,
    status: "listening"
  }))
}));

vi.mock("../../src/services/recorder", () => ({
  SessionRecorder: vi.fn().mockImplementation(() => ({
    start: startRecorder,
    stop: stopRecorder
  }))
}));

function setupFetchMock() {
  const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    const method = (init?.method || "GET").toUpperCase();

    if (url.includes("/api/topics") && method === "GET") {
      return Promise.resolve({ ok: true, json: async () => [{ id: "topic-1", title: "Topic One" }] } as any);
    }
    if (url.endsWith("/api/sessions") && method === "POST") {
      return Promise.resolve({
        ok: true,
        json: async () => ({ id: "session-1", topic_id: "topic-1", user_id: "user" })
      } as any);
    }
    if (url.includes("/api/realtime/session") && method === "POST") {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          client_secret: "secret-1",
          expires_at: new Date(Date.now() + 120_000).toISOString(),
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
          transcript: [{ speaker: "user", text: "hello recovered" }],
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
  requestMicMock.mockResolvedValue("granted");
  startRecorder.mockResolvedValue(undefined);
  stopRecorder.mockResolvedValue({ blob: new Blob(["abc"], { type: "audio/webm" }), durationMs: 1000 });
  startRealtime.mockResolvedValue(undefined);
  refreshRealtime.mockResolvedValue(undefined);
  (navigator as any).mediaDevices = {
    getUserMedia: vi.fn().mockResolvedValue({ getTracks: () => [{ stop: vi.fn() }] })
  };
  online = true;
  vi.spyOn(window.navigator, "onLine", "get").mockImplementation(() => online);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resilience flows", () => {
  it("handles network drop with retry and end-and-save path", async () => {
    const fetchMock = setupFetchMock();

    renderWithProviders(
      <MemoryRouter>
        <SessionPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByRole("option", { name: /topic one/i })).toBeInTheDocument()
    );
    const select = screen.getByLabelText(/topic/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "topic-1" } });

    fireEvent.click(screen.getByText(/Start Session/));
    await waitFor(() => expect(startRealtime).toHaveBeenCalled());
    await waitFor(() => expect(screen.getByText(/Status: listening/i)).toBeInTheDocument());

    // simulate offline drop
    await act(async () => {
      online = false;
      window.dispatchEvent(new Event("offline"));
    });

    await waitFor(() => expect(screen.getByText(/network connection lost/i)).toBeInTheDocument());

    // retry refresh
    const retryButton = screen.getByRole("button", { name: /Retry connection/i });
    fireEvent.click(retryButton);
    await waitFor(() => expect(refreshRealtime).toHaveBeenCalled());

    // end session still finalizes
    fireEvent.click(screen.getByText(/End Session/));
    await waitFor(() => expect(stopRecorder).toHaveBeenCalled());
    await waitFor(() =>
      expect(screen.getByText(/Session finalized and transcript received/i)).toBeInTheDocument()
    );
  });
});
