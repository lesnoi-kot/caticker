import { useCallback, useEffect, useRef } from "react";
import cn from "classnames";

import {
  useIsItemSelected,
  useWorkspaceItem,
  useWorkspaceStore,
} from "../store/workspace";
// import { useTransformStore } from "../store/transforms";
import { ImperativeTransformEvent, ItemComponentInterface } from "./types";
import { useWorkspaceRef } from "./hooks";
import { degToRad, distance, radToDeg } from "../utils/math";
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

  const scale = useRef<DOMPoint>(new DOMPoint(1, 1));
  const rotation = useRef<number>(0);
  const resizeDirection = useRef<string>("r");
  const originalSize = useRef<DOMPoint>(new DOMPoint(0, 0));

  const translationMatrix = useRef<DOMMatrix>(new DOMMatrix());
  const rotationMatrix = useRef<DOMMatrix>(new DOMMatrix());
  const scaleMatrix = useRef<DOMMatrix>(new DOMMatrix());

  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const selectMore = useWorkspaceStore((store) => store.selectMore);
  const selected = useIsItemSelected(id);
  const item = useWorkspaceItem(id);

  const getItemSize = useCallback(() => {
    if (canResize) {
      return scaleMatrix.current.transformPoint(originalSize.current);
    }

    return originalSize.current;
  }, [canResize]);

  const getTransform = useCallback(() => {
    const matrix = new DOMMatrix()
      .multiplySelf(translationMatrix.current)
      .multiplySelf(rotationMatrix.current)
      .multiplySelf(scaleMatrix.current);

    return matrix;
  }, []);

  const getOrigin = useCallback(() => {
    return getTransform().transformPoint(new DOMPoint(0, 0));
  }, [getTransform]);

  const getCenter = useCallback(() => {
    return getTransform().transformPoint(
      new DOMPoint(originalSize.current.x / 2, originalSize.current.y / 2)
    );
  }, [getTransform]);

  const recalcRotation = useCallback(() => {
    const scaledSize = getItemSize();

    rotationMatrix.current = new DOMMatrix()
      .translateSelf(scaledSize.x / 2, scaledSize.y / 2)
      .rotateSelf(0, 0, rotation.current)
      .translateSelf(-scaledSize.x / 2, -scaledSize.y / 2);
  }, [getItemSize]);

  const updateTransformStyle = useCallback(() => {
    const transform = getTransform();

    if (innerRef.current) {
      innerRef.current.style.transform = transform.toString();
    }

    if (selectionRef.current) {
      const unscaledTransform = new DOMMatrix()
        .multiplySelf(transform)
        .multiplySelf(scaleMatrix.current.inverse());

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

    // const center = getCenter();
    // const origin = getOrigin();
    // Object.assign(
    //   (document.querySelector(".workspace__result-dot") as HTMLDivElement)
    //     .style,
    //   {
    //     left: `${center.x}px`,
    //     top: `${center.y}px`,
    //   }
    // );
    // Object.assign(
    //   (document.querySelector(".workspace__result-origin") as HTMLDivElement)
    //     .style,
    //   {
    //     left: `${origin.x}px`,
    //     top: `${origin.y}px`,
    //   }
    // );
  }, [getTransform, getItemSize]);

  // Move current item.
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      translationMatrix.current.translateSelf(event.movementX, event.movementY);
      updateTransformStyle();
    },
    [updateTransformStyle]
  );

  // Resize current item.
  const onResizerMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const mouse = getRelativeXY(workspaceRef.current, event);
      const rotationRad = degToRad(rotation.current);
      const origin = getOrigin();
      const distToOrigin = distance(mouse, origin);
      const angleToOrigin = Math.atan2(mouse.y - origin.y, mouse.x - origin.x);

      scaleMatrix.current = new DOMMatrix();

      if (resizeDirection.current.includes("r")) {
        scale.current.x =
          (distToOrigin * Math.cos(angleToOrigin - rotationRad)) /
          originalSize.current.x;
      }

      if (resizeDirection.current.includes("b")) {
        scale.current.y =
          (distToOrigin * Math.sin(angleToOrigin - rotationRad)) /
          originalSize.current.y;
      }

      scaleMatrix.current.scaleSelf(scale.current.x, scale.current.y);

      updateTransformStyle();
    },
    [workspaceRef, updateTransformStyle, getOrigin]
  );

  // Rotate current item.
  const onRotatorMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const center = getCenter();
      const mouse = getRelativeXY(workspaceRef.current, event);

      rotation.current = radToDeg(
        Math.atan2(mouse.y - center.y, mouse.x - center.x)
      );

      if (scale.current.x < 0) {
        rotation.current -= 180;
      }

      recalcRotation();
      updateTransformStyle();
    },
    [workspaceRef, getCenter, updateTransformStyle, recalcRotation]
  );

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousemove", onResizerMouseMove);
    document.removeEventListener("mousemove", onRotatorMouseMove);

    const center = getCenter();
    const scaledSize = getItemSize();

    translationMatrix.current = new DOMMatrix().translateSelf(
      center.x - scaledSize.x / 2,
      center.y - scaledSize.y / 2
    );

    recalcRotation();
    updateTransformStyle();
  }, [
    onMouseMove,
    onResizerMouseMove,
    onRotatorMouseMove,
    updateTransformStyle,
    getCenter,
    getItemSize,
    recalcRotation,
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

  const listenCommands = useCallback(
    (event: ImperativeTransformEvent) => {
      const { command } = event.detail;

      switch (command) {
        case "flipX":
          scaleMatrix.current.scaleSelf(-1, 1);
          scale.current.x *= -1;
          break;
        case "flipY":
          scaleMatrix.current.scaleSelf(1, -1);
          scale.current.y *= -1;
          break;
        case "+rotateZ":
          rotation.current += 90;
          break;
        case "-rotateZ":
          rotation.current -= 90;
          break;
        case "rotateZ=0":
          rotation.current = 0;
          break;
        case "originalScale":
          scaleMatrix.current = new DOMMatrix().scaleSelf(1, 1);
          scale.current.x = scale.current.y = 1;
          break;
        default:
          return;
      }

      recalcRotation();
      updateTransformStyle();
    },
    [updateTransformStyle, recalcRotation]
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const innerElSize = entries[0].borderBoxSize;
      originalSize.current.x = innerElSize[0].inlineSize;
      originalSize.current.y = innerElSize[0].blockSize;

      updateTransformStyle();
    });

    const ref = innerRef.current;

    if (ref) {
      resizeObserver.observe(ref);
      ref.addEventListener(ImperativeTransformEvent.type, listenCommands);
    }

    return () => {
      resizeObserver.disconnect();
      ref?.removeEventListener(ImperativeTransformEvent.type, listenCommands);
    };
  }, [updateTransformStyle, listenCommands]);

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
      draggable={false}
      onMouseDown={(event) => {
        if (event.button === 0) {
          document.addEventListener("mousemove", onMouseMove);

          if (event.ctrlKey) {
            selectMore(id);
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
        style={{ transform: getTransform().toString() }}
        draggable={false}
      >
        <View item={item} selected={selected} />
      </div>

      <div
        ref={selectionRef}
        draggable={false}
        className={cn(
          "workspace__stage-item__selection",
          !canResize && "workspace__stage-item__selection--auto",
          selected && "workspace__stage-item--selected"
        )}
      >
        {selected && (
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

        {selected &&
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
