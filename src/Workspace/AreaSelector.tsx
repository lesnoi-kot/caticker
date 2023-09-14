import { useCallback, useEffect, useRef } from "react";

import { useWorkspaceItemIds, useWorkspaceStore } from "../store/workspace";
import { useTransformStore } from "../store/transforms";
import { getBoxedRelativeXY } from "../utils/events";
import { fastIntersectionCheck, rectToPoly } from "../utils/math";
import { useWorkspaceRef } from "./hooks";

function useWorkspaceSelectTool() {
  const { workspaceRef } = useWorkspaceRef();
  const selectNone = useWorkspaceStore((store) => store.selectNone);
  const selectMany = useWorkspaceStore((store) => store.selectMany);
  const stageSettings = useWorkspaceStore((store) => store.settings);
  const ids = useWorkspaceItemIds();
  const selectorRef = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect>(new DOMRect(0, 0, 0, 0));

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current || !selectorRef.current) {
        return;
      }

      const mouse = getBoxedRelativeXY(
        workspaceRef.current,
        event,
        stageSettings.stageWidth,
        stageSettings.stageHeight
      );
      const { left, top, width, height } = rect.current;
      rect.current.width = mouse.x - rect.current.x;
      rect.current.height = mouse.y - rect.current.y;

      selectorRef.current.setAttribute(
        "style",
        `
        display: block;
        left: ${left}px;
        top: ${top}px;
        width: ${Math.abs(width)}px;
        height: ${Math.abs(height)}px;
      `
      );

      const selectionPoly = rectToPoly(rect.current);
      if (selectionPoly.isEmpty()) {
        return;
      }

      const newlySelected = [] as string[];
      const transformsState = useTransformStore.getState().items;

      ids.forEach((id) => {
        const targetPoly = transformsState[id]?.polygon;

        if (
          targetPoly &&
          (fastIntersectionCheck(rect.current, targetPoly) ||
            selectionPoly.intersect(targetPoly).length > 0)
        ) {
          newlySelected.push(id);
        }
      });

      selectMany(newlySelected);
    },
    [workspaceRef, ids, selectMany, stageSettings]
  );

  const onMouseUp = useCallback(() => {
    selectorRef.current!.style.display = "none";
    document.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

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

      const mouse = getBoxedRelativeXY(
        workspaceRef.current,
        event,
        stageSettings.stageWidth,
        stageSettings.stageHeight
      );
      rect.current.x = mouse.x;
      rect.current.y = mouse.y;
      rect.current.width = rect.current.height = 0;

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp, { once: true });
    },
    [workspaceRef, onMouseMove, selectNone, onMouseUp, stageSettings]
  );

  useEffect(() => {
    const currentRef = workspaceRef.current;
    currentRef!.addEventListener("mousedown", onMouseDown);

    return () => {
      currentRef!.removeEventListener("mousedown", onMouseDown);
    };
  }, [onMouseDown, workspaceRef]);

  return { selectorRef };
}

export default function AreaSelector() {
  const selectTool = useWorkspaceSelectTool();

  return (
    <div ref={selectTool.selectorRef} className="workspace__result-selector" />
  );
}
