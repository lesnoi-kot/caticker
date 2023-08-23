import { nanoid } from "nanoid";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export enum WorkspaceItemType {
  Picture,
  Text,
}

export type WorkspaceText = { id: string; type: WorkspaceItemType.Text };

export type WorkspacePicture = {
  id: string;
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
    combine({ sprites: {} as Record<string, WorkspaceItem> }, (set) => ({
      upsert: (item: WorkspaceItem) => {
        set((state) => {
          state.sprites[item.id] = item;
        });
      },

      remove: (id: string) => {
        set((state) => {
          delete state.sprites[id];
        });
      },

      removeAll: () => {
        set({ sprites: {} });
      },
    }))
  ),
  shallow
);

export const useWorkspaceItems = () =>
  useWorkspaceStore((state) => Object.keys(state.sprites));

export const useWorkspaceItem = (id: string) =>
  useWorkspaceStore((state) => state.sprites[id]);
