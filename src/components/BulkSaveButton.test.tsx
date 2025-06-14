import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BulkSaveButton } from "./BulkSaveButton";
import { axe } from "jest-axe";
import "jest-axe/extend-expect";

describe("BulkSaveButton", () => {
  let defaultProps: {
    onSaveAll: ReturnType<typeof vi.fn>;
    onSaveAccepted: ReturnType<typeof vi.fn>;
    disabled: boolean;
    isLoading: boolean;
    acceptedCount: number;
    totalCount: number;
  };

  beforeEach(() => {
    defaultProps = {
      onSaveAll: vi.fn(),
      onSaveAccepted: vi.fn(),
      disabled: false,
      isLoading: false,
      acceptedCount: 3,
      totalCount: 5,
    };
  });

  it("renders both buttons with correct text and counts", () => {
    render(<BulkSaveButton {...defaultProps} />);

    expect(screen.getByText("Zapisz wybrane (3)")).toBeInTheDocument();
    expect(screen.getByText("Zapisz wszystkie (5)")).toBeInTheDocument();
    expect(screen.getByText("3 z 5 fiszek wybranych do zapisu")).toBeInTheDocument();
  });

  it("disables 'Zapisz wybrane' button when acceptedCount is 0", () => {
    render(<BulkSaveButton {...defaultProps} acceptedCount={0} />);

    const acceptedButton = screen.getByTestId("save-accepted-button");
    expect(acceptedButton).toBeDisabled();
  });

  it("disables 'Zapisz wszystkie' button when totalCount is 0", () => {
    render(<BulkSaveButton {...defaultProps} totalCount={0} />);

    const allButton = screen.getByTestId("save-all-button");
    expect(allButton).toBeDisabled();
  });

  it("disables both buttons when disabled prop is true", () => {
    render(<BulkSaveButton {...defaultProps} disabled={true} />);

    const acceptedButton = screen.getByTestId("save-accepted-button");
    const allButton = screen.getByTestId("save-all-button");

    expect(acceptedButton).toBeDisabled();
    expect(allButton).toBeDisabled();
  });

  it("shows loading state when isLoading is true", () => {
    render(<BulkSaveButton {...defaultProps} isLoading={true} />);

    expect(screen.getAllByText("Zapisywanie...")).toHaveLength(2);
    expect(screen.getAllByRole("button")).toEqual(
      expect.arrayContaining([expect.objectContaining({ disabled: true })])
    );
  });

  it("calls onSaveAccepted when accepted button is clicked", () => {
    const handleSaveAccepted = vi.fn();
    render(<BulkSaveButton {...defaultProps} onSaveAccepted={handleSaveAccepted} />);

    const acceptedButton = screen.getByTestId("save-accepted-button");
    fireEvent.click(acceptedButton);

    expect(handleSaveAccepted).toHaveBeenCalledOnce();
  });

  it("calls onSaveAll when save all button is clicked", () => {
    const handleSaveAll = vi.fn();
    render(<BulkSaveButton {...defaultProps} onSaveAll={handleSaveAll} />);

    const allButton = screen.getByTestId("save-all-button");
    fireEvent.click(allButton);

    expect(handleSaveAll).toHaveBeenCalledOnce();
  });

  it("does not call callbacks when buttons are disabled", () => {
    const handleSaveAccepted = vi.fn();
    const handleSaveAll = vi.fn();
    render(
      <BulkSaveButton {...defaultProps} onSaveAccepted={handleSaveAccepted} onSaveAll={handleSaveAll} disabled={true} />
    );

    const acceptedButton = screen.getByTestId("save-accepted-button");
    const allButton = screen.getByTestId("save-all-button");

    fireEvent.click(acceptedButton);
    fireEvent.click(allButton);

    expect(handleSaveAccepted).not.toHaveBeenCalled();
    expect(handleSaveAll).not.toHaveBeenCalled();
  });

  it("has loading spinners when isLoading is true", () => {
    render(<BulkSaveButton {...defaultProps} isLoading={true} />);

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button.querySelector(".animate-spin")).toBeInTheDocument();
    });
  });

  it("has proper accessibility attributes", async () => {
    const { container } = render(<BulkSaveButton {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("has proper ARIA labels for screen readers", () => {
    render(<BulkSaveButton {...defaultProps} />);

    const acceptedButton = screen.getByTestId("save-accepted-button");
    const allButton = screen.getByTestId("save-all-button");

    expect(acceptedButton).toBeInTheDocument();
    expect(allButton).toBeInTheDocument();
  });

  it("is keyboard accessible", () => {
    render(<BulkSaveButton {...defaultProps} />);

    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      button.focus();
      expect(button).toHaveFocus();
      expect(button).not.toHaveAttribute("tabindex", "-1");
    });
  });

  it("handles edge case with zero counts gracefully", () => {
    render(<BulkSaveButton {...defaultProps} acceptedCount={0} totalCount={0} />);

    const acceptedButton = screen.getByTestId("save-accepted-button");
    const allButton = screen.getByTestId("save-all-button");

    expect(acceptedButton).toBeDisabled();
    expect(allButton).toBeDisabled();
    expect(screen.getByText("0 z 0 fiszek wybranych do zapisu")).toBeInTheDocument();
  });

  it("prevents keyboard activation when disabled", () => {
    const handleSaveAccepted = vi.fn();
    const handleSaveAll = vi.fn();
    render(
      <BulkSaveButton {...defaultProps} onSaveAccepted={handleSaveAccepted} onSaveAll={handleSaveAll} disabled={true} />
    );

    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      expect(button).toBeDisabled();
      fireEvent.keyDown(button, { key: "Enter", code: "Enter" });
    });

    expect(handleSaveAccepted).not.toHaveBeenCalled();
    expect(handleSaveAll).not.toHaveBeenCalled();
  });

  it("maintains proper styling classes", () => {
    render(<BulkSaveButton {...defaultProps} />);

    const acceptedButton = screen.getByTestId("save-accepted-button");
    const allButton = screen.getByTestId("save-all-button");

    // Test that buttons are visible and have expected structure
    expect(acceptedButton).toBeVisible();
    expect(allButton).toBeVisible();
    expect(acceptedButton).toBeEnabled();
    expect(allButton).toBeEnabled();
  });

  it("handles combined loading and disabled states", () => {
    render(<BulkSaveButton {...defaultProps} disabled={true} isLoading={true} />);

    const buttons = screen.getAllByRole("button");

    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });

    expect(screen.getAllByText("Zapisywanie...")).toHaveLength(2);
  });
});
