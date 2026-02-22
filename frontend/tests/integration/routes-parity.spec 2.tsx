import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

function makeFetchMock() {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/topics")) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: "t1", title: "Topic 1" }]
      } as any);
    }
    if (url.match(/\/api\/sessions\/s1/)) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          session: {
            id: "s1",
            topic_title: "Topic 1",
            start_time: "2024-01-01T00:00:00.000Z",
            status: "ended",
            privacy: "private",
            duration_seconds: 12,
            audio_url: "http://example.com/audio.webm",
            transcript: [{ speaker: "user", text: "Hello world" }]
          }
        })
      } as any);
    }
    if (url.includes("/api/sessions")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          sessions: [
            {
              id: "s1",
              topic_title: "Topic 1",
              start_time: "2024-01-01T00:00:00.000Z",
              status: "ended",
              privacy: "private",
              duration_seconds: 12,
              has_audio: true,
              has_transcript: true
            }
          ]
        })
      } as any);
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({})
    } as any);
  });
}

describe("routes parity", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", makeFetchMock());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("walks Home → Session → History → History Detail without regressions", async () => {
    window.history.pushState({}, "", "/");
    const user = userEvent.setup();
    renderWithProviders(<App />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /practice your speech/i })
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /^session$/i }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /topic:/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole("link", { name: /^history$/i }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /^history$/i })).toBeInTheDocument()
    );

    await user.click(screen.getByRole("link", { name: /^open$/i }));
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: /history detail/i })).toBeInTheDocument()
    );
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/session audio player/i)).toBeInTheDocument();
  });
});
