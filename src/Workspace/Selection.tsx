import { useEffect, useRef } from "react";
import cn from "classnames";

import { useSelectedItemIds } from "@/store/workspace";
import {
  TransformState,
  computeBoundingBox,
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
          --width: "${width.toFixed(0)}";
          --height: "${height.toFixed(0)}";
          --scaleX: "${Math.sign(1)}";
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
};

function computeItemBoundingBox(
  state: TransformState,
  itemId: string
): SelectionGeometry {
  const geometry = state.items[itemId];

  const unscaledTransform = new DOMMatrix()
    .translateSelf(geometry.translate.x, geometry.translate.y)
    .rotateSelf(geometry.rotation)
    .scaleSelf(Math.sign(geometry.scale.x), Math.sign(geometry.scale.y));
  const scaledSize = getItemSizeFromGeometry(geometry);

  return {
    width: Math.abs(scaledSize.x),
    height: Math.abs(scaledSize.y),
    transform: unscaledTransform,
  };
}
