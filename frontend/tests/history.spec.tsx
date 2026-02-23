import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "./utils";

// Override for session-detail test that needs useParams
const mockUseParams = vi.fn().mockReturnValue({});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/history",
  useParams: () => mockUseParams(),
  useSearchParams: () => new URLSearchParams(),
}));

import HistoryPage from "../app/history/page";
import SessionDetailRoute from "../app/sessions/[id]/page";

afterEach(() => {
  vi.restoreAllMocks();
  mockUseParams.mockReturnValue({});
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

    renderWithProviders(<HistoryPage />);

    await waitFor(() => expect(screen.getByText(/Topic One/)).toBeInTheDocument());
    expect(screen.getByRole("heading", { name: /^history$/i })).toBeInTheDocument();
  });

  it("shows empty state when no sessions", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: [] })
    } as any);
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<HistoryPage />);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/No sessions yet/i));
  });

  it("shows session detail with audio and transcript", async () => {
    mockUseParams.mockReturnValue({ id: "session-2" });
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

    renderWithProviders(<SessionDetailRoute />);

    await waitFor(() => expect(screen.getByText(/Topic Two/)).toBeInTheDocument());
    expect(screen.getByText(/hello/)).toBeInTheDocument();
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
  });
});
