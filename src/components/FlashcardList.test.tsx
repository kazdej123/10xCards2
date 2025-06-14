import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FlashcardList } from "./FlashcardList";
import type { FlashcardProposalViewModel } from "./FlashcardGenerationView";
import { axe } from "jest-axe";
import "jest-axe/extend-expect";

// Mock the FlashcardListItem component
vi.mock("./FlashcardListItem", () => ({
  FlashcardListItem: ({
    flashcard,
    onAccept,
    onEdit,
    onReject,
  }: {
    flashcard: FlashcardProposalViewModel;
    onAccept: (id: string) => void;
    onEdit: (id: string, front: string, back: string) => void;
    onReject: (id: string) => void;
  }) => (
    <div data-testid={`flashcard-item-${flashcard.id}`}>
      <div>Front: {flashcard.front}</div>
      <div>Back: {flashcard.back}</div>
      <div>Status: {flashcard.status}</div>
      <button onClick={() => onAccept(flashcard.id)}>Accept</button>
      <button onClick={() => onEdit(flashcard.id, "new front", "new back")}>Edit</button>
      <button onClick={() => onReject(flashcard.id)}>Reject</button>
    </div>
  ),
}));

describe("FlashcardList", () => {
  let mockFlashcards: FlashcardProposalViewModel[];
  let defaultProps: {
    flashcards: FlashcardProposalViewModel[];
    onAccept: ReturnType<typeof vi.fn>;
    onEdit: ReturnType<typeof vi.fn>;
    onReject: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockFlashcards = [
      {
        id: "1",
        front: "Question 1",
        back: "Answer 1",
        source: "ai-full",
        status: "pending",
      },
      {
        id: "2",
        front: "Question 2",
        back: "Answer 2",
        source: "ai-full",
        status: "accepted",
      },
      {
        id: "3",
        front: "Question 3",
        back: "Answer 3",
        source: "ai-full",
        status: "rejected",
      },
    ];

    defaultProps = {
      flashcards: mockFlashcards,
      onAccept: vi.fn(),
      onEdit: vi.fn(),
      onReject: vi.fn(),
    };
  });

  it("renders all flashcard items when flashcards array is not empty", () => {
    render(<FlashcardList {...defaultProps} />);

    expect(screen.getByTestId("flashcard-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("flashcard-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("flashcard-item-3")).toBeInTheDocument();
  });

  it("renders flashcard content correctly", () => {
    render(<FlashcardList {...defaultProps} />);

    expect(screen.getByText("Front: Question 1")).toBeInTheDocument();
    expect(screen.getByText("Back: Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Status: pending")).toBeInTheDocument();
  });

  it("returns null when flashcards array is empty", () => {
    const { container } = render(<FlashcardList {...defaultProps} flashcards={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("passes correct props to FlashcardListItem components", () => {
    render(<FlashcardList {...defaultProps} />);

    // Verify that the mock component receives the expected data
    expect(screen.getByText("Front: Question 1")).toBeInTheDocument();
    expect(screen.getByText("Back: Answer 1")).toBeInTheDocument();
    expect(screen.getByText("Status: pending")).toBeInTheDocument();

    expect(screen.getByText("Front: Question 2")).toBeInTheDocument();
    expect(screen.getByText("Back: Answer 2")).toBeInTheDocument();
    expect(screen.getByText("Status: accepted")).toBeInTheDocument();
  });

  it("calls onAccept when accept button is clicked", () => {
    const handleAccept = vi.fn();
    render(<FlashcardList {...defaultProps} onAccept={handleAccept} />);

    const acceptButtons = screen.getAllByText("Accept");
    acceptButtons[0].click();

    expect(handleAccept).toHaveBeenCalledWith("1");
  });

  it("calls onEdit when edit button is clicked", () => {
    const handleEdit = vi.fn();
    render(<FlashcardList {...defaultProps} onEdit={handleEdit} />);

    const editButtons = screen.getAllByText("Edit");
    editButtons[0].click();

    expect(handleEdit).toHaveBeenCalledWith("1", "new front", "new back");
  });

  it("calls onReject when reject button is clicked", () => {
    const handleReject = vi.fn();
    render(<FlashcardList {...defaultProps} onReject={handleReject} />);

    const rejectButtons = screen.getAllByText("Reject");
    rejectButtons[0].click();

    expect(handleReject).toHaveBeenCalledWith("1");
  });

  it("has proper accessibility attributes", async () => {
    const { container } = render(<FlashcardList {...defaultProps} />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders with proper list structure", () => {
    render(<FlashcardList {...defaultProps} />);

    const listContainer = document.querySelector(".space-y-4");
    expect(listContainer).toBeInTheDocument();
  });

  it("handles single flashcard correctly", () => {
    const singleFlashcard = [mockFlashcards[0]];
    render(<FlashcardList {...defaultProps} flashcards={singleFlashcard} />);

    expect(screen.getByTestId("flashcard-item-1")).toBeInTheDocument();
    expect(screen.queryByTestId("flashcard-item-2")).not.toBeInTheDocument();
    expect(screen.queryByTestId("flashcard-item-3")).not.toBeInTheDocument();
  });

  it("maintains correct order of flashcards", () => {
    render(<FlashcardList {...defaultProps} />);

    const flashcardItems = screen.getAllByTestId(/flashcard-item-/);
    expect(flashcardItems).toHaveLength(3);

    // Check that the order is preserved
    expect(flashcardItems[0]).toHaveAttribute("data-testid", "flashcard-item-1");
    expect(flashcardItems[1]).toHaveAttribute("data-testid", "flashcard-item-2");
    expect(flashcardItems[2]).toHaveAttribute("data-testid", "flashcard-item-3");
  });

  it("handles different flashcard statuses", () => {
    render(<FlashcardList {...defaultProps} />);

    expect(screen.getByText("Status: pending")).toBeInTheDocument();
    expect(screen.getByText("Status: accepted")).toBeInTheDocument();
    expect(screen.getByText("Status: rejected")).toBeInTheDocument();
  });
});
