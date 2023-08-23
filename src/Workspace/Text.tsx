import { useCallback, useEffect, useRef } from "react";

import { WorkspaceText, useWorkspaceStore } from "../store/workspace";

export default function Text({ item }: { item: WorkspaceText }) {
  const remove = useWorkspaceStore((store) => store.remove);
  const ref = useRef<HTMLDivElement>(null);

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (ref.current) {
      const x = ref.current.offsetLeft + event.movementX;
      const y = ref.current.offsetTop + event.movementY;
      ref.current.style.left = `${x}px`;
      ref.current.style.top = `${y}px`;
    }
  }, []);

  useEffect(() => {
    ref.current?.focus();
  });

  return (
    <div
      ref={ref}
      id={item.id}
      autoFocus
      contentEditable
      tabIndex={0}
      className="workspace__stage-text"
      draggable={false}
      onMouseDown={(event) => {
        if (event.button === 0) {
          document.addEventListener("mousemove", onMouseMove);
        }
      }}
      onMouseUp={() => {
        document.removeEventListener("mousemove", onMouseMove);
      }}
      onBlur={() => {
        if (!(ref.current?.textContent ?? "").trim()) {
          remove(item.id);
        }
      }}
    />
  );
}
