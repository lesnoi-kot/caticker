import { useCallback, useEffect } from "react";

import {
  useWorkspaceStore,
  makePictureItem,
  useWorkspaceStoreActions,
} from "../store/workspace";
import { useWorkspaceRef } from "./hooks";
import {
  redoNextAction,
  runInUndoHistory,
  undoLastAction,
} from "../store/undo";

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
  const { workspaceRef } = useWorkspaceRef();
  const { removeMultiple, selectNone, selectOne, selectAll, upsert } =
    useWorkspaceStoreActions();

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.code) {
        case "Delete":
          runInUndoHistory(() => {
            removeMultiple(useWorkspaceStore.getState().selectedItems);
          });
          break;
        case "KeyC":
          if (event.ctrlKey) {
            console.log("Copying");
          }
          break;
        case "KeyX":
          if (event.ctrlKey) {
            console.log("Cutting");
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
    [removeMultiple, selectNone, selectAll]
  );

  const onPaste = useCallback(
    (e: ClipboardEvent) => {
      if (e.target !== workspaceRef.current || !e.clipboardData) {
        return;
      }

      for (const item of Array.from(e.clipboardData.items)) {
        if (isSupportedPasteData(item.type)) {
          const asFile = item.getAsFile();

          if (asFile) {
            runInUndoHistory(() => {
              const item = makePictureItem(asFile);
              upsert(item);
              selectOne(item.id);
            });
          }
          break;
        }
      }
    },
    [upsert, selectOne, workspaceRef]
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
