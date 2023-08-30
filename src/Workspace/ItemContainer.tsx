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
  const ref = useRef<HTMLDivElement>(null);
  // const dotRef = useRef<HTMLDivElement>(null);
  const position = useRef<DOMPoint>(new DOMPoint(0, 0));
  const scale = useRef<DOMPoint>(new DOMPoint(1, 1));
  const rotation = useRef<number>(0);
  const resizeDirection = useRef<string>("r");
  const size = useRef<DOMPoint>(new DOMPoint(100, 100));

  const transform = useRef<DOMMatrix>(new DOMMatrix());
  const translationMatrix = useRef<DOMMatrix>(new DOMMatrix());
  const rotationMatrix = useRef<DOMMatrix>(new DOMMatrix());
  const scaleMatrix = useRef<DOMMatrix>(new DOMMatrix());

  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const selectMore = useWorkspaceStore((store) => store.selectMore);
  const selected = useIsItemSelected(id);
  const item = useWorkspaceItem(id);

  const getOrigin = useCallback(() => {
    console.log(rotation.current);

    return (
      new DOMMatrix()
        .multiplySelf(translationMatrix.current)
        // .translateSelf(50 * scale.current.x, 50 * scale.current.y)
        // .rotateSelf(0, 0, rotation.current)
        // .translateSelf(-50 * scale.current.x, -50 * scale.current.y)
        .multiplySelf(rotationMatrix.current)
        // .multiplySelf(scaleMatrix.current)
        .transformPoint(new DOMPoint(0, 0))
    );
  }, []);

  const getCenter = useCallback(() => {
    console.log(rotation.current);

    return (
      new DOMMatrix()
        .multiplySelf(translationMatrix.current)
        // .translateSelf(50 * scale.current.x, 50 * scale.current.y)
        // .rotateSelf(0, 0, rotation.current)
        // .translateSelf(-50 * scale.current.x, -50 * scale.current.y)
        .multiplySelf(rotationMatrix.current)
        // .multiplySelf(scaleMatrix.current)
        .transformPoint(new DOMPoint(size.current.x / 2, size.current.y / 2))
    );
  }, []);

  // const w = ref.current.clientWidth;
  // const h = ref.current.clientHeight;

  // matrix(1.4142135381698608, 1.4142135381698608, -0.7071067690849304, 0.7071067690849304, 214.6446533203125, 143.93399047851562)
  const getTransform = useCallback(() => {
    const matrix = new DOMMatrix();
    matrix
      .multiplySelf(translationMatrix.current)
      .multiplySelf(rotationMatrix.current)
      .multiplySelf(scaleMatrix.current);

    // matrix.translateSelf(position.current.x, position.current.y);

    // const position = matrix.transformPoint(new DOMPoint(0, 0));
    // const center = matrix
    // .scale(scale.current.x, scale.current.y)
    // .transformPoint(new DOMPoint(50, 50));
    // const scaledWidth = scale.current.x * 50;
    // const scaledHeight = scale.current.y * 50;

    // const prevScaleX = scale.current.x;
    // const prevScaleY = scale.current.y;

    // matrix.translateSelf(center.x, center.y);
    // matrix.translateSelf(50 * scale.current.x, 50 * scale.current.y);

    // matrix.translateSelf(50, 50);
    // matrix.rotateSelf(0, 0, rotation.current);
    // matrix.translateSelf(-50, -50);

    // matrix.translateSelf(-50 * scale.current.x, -50 * scale.current.y);
    // matrix.translateSelf(-center.x, -center.y);

    // matrix.scaleSelf(scale.current.x, scale.current.y);

    // console.log(matrix.transformPoint(new DOMPoint(0, 100)));

    // const moved = `translate(${position.current.x}px, ${position.current.y}px)`;
    // const rotated = `translate(${centerX}px, ${centerY}px) rotate(${
    //   rotation.current
    // }deg) translate(${-centerX}px, ${-centerY}px)`;
    // const rotated = `rotate(${rotation.current}deg)`;
    // const scaled = `scaleY(${scale.current.y}) scaleX(${scale.current.x})`;

    // if (dotRef.current && ref.current && workspaceRef.current) {
    //   const container = workspaceRef.current.getBoundingClientRect();
    //   const box = ref.current.getBoundingClientRect();
    //   dotRef.current.style.width = `${box.width}px`;
    //   dotRef.current.style.height = `${box.height}px`;
    //   dotRef.current.style.top = `${box.top - container.top}px`;
    //   dotRef.current.style.left = `${box.left - container.left}px`;
    // }

    return matrix.toString();
    // return transform.current.toString();
    // return `${moved} ${rotated} ${scaled}`;
  }, []);

  // transform: translate(100px, 100px) translate(50%, 50%) rotate(45deg) translate(-50%, -50%) scaleX(1);

  // Move current item.
  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      const el = ref.current;

      if (!el || !workspaceRef.current) {
        return;
      }

      const [x, y] = getRelativeXY2(workspaceRef.current, event);
      // const [localX, localY] = getRelativeXY2(el, event);
      position.current.x = x;
      position.current.y = y;
      translationMatrix.current = new DOMMatrix().translateSelf(
        position.current.x,
        position.current.y
      );

      // position.current.x += event.movementX;
      // position.current.y += event.movementY;
      // translationMatrix.current.translateSelf(event.movementX, event.movementY);

      const center = getCenter();

      Object.assign(
        (document.querySelector(".workspace__result-dot") as HTMLDivElement)
          .style,
        {
          left: `${center.x}px`,
          top: `${center.y}px`,
        }
      );

      el.style.transform = getTransform();
    },
    [workspaceRef, getTransform, getCenter]
  );

  // Resize current item.
  const onResizerMouseMove = useCallback(
    (event: MouseEvent) => {
      const el = ref.current;
      if (!el || !workspaceRef.current) {
        return;
      }

      const { clientHeight, clientWidth } = el;
      // const scaledWidth = scale.current.x * clientWidth;
      // const scaledHeight = scale.current.y * clientHeight;
      const [moveX, moveY] = getRelativeXY(workspaceRef.current, event);
      const rotationRad = degToRad(rotation.current);

      const center = getCenter();

      Object.assign(
        (document.querySelector(".workspace__result-dot") as HTMLDivElement)
          .style,
        {
          left: `${center.x}px`,
          top: `${center.y}px`,
        }
      );

      const origin = new DOMMatrix()
        .multiplySelf(translationMatrix.current)
        .multiplySelf(rotationMatrix.current)
        .multiplySelf(scaleMatrix.current)
        .transformPoint(new DOMPoint(0, 0));

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
        const dist = Math.sqrt(
          (moveX - origin.x) ** 2 + (moveY - origin.y) ** 2
        );
        const angle = Math.atan2(moveY - origin.y, moveX - origin.x);

        // console.log({ dist, angle: radToDeg(angle) });

        scale.current.x = (dist * Math.cos(angle - rotationRad)) / clientWidth;
        // scale.current.x = (dist * Math.cos(angle)) / clientWidth;
        // scale.current.x = (dist * 2) / clientWidth;
      }

      // if (resizeDirection.current.includes("b")) {
      //   const dist = Math.sqrt(
      //     (moveX - position.current.x) ** 2 + (moveY - position.current.y) ** 2
      //   );
      //   const angle = Math.atan2(
      //     moveY - position.current.y,
      //     moveX - position.current.x
      //   );

      //   scale.current.y = (dist * Math.sin(angle - rotationRad)) / clientHeight;
      // }

      scaleMatrix.current = new DOMMatrix();
      scaleMatrix.current.scaleSelf(scale.current.x, scale.current.y);

      el.style.transform = getTransform();
    },
    [getTransform, workspaceRef, getCenter]
  );

  // Rotate current item.
  const onRotatorMouseMove = useCallback(
    (event: MouseEvent) => {
      const el = ref.current;
      if (!el || !workspaceRef.current) {
        return;
      }

      const center = getOrigin();

      Object.assign(
        (document.querySelector(".workspace__result-dot") as HTMLDivElement)
          .style,
        {
          left: `${center.x}px`,
          top: `${center.y}px`,
        }
      );

      const [moveX, moveY] = getRelativeXY2(workspaceRef.current, event);

      rotation.current = radToDeg(
        Math.atan2(moveY - center.y, moveX - center.x)
      );

      rotationMatrix.current = new DOMMatrix();
      // rotationMatrix.current.translateSelf(
      //   size.current.x / 2, // * scale.current.x,
      //   size.current.y / 2 // * scale.current.y
      // );
      // rotationMatrix.current.translateSelf(50, 50);
      rotationMatrix.current.rotateSelf(0, 0, rotation.current);
      // rotationMatrix.current.translateSelf(
      //   -(size.current.x / 2) /* * scale.current.x */,
      //   -(size.current.y / 2) /* * scale.current.y */
      // );
      // rotationMatrix.current.translateSelf(-50, -50);

      el.style.transform = getTransform();
    },
    [workspaceRef, getTransform, getCenter]
  );

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mousemove", onResizerMouseMove);
    document.removeEventListener("mousemove", onRotatorMouseMove);

    size.current.x *= scale.current.x;
    size.current.y *= scale.current.y;
    scale.current.x = 1;
    scale.current.y = 1;
    scaleMatrix.current = new DOMMatrix();
    scaleMatrix.current.scaleSelf(scale.current.x, scale.current.y);

    if (ref.current) {
      ref.current.style.width = `${size.current.x}px`;
      ref.current.style.height = `${size.current.y}px`;
      ref.current.style.transform = getTransform();
    }
  }, [onMouseMove, onResizerMouseMove, onRotatorMouseMove]);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      console.log(event.key);

      if (event.key === "ArrowLeft") {
        rotation.current -= 5;
      } else if (event.key === "ArrowRight") {
        rotation.current += 5;
      } else if (event.key === "+") {
        scale.current.x += 0.5;
      } else if (event.key === "-") {
        scale.current.x -= 0.5;
      }
      ref.current!.style.transform = getTransform();
    },
    [getTransform]
  );

  useEffect(() => {
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onMouseUp, onKeyDown]);

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
      ref={ref}
      id={item.id}
      className={cn(
        "workspace__stage-item",
        selected && "workspace__stage-item--selected"
      )}
      style={{
        transform: getTransform(),
      }}
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
      <View item={item} selected={selected} />

      {selected && (
        <div
          onMouseDown={onRotatorMouseDown}
          draggable={false}
          className="workspace__stage-item__anchor workspace__stage-item__anchor-rotate"
        ></div>
      )}

      {selected &&
        canResize &&
        ["l", "t", "r", "b"].map(
          (
            direction // "rb" "lb"
          ) => (
            <div
              key={direction}
              draggable={false}
              className={`workspace__stage-item__anchor workspace__stage-item__anchor--${direction}`}
              onMouseDown={onResizerMouseDown}
              data-direction={direction}
            ></div>
          )
        )}
    </div>
  );
}

export default ItemContainer;
