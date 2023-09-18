import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { nanoid } from "nanoid";

import { WorkspaceAnyItem, useWorkspaceStore } from "./workspace";
import { ItemGeometryInfo, useTransformStore } from "./transforms";

type ClipboardItemTuple = [WorkspaceAnyItem, ItemGeometryInfo];

export const useClipboardStore = createWithEqualityFn(
  immer(
    combine({ items: [] as Array<ClipboardItemTuple> }, (set) => ({
      put: (itemIds: Iterable<string>) => {
        const stageItems = useWorkspaceStore.getState().stageItems;
        const transformItems = useTransformStore.getState().items;

        set((state) => {
          state.items.length = 0;

          for (const id of itemIds) {
            state.items.push([
              { ...stageItems[id], id: nanoid() },
              transformItems[id],
            ]);
          }
        });
      },
    }))
  ),
  shallow
);
