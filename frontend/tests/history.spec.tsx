import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HistoryPage } from "../src/pages/history";
import { SessionDetailPage } from "../src/pages/session-detail";
import React from "react";
import "@testing-library/jest-dom";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("history flows", () => {
  it("renders sessions list from API", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sessions: [
          {
            id: "session-1",
            topic_id: "topic-1",
            topic_title: "Topic One",
            start_time: new Date().toISOString(),
            duration_seconds: 12,
            status: "ended",
            privacy: "private",
            audio_url: null,
            has_audio: false,
            has_transcript: true
          }
        ]
      })
    } as any);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Topic One/)).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: /^history$/i })).toBeInTheDocument();
    expect(screen.getByText(/ended/i)).toBeInTheDocument();
  });

  it("shows empty state when no sessions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: [] })
    } as any);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/No sessions yet/i));
  });

  it("shows session detail with audio and transcript", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session: {
          id: "session-2",
          topic_title: "Topic Two",
          start_time: new Date().toISOString(),
          end_time: new Date().toISOString(),
          duration_seconds: 8,
          status: "ended",
          privacy: "private",
          audio_url: "http://example.com/audio.webm",
          transcript: [{ speaker: "user", text: "hello" }]
        }
      })
    } as any);
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MemoryRouter>
        <SessionDetailPage sessionId="session-2" onBack={() => {}} />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByText(/Topic Two/)).toBeInTheDocument());
    expect(screen.getByText(/hello/)).toBeInTheDocument();
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
  });
});
