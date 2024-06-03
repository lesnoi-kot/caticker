import type { RgbaColor } from "react-colorful";

export function getRGBAString(rgba: RgbaColor): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a ?? 1})`;
}
