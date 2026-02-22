import { render, type RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";
import { QueryProvider } from "../src/providers/queryClient";

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return render(<QueryProvider>{ui}</QueryProvider>, options);
}
