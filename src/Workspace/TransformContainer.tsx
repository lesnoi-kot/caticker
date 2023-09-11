import { ReactNode, useCallback, useEffect, useRef } from "react";
import cn from "classnames";

import { useIsItemSelected } from "../store/workspace";
import { ItemGeometryInfo, useTransformStore } from "../store/transforms";
import {
  getGeometry,
  getItemSize,
  useItemTransformActions,
  useWorkspaceRef,
} from "./hooks";
import ResizerDot from "./ResizerDot";
import { RESIZER_TYPES } from "./types";
import RotatorHandle from "./RotatorHandle";

type Props = {
  id: string;
  canResize?: boolean;
  canRotate?: boolean;
  children: ReactNode;
};

function TransformContainer({ id, children, canResize, canRotate }: Props) {
  const { onItemPress, onItemResizeStart, onItemRotateStart } =
    useWorkspaceRef();
  const isSelected = useIsItemSelected(id);
  const { createGeometry, resize } = useItemTransformActions(id);

  const innerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  const updateTransformStyle = useCallback(() => {
    const geometry = getGeometry(id);

    if (innerRef.current) {
      innerRef.current.style.transform = geometry.transform.toString();
    }

    if (selectionRef.current) {
      setSelectionTransformStyle(geometry, selectionRef.current);
    }
  }, [id]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const innerElSize = entries[0].borderBoxSize;
      resize(innerElSize[0].inlineSize, innerElSize[0].blockSize);
    });

    if (innerRef.current) {
      resizeObserver.observe(innerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [resize, updateTransformStyle]);

  useEffect(() => {
    createGeometry();

    return useTransformStore.subscribe((state, prevState) => {
      if (!Object.is(state.items[id], prevState.items[id])) {
        updateTransformStyle();
      }
    });
  }, [id, createGeometry, updateTransformStyle]);

  return (
    <div
      className="workspace__stage-item"
      id={`container-${id}`}
      draggable={false}
      onMouseDown={(event) => {
        event.stopPropagation();

        onItemPress(id, event.nativeEvent);
      }}
    >
      <div
        ref={innerRef}
        id={id}
        className={cn(
          "workspace__stage-item__inner",
          canResize && "workspace__stage-item__inner--absolute"
        )}
        draggable={false}
      >
        {children}
      </div>

      <div
        ref={selectionRef}
        draggable={false}
        className={cn(
          "workspace__stage-item__selection",
          !canResize && "workspace__stage-item__selection--auto",
          isSelected && "workspace__stage-item--selected"
        )}
      >
        {isSelected && canRotate && (
          <RotatorHandle
            onMouseDown={(event) => {
              event.stopPropagation();

              onItemRotateStart(id, event.nativeEvent);
            }}
          />
        )}

        {isSelected &&
          canResize &&
          RESIZER_TYPES.map((resizeType) => (
            <ResizerDot
              key={resizeType}
              position={resizeType}
              onMouseDown={(event) => {
                event.stopPropagation();

                onItemResizeStart(id, resizeType, event.nativeEvent);
              }}
            />
          ))}
      </div>
    </div>
  );
}

function setSelectionTransformStyle(
  geometry: ItemGeometryInfo,
  el: HTMLDivElement
) {
  const { transform, scale } = geometry;

  const unscaledTransform = new DOMMatrix()
    .multiplySelf(transform)
    .multiplySelf(new DOMMatrix().scaleSelf(scale.x, scale.y).inverse());

  const scaledSize = getItemSize(geometry);

  if (scaledSize.x < 0) {
    unscaledTransform.scaleSelf(-1, 1);
  }
  if (scaledSize.y < 0) {
    unscaledTransform.scaleSelf(1, -1);
  }

  el.setAttribute(
    "style",
    `
      width: ${Math.abs(scaledSize.x)}px;
      height: ${Math.abs(scaledSize.y)}px;
      transform: ${unscaledTransform};
    `
  );
}

export default TransformContainer;
