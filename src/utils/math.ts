import geometry from "@flatten-js/core";

export const radToDeg = (r: number) => (r * 180) / Math.PI;
export const degToRad = (d: number) => (d * Math.PI) / 180;

export function distance(p1: DOMPoint, p2: DOMPoint): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

export function rectToPoly(rect: DOMRect): geometry.Polygon {
  const { x, y, width, height } = rect;

  return new geometry.Polygon([
    geometry.point(x, y),
    geometry.point(x + width, y),
    geometry.point(x + width, y + height),
    geometry.point(x, y + height),
  ]);
}

export const getOrigin = (m: DOMMatrixReadOnly): DOMPoint => {
  return m.transformPoint(new DOMPoint(0, 0));
};

export function fastIntersectionCheck(
  rect: DOMRect,
  item: geometry.Polygon
): boolean {
  const { top, left, right, bottom } = rect;

  for (const v of item.vertices) {
    if (v.x >= left && v.y >= top && v.x <= right && v.y <= bottom) {
      return true;
    }
  }

  return false;
}
