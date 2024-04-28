import { BaseWorkspaceItem } from "../store/workspace";

export type ItemComponentInterface<T extends BaseWorkspaceItem> = {
  item: T;
};

export type ResizerType =
  | "bottom"
  | "right"
  | "bottom-right"
  | "top"
  | "left"
  | "top-left"
  | "top-right"
  | "bottom-left";

export const RESIZER_TYPES: ResizerType[] = [
  "top-left",
  "top",
  "top-right",
  "right",
  "bottom-right",
  "bottom",
  "bottom-left",
  "left",
];
