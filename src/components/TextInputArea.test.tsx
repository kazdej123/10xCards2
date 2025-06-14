import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TextInputArea } from "./TextInputArea";
import { axe } from "jest-axe";
import "jest-axe/extend-expect";

describe("TextInputArea", () => {
  let defaultProps: {
    value: string;
    onChange: ReturnType<typeof vi.fn>;
    disabled?: boolean;
  };

  beforeEach(() => {
    defaultProps = {
      value: "",
      onChange: vi.fn(),
      disabled: false,
    };
  });

  it("renders with correct label and placeholder", () => {
    render(<TextInputArea {...defaultProps} />);

    expect(screen.getByLabelText("Tekst źródłowy")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Wklej tutaj swój tekst (1000-10000 znaków)")).toBeInTheDocument();
  });

  it("displays character count correctly", () => {
    render(<TextInputArea {...defaultProps} value="test text" />);

    expect(screen.getByText("9 / 10000 znaków")).toBeInTheDocument();
  });

  it("shows red count color when text is too short", () => {
    render(<TextInputArea {...defaultProps} value="short" />);

    const countElement = screen.getByText("5 / 10000 znaków");
    expect(countElement).toHaveClass("text-red-200");
  });

  it("shows red count color when text is too long", () => {
    const longText = "a".repeat(10001);
    render(<TextInputArea {...defaultProps} value={longText} />);

    const countElement = screen.getByText("10001 / 10000 znaków");
    expect(countElement).toHaveClass("text-red-200");
  });

  it("shows blue count color when text length is valid", () => {
    const validText = "a".repeat(5000);
    render(<TextInputArea {...defaultProps} value={validText} />);

    const countElement = screen.getByText("5000 / 10000 znaków");
    expect(countElement).toHaveClass("text-blue-200/70");
  });

  it("shows validation error when text is too short", () => {
    render(<TextInputArea {...defaultProps} value="short" />);

    expect(screen.getByText("Wprowadź co najmniej 1000 znaków")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("shows validation error when text is too long", () => {
    const longText = "a".repeat(10001);
    render(<TextInputArea {...defaultProps} value={longText} />);

    expect(screen.getByText("Wprowadź nie więcej niż 10000 znaków")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("does not show validation error when text length is valid", () => {
    const validText = "a".repeat(5000);
    render(<TextInputArea {...defaultProps} value={validText} />);

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("calls onChange when text is entered", () => {
    const handleChange = vi.fn();
    render(<TextInputArea {...defaultProps} onChange={handleChange} />);

    const textarea = screen.getByLabelText("Tekst źródłowy");
    fireEvent.change(textarea, { target: { value: "new text" } });

    expect(handleChange).toHaveBeenCalledWith("new text");
  });

  it("is disabled when disabled prop is true", () => {
    render(<TextInputArea {...defaultProps} disabled={true} />);

    const textarea = screen.getByLabelText("Tekst źródłowy");
    expect(textarea).toBeDisabled();
  });

  it("has proper aria attributes for validation", () => {
    render(<TextInputArea {...defaultProps} value="short" />);

    const textarea = screen.getByLabelText("Tekst źródłowy");
    expect(textarea).toHaveAttribute("aria-describedby", "text-validation");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("does not have aria-describedby when valid", () => {
    const validText = "a".repeat(5000);
    render(<TextInputArea {...defaultProps} value={validText} />);

    const textarea = screen.getByLabelText("Tekst źródłowy");
    expect(textarea).not.toHaveAttribute("aria-describedby");
    expect(textarea).toHaveAttribute("aria-invalid", "false");
  });

  it("has proper accessibility attributes", async () => {
    const { container } = render(<TextInputArea {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has proper live region for character count", () => {
    render(<TextInputArea {...defaultProps} value="test" />);

    const countElement = screen.getByText("4 / 10000 znaków");
    expect(countElement).toHaveAttribute("role", "status");
    expect(countElement).toHaveAttribute("aria-live", "polite");
  });

  it("is keyboard accessible", () => {
    render(<TextInputArea {...defaultProps} />);

    const textarea = screen.getByLabelText("Tekst źródłowy");
    textarea.focus();
    expect(textarea).toHaveFocus();
  });

  it("maintains focus after text changes", () => {
    const handleChange = vi.fn();
    render(<TextInputArea {...defaultProps} onChange={handleChange} />);

    const textarea = screen.getByLabelText("Tekst źródłowy");
    textarea.focus();
    fireEvent.change(textarea, { target: { value: "new text" } });

    expect(textarea).toHaveFocus();
  });

  it("handles edge cases for character count boundaries", () => {
    const exactMin = "a".repeat(1000);
    const exactMax = "a".repeat(10000);

    const { rerender } = render(<TextInputArea {...defaultProps} value={exactMin} />);
    expect(screen.getByText("1000 / 10000 znaków")).toHaveClass("text-blue-200/70");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    rerender(<TextInputArea {...defaultProps} value={exactMax} />);
    expect(screen.getByText("10000 / 10000 znaków")).toHaveClass("text-blue-200/70");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("handles rapid text changes correctly", () => {
    const handleChange = vi.fn();
    render(<TextInputArea {...defaultProps} onChange={handleChange} />);

    const textarea = screen.getByLabelText("Tekst źródłowy");

    fireEvent.change(textarea, { target: { value: "a" } });
    fireEvent.change(textarea, { target: { value: "ab" } });
    fireEvent.change(textarea, { target: { value: "abc" } });

    expect(handleChange).toHaveBeenCalledTimes(3);
    expect(handleChange).toHaveBeenLastCalledWith("abc");
  });
});
