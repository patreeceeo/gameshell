import { countEmbodiedPoints } from "./snake";

test("countEmbodiedPoints", () => {
  const points3by5 = [
    [0, 0],
    [0, 5],
    [5, 5],
    [5, 10],
  ];

  expect(countEmbodiedPoints(points3by5 as any, 17)).toBe(3);
  expect(countEmbodiedPoints(points3by5 as any, 16)).toBe(3);
  expect(countEmbodiedPoints(points3by5 as any, 15)).toBe(3);
  expect(countEmbodiedPoints(points3by5 as any, 11)).toBe(3);

  expect(countEmbodiedPoints(points3by5 as any, 10)).toBe(2);
  expect(countEmbodiedPoints(points3by5 as any, 6)).toBe(2);

  expect(countEmbodiedPoints(points3by5 as any, 5)).toBe(1);
  expect(countEmbodiedPoints(points3by5 as any, 4)).toBe(1);
});
