import { describe, it, expect, vi, afterEach } from "vitest";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

import HomePage from "../../app/page";

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

describe("page rendering", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Home page with heading", async () => {
    vi.stubGlobal("fetch", fetchMock());
    renderWithProviders(<HomePage />);
    expect(
      await screen.findByRole("heading", { level: 1, name: /practice your speech/i })
    ).toBeInTheDocument();
  });
});
