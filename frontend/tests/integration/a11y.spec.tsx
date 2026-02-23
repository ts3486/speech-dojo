import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

import { Shell } from "../../app/shell";

describe("app accessibility primitives", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shell renders with accessible navigation landmark", () => {
    render(<Shell />);
    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
  });
});
