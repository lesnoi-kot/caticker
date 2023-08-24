import { nanoid } from "nanoid";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export enum WorkspaceItemType {
  Picture,
  Text,
}

export type BaseWorkspaceItem = { id: string; type: WorkspaceItemType };

export type WorkspaceText = BaseWorkspaceItem & {
  type: WorkspaceItemType.Text;
};

export type WorkspacePicture = BaseWorkspaceItem & {
  type: WorkspaceItemType.Picture;
  file: File;
};

export type WorkspaceItem = WorkspaceText | WorkspacePicture;

export const makePictureItem = (file: File) => ({
  id: nanoid(),
  type: WorkspaceItemType.Picture,
  file,
});

export const makeTextItem = () => ({
  id: nanoid(),
  type: WorkspaceItemType.Text,
});

export const useWorkspaceStore = createWithEqualityFn(
  immer(
    combine(
      {
        stageItems: {} as Record<string, WorkspaceItem>,
        selectedItems: new Set<string>(),
      },
      (set) => ({
        upsert: (item: WorkspaceItem) => {
          set((state) => {
            state.stageItems[item.id] = item;
          });
        },

        remove: (id: string) => {
          set((state) => {
            delete state.stageItems[id];
          });
        },

        removeMultiple: (ids: string[]) => {
          set((state) => {
            for (const id of ids) {
              delete state.stageItems[id];
              state.selectedItems.delete(id);
            }
          });
        },

        removeAll: () => {
          set({ stageItems: {} });
        },

        selectOne: (id: string) => {
          set((state) => {
            state.selectedItems.clear();
            state.selectedItems.add(id);
          });
        },

        selectMore: (id: string) => {
          set((state) => {
            state.selectedItems.add(id);
          });
        },

        selectNone: () => {
          set((state) => {
            state.selectedItems.clear();
          });
        },
      })
    )
  ),
  shallow
);

export const useWorkspaceItemIds = () =>
  useWorkspaceStore((state) => Object.keys(state.stageItems));

export const useWorkspaceItem = (id: string) =>
  useWorkspaceStore((state) => state.stageItems[id]);

export const useIsItemSelected = (id: string) =>
  useWorkspaceStore((state) => state.selectedItems.has(id));

export const useIsSelectedItemIds = () =>
  useWorkspaceStore((state) => Array.from(state.selectedItems));
