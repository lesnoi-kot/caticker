import { useCallback, useEffect } from "react";

import {
  useWorkspaceStore,
  useSelectedItemIds,
  makePictureItem,
} from "../store/workspace";
import { useWorkspaceRef } from "./hooks";
import { redoAction, undoAction, useUndoStore } from "../store/undo";

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
  const selectedItems = useSelectedItemIds();
  const pushHistory = useUndoStore((store) => store.push);

  const { removeMultiple, selectNone, selectAll, upsert } = useWorkspaceStore(
    (store) => ({
      removeMultiple: store.removeMultiple,
      selectNone: store.selectNone,
      selectAll: store.selectAll,
      upsert: store.upsert,
    })
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "delete":
          pushHistory({
            type: "delete",
            items: selectedItems.map(
              (id) => useWorkspaceStore.getState().stageItems[id]
            ),
          });
          removeMultiple(selectedItems);
          break;
        case "c":
          if (event.ctrlKey) {
            console.log("Copying");
          }
          break;
        case "x":
          if (event.ctrlKey) {
            console.log("Cutting");
          }
          break;
        case "z":
          if (event.ctrlKey) {
            undoAction();
          }
          break;
        case "y":
          if (event.ctrlKey) {
            redoAction();
          }
          break;
        case "a":
          if (event.target === document.body) {
            event.preventDefault();
            selectAll();
          }

          break;
        case "escape":
          selectNone();
          break;
        default:
          break;
      }
    },
    [selectedItems, removeMultiple, selectNone, selectAll]
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
            upsert(makePictureItem(asFile));
          }
          break;
        }
      }
    },
    [upsert, workspaceRef]
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
