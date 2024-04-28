import { BaseWorkspaceItem } from "../store/workspace";

export type ItemComponentInterface<T extends BaseWorkspaceItem> = {
  item: T;
};

export type ResizerType = "bottom" | "right" | "bottom-right" | "top";
export const RESIZER_TYPES: ResizerType[] = [
  "bottom",
  "right",
  "bottom-right",
  "top",
];
