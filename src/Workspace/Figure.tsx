import { FigureType, WorkspaceFigure } from "../store/workspace";
import type { ItemComponentInterface } from "./types";

const classnameForFigure = {
  [FigureType.Rect]: "workspace__stage-figure workspace__stage-figure--rect",
  [FigureType.Circle]:
    "workspace__stage-figure workspace__stage-figure--circle",
};

function Figure({ item }: ItemComponentInterface<WorkspaceFigure>) {
  return (
    <div
      className={classnameForFigure[item.figure] ?? ""}
      style={{ backgroundColor: item.color }}
      draggable={false}
    />
  );
}

export default Figure;
