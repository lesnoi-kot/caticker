import { useCallback, useEffect } from "react";
import { nanoid } from "nanoid";

import {
  useWorkspaceStore,
  makePictureItem,
  useWorkspaceStoreActions,
} from "../store/workspace";
import {
  redoNextAction,
  runInUndoHistory,
  undoLastAction,
} from "../store/undo";
import { useClipboardStore } from "../store/clipboard";
import { useTransformActions } from "../store/transforms";

const supportedPasteFormats = [
  "image/png",
  "image/webp",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
];

const isSupportedPasteData = (format: string) =>
  supportedPasteFormats.includes(format);

export default function KeyboardHandler() {
  const {
    removeMultiple,
    selectNone,
    selectOne,
    selectAll,
    selectMany,
    upsert,
    layerUp,
  } = useWorkspaceStoreActions();
  const { replace: replaceTransformItem } = useTransformActions();
  const copyItems = useClipboardStore((store) => store.put);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.code) {
        case "Delete":
          runInUndoHistory(() => {
            removeMultiple(useWorkspaceStore.getState().selectedItems);
          });
          break;
        case "KeyC":
        case "KeyX":
          if (event.ctrlKey) {
            const selectedItems = useWorkspaceStore.getState().selectedItems;

            if (selectedItems.size > 0) {
              event.preventDefault();
              copyItems(selectedItems);

              if (event.code === "KeyX") {
                runInUndoHistory(() => {
                  removeMultiple(selectedItems);
                });
              }
            }
          }
          break;
        case "KeyV":
          if (event.ctrlKey) {
            runInUndoHistory(() => {
              const newIds = [] as string[];

              useClipboardStore
                .getState()
                .items.forEach(([item, transform]) => {
                  const newId = nanoid();
                  upsert({ ...item, id: newId });
                  replaceTransformItem(newId, transform);
                  layerUp(newId);
                  newIds.push(newId);
                });

              selectMany(newIds);

              if (newIds.length) {
                event.preventDefault();
              }
            });
          }
          break;
        case "KeyZ":
          if (event.ctrlKey) {
            undoLastAction();
          }
          break;
        case "KeyY":
          if (event.ctrlKey) {
            redoNextAction();
          }
          break;
        case "KeyA":
          if (event.target === document.body) {
            event.preventDefault();
            selectAll();
          }

          break;
        case "Escape":
          selectNone();
          break;
        default:
          break;
      }
    },
    [
      removeMultiple,
      selectNone,
      selectAll,
      copyItems,
      selectMany,
      replaceTransformItem,
      upsert,
      layerUp,
    ]
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      if (!e.clipboardData) {
        return;
      }

      for (const item of Array.from(e.clipboardData.items)) {
        if (isSupportedPasteData(item.type)) {
          const asFile = item.getAsFile();

          if (asFile) {
            runInUndoHistory(() => {
              const item = makePictureItem(asFile);

              upsert(item);
              layerUp(item.id);
              selectOne(item.id);
            });
          }
          break;
        }
      }
    },
    [upsert, selectOne, layerUp]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("paste", onPaste);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("paste", onPaste);
    };
  }, [onKeyDown, onPaste]);

  return null;
}
