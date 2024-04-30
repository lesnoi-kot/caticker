import { WorkspaceFigure } from "@/store/workspace";
import { FigureType } from "@/store/types";

import type { ItemComponentInterface } from "./types";

const classnameForFigure = {
  [FigureType.Rect]: "workspace__stage-figure workspace__stage-figure--rect",
  [FigureType.Circle]:
    "workspace__stage-figure workspace__stage-figure--circle",
};

function Figure({
  item,
  transform: tranform,
}: ItemComponentInterface<WorkspaceFigure>) {
  return (
    <div
      id={item.id}
      className={classnameForFigure[item.figure] ?? ""}
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
