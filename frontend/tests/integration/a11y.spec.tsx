import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/App";
import "@testing-library/jest-dom";

function stubFetch() {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/topics")) {
      return Promise.resolve({ ok: true, json: async () => [] } as any);
    }
    if (url.includes("/api/sessions")) {
      return Promise.resolve({ ok: true, json: async () => ({ sessions: [] }) } as any);
    }
    return Promise.resolve({ ok: true, json: async () => ({}) } as any);
  });
}

describe("app accessibility primitives", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", stubFetch());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("provides skip link and focus-visible navigation", async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.tab();
    const skip = screen.getByRole("link", { name: /skip to main content/i });
    expect(skip).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
