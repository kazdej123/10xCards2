import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FlashcardListItem } from "./FlashcardListItem";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import { axe } from "jest-axe";
import "jest-axe/extend-expect";

describe("FlashcardListItem", () => {
  let mockFlashcard: FlashcardProposalViewModel;
  let defaultProps: {
    flashcard: FlashcardProposalViewModel;
    onAccept: ReturnType<typeof vi.fn>;
    onEdit: ReturnType<typeof vi.fn>;
    onReject: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockFlashcard = {
      id: "test-id",
      front: "Test front",
      back: "Test back",
      status: "pending",
    };

    defaultProps = {
      flashcard: mockFlashcard,
      onAccept: vi.fn(),
      onEdit: vi.fn(),
      onReject: vi.fn(),
    };
  });

  describe("Display Mode", () => {
    it("renders flashcard content in display mode", () => {
      render(<FlashcardListItem {...defaultProps} />);

      expect(screen.getByText("Test front")).toBeInTheDocument();
      expect(screen.getByText("Test back")).toBeInTheDocument();
      expect(screen.getByText("Oczekuje")).toBeInTheDocument();
    });

    it("shows correct status for different states", () => {
      const statuses = [
        { status: "pending", text: "Oczekuje" },
        { status: "accepted", text: "Zaakceptowana" },
        { status: "rejected", text: "Odrzucona" },
        { status: "edited", text: "Edytowana" },
      ] as const;

      statuses.forEach(({ status, text }) => {
        const flashcard = { ...mockFlashcard, status };
        const { rerender } = render(<FlashcardListItem {...defaultProps} flashcard={flashcard} />);

        expect(screen.getByText(text)).toBeInTheDocument();

        if (status !== statuses[statuses.length - 1].status) {
          rerender(<div />); // Clear for next test
        }
      });
    });

    it("shows accept button for rejected flashcards", () => {
      const rejectedFlashcard = { ...mockFlashcard, status: "rejected" as const };
      render(<FlashcardListItem {...defaultProps} flashcard={rejectedFlashcard} />);

      expect(screen.getByText("✓ Akceptuj")).toBeInTheDocument();
      expect(screen.queryByText("✕")).not.toBeInTheDocument();
      expect(screen.queryByText("✏️")).not.toBeInTheDocument();
    });

    it("shows reject, edit, and accept buttons for non-rejected flashcards", () => {
      render(<FlashcardListItem {...defaultProps} />);

      expect(screen.getByLabelText("Odrzuć fiszkę")).toBeInTheDocument();
      expect(screen.getByLabelText("Edytuj fiszkę")).toBeInTheDocument();
      expect(screen.getByLabelText("Zaakceptuj fiszkę")).toBeInTheDocument();
    });
  });

  describe("Editing Mode", () => {
    it("enters editing mode when edit button is clicked", () => {
      render(<FlashcardListItem {...defaultProps} />);

      const editButton = screen.getByLabelText("Edytuj fiszkę");
      fireEvent.click(editButton);

      expect(screen.getByLabelText("Strona przednia")).toBeInTheDocument();
      expect(screen.getByLabelText("Strona tylna")).toBeInTheDocument();
      expect(screen.getByText("Zapisz")).toBeInTheDocument();
      expect(screen.getByText("Anuluj")).toBeInTheDocument();
    });

    it("shows flashcard data in editing mode", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByDisplayValue("Test front");
      const backInput = screen.getByDisplayValue("Test back");

      expect(frontInput).toBeInTheDocument();
      expect(backInput).toBeInTheDocument();
    });

    it("updates input values when typing", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      fireEvent.change(frontInput, { target: { value: "New front" } });

      expect(screen.getByDisplayValue("New front")).toBeInTheDocument();
    });

    it("shows character count for inputs", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "10/200 znaków";
        })
      ).toBeInTheDocument(); // Test front length (Test front = 10 characters)
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === "9/500 znaków";
        })
      ).toBeInTheDocument(); // Test back length (Test back = 9 characters)
    });
  });

  describe("Validation", () => {
    it("shows validation error when front is too long", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      const longText = "a".repeat(201);
      fireEvent.change(frontInput, { target: { value: longText } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      expect(screen.getByText("Strona przednia musi mieć maksymalnie 200 znaków")).toBeInTheDocument();
    });

    it("shows validation error when back is too long", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const backInput = screen.getByLabelText("Strona tylna");
      const longText = "a".repeat(501);
      fireEvent.change(backInput, { target: { value: longText } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      expect(screen.getByText("Strona tylna musi mieć maksymalnie 500 znaków")).toBeInTheDocument();
    });

    it("shows validation error when front is empty", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      fireEvent.change(frontInput, { target: { value: "   " } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      expect(screen.getByText("Strona przednia nie może być pusta")).toBeInTheDocument();
    });

    it("shows validation error when back is empty", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const backInput = screen.getByLabelText("Strona tylna");
      fireEvent.change(backInput, { target: { value: "   " } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      expect(screen.getByText("Strona tylna nie może być pusta")).toBeInTheDocument();
    });
  });

  describe("Actions", () => {
    it("calls onAccept when accept button is clicked", () => {
      const handleAccept = vi.fn();
      render(<FlashcardListItem {...defaultProps} onAccept={handleAccept} />);

      const acceptButton = screen.getByLabelText("Zaakceptuj fiszkę");
      fireEvent.click(acceptButton);

      expect(handleAccept).toHaveBeenCalledWith("test-id");
    });

    it("calls onReject when reject button is clicked", () => {
      const handleReject = vi.fn();
      render(<FlashcardListItem {...defaultProps} onReject={handleReject} />);

      const rejectButton = screen.getByLabelText("Odrzuć fiszkę");
      fireEvent.click(rejectButton);

      expect(handleReject).toHaveBeenCalledWith("test-id");
    });

    it("calls onEdit when save is clicked with valid data", () => {
      const handleEdit = vi.fn();
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} onEdit={handleEdit} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      const backInput = screen.getByLabelText("Strona tylna");

      fireEvent.change(frontInput, { target: { value: "New front" } });
      fireEvent.change(backInput, { target: { value: "New back" } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      expect(handleEdit).toHaveBeenCalledWith("test-id", "New front", "New back");
    });

    it("cancels editing when cancel button is clicked", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      fireEvent.change(frontInput, { target: { value: "Changed text" } });

      const cancelButton = screen.getByText("Anuluj");
      fireEvent.click(cancelButton);

      // Should exit editing mode and reset values
      expect(screen.queryByLabelText("Strona przednia")).not.toBeInTheDocument();
      expect(screen.getByText("Test front")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper accessibility attributes", async () => {
      const { container } = render(<FlashcardListItem {...defaultProps} />);

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("has proper ARIA labels for buttons", () => {
      render(<FlashcardListItem {...defaultProps} />);

      expect(screen.getByLabelText("Odrzuć fiszkę")).toBeInTheDocument();
      expect(screen.getByLabelText("Edytuj fiszkę")).toBeInTheDocument();
      expect(screen.getByLabelText("Zaakceptuj fiszkę")).toBeInTheDocument();
    });

    it("has proper form labels in editing mode", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      expect(screen.getByLabelText("Strona przednia")).toBeInTheDocument();
      expect(screen.getByLabelText("Strona tylna")).toBeInTheDocument();
    });

    it("shows validation errors with proper role", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      fireEvent.change(frontInput, { target: { value: "" } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      const errorMessage = screen.getByRole("alert");
      expect(errorMessage).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles accepted status correctly", () => {
      const acceptedFlashcard = { ...mockFlashcard, status: "accepted" as const };
      render(<FlashcardListItem {...defaultProps} flashcard={acceptedFlashcard} />);

      expect(screen.getByText("Zaakceptowana")).toBeInTheDocument();
      expect(screen.queryByText("✓ Akceptuj")).not.toBeInTheDocument();
    });

    it("handles edited status correctly", () => {
      const editedFlashcard = { ...mockFlashcard, status: "edited" as const };
      render(<FlashcardListItem {...defaultProps} flashcard={editedFlashcard} />);

      expect(screen.getByText("Edytowana")).toBeInTheDocument();
      expect(screen.queryByText("✓ Akceptuj")).not.toBeInTheDocument();
    });

    it("clears validation error when input changes", () => {
      const editingFlashcard = { ...mockFlashcard, isEditing: true };
      render(<FlashcardListItem {...defaultProps} flashcard={editingFlashcard} />);

      const frontInput = screen.getByLabelText("Strona przednia");
      fireEvent.change(frontInput, { target: { value: "" } });

      const saveButton = screen.getByText("Zapisz");
      fireEvent.click(saveButton);

      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Type something to clear the error
      fireEvent.change(frontInput, { target: { value: "Valid text" } });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
