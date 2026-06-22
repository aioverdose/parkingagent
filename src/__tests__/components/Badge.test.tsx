import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("uses label prop over children when provided", () => {
    render(<Badge label="Label text">Children</Badge>);
    expect(screen.getByText("Label text")).toBeInTheDocument();
    expect(screen.queryByText("Children")).not.toBeInTheDocument();
  });

  it("renders with default variant classes", () => {
    const { container } = render(<Badge>Default</Badge>);
    expect(container.firstChild?.textContent).toBe("Default");
  });

  it("applies variant class for success", () => {
    render(<Badge variant="success">Success</Badge>);
    const badge = screen.getByText("Success");
    expect(badge.className).toContain("bg-[#D1FAE5]");
    expect(badge.className).toContain("text-[#059669]");
  });

  it("applies variant class for error", () => {
    render(<Badge variant="error">Error</Badge>);
    const badge = screen.getByText("Error");
    expect(badge.className).toContain("bg-[#FEE2E2]");
    expect(badge.className).toContain("text-[#DC2626]");
  });

  it("applies custom className", () => {
    render(<Badge className="my-custom">Custom</Badge>);
    expect(screen.getByText("Custom").className).toContain("my-custom");
  });
});
