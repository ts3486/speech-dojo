import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SessionDetailPage } from "../../src/pages/session-detail";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

describe("history detail parity", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders detail view with audio and transcript", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session: {
          id: "s1",
          topic_title: "Topic 1",
          start_time: "2024-01-01T00:00:00.000Z",
          status: "ended",
          privacy: "private",
          duration_seconds: 15,
          audio_url: "http://example.com/audio.webm",
          transcript: [{ speaker: "user", text: "Sample line" }]
        }
      })
    }) as any);

    renderWithProviders(
      <MemoryRouter initialEntries={["/sessions/s1"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", { name: /history detail/i })).toBeInTheDocument();
    expect(await screen.findByText(/sample line/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
  });

  it("shows error state when load fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    }) as any);

    renderWithProviders(
      <MemoryRouter initialEntries={["/sessions/s1"]}>
        <Routes>
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText(/failed to load session/i)).toBeInTheDocument();
  });
});
