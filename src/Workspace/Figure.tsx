import { FIGURE_BASE_SIZE } from "../constants";
import { FigureType } from "../store/types";
import { WorkspaceFigure } from "../store/workspace";
import type { ItemComponentInterface } from "./types";

const classnameForFigure = {
  [FigureType.Rect]: "workspace__stage-figure workspace__stage-figure--rect",
  [FigureType.Circle]:
    "workspace__stage-figure workspace__stage-figure--circle",
};

const figureSize = {
  width: `${FIGURE_BASE_SIZE}px`,
  height: `${FIGURE_BASE_SIZE}px`,
};

function Figure({ item }: ItemComponentInterface<WorkspaceFigure>) {
  return (
    <div
      id={item.id}
      className={classnameForFigure[item.figure] ?? ""}
      style={{ backgroundColor: item.color, ...figureSize }}
      draggable={false}
    />
  );
}

export default Figure;
