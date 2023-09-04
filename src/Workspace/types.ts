import { BaseWorkspaceItem } from "../store/workspace";

export type ItemComponentInterface<T = BaseWorkspaceItem> = {
  item: T;
  selected: boolean;
};

export type CommandType =
  | "-rotateZ"
  | "rotateZ=0"
  | "+rotateZ"
  | "originalScale"
  | "flipX"
  | "flipY";

export class ImperativeTransformEvent extends CustomEvent<{
  command: CommandType;
}> {
  constructor(command: CommandType) {
    super(ImperativeTransformEvent.type, {
      detail: { command },
    });
  }

  static readonly type = "transform";
}

declare global {
  interface GlobalEventHandlersEventMap {
    [ImperativeTransformEvent.type]: ImperativeTransformEvent;
  }
}
