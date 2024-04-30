import {
  TrashIcon,
  ArrowUpOnSquareStackIcon,
  ArrowDownOnSquareStackIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/solid";

import {
  useSelectedItemIds,
  useWorkspaceStoreActions,
} from "@/store/workspace";
import { runInUndoHistory } from "@/store/undo";
import { useTransformActions } from "@/store/transforms";
import { useClipboardStore } from "@/store/clipboard";

export function SidebarMenu() {
  const selectedItemIds = useSelectedItemIds();
  const { layerUp, layerDown, removeMultiple } = useWorkspaceStoreActions();
  const { rotateToAround, scaleTo } = useTransformActions();
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
        className="btn"
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
        className="btn"
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
        className="btn"
        title="Слой вверх"
        onClick={() => {
          runInUndoHistory(() => {
            changeOrder("up");
          });
        }}
      >
        <ArrowUpOnSquareStackIcon />
      </button>

      <button
        className="btn"
        title="Слой вниз"
        onClick={() => {
          runInUndoHistory(() => {
            changeOrder("down");
          });
        }}
      >
        <ArrowDownOnSquareStackIcon />
      </button>

      <button
        className="btn"
        title="Скопировать"
        onClick={() => {
          copyItems(selectedItemIds);
        }}
      >
        <DocumentDuplicateIcon />
      </button>

      <button
        className="btn"
        title="Удалить"
        onClick={() => {
          runInUndoHistory(() => {
            removeMultiple(selectedItemIds);
          });
        }}
      >
        <TrashIcon />
      </button>
    </div>
  );
}
