import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Card title="My Title">Content</Card>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("does not render title when not provided", () => {
    render(<Card>Content</Card>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("applies hover class when hover prop is true", () => {
    const { container } = render(<Card hover>Content</Card>);
    expect(container.firstChild?.textContent).toContain("Content");
  });

  it("applies custom class name", () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain("custom-class");
  });

  it("applies custom style", () => {
    const { container } = render(<Card style={{ color: "red" }}>Content</Card>);
    const div = container.firstChild as HTMLElement;
    expect(div.style.color).toBe("red");
  });
});
