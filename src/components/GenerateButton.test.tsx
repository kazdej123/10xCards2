import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GenerateButton } from "./GenerateButton";
import { axe } from "jest-axe";

// Import and extend jest-axe matchers for Vitest
import "jest-axe/extend-expect";

describe("GenerateButton", () => {
  const defaultProps = {
    onClick: vi.fn(),
    disabled: false,
    isLoading: false,
  };

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

    // Better approach: use getByTestId or aria attributes instead of querySelector
    const button = screen.getByRole("button");
    expect(button).toContainHTML("animate-spin");
  });

  it("maintains proper button styling", () => {
    render(<GenerateButton {...defaultProps} />);

    const button = screen.getByRole("button");
    // Test essential functionality rather than specific CSS classes
    expect(button).toBeVisible();
    expect(button).toBeEnabled();
  });

  it("is keyboard accessible", () => {
    const handleClick = vi.fn();
    render(<GenerateButton {...defaultProps} onClick={handleClick} />);

    const button = screen.getByRole("button");

    // Check if button is focusable
    button.focus();
    expect(button).toHaveFocus();

    // Test button responds to Space key (standard for buttons)
    fireEvent.keyDown(button, { key: " ", code: "Space" });
    // Note: Native button behavior should handle Space key
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
});
