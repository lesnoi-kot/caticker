import {
  Delete,
  Copy,
  BringToFront,
  FlipHorizontal,
  FlipVertical,
  SendToBack,
} from "lucide-react";

import {
  useSelectedItemIds,
  useWorkspaceStoreActions,
} from "@/store/workspace";
import { runInUndoHistory } from "@/store/undo";
import { useTransformActions, useTransformStore } from "@/store/transforms";
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
      <div className="tooltip" data-tip="Сбросить поворот">
        <button
          className="btn btn-circle"
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
      </div>

      <div className="tooltip" data-tip="Отразить по горизонтали">
        <button
          className="btn btn-circle"
          onClick={() => {
            if (selectedItemIds.length === 0) {
              return;
            }

            const transformState = useTransformStore.getState();

            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                if (transformState.items[id]) {
                  scaleTo(
                    id,
                    -transformState.items[id].scale.x,
                    1,
                    new DOMPoint(0.5, 0.5)
                  );
                }
              });
            });
          }}
        >
          <FlipHorizontal />
        </button>
      </div>

      <div className="tooltip" data-tip="Отразить по вертикали">
        <button
          className="btn btn-circle"
          onClick={() => {
            if (selectedItemIds.length === 0) {
              return;
            }

            const transformState = useTransformStore.getState();

            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                if (transformState.items[id]) {
                  scaleTo(
                    id,
                    1,
                    -transformState.items[id].scale.y,
                    new DOMPoint(0.5, 0.5)
                  );
                }
              });
            });
          }}
        >
          <FlipVertical />
        </button>
      </div>

      <div className="tooltip" data-tip="Слой вверх">
        <button
          className="btn btn-circle"
          onClick={() => {
            runInUndoHistory(() => {
              changeOrder("up");
            });
          }}
        >
          <BringToFront />
        </button>
      </div>

      <div className="tooltip" data-tip="Слой вниз">
        <button
          className="btn btn-circle"
          onClick={() => {
            runInUndoHistory(() => {
              changeOrder("down");
            });
          }}
        >
          <SendToBack />
        </button>
      </div>

      <div className="tooltip" data-tip="Скопировать">
        <button
          className="btn btn-circle"
          onClick={() => {
            copyItems(selectedItemIds);
          }}
        >
          <Copy />
        </button>
      </div>

      <div className="tooltip" data-tip="Удалить">
        <button
          className="btn btn-error btn-circle"
          onClick={() => {
            runInUndoHistory(() => {
              removeMultiple(selectedItemIds);
            });
          }}
        >
          <Delete />
        </button>
      </div>
    </div>
  );
}
