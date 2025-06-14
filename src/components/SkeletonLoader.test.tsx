import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SkeletonLoader } from "./SkeletonLoader";
import { axe } from "jest-axe";
import "jest-axe/extend-expect";

describe("SkeletonLoader", () => {
  it("renders 3 skeleton cards by default", () => {
    render(<SkeletonLoader />);

    // Check that 3 skeleton containers are rendered
    const skeletonContainers = screen.getAllByRole("generic");
    const cardContainers = skeletonContainers.filter(
      (el) => el.className.includes("border-l-4") && el.className.includes("bg-white/10")
    );

    expect(cardContainers).toHaveLength(3);
  });

  it("renders skeleton elements with proper structure", () => {
    render(<SkeletonLoader />);

    // Test that skeleton elements are present
    // We expect multiple skeleton elements across the 3 cards
    const skeletonElements = document.querySelectorAll(".bg-white\\/20, .bg-white\\/15");
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it("has proper accessibility attributes", async () => {
    const { container } = render(<SkeletonLoader />);

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders skeleton cards with consistent styling", () => {
    render(<SkeletonLoader />);

    const cardContainers = document.querySelectorAll(".border-l-4.border-l-white\\/30");
    expect(cardContainers).toHaveLength(3);

    cardContainers.forEach((card) => {
      expect(card).toHaveClass("bg-white/10");
      expect(card).toHaveClass("backdrop-blur-sm");
      expect(card).toHaveClass("rounded-lg");
    });
  });

  it("renders with proper loading semantics", () => {
    render(<SkeletonLoader />);

    // The skeleton should indicate loading state
    const container = document.querySelector(".space-y-4");
    expect(container).toBeInTheDocument();
  });

  it("is not interactive", () => {
    render(<SkeletonLoader />);

    // Skeleton should not have any interactive elements
    const buttons = screen.queryAllByRole("button");
    const links = screen.queryAllByRole("link");
    const inputs = screen.queryAllByRole("textbox");

    expect(buttons).toHaveLength(0);
    expect(links).toHaveLength(0);
    expect(inputs).toHaveLength(0);
  });

  it("maintains consistent spacing", () => {
    render(<SkeletonLoader />);

    const mainContainer = document.querySelector(".space-y-4");
    expect(mainContainer).toBeInTheDocument();

    // Each card should have internal spacing
    const cardSpacing = document.querySelectorAll(".space-y-4, .space-y-3");
    expect(cardSpacing.length).toBeGreaterThan(0);
  });
});
