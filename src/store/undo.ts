import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

import {
  TransformState,
  mergeTransformState,
  useTransformStore,
} from "./transforms";
import {
  WorkspaceState,
  mergeWorkspaceState,
  useWorkspaceStore,
} from "./workspace";

export type TransformAction = {
  type: "transform";
  before: TransformState;
  after: TransformState;
};

export type ModifyItemAction = {
  type: "modify";
  before: WorkspaceState;
  after: WorkspaceState;
};

export type CompoundAction = {
  type: "compound";
  children: Array<TransformAction | ModifyItemAction>;
};

type UserAction = TransformAction | ModifyItemAction | CompoundAction;

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

export function undoAction(action: UserAction) {
  switch (action.type) {
    case "transform":
      mergeTransformState(action.before);
      break;
    case "modify":
      mergeWorkspaceState(action.before);
      break;
    case "compound":
      action.children.forEach((childAction) => {
        undoAction(childAction);
      });
      break;
    default:
      throw new Error("Invalid history item");
  }
}

export function redoAction(action: UserAction) {
  switch (action.type) {
    case "transform":
      mergeTransformState(action.after);
      break;

    case "modify":
      mergeWorkspaceState(action.after);
      break;
    case "compound":
      action.children.forEach((childAction) => {
        redoAction(childAction);
      });
      break;
    default:
      throw new Error("Invalid history item");
  }
}

export function undoLastAction() {
  const state = useUndoStore.getState();
  const lastAction = state.actions[state.index];

  if (!lastAction) {
    return;
  }

  undoAction(lastAction);
  useUndoStore.getState().pop();
}

export function redoNextAction() {
  const state = useUndoStore.getState();
  const nextAction = state.actions[state.index + 1];

  if (!nextAction) {
    return;
  }

  redoAction(nextAction);
  useUndoStore.getState().forward();
}

export class HistoryComparer {
  workspaceState: WorkspaceState | null = null;
  transformState: TransformState | null = null;

  start() {
    this.workspaceState = useWorkspaceStore.getState();
    this.transformState = useTransformStore.getState();
  }

  compareToCurrentStates(): UserAction | null {
    if (!this.workspaceState || !this.transformState) {
      throw new Error("HistoryComparer invariant: no 'before'-state");
    }

    const currentWorkspaceState = useWorkspaceStore.getState();
    const currentTransformState = useTransformStore.getState();

    let transformAction: TransformAction | null = null;
    let modifyItemAction: ModifyItemAction | null = null;

    if (this.workspaceState !== currentWorkspaceState) {
      modifyItemAction = {
        type: "modify",
        before: this.workspaceState,
        after: currentWorkspaceState,
      };
    }

    if (this.transformState !== currentTransformState) {
      transformAction = {
        type: "transform",
        before: this.transformState,
        after: currentTransformState,
      };
    }

    if (transformAction && modifyItemAction) {
      return {
        type: "compound",
        children: [transformAction, modifyItemAction],
      } as CompoundAction;
    }

    if (transformAction) {
      return transformAction;
    }

    if (modifyItemAction) {
      return modifyItemAction;
    }

    return null;
  }
}

export function runInUndoHistory(stateMutator: () => void): void {
  const c = new HistoryComparer();
  c.start();
  stateMutator();
  const possibleHistoryAction = c.compareToCurrentStates();

  if (possibleHistoryAction) {
    useUndoStore.getState().push(possibleHistoryAction);
  }
}
