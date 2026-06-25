import {
  polygon,
  polygonFromPoints,
  polygonIncludesPoint,
  polygonIncludesPointNonZero,
  pointOnPolygon,
} from "../src/polygon";
import { pointFrom } from "../src/point";

describe("polygon utilities", () => {
  it("should close a polygon when using polygonFromPoints", () => {
    const p1 = pointFrom(0, 0);
    const p2 = pointFrom(10, 0);
    const p3 = pointFrom(10, 10);
    const poly = polygonFromPoints([p1, p2, p3] as any) as any;
    expect(poly.length).toBe(4);
    expect(poly[0]).toEqual(poly[poly.length - 1]);
  });

  it("should report a point inside the polygon as included", () => {
    const square = polygon(
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(10, 10),
      pointFrom(0, 10),
    ) as any;
    const inside = pointFrom(5, 5);
    expect(polygonIncludesPoint(inside, square)).toBe(true);
  });

  it("should report a point outside the polygon as not included", () => {
    const square = polygonFromPoints([
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(10, 10),
      pointFrom(0, 10),
    ] as any) as any;
    const outside = pointFrom(20, 20);
    expect(polygonIncludesPoint(outside, square)).toBe(false);
  });

  it("polygonIncludesPointNonZero should use winding and distinguish inside/outside", () => {
    const square = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ] as any;
    expect(polygonIncludesPointNonZero([5, 5], square)).toBe(true);
    expect(polygonIncludesPointNonZero([20, 20], square)).toBe(false);
  });

  it("pointOnPolygon should return true for a point on an edge", () => {
    const square = polygon(
      pointFrom(0, 0),
      pointFrom(10, 0),
      pointFrom(10, 10),
      pointFrom(0, 10),
    ) as any;
    const onEdge = pointFrom(10, 5);
    expect(pointOnPolygon(onEdge, square)).toBe(true);
  });
});
