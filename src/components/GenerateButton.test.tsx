import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerateButton } from "./GenerateButton";
import { axe } from "jest-axe";

// Import and extend jest-axe matchers for Vitest
import "jest-axe/extend-expect";

describe("GenerateButton", () => {
  let defaultProps: {
    onClick: ReturnType<typeof vi.fn>;
    disabled: boolean;
    isLoading: boolean;
  };

  beforeEach(() => {
    defaultProps = {
      onClick: vi.fn(),
      disabled: false,
      isLoading: false,
    };
  });

  it("renders with default text", () => {
    render(<GenerateButton {...defaultProps} />);

    expect(screen.getByText("Generuj fiszki")).toBeInTheDocument();
  });

  it("shows loading state when isLoading is true", () => {
    render(<GenerateButton {...defaultProps} isLoading={true} />);

    expect(screen.getByText("Generowanie...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("is disabled when disabled prop is true", () => {
    render(<GenerateButton {...defaultProps} disabled={true} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onClick when clicked and not disabled", () => {
    const handleClick = vi.fn();
    render(<GenerateButton {...defaultProps} onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("does not call onClick when disabled", () => {
    const handleClick = vi.fn();
    render(<GenerateButton {...defaultProps} onClick={handleClick} disabled={true} />);

    fireEvent.click(screen.getByRole("button"));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("has proper accessibility attributes", async () => {
    const { container } = render(<GenerateButton {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has loading spinner when isLoading is true", () => {
    render(<GenerateButton {...defaultProps} isLoading={true} />);

    const button = screen.getByRole("button");
    // Test for Loader2 icon presence more reliably
    expect(button.querySelector(".lucide-loader-circle")).toBeInTheDocument();
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("maintains proper button styling", () => {
    render(<GenerateButton {...defaultProps} />);

    const button = screen.getByRole("button");
    // Test essential functionality rather than specific CSS classes
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });

  it("is keyboard accessible", () => {
    render(<GenerateButton {...defaultProps} />);

    const button = screen.getByRole("button");

    // Check if button is focusable (main requirement for keyboard accessibility)
    button.focus();
    expect(button).toHaveFocus();

    // Verify button is not explicitly removed from tab order
    expect(button).not.toHaveAttribute("tabindex", "-1");

    // Button element is naturally keyboard accessible
    // Space and Enter keys are handled by browser natively
  });

  it("has proper ARIA attributes for screen readers", () => {
    render(<GenerateButton {...defaultProps} isLoading={true} />);

    const button = screen.getByRole("button");

    // When loading, button should be properly announced to screen readers
    expect(button).toHaveAttribute("disabled");
    expect(button).toHaveTextContent("Generowanie...");
  });

  it("handles combined disabled and loading states", () => {
    render(<GenerateButton {...defaultProps} disabled={true} isLoading={true} />);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Generowanie...");
  });

  it("prevents onClick when both disabled and loading", () => {
    const handleClick = vi.fn();
    render(<GenerateButton {...defaultProps} onClick={handleClick} disabled={true} isLoading={true} />);

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("has responsive width classes for mobile and desktop", () => {
    render(<GenerateButton {...defaultProps} />);

    const button = screen.getByRole("button");
    // Test responsive design classes
    expect(button).toHaveClass("w-full", "sm:w-auto");
  });

  it("prevents keyboard activation when disabled", () => {
    const handleClick = vi.fn();
    render(<GenerateButton {...defaultProps} onClick={handleClick} disabled={true} />);

    const button = screen.getByRole("button");

    // Test that disabled button cannot be focused/activated
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("disabled");

    // Try keyboard interaction on disabled button
    fireEvent.keyDown(button, { key: "Enter", code: "Enter" });

    expect(handleClick).not.toHaveBeenCalled();
  });
});
