export const radToDeg = (r: number) => (r * 180) / Math.PI;
export const degToRad = (d: number) => (d * Math.PI) / 180;

export function extractCosSin(rotationMatrix: DOMMatrixReadOnly) {
  return [rotationMatrix.a, rotationMatrix.b];
}

export function distance(p1: DOMPoint, p2: DOMPoint): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}
