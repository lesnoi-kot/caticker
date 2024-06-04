import { nanoid } from "nanoid";
import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import { CreateActionOptions, useTransformStore } from "./transforms";
import { STICKER_MAX_SIZE } from "../constants";
import { FigureType, WorkspaceItemType } from "./types";

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
  fontItalic: boolean;
  strokeColor: string;
  strokeWidth: number;
};

export type WorkspacePicture = BaseWorkspaceItem & {
  type: WorkspaceItemType.Picture;
  file: Blob;
  resizeQuality: ResizeQuality;
};

export type WorkspaceFigure = BaseWorkspaceItem & {
  type: WorkspaceItemType.Figure;
  figure: FigureType;
  color: string;
};

export type WorkspaceAnyItem =
  | WorkspaceFigure
  | WorkspacePicture
  | WorkspaceText;

export const makePictureItem = (file: Blob): WorkspacePicture => ({
  id: nanoid(),
  type: WorkspaceItemType.Picture,
  layer: 0,
  file,
  resizeQuality: "high",
});

export const makeTextItem = (): WorkspaceText => ({
  id: nanoid(),
  type: WorkspaceItemType.Text,
  layer: 0,
  text: "Введи текст!",
  color: "hsl(0, 0%, 0%, 1)",
  fontFamily: "Arial",
  fontSize: 32,
  fontItalic: false,
  strokeColor: "white",
  strokeWidth: 0,
});

export const makeFigureItem = (figure: FigureType): WorkspaceFigure => ({
  id: nanoid(),
  type: WorkspaceItemType.Figure,
  layer: 0,
  figure,
  color: `hsl(${(Math.random() * 360).toFixed()}, 100%, 75%, 1)`,
});

type StageSettings = {
  stageWidth: number;
  stageHeight: number;
  stageColor: string;
  roundBorders: boolean;
};

export const useWorkspaceStore = createWithEqualityFn(
  immer(
    combine(
      {
        stageItems: Object.create(null) as Record<string, WorkspaceAnyItem>,
        selectedItems: new Set<string>(),

        settings: {
          stageWidth: STICKER_MAX_SIZE,
          stageHeight: STICKER_MAX_SIZE,
          stageColor: "hsla(0, 0%, 100%, 0)",
          roundBorders: true,
        } as StageSettings,
      },

      (set) => ({
        upsert: (item: WorkspaceAnyItem, options: CreateActionOptions = {}) => {
          if (item.type === WorkspaceItemType.Text) {
            options.height ??= item.fontSize;
          }

          useTransformStore.getState().create(item.id, options);

          set((state) => {
            state.stageItems[item.id] = item;
          });
          useWorkspaceStore.getState().layerUp(item.id);
        },

        remove: (id: string) => {
          useTransformStore.getState().remove(id);

          set((state) => {
            delete state.stageItems[id];
            state.selectedItems.delete(id);
          });
        },

        removeMultiple: (ids: Iterable<string>) => {
          set((state) => {
            for (const id of ids) {
              useTransformStore.getState().remove(id);
              delete state.stageItems[id];
              state.selectedItems.delete(id);
            }
          });
        },

        removeAll: () => {
          useTransformStore.getState().reset();

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

export const useWorkspaceItemIds = (): string[] =>
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

export const useWorkspaceStoreActions = () =>
  useWorkspaceStore((store) => ({
    upsert: store.upsert,
    selectOne: store.selectOne,
    selectMany: store.selectMany,
    removeMultiple: store.removeMultiple,
    selectNone: store.selectNone,
    selectAll: store.selectAll,
    modifySettings: store.modifySettings,
    layerUp: store.layerUp,
    layerDown: store.layerDown,
  }));
