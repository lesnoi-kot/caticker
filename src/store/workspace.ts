import { nanoid } from "nanoid";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

export enum WorkspaceItemType {
  Picture,
  Text,
  Figure,
}

export type BaseWorkspaceItem = { id: string; type: WorkspaceItemType };

export type WorkspaceText = BaseWorkspaceItem & {
  type: WorkspaceItemType.Text;
  color: string;
  fontFamily: string;
  fontSize: number;
  strokeColor: string | null;
  strokeWidth: number;
};

export type WorkspacePicture = BaseWorkspaceItem & {
  type: WorkspaceItemType.Picture;
  file: File;
};

export enum FigureType {
  Rect,
  Circle,
}

export type WorkspaceFigure = BaseWorkspaceItem & {
  type: WorkspaceItemType.Figure;
  figure: FigureType;
  color: string;
};

export const makePictureItem = (file: File): WorkspacePicture => ({
  id: nanoid(),
  type: WorkspaceItemType.Picture,
  file,
});

export const makeTextItem = (): WorkspaceText => ({
  id: nanoid(),
  type: WorkspaceItemType.Text,
  color: "black",
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  fontSize: 32,
  strokeColor: null,
  strokeWidth: 0,
});

export const makeFigureItem = (figure: FigureType): WorkspaceFigure => ({
  id: nanoid(),
  type: WorkspaceItemType.Figure,
  figure,
  color: "teal",
});

export const useWorkspaceStore = createWithEqualityFn(
  immer(
    combine(
      {
        stageItems: Object.create(null) as Record<string, BaseWorkspaceItem>,
        selectedItems: new Set<string>(),
      },
      (set) => ({
        upsert: (item: BaseWorkspaceItem) => {
          set((state) => {
            state.stageItems[item.id] = item;
          });
        },

        remove: (id: string) => {
          set((state) => {
            delete state.stageItems[id];
            state.selectedItems.delete(id);
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
          set({ stageItems: Object.create(null) });
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

export const useWorkspaceItems = (ids: string[]) =>
  useWorkspaceStore((state) =>
    ids.map((id) => state.stageItems[id]).filter(Boolean)
  );

export const useIsItemSelected = (id: string) =>
  useWorkspaceStore((state) => state.selectedItems.has(id));

export const useIsSelectedItemIds = () =>
  useWorkspaceStore((state) => Array.from(state.selectedItems));
