import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";

import { useSelectedItemIds } from "@/store/workspace";
import {
  computeBoundingBox,
  getItemSizeFromGeometry,
  type ItemGeometryInfo,
  useItemsTransform,
  useTransformStore,
} from "@/store/transforms";

import { useWorkspaceRef } from "./hooks";
import { RESIZER_TYPES } from "./types";
import ResizerDot from "./ui/ResizerDot";
import RotatorHandle from "./ui/RotatorHandle";

export function Selection() {
  const { onItemResizeStart, onItemRotateStart } = useWorkspaceRef();
  const selectionRef = useRef<HTMLDivElement>(null);
  const selectedItemIds = useSelectedItemIds();
  const canResize = selectedItemIds.length === 1;
  const canRotate = selectedItemIds.length === 1;
  const selectedItemsTransform = useItemsTransform(selectedItemIds);

  const boundingBox = useMemo<SelectionGeometry | null>(() => {
    if (selectedItemsTransform.length === 0) {
      return null;
    }

    if (!selectionRef.current || !selectedItemsTransform.every(Boolean)) {
      return null;
    }

    if (selectedItemsTransform.length === 1) {
      return computeItemBoundingBox(selectedItemsTransform[0]);
    }

    return computeBoundingBox(useTransformStore.getState(), selectedItemIds);
  }, [selectedItemIds, selectedItemsTransform]);

  useEffect(() => {
    if (boundingBox) {
      const { width, height, transform } = boundingBox;
      selectionRef.current?.setAttribute(
        "style",
        `width: ${width}px; height: ${height}px; transform: ${transform};`
      );
    }
  }, [boundingBox]);

  return (
    <div
      ref={selectionRef}
      draggable={false}
      className={clsx(
        " absolute pointer-events-none origin-top-left outline-dashed outline-1 outline-slate-950",
        selectedItemIds.length === 0 && "hidden"
      )}
    >
      {canRotate && (
        <RotatorHandle
          onMouseDown={(event) => {
            event.stopPropagation();

            onItemRotateStart(selectedItemIds[0], event.nativeEvent);
          }}
        />
      )}

      {canResize &&
        RESIZER_TYPES.map((resizeType) => (
          <ResizerDot
            key={resizeType}
            position={resizeType}
            onMouseDown={(event) => {
              event.stopPropagation();

              onItemResizeStart(resizeType, event.nativeEvent);
            }}
          />
        ))}
    </div>
  );
}

type SelectionGeometry = {
  width: number;
  height: number;
  transform: DOMMatrixReadOnly;
  rotation?: number;
};

function computeItemBoundingBox(geometry: ItemGeometryInfo): SelectionGeometry {
  const unscaledTransform = new DOMMatrix()
    .translateSelf(geometry.translate.x, geometry.translate.y)
    .rotateSelf(geometry.rotation)
    .scaleSelf(Math.sign(geometry.scale.x), Math.sign(geometry.scale.y));
  const scaledSize = getItemSizeFromGeometry(geometry);

  return {
    width: Math.abs(scaledSize.x),
    height: Math.abs(scaledSize.y),
    transform: unscaledTransform,
    rotation: geometry.rotation,
  };
}
