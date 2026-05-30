import { rectangleIntersectRectangle, rectangleFromNumberSequence } from "../src/rectangle";
import { pointFrom } from "../src/point";

describe("rectangleIntersectRectangle", () => {
  it("should return true when rectangles overlap", () => {
    const rect1 = rectangleFromNumberSequence(0, 0, 10, 10);
    const rect2 = rectangleFromNumberSequence(5, 5, 15, 15);
    expect(rectangleIntersectRectangle(rect1, rect2)).toBe(true);
  });

  it("should return false when rectangles do not overlap", () => {
    const rect1 = rectangleFromNumberSequence(0, 0, 10, 10);
    const rect2 = rectangleFromNumberSequence(20, 20, 30, 30);
    expect(rectangleIntersectRectangle(rect1, rect2)).toBe(false);
  });
});
