import { BaseWorkspaceItem } from "../store/workspace";

export type ItemComponentInterface<T extends BaseWorkspaceItem> = {
  item: T;
};
