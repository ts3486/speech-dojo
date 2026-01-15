import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { SessionDetailPage } from "../../src/pages/session-detail";
import "@testing-library/jest-dom";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SessionDetailPage", () => {
  it("renders audio player and transcript rows", async () => {
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
          transcript: [{ speaker: "user", text: "hello detail" }]
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
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
    expect(screen.getByText(/hello detail/i)).toBeInTheDocument();
  });
});
