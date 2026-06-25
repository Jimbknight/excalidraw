import { triangleIncludesPoint } from "../src/triangle";
import { pointFrom } from "../src/point";

describe("triangleIncludesPoint", () => {
  it("should return true when point is inside the triangle", () => {
    const triangle = [
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(5, 10),
    ] as any;
    const point = pointFrom(5, 5);
    expect(triangleIncludesPoint(triangle, point)).toBe(true);
  });

  it("should return false when point is outside the triangle", () => {
    const triangle = [
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(5, 10),
    ] as any;
    const point = pointFrom(10, 10);
    expect(triangleIncludesPoint(triangle, point)).toBe(false);
  });

  it("should return true when point is exactly on the edge", () => {
    const triangle = [
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(5, 10),
    ] as any;
    const point = pointFrom(5, 0); // On the bottom edge
    expect(triangleIncludesPoint(triangle, point)).toBe(true);
  });

  it("should return true when point is exactly on a vertex", () => {
    const triangle = [
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(5, 10),
    ] as any;
    const point = pointFrom(10, 0); // Vertex
    expect(triangleIncludesPoint(triangle, point)).toBe(true);
  });

  it("should handle triangles with negative coordinates correctly", () => {
    const triangle = [
      pointFrom(-10, -10),
      pointFrom(0, -10),
      pointFrom(-5, 0),
    ] as any;
    const point = pointFrom(-5, -5); // Inside
    expect(triangleIncludesPoint(triangle, point)).toBe(true);
  });
});
