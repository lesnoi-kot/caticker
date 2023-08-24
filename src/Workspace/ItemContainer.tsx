import { useCallback, useRef } from "react";
import cn from "classnames";

import {
  useIsItemSelected,
  useWorkspaceItem,
  useWorkspaceStore,
} from "../store/workspace";
import { ItemComponentInterface } from "./types";

function ItemContainer({
  id,
  View,
}: {
  id: string;
  View: React.FC<ItemComponentInterface<any>>;
}) {
  const ref = useRef<HTMLImageElement>(null);
  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const selectMore = useWorkspaceStore((store) => store.selectMore);
  const selected = useIsItemSelected(id);
  const item = useWorkspaceItem(id);

  const onMouseMove = useCallback((event: MouseEvent) => {
    const el = ref.current;

    if (el) {
      const x = el.offsetLeft + event.movementX;
      const y = el.offsetTop + event.movementY;
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    }
  }, []);

  return (
    <div
      ref={ref}
      id={item.id}
      className={cn(
        "workspace__stage-item",
        selected && "workspace__stage-item--selected"
      )}
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
      onMouseUp={() => {
        document.removeEventListener("mousemove", onMouseMove);
      }}
    >
      <View item={item} selected={selected} />

      {selected && (
        <>
          <div
            className="workspace__stage-item__anchor workspace__stage-item__anchor--lt"
            onMouseDown={(event) => {
              //
            }}
          ></div>
          <div
            className="workspace__stage-item__anchor workspace__stage-item__anchor--rt"
            onMouseDown={(event) => {}}
          ></div>
          <div
            className="workspace__stage-item__anchor workspace__stage-item__anchor--lb"
            onMouseDown={(event) => {}}
          ></div>
          <div
            className="workspace__stage-item__anchor workspace__stage-item__anchor--rb"
            onMouseDown={(event) => {
              const el = ref.current;

              if (el) {
                el.style.transformOrigin = "top left";
              }
            }}
          ></div>
        </>
      )}
    </div>
  );
}

export default ItemContainer;
