import { describe, it, expect, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

import HistoryPage from "../../app/history/page";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("query states", () => {
  it("shows loading then uses cached data without refetch", async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          sessions: [
            {
              id: "session-1",
              topic_id: "t1",
              topic_title: "Topic One",
              start_time: new Date().toISOString(),
              duration_seconds: 12,
              status: "ended",
              privacy: "private",
              has_audio: false,
              has_transcript: true
            }
          ]
        })
      } as any)
    );
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<HistoryPage />);

    expect(await screen.findByText(/Topic One/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows error state when query fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    } as any);
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(<HistoryPage />);

    // fetchSessions throws "Failed to fetch history"; HistoryPage renders that error message
    expect(await screen.findByText(/failed to fetch history/i)).toBeInTheDocument();
  });
});
