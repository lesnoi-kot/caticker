import { useCallback, useEffect, useMemo, useRef } from "react";

import type { WorkspacePicture } from "../store/workspace";

export default function Picture({ item }: { item: WorkspacePicture }) {
  const ref = useRef<HTMLImageElement>(null);

  const imageSrc = useMemo(() => URL.createObjectURL(item.file), [item.file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const onMouseMove = useCallback((event: MouseEvent) => {
    if (ref.current) {
      const x = ref.current.offsetLeft + event.movementX;
      const y = ref.current.offsetTop + event.movementY;
      ref.current.style.left = `${x}px`;
      ref.current.style.top = `${y}px`;
    }
  }, []);

  return (
    <img
      ref={ref}
      id={item.id}
      className="workspace__stage-picture"
      src={imageSrc}
      draggable={false}
      onMouseDown={(event) => {
        if (event.button === 0) {
          document.addEventListener("mousemove", onMouseMove);
        }
      }}
      onMouseUp={() => {
        document.removeEventListener("mousemove", onMouseMove);
      }}
    />
  );
}
