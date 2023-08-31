import { useCallback, useEffect, useRef } from "react";
import cn from "classnames";

import {
  useIsItemSelected,
  useWorkspaceItem,
  useWorkspaceStore,
} from "../store/workspace";
import { ItemComponentInterface } from "./types";
import { getRelativeXY, getRelativeXY2, useWorkspaceRef } from "./hooks";

type Props = {
  id: string;
  View: React.FC<ItemComponentInterface>;
  canResize?: boolean;
  canRotate?: boolean;
};

const radToDeg = (r: number) => (r * 180) / Math.PI;
const degToRad = (d: number) => (d * Math.PI) / 180;

function ItemContainer({ id, View, canResize }: Props) {
  console.log(`ItemContainer ${id}`);

  const workspaceRef = useWorkspaceRef();
  const innerRef = useRef<HTMLDivElement | null>(null);
  const selectionRef = useRef<HTMLDivElement>(null);

  const scale = useRef<DOMPoint>(new DOMPoint(1, 1));
  const rotation = useRef<number>(0);
  const resizeDirection = useRef<string>("r");
  const size = useRef<DOMPoint>(new DOMPoint(0, 0));

  const translationMatrix = useRef<DOMMatrix>(new DOMMatrix());
  const rotationMatrix = useRef<DOMMatrix>(new DOMMatrix());
  const scaleMatrix = useRef<DOMMatrix>(new DOMMatrix());

  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const selectMore = useWorkspaceStore((store) => store.selectMore);
  const selected = useIsItemSelected(id);
  const item = useWorkspaceItem(id);

  const getOrigin = useCallback(() => {
    return new DOMMatrix()
      .multiplySelf(translationMatrix.current)
      .multiplySelf(rotationMatrix.current)
      .multiplySelf(scaleMatrix.current)
      .transformPoint(new DOMPoint(0, 0));
  }, []);

  const getCenter = useCallback(() => {
    return new DOMMatrix()
      .multiplySelf(translationMatrix.current)
      .multiplySelf(rotationMatrix.current)
      .multiplySelf(scaleMatrix.current)
      .transformPoint(new DOMPoint(size.current.x / 2, size.current.y / 2));
  }, []);

  const getTransform = useCallback(() => {
    const matrix = new DOMMatrix()
      .multiplySelf(translationMatrix.current)
      .multiplySelf(rotationMatrix.current)
      .multiplySelf(scaleMatrix.current);

    return matrix;
  }, []);

  const updateTransformStyle = useCallback(() => {
    const transform = getTransform();

    if (innerRef.current) {
      innerRef.current.style.transform = transform.toString();
    }

    if (selectionRef.current) {
      const unscaledTransform = new DOMMatrix()
        .multiplySelf(transform)
        .multiplySelf(scaleMatrix.current.inverse());

      const scaledSize = scaleMatrix.current.transformPoint(
        new DOMPoint(size.current.x, size.current.y)
      );
      selectionRef.current.style.width = `${scaledSize.x}px`;
      selectionRef.current.style.height = `${scaledSize.y}px`;
      selectionRef.current.style.transform = unscaledTransform.toString();
    }
  }, [getTransform]);

  // Move current item.
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      translationMatrix.current.translateSelf(event.movementX, event.movementY);

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

      updateTransformStyle();
    },
    [workspaceRef, getTransform, updateTransformStyle, getCenter]
  );

  // Resize current item.
  const onResizerMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const [moveX, moveY] = getRelativeXY(workspaceRef.current, event);
      const rotationRad = degToRad(rotation.current);

      // const center = getCenter();
      const origin = getOrigin();
      const dist = Math.sqrt((moveX - origin.x) ** 2 + (moveY - origin.y) ** 2);

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

      // const origin = new DOMMatrix()
      //   .multiplySelf(translationMatrix.current)
      //   .multiplySelf(rotationMatrix.current)
      //   .multiplySelf(scaleMatrix.current)
      //   .transformPoint(new DOMPoint(0, 0));

      // if (resizeDirection.current.includes("l")) {
      //   const farX = position.current.x + scaledWidth * Math.cos(rotationRad);
      //   const farY = position.current.y + scaledHeight * Math.sin(rotationRad);
      //   const dist = Math.sqrt((moveX - farX) ** 2 + (moveY - farY) ** 2);
      //   const angle = Math.atan2(farY - moveY, farX - moveX);
      //   position.current.x = moveX;
      //   scale.current.x =
      //     (dist * Math.cos(angle - rotationRad)) / el.clientWidth;
      // }

      if (resizeDirection.current.includes("r")) {
        const angle = Math.atan2(moveY - origin.y, moveX - origin.x);
        scale.current.x =
          (dist * Math.cos(angle - rotationRad)) / size.current.x;
      }

      if (resizeDirection.current.includes("b")) {
        const angle = Math.atan2(moveY - origin.y, moveX - origin.x);
        scale.current.y =
          (dist * Math.sin(angle - rotationRad)) / size.current.y;
      }

      scaleMatrix.current = new DOMMatrix();
      scaleMatrix.current.scaleSelf(scale.current.x, scale.current.y);

      updateTransformStyle();
    },
    [getTransform, workspaceRef, getCenter, updateTransformStyle]
  );

  // Rotate current item.
  const onRotatorMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const center = getCenter();
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

      const [moveX, moveY] = getRelativeXY2(workspaceRef.current, event);
      const scaledSize = scaleMatrix.current.transformPoint(
        new DOMPoint(size.current.x, size.current.y)
      );

      rotation.current = radToDeg(
        Math.atan2(moveY - center.y, moveX - center.x)
      );

      rotationMatrix.current = new DOMMatrix();
      rotationMatrix.current.translateSelf(scaledSize.x / 2, scaledSize.y / 2);
      rotationMatrix.current.rotateSelf(0, 0, rotation.current);
      rotationMatrix.current.translateSelf(
        -scaledSize.x / 2,
        -scaledSize.y / 2
      );

      updateTransformStyle();
    },
    [workspaceRef, getTransform, getCenter, updateTransformStyle]
  );

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousemove", onResizerMouseMove);
    document.removeEventListener("mousemove", onRotatorMouseMove);

    const center = getCenter();
    const scaledSize = scaleMatrix.current.transformPoint(
      new DOMPoint(size.current.x, size.current.y)
    );

    translationMatrix.current = new DOMMatrix().translateSelf(
      center.x - scaledSize.x / 2,
      center.y - scaledSize.y / 2
    );

    rotationMatrix.current = new DOMMatrix()
      .translateSelf(scaledSize.x / 2, scaledSize.y / 2)
      .rotateSelf(0, 0, rotation.current)
      .translateSelf(-scaledSize.x / 2, -scaledSize.y / 2);

    updateTransformStyle();
  }, [
    onMouseMove,
    onResizerMouseMove,
    onRotatorMouseMove,
    updateTransformStyle,
  ]);

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseUp]);

  useEffect(() => {
    if (innerRef.current && size.current.x === 0) {
      size.current.x = innerRef.current.clientWidth;
      size.current.y = innerRef.current.clientHeight;

      updateTransformStyle();
    }
  }, [innerRef.current, updateTransformStyle]);

  const onResizerMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      if (event.button === 0) {
        resizeDirection.current =
          (event.target as HTMLDivElement).dataset.direction ?? "";

        document.addEventListener("mousemove", onResizerMouseMove);
      }
    },
    [onResizerMouseMove]
  );

  const onRotatorMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();

      if (event.button === 0) {
        document.addEventListener("mousemove", onRotatorMouseMove);
      }
    },
    [onRotatorMouseMove]
  );

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
          selected && "workspace__stage-item--selected"
        )}
      >
        {selected && (
          <div
            onMouseDown={onRotatorMouseDown}
            draggable={false}
            className="workspace__stage-item__anchor workspace__stage-item__anchor-rotate"
          ></div>
        )}

        {selected &&
          canResize &&
          [/*"l", "t",*/ "r", "b", "rb"].map((direction) => (
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
