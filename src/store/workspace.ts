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

export type BaseWorkspaceItem = {
  id: string;
  type: WorkspaceItemType;
  layer: number;
};

export type WorkspaceText = BaseWorkspaceItem & {
  text: string;
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

export type WorkspaceAnyItem =
  | WorkspaceFigure
  | WorkspacePicture
  | WorkspaceText;

export const makePictureItem = (file: File): WorkspacePicture => ({
  id: nanoid(),
  type: WorkspaceItemType.Picture,
  layer: 0,
  file,
});

export const makeTextItem = (): WorkspaceText => ({
  id: nanoid(),
  type: WorkspaceItemType.Text,
  layer: 0,
  text: "Введи текст!",
  color: "black",
  fontFamily: "system-ui",
  fontSize: 32,
  strokeColor: null,
  strokeWidth: 0,
});

export const makeFigureItem = (figure: FigureType): WorkspaceFigure => ({
  id: nanoid(),
  type: WorkspaceItemType.Figure,
  layer: 0,
  figure,
  color: "teal",
});

type StageSettings = {
  stageWidth: number;
  stageHeight: number;
  stageColor: string;
};

export const STICKER_MAX_SIZE = 512;

export const useWorkspaceStore = createWithEqualityFn(
  immer(
    combine(
      {
        stageItems: Object.create(null) as Record<string, WorkspaceAnyItem>,
        selectedItems: new Set<string>(),

        settings: {
          stageWidth: STICKER_MAX_SIZE,
          stageHeight: STICKER_MAX_SIZE,
          stageColor: "white",
        } as StageSettings,
      },

      (set) => ({
        upsert: (item: WorkspaceAnyItem) => {
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
          set({
            stageItems: Object.create(null),
            selectedItems: new Set<string>(),
          });
        },

        layerUp: (id: string) => {
          set((state) => {
            let maxLayer = 0;
            for (const anotherId in state.stageItems) {
              maxLayer = Math.max(maxLayer, state.stageItems[anotherId].layer);
            }

            state.stageItems[id].layer = maxLayer + 1;
          });
        },

        layerDown: (id: string) => {
          set((state) => {
            let minLayer = 0;
            for (const anotherId in state.stageItems) {
              minLayer = Math.min(minLayer, state.stageItems[anotherId].layer);
            }

            state.stageItems[id].layer = minLayer - 1;
          });
        },

        selectOne: (id: string) => {
          set((state) => {
            state.selectedItems.clear();
            state.selectedItems.add(id);
          });
        },

        selectMany: (ids: string[]) => {
          set((state) => {
            state.selectedItems.clear();

            for (const id of ids) {
              state.selectedItems.add(id);
            }
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

        selectAll: () => {
          set((state) => {
            state.selectedItems.clear();

            Object.keys(state.stageItems).forEach((id) => {
              state.selectedItems.add(id);
            });
          });
        },

        toggleSelect: (id: string) => {
          set((state) => {
            if (state.selectedItems.has(id)) {
              state.selectedItems.delete(id);
            } else {
              state.selectedItems.add(id);
            }
          });
        },

        modifySettings: (settings: Partial<StageSettings>) => {
          set((state) => {
            Object.assign(state.settings, settings);
          });
        },
      })
    )
  ),
  shallow
);

export type WorkspaceState = ReturnType<typeof useWorkspaceStore.getState>;
export const mergeWorkspaceState = (newState: WorkspaceState) =>
  useWorkspaceStore.setState(newState);

export const useWorkspaceItemIds = () =>
  useWorkspaceStore((state) =>
    Object.keys(state.stageItems).sort((a, b) => {
      return state.stageItems[a].layer - state.stageItems[b].layer;
    })
  );

export const useWorkspaceItem = (id: string) =>
  useWorkspaceStore((state) => state.stageItems[id]);

export const useWorkspaceItems = (ids: string[]) =>
  useWorkspaceStore((state) =>
    ids.map((id) => state.stageItems[id]).filter(Boolean)
  );

export const useIsItemSelected = (id: string) =>
  useWorkspaceStore((state) => state.selectedItems.has(id));

export const useSelectedItemIds = () =>
  useWorkspaceStore((state) => Array.from(state.selectedItems));
