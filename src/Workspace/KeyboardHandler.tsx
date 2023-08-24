import { useCallback, useEffect } from "react";

import { useWorkspaceStore, useIsSelectedItemIds } from "../store/workspace";

export default function KeyboardHandler() {
  const selectedItems = useIsSelectedItemIds();
  const removeMultiple = useWorkspaceStore((store) => store.removeMultiple);
  const selectNone = useWorkspaceStore((store) => store.selectNone);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case "delete":
          removeMultiple(selectedItems);
          break;
        case "x":
          if (event.ctrlKey) {
            console.log("Cutting");
          }
          break;
        case "escape":
          selectNone();
          break;
        default:
          break;
      }
    },
    [selectedItems, removeMultiple, selectNone]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onKeyDown]);

  return null;
}
