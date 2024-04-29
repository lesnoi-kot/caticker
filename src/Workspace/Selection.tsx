import { useEffect, useRef } from "react";
import cn from "classnames";

import { useSelectedItemIds } from "@/store/workspace";
import {
  TransformState,
  getItemSizeFromGeometry,
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

  useEffect(() => {
    if (selectedItemIds.length === 0) {
      return;
    }

    function updateTransformStyle(state: TransformState) {
      if (
        !selectionRef.current ||
        !selectedItemIds.every((itemId) => Boolean(state.items[itemId]))
      ) {
        return;
      }

      const { width, height, transform } =
        selectedItemIds.length === 1
          ? computeItemBoundingBox(state, selectedItemIds[0])
          : computeBoundingBox(state, selectedItemIds);

      selectionRef.current.setAttribute(
        "style",
        `
          width: ${width}px;
          height: ${height}px;
          transform: ${transform};
        `
      );
    }

    updateTransformStyle(useTransformStore.getState());
    return useTransformStore.subscribe(updateTransformStyle);
  }, [selectedItemIds]);

  return (
    <div
      ref={selectionRef}
      draggable={false}
      className={cn(
        "workspace__stage-item__selection",
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

              onItemResizeStart(
                selectedItemIds[0],
                resizeType,
                event.nativeEvent
              );
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
};

function computeItemBoundingBox(
  state: TransformState,
  itemId: string
): SelectionGeometry {
  const geometry = state.items[itemId];
  const { transform, scale } = geometry;

  const unscaledTransform = new DOMMatrix()
    .multiplySelf(transform)
    .multiplySelf(new DOMMatrix().scaleSelf(scale.x, scale.y).inverse());

  const scaledSize = getItemSizeFromGeometry(geometry);

  if (scaledSize.x < 0) {
    unscaledTransform.scaleSelf(-1, 1);
  }
  if (scaledSize.y < 0) {
    unscaledTransform.scaleSelf(1, -1);
  }

  return {
    width: Math.abs(scaledSize.x),
    height: Math.abs(scaledSize.y),
    transform: unscaledTransform,
  };
}

function computeBoundingBox(
  state: TransformState,
  itemIds: string[]
): SelectionGeometry {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const points: DOMPointReadOnly[] = itemIds.flatMap((itemId) => {
    const { transform, unscaledWidth, unscaledHeight } = state.items[itemId];
    return [
      transform.transformPoint(new DOMPointReadOnly(0, 0)),
      transform.transformPoint(new DOMPointReadOnly(unscaledWidth, 0)),
      transform.transformPoint(
        new DOMPointReadOnly(unscaledWidth, unscaledHeight)
      ),
      transform.transformPoint(new DOMPointReadOnly(0, unscaledHeight)),
    ];
  });

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    transform: new DOMMatrixReadOnly().translate(minX, minY),
  };
}
