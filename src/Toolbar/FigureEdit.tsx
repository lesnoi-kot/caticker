import { ChromePicker } from "react-color";

import { WorkspaceFigure, useWorkspaceStore } from "../store/workspace";

import "./Toolbar.css";

export default function FigureEdit({ item }: { item: WorkspaceFigure }) {
  const upsert = useWorkspaceStore((store) => store.upsert);

  return (
    <div className="toolbar__figure-menu">
      <div>
        <p>Цвет фигуры</p>
        <ChromePicker
          color={item.color}
          onChange={(color) => {
            const updatedItem = { ...item };
            updatedItem.color = color.hex;
            upsert(updatedItem);
          }}
        />
      </div>
    </div>
  );
}
