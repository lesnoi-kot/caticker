import type { RGBColor } from "react-color";

export function getRGBAString(rgba: RGBColor): string {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a ?? 1})`;
}
