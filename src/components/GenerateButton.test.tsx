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

    const spinner = screen.getByRole("button").querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });

  it("maintains proper CSS classes", () => {
    render(<GenerateButton {...defaultProps} />);

    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gradient-to-r", "from-blue-500", "to-purple-600");
  });
});
