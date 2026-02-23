import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/history",
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}));

import { Shell } from "../../app/shell";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("header navigation", () => {
  it("sets aria-current on the active nav link", () => {
    render(<Shell />);
    expect(screen.getByRole("link", { name: /history/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /session/i })).not.toHaveAttribute("aria-current");
  });

  it("renders all navigation links", () => {
    render(<Shell />);
    expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /session/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /social hub/i })).toBeInTheDocument();
  });
});
