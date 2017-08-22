export interface Point {
  x: number;
  y: number;
}

export function add(a: Point, b: Point) {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function subtract(a: Point, b: Point) {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function distance(a: Point, b: Point) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.x);
}
