import clsx from "clsx";

import { WorkspaceFigure } from "@/store/workspace";
import { FigureType } from "@/store/types";

import type { ItemComponentInterface } from "../types";
import css from "./stageItems.module.css";

const classnameForFigure = {
  [FigureType.Rect]: "",
  [FigureType.Circle]: "rounded-full",
};

function Figure({
  item,
  transform: tranform,
}: ItemComponentInterface<WorkspaceFigure>) {
  return (
    <div
      id={item.id}
      className={clsx(css.stageItem, classnameForFigure[item.figure])}
      style={{
        backgroundColor: item.color,
        width: `${tranform.width}px`,
        height: `${tranform.height}px`,
      }}
      draggable={false}
    />
  );
}

export default Figure;
