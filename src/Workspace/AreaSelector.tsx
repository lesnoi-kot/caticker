import { useCallback, useEffect, useRef } from "react";
import geometry from "@flatten-js/core";

import { useWorkspaceItemIds, useWorkspaceStore } from "../store/workspace";
import { getBoxedRelativeXY } from "../utils/events";
import { useWorkspaceRef } from "./hooks";

function useWorkspaceSelectTool() {
  const workspaceRef = useWorkspaceRef();
  const selectNone = useWorkspaceStore((store) => store.selectNone);
  const selectMany = useWorkspaceStore((store) => store.selectMany);
  const ids = useWorkspaceItemIds();
  const selectorRef = useRef<HTMLDivElement>(null);
  const rect = useRef<DOMRect>(new DOMRect(0, 0, 0, 0));

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current || !selectorRef.current) {
        return;
      }

      const [moveX, moveY] = getBoxedRelativeXY(workspaceRef.current, event);
      const { left, top, width, height } = rect.current;
      rect.current.width = moveX - rect.current.x;
      rect.current.height = moveY - rect.current.y;

      selectorRef.current.style.left = `${left}px`;
      selectorRef.current.style.top = `${top}px`;
      selectorRef.current.style.width = `${Math.abs(width)}px`;
      selectorRef.current.style.height = `${Math.abs(height)}px`;

      const selectionPoly = new geometry.Polygon([
        geometry.point(left, top),
        geometry.point(left + Math.abs(width), top),
        geometry.point(left + Math.abs(width), top + Math.abs(height)),
        geometry.point(left, top + Math.abs(height)),
      ]);

      if (
        selectionPoly.isEmpty() ||
        !selectionPoly.isValid() ||
        selectionPoly.vertices.length !== 4
      ) {
        return;
      }

      const selected = [] as string[];

      ids.forEach((id) => {
        const el = document.getElementById(id);

        if (el) {
          const m = new DOMMatrix(el.style.transform);

          const p1 = m.transformPoint(new DOMPoint(0, 0));
          const p2 = m.transformPoint(new DOMPoint(100, 0));
          const p3 = m.transformPoint(new DOMPoint(100, 100));
          const p4 = m.transformPoint(new DOMPoint(0, 100));

          const targetPoly = new geometry.Polygon([
            geometry.point(p1.x, p1.y),
            geometry.point(p2.x, p2.y),
            geometry.point(p3.x, p3.y),
            geometry.point(p4.x, p4.y),
          ]);

          if (
            containsRect(selectionPoly, targetPoly) ||
            selectionPoly.intersect(targetPoly).length > 0
          ) {
            selected.push(id);
          }
        }
      });

      selectMany(selected);
    },
    [workspaceRef, ids, selectMany]
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

function containsRect(rect: geometry.Polygon, item: geometry.Polygon): boolean {
  const [p1, p2, p3, p4] = rect.vertices;

  for (const v of item.vertices) {
    if (v.x >= p1.x && v.y >= p1.y && v.x <= p3.x && v.y <= p3.y) {
      return true;
    }
  }

  return false;
}
