import {
  useWorkspaceStore,
  useWorkspaceItems,
  useSelectedItemIds,
} from "../store/workspace";
import { runInUndoHistory } from "../store/undo";
import { useTransformStore } from "../store/transforms";

export function SidebarMenu() {
  const selectedItemIds = useSelectedItemIds();
  const selectedItems = useWorkspaceItems(selectedItemIds);
  const layerUp = useWorkspaceStore((store) => store.layerUp);
  const layerDown = useWorkspaceStore((store) => store.layerDown);
  const removeMultiple = useWorkspaceStore((store) => store.removeMultiple);
  const rotateAround = useTransformStore((store) => store.rotateAround);
  const rotateToAround = useTransformStore((store) => store.rotateToAround);
  const scaleTo = useTransformStore((store) => store.scaleTo);

  if (selectedItems.length === 0) {
    return null;
  }

  const changeOrder = (direction: "up" | "down") => {
    if (direction === "up") {
      selectedItemIds.forEach((id) => {
        layerUp(id);
      });
    } else {
      selectedItemIds.forEach((id) => {
        layerDown(id);
      });
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={() => {
          runInUndoHistory(() => {
            selectedItemIds.forEach((id) => {
              rotateAround(id, -90);
            });
          });
        }}
      >
        +90°
      </button>

      <button
        onClick={() => {
          runInUndoHistory(() => {
            selectedItemIds.forEach((id) => {
              rotateToAround(id, 0);
            });
          });
        }}
      >
        0°
      </button>

      <button
        onClick={() => {
          runInUndoHistory(() => {
            selectedItemIds.forEach((id) => {
              rotateAround(id, 90);
            });
          });
        }}
      >
        -90°
      </button>

      <button
        title="Оригинальный масштаб"
        onClick={() => {
          runInUndoHistory(() => {
            selectedItemIds.forEach((id) => {
              scaleTo(id, 1, 1);
            });
          });
        }}
      >
        1x
      </button>

      <button
        title="Слой вверх"
        onClick={() => {
          runInUndoHistory(() => {
            changeOrder("up");
          });
        }}
      >
        ↥
      </button>

      <button
        title="Слой вниз"
        onClick={() => {
          runInUndoHistory(() => {
            changeOrder("down");
          });
        }}
      >
        ↧
      </button>

      <button
        title="Скопировать"
        onClick={() => {
          //
        }}
      >
        📋
      </button>

      <button
        title="Удалить"
        onClick={() => {
          runInUndoHistory(() => {
            removeMultiple(selectedItemIds);
          });
        }}
        className="text-3xl"
      >
        ␡
      </button>
    </div>
  );
}
