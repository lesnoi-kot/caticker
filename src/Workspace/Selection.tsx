import { useEffect, useMemo, useRef } from "react";
import cn from "classnames";

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
import ResizerDot from "./ResizerDot";
import RotatorHandle from "./RotatorHandle";

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

    const boundingBox =
      selectedItemsTransform.length === 1
        ? computeItemBoundingBox(selectedItemsTransform[0])
        : computeBoundingBox(useTransformStore.getState(), selectedItemIds);
    return boundingBox;
  }, [selectedItemIds, selectedItemsTransform]);

  useEffect(() => {
    if (boundingBox) {
      const { width, height, transform } = boundingBox;
      selectionRef.current?.setAttribute(
        "style",
        `width: ${width}px; height: ${height}px; transform: ${transform};`
      );
    }
  }, [selectedItemIds, boundingBox]);

  return (
    <div
      ref={selectionRef}
      draggable={false}
      className={cn(
        "workspace__stage-item__selection",
        selectedItemIds.length === 0 && "hidden"
      )}
    >
      <SizeLabels boundingBox={boundingBox} />

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

function SizeLabels({
  boundingBox,
}: {
  boundingBox: SelectionGeometry | null;
}) {
  if (!boundingBox) {
    return null;
  }

  const { width, height, rotation = 0 } = boundingBox;
  const caption = `${Math.round(width)}×${Math.round(height)}`;
  const idx = Math.round(((360 + rotation) % 360) / 90) % 4;
  const labels = [
    <span className="workspace__stage-item__selection-label left-1/2 top-0 -translate-x-1/2 -translate-y-full">
      {caption}
    </span>,
    <span className="workspace__stage-item__selection-label left-0 top-1/2 -rotate-90 -translate-y-1/2 -translate-x-3/4">
      {caption}
    </span>,
    <span className="workspace__stage-item__selection-label left-1/2 bottom-0 -translate-x-1/2 translate-y-full -scale-x-100 -scale-y-100">
      {caption}
    </span>,
    <span className="workspace__stage-item__selection-label right-0 top-1/2 rotate-90 -translate-y-1/2 translate-x-3/4">
      {caption}
    </span>,
  ];
  return labels[idx];
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
