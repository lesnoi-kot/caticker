import { useCallback, useEffect, useRef } from "react";

import { useWorkspaceStore } from "../store/workspace";
import { getBoxedRelativeXY } from "../utils/events";
import { useWorkspaceRef } from "./hooks";

function useWorkspaceSelectTool() {
  const workspaceRef = useWorkspaceRef();
  const selectNone = useWorkspaceStore((store) => store.selectNone);
  const selectorRef = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect>(new DOMRect(0, 0, 0, 0));

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current || !selectorRef.current) {
        return;
      }

      const [moveX, moveY] = getBoxedRelativeXY(workspaceRef.current, event);
      rect.current.width = moveX - rect.current.x;
      rect.current.height = moveY - rect.current.y;

      selectorRef.current.style.left = `${rect.current.left}px`;
      selectorRef.current.style.top = `${rect.current.top}px`;
      selectorRef.current.style.width = `${Math.abs(rect.current.width)}px`;
      selectorRef.current.style.height = `${Math.abs(rect.current.height)}px`;
    },
    [workspaceRef]
  );

  const onMouseDown = useCallback(
    (event: MouseEvent) => {
      if (event.button !== 0) {
        return;
      }

      if (
        event.target !== workspaceRef.current ||
        workspaceRef.current === null ||
        !selectorRef.current
      ) {
        return;
      }

      selectNone();

      const [clickX, clickY] = getBoxedRelativeXY(workspaceRef.current, event);
      rect.current.x = clickX;
      rect.current.y = clickY;
      rect.current.width = rect.current.height = 0;

      selectorRef.current.style.width = "0px";
      selectorRef.current.style.height = "0px";
      selectorRef.current.style.left = `${rect.current.left}px`;
      selectorRef.current.style.top = `${rect.current.top}px`;
      selectorRef.current.style.display = "block";

      document.addEventListener("mousemove", onMouseMove);
    },
    [workspaceRef, onMouseMove, selectNone]
  );

  const onMouseUp = useCallback(() => {
    selectorRef.current!.style.display = "none";
    document.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [onMouseUp, onMouseDown]);

  return { selectorRef };
}

export default function AreaSelector() {
  const selectTool = useWorkspaceSelectTool();

  return (
    <div ref={selectTool.selectorRef} className="workspace__result-selector" />
  );
}
