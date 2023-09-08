import { BaseWorkspaceItem } from "../store/workspace";

export type ItemComponentInterface<T = BaseWorkspaceItem> = {
  item: T;
  selected: boolean;
};
