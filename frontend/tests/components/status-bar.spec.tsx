import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBar } from "../../src/components/StatusBar";
import { AlertStack } from "../../src/components/AlertStack";
import "@testing-library/jest-dom";

describe("StatusBar and AlertStack", () => {
  it("renders connection, mic, and token states", () => {
    render(
      <StatusBar
        status={{
          connection: "active",
          mic: "granted",
          token: "valid",
          info: "Listening"
        }}
      />
    );

    expect(screen.getByLabelText(/session status/i)).toBeInTheDocument();
    expect(screen.getByText(/Connection: active/i)).toBeInTheDocument();
    expect(screen.getByText(/Mic: granted/i)).toBeInTheDocument();
    expect(screen.getByText(/Token: valid/i)).toBeInTheDocument();
  });

  it("shows alerts with inline actions", async () => {
    const onClick = vi.fn();
    render(
      <AlertStack
        alerts={[
          { id: "net", tone: "network", message: "Network connection lost", actions: [{ label: "Retry", onClick }] }
        ]}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/network connection lost/i);
    await screen.findByRole("button", { name: /retry/i }).then((btn) => btn.click());
    expect(onClick).toHaveBeenCalled();
  });
});
