import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button, LinkButton } from "../../src/components/ui/Button";
import { StatusChip } from "../../src/components/ui/StatusChip";
import { Card } from "../../src/components/ui/Card";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

describe("UI Kit tokens", () => {
  it("applies tokenized styles to buttons and chips", () => {
    render(
      <MemoryRouter>
        <div>
          <Button>Primary</Button>
          <LinkButton to="/x" variant="secondary">
            Link
          </LinkButton>
          <StatusChip label="Active" tone="active" />
        </div>
      </MemoryRouter>
    );

    expect(screen.getByText("Primary")).toHaveClass("bg-primary");
    expect(screen.getByText("Link")).toHaveClass("border");
    expect(screen.getByText(/Active/)).toBeInTheDocument();
  });

  it("renders Card shell with actions", () => {
    render(
      <Card title="Card Title" actions={<Button>Action</Button>}>
        <p>Content</p>
      </Card>
    );
    expect(screen.getByText(/Card Title/)).toBeInTheDocument();
    expect(screen.getByText(/Content/)).toBeInTheDocument();
    expect(screen.getByText(/Action/)).toBeInTheDocument();
  });
});
