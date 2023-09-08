import { useCallback, useEffect, useRef } from "react";
import cn from "classnames";

import {
  useIsItemSelected,
  useWorkspaceItem,
  useWorkspaceStore,
} from "../store/workspace";
import { useTransformStore } from "../store/transforms";
import { ItemComponentInterface } from "./types";
import { useTransformActions, useWorkspaceRef } from "./hooks";
import { degToRad, distance, getOrigin, radToDeg } from "../utils/math";
import { getRelativeXY } from "../utils/events";

type Props = {
  id: string;
  View: React.FC<ItemComponentInterface>;
  canResize?: boolean;
  canRotate?: boolean;
};

function ItemContainer({ id, View, canResize }: Props) {
  const workspaceRef = useWorkspaceRef();
  const innerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  const resizeDirection = useRef<string>("r");

  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const selectMore = useWorkspaceStore((store) => store.selectMore);
  const isSelected = useIsItemSelected(id);
  const item = useWorkspaceItem(id);

  const {
    translate,
    translateTo,
    rotateToAround,
    scaleXTo,
    scaleYTo,
    createGeometry,
    resize,
  } = useTransformActions(id);

  const getGeometry = useCallback(() => {
    const geometry = useTransformStore.getState().items[id];
    return geometry;
  }, [id]);

  const getItemSize = useCallback((): DOMPoint => {
    const { scale, unscaledWidth, unscaledHeight } = getGeometry();

    if (canResize) {
      return new DOMPoint(unscaledWidth * scale.x, unscaledHeight * scale.y);
    }

    return new DOMPoint(unscaledWidth, unscaledHeight);
  }, [canResize, getGeometry]);

  const getCenter = useCallback((): DOMPoint => {
    const { unscaledWidth, unscaledHeight, transform } = getGeometry();
    return transform.transformPoint(
      new DOMPoint(unscaledWidth / 2, unscaledHeight / 2)
    );
  }, [getGeometry]);

  const updateTransformStyle = useCallback(() => {
    const { scale, transform } = getGeometry();

    if (innerRef.current) {
      innerRef.current.style.transform = transform.toString();
    }

    if (selectionRef.current) {
      const unscaledTransform = new DOMMatrix()
        .multiplySelf(transform)
        .multiplySelf(new DOMMatrix().scaleSelf(scale.x, scale.y).inverse());

      const scaledSize = getItemSize();

      if (scaledSize.x < 0) {
        selectionRef.current.style.width = `${Math.abs(scaledSize.x)}px`;
        unscaledTransform.scaleSelf(-1, 1);
      } else {
        selectionRef.current.style.width = `${scaledSize.x}px`;
      }

      if (scaledSize.y < 0) {
        selectionRef.current.style.height = `${Math.abs(scaledSize.y)}px`;
        unscaledTransform.scaleSelf(1, -1);
      } else {
        selectionRef.current.style.height = `${scaledSize.y}px`;
      }

      selectionRef.current.style.transform = unscaledTransform.toString();
    }
  }, [getItemSize, getGeometry]);

  // Move current item.
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      translate(event.movementX, event.movementY);
    },
    [translate]
  );

  // Resize current item.
  const onResizerMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const { unscaledWidth, unscaledHeight, rotation, transform } =
        getGeometry();
      const mouse = getRelativeXY(workspaceRef.current, event);
      const rotationRad = degToRad(rotation);
      const origin = getOrigin(transform);
      const distToOrigin = distance(mouse, origin);
      const angleToOrigin = Math.atan2(mouse.y - origin.y, mouse.x - origin.x);

      if (resizeDirection.current.includes("r")) {
        scaleXTo(
          (distToOrigin * Math.cos(angleToOrigin - rotationRad)) / unscaledWidth
        );
      }

      if (resizeDirection.current.includes("b")) {
        scaleYTo(
          (distToOrigin * Math.sin(angleToOrigin - rotationRad)) /
            unscaledHeight
        );
      }
    },
    [workspaceRef, getGeometry, scaleXTo, scaleYTo]
  );

  // Rotate current item.
  const onRotatorMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const { scale } = getGeometry();
      const center = getCenter();
      const scaledSize = getItemSize();
      const mouse = getRelativeXY(workspaceRef.current, event);

      const newRotation =
        Math.atan2(mouse.y - center.y, mouse.x - center.x) -
        (scale.x < 0 ? -Math.PI : 0);

      rotateToAround(
        radToDeg(newRotation),
        new DOMPoint(scaledSize.x / 2, scaledSize.y / 2)
      );
    },
    [workspaceRef, getCenter, getGeometry, rotateToAround, getItemSize]
  );

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousemove", onResizerMouseMove);
    document.removeEventListener("mousemove", onRotatorMouseMove);

    const { rotation } = getGeometry();
    const center = getCenter();
    const scaledSize = getItemSize();

    translateTo(center.x - scaledSize.x / 2, center.y - scaledSize.y / 2);
    rotateToAround(rotation, new DOMPoint(scaledSize.x / 2, scaledSize.y / 2));
  }, [
    onMouseMove,
    onResizerMouseMove,
    onRotatorMouseMove,
    getCenter,
    getItemSize,
    translateTo,
    getGeometry,
    rotateToAround,
  ]);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);

      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousemove", onResizerMouseMove);
      document.removeEventListener("mousemove", onRotatorMouseMove);
    };
  }, [onMouseUp, onMouseMove, onResizerMouseMove, onRotatorMouseMove]);

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

    return useTransformStore.subscribe(() => {
      updateTransformStyle();
    });
  }, [createGeometry, updateTransformStyle]);

  const onResizerMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (event.button === 0) {
      resizeDirection.current =
        (event.target as HTMLDivElement).dataset.direction ?? "";

      document.addEventListener("mousemove", onResizerMouseMove);
    }
  };

  return (
    <div
      className="workspace__stage-item"
      id={`container-${item.id}`}
      draggable={false}
      onMouseDown={(event) => {
        if (event.button === 0) {
          document.addEventListener("mousemove", onMouseMove);

          if (event.ctrlKey) {
            selectMore(id);
            // } else if (selectedIds.length === 0) {
          } else {
            selectOne(id);
          }
        }
      }}
    >
      <div
        ref={innerRef}
        id={item.id}
        className={cn(
          "workspace__stage-item__inner",
          canResize && "workspace__stage-item__inner--absolute"
        )}
        draggable={false}
      >
        <View item={item} selected={isSelected} />
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
        {isSelected && (
          <div
            onMouseDown={(event) => {
              event.stopPropagation();

              if (event.button === 0) {
                document.addEventListener("mousemove", onRotatorMouseMove);
              }
            }}
            draggable={false}
            className="workspace__stage-item__anchor workspace__stage-item__anchor-rotate"
          ></div>
        )}

        {isSelected &&
          canResize &&
          ["r", "b", "rb"].map((direction) => (
            <div
              key={direction}
              draggable={false}
              className={`workspace__stage-item__anchor workspace__stage-item__anchor--${direction}`}
              onMouseDown={onResizerMouseDown}
              data-direction={direction}
            ></div>
          ))}
      </div>
    </div>
  );
}

export default ItemContainer;
