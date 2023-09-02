export function getBoxedRelativeXY(container: HTMLElement, event: MouseEvent) {
  const { x: containerX, y: containerY } = container.getBoundingClientRect();
  return [
    Math.min(512, Math.max(0, event.clientX - containerX)),
    Math.min(512, Math.max(0, event.clientY - containerY)),
  ];
}

export function getRelativeXY(
  container: HTMLElement,
  event: MouseEvent
): DOMPoint {
  const { x: containerX, y: containerY } = container.getBoundingClientRect();
  return new DOMPoint(event.clientX - containerX, event.clientY - containerY);
}
