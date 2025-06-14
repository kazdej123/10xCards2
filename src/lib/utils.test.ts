import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("combines class names correctly", () => {
    const result = cn("class1", "class2", "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("handles conditional classes", () => {
    const isVisible = true;
    const isHidden = false;
    const result = cn("always", isVisible && "conditional", isHidden && "hidden");
    expect(result).toBe("always conditional");
  });

  it("handles undefined and null values", () => {
    const result = cn("class1", undefined, null, "class2");
    expect(result).toBe("class1 class2");
  });

  it("handles empty strings", () => {
    const result = cn("class1", "", "class2");
    expect(result).toBe("class1 class2");
  });

  it("merges Tailwind conflicting classes correctly", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("handles array of classes", () => {
    const result = cn(["class1", "class2"], "class3");
    expect(result).toBe("class1 class2 class3");
  });

  it("handles object notation with boolean values", () => {
    const result = cn({
      class1: true,
      class2: false,
      class3: true,
    });
    expect(result).toBe("class1 class3");
  });

  it("handles complex combinations", () => {
    const isActive = true;
    const isDisabled = false;

    const result = cn(
      "base-class",
      {
        active: isActive,
        disabled: isDisabled,
      },
      isActive && "active-modifier",
      "final-class"
    );

    expect(result).toBe("base-class active active-modifier final-class");
  });

  it("handles no arguments", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("handles single argument", () => {
    const result = cn("single-class");
    expect(result).toBe("single-class");
  });

  it("handles duplicate classes", () => {
    const result = cn("class1", "class2", "class1");
    expect(result).toBe("class1 class2 class1");
  });

  it("handles nested arrays and objects", () => {
    const result = cn(
      "base",
      ["array1", "array2"],
      {
        obj1: true,
        obj2: false,
      },
      [
        {
          nested: true,
        },
      ]
    );

    expect(result).toBe("base array1 array2 obj1 nested");
  });
});
