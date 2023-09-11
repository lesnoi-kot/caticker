import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

import { ItemGeometryInfo, useTransformStore } from "./transforms";
import { WorkspaceAnyItem, useWorkspaceStore } from "./workspace";

export type TransformAction = {
  type: "transform";
  before: Record<string, ItemGeometryInfo>;
  after: Record<string, ItemGeometryInfo>;
};

export type CreateAction = {
  type: "create";
  item: WorkspaceAnyItem;
};

export type DeleteAction = {
  type: "delete";
  items: WorkspaceAnyItem[];
};

export type ModifyItemAction = {
  type: "modify";
  item: WorkspaceAnyItem;
};

type UserAction =
  | TransformAction
  | CreateAction
  | ModifyItemAction
  | DeleteAction;

export const useUndoStore = createWithEqualityFn(
  immer(
    combine(
      {
        actions: [] as Array<UserAction>,
        index: -1,
      },
      (set) => ({
        push: (action: UserAction) => {
          set((state) => {
            if (state.index === state.actions.length - 1) {
              state.actions.push(action);
            } else {
              state.actions.length = state.index + 1;
              state.actions.push(action);
            }

            state.index++;
          });
        },

        pop: () => {
          set((state) => {
            if (state.index >= 0) {
              state.index--;
            }
          });
        },

        forward: () => {
          set((state) => {
            if (state.index < state.actions.length - 1) {
              state.index++;
            }
          });
        },
      })
    )
  ),
  shallow
);

export function undoAction() {
  const state = useUndoStore.getState();
  const lastAction = state.actions[state.index];

  if (!lastAction) {
    return;
  }

  switch (lastAction.type) {
    case "transform":
      for (const id in lastAction.before) {
        useTransformStore.getState().replace(id, lastAction.before[id]);
      }
      break;
    case "create":
      useWorkspaceStore.getState().remove(lastAction.item.id);
      break;
    case "delete":
      lastAction.items.forEach((item) => {
        useWorkspaceStore.getState().upsert(item);
      });
      break;
    case "modify":
      useWorkspaceStore.getState().upsert(lastAction.item);
      break;
    default:
      break;
  }

  state.pop();
}

export function redoAction() {
  const state = useUndoStore.getState();
  const nextAction = state.actions[state.index + 1];

  if (!nextAction) {
    return;
  }

  switch (nextAction.type) {
    case "transform":
      for (const id in nextAction.after) {
        useTransformStore.getState().replace(id, nextAction.after[id]);
      }
      break;
    case "create":
      useWorkspaceStore.getState().upsert(nextAction.item);
      break;
    case "delete":
      nextAction.items.forEach((item) => {
        useWorkspaceStore.getState().remove(item.id);
      });
      break;
    case "modify":
      useWorkspaceStore.getState().upsert(nextAction.item);
      break;
    default:
      break;
  }

  state.forward();
}
