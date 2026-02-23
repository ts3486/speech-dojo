import { afterEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { renderWithProviders } from "../utils";

import HomePage from "../../app/page";

function makeFetchMock() {
  return vi.fn().mockImplementation((input: RequestInfo | URL) => {
    const url = String(input);
    if (url.includes("/api/topics")) {
      return Promise.resolve({
        ok: true,
        json: async () => [{ id: "t1", title: "Topic 1", category: "solo" }]
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

describe("routes parity", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders Home page with topics", async () => {
    vi.stubGlobal("fetch", makeFetchMock());
    renderWithProviders(<HomePage />);

    expect(
      await screen.findByRole("heading", { level: 1, name: /practice your speech/i })
    ).toBeInTheDocument();
    expect(await screen.findByText(/Topic 1/)).toBeInTheDocument();
  });
});
