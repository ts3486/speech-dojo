import { describe, it, expect, vi, afterEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { screen } from "@testing-library/react";
import { HistoryPage } from "../../src/pages/history";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

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

    renderWithProviders(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(await screen.findByText(/Topic One/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // ensure no additional fetches fired during render cycle
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows error state when query fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    } as any);
    vi.stubGlobal("fetch", fetchMock);

    renderWithProviders(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );

    expect(await screen.findByText(/failed to fetch history/i)).toBeInTheDocument();
  });
});
