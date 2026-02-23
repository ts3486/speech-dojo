import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/sessions/s1",
  useParams: () => ({ id: "s1" }),
  useSearchParams: () => new URLSearchParams(),
}));

import SessionDetailRoute from "../../app/sessions/[id]/page";

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

    renderWithProviders(<SessionDetailRoute />);

    expect(await screen.findByText(/Sample line/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
  });

  it("shows error state when load fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({})
    }) as any);

    renderWithProviders(<SessionDetailRoute />);

    expect(await screen.findByText(/failed to load session/i)).toBeInTheDocument();
  });
});
