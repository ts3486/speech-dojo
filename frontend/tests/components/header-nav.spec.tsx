import { describe, it, beforeEach, afterEach, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

function stubFetch() {
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

describe("header navigation", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", stubFetch());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets aria-current on the active nav link", async () => {
    window.history.pushState({}, "", "/history");
    renderWithProviders(<App />);
    await waitFor(() =>
      expect(screen.getByRole("link", { name: /history/i })).toHaveAttribute("aria-current", "page")
    );
    expect(screen.getByRole("link", { name: /session/i })).not.toHaveAttribute("aria-current");
  });

  it("keeps skip link focusable for keyboard users", async () => {
    window.history.pushState({}, "", "/session");
    renderWithProviders(<App />);
    const user = userEvent.setup();
    await user.tab();
    const skip = screen.getByRole("link", { name: /skip to main content/i });
    expect(skip).toHaveFocus();
  });
});
