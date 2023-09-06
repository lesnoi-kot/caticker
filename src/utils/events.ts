export function getBoxedRelativeXY(
  container: HTMLElement,
  event: MouseEvent,
  maxX: number,
  maxY: number
) {
  const { x: containerX, y: containerY } = container.getBoundingClientRect();

  return new DOMPoint(
    Math.min(maxX, Math.max(0, event.clientX - containerX)),
    Math.min(maxY, Math.max(0, event.clientY - containerY))
  );
}

export function getRelativeXY(
  container: HTMLElement,
  event: MouseEvent
): DOMPoint {
  const { x: containerX, y: containerY } = container.getBoundingClientRect();
  return new DOMPoint(event.clientX - containerX, event.clientY - containerY);
}
