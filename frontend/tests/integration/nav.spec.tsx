import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import "@testing-library/jest-dom";

function fetchMock() {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/topics")) {
      return Promise.resolve({
        ok: true,
        json: async () => []
      } as any);
    }
    if (url.includes("/api/sessions")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({ sessions: [] })
      } as any);
    }
    return Promise.resolve({
      ok: true,
      json: async () => ({})
    } as any);
  });
}

describe("navigation integration", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("navigates between Session and History routes", async () => {
    window.history.pushState({}, "", "/");
    const user = userEvent.setup();
    render(<App />);

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

    // back to home
    await user.click(screen.getByRole("link", { name: /^home$/i }));
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 1, name: /practice your speech/i })
      ).toBeInTheDocument()
    );
  });
});
