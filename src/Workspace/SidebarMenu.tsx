import {
  useSelectedItemIds,
  useWorkspaceStoreActions,
} from "../store/workspace";
import { runInUndoHistory } from "../store/undo";
import { useTransformActions } from "../store/transforms";
import { useClipboardStore } from "../store/clipboard";

export function SidebarMenu() {
  const selectedItemIds = useSelectedItemIds();
  const { layerUp, layerDown, removeMultiple } = useWorkspaceStoreActions();
  const { rotateToAround, rotateAround, scaleTo } = useTransformActions();
  const copyItems = useClipboardStore((store) => store.put);

  if (selectedItemIds.length === 0) {
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
          copyItems(selectedItemIds);
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
