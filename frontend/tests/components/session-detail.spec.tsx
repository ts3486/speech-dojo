import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

// Override useParams for this file to provide session ID
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/sessions/session-2",
  useParams: () => ({ id: "session-2" }),
  useSearchParams: () => new URLSearchParams(),
}));

// Must import AFTER vi.mock since vi.mock is hoisted
import SessionDetailRoute from "../../app/sessions/[id]/page";

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

    renderWithProviders(<SessionDetailRoute />);

    await waitFor(() => expect(screen.getByText(/Topic Two/)).toBeInTheDocument());
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
    expect(screen.getByText(/hello detail/i)).toBeInTheDocument();
  });
});
