import { ChromePicker } from "react-color";

import "./Toolbar.css";
import { WorkspaceText, useWorkspaceStore } from "../store/workspace";

const FONT_INCREASE_SPEED = 7 / 100;

export default function TextEdit({ item }: { item: WorkspaceText }) {
  const upsert = useWorkspaceStore((store) => store.upsert);

  const increaseFontSize = (sign: number) => {
    const updatedItem = { ...item };
    updatedItem.fontSize = Math.max(
      1,
      updatedItem.fontSize +
        sign * Math.ceil(FONT_INCREASE_SPEED * item.fontSize)
    );
    upsert(updatedItem);
  };

  const increaseStrokeWidth = (sign: number) => {
    const updatedItem = { ...item };
    updatedItem.strokeWidth = Math.max(0, updatedItem.strokeWidth + sign);
    upsert(updatedItem);
  };

  return (
    <div className="toolbar__text-menu">
      <button
        onClick={() => {
          increaseFontSize(1);
        }}
      >
        A +
      </button>

      <button
        onClick={() => {
          increaseFontSize(-1);
        }}
      >
        A -
      </button>

      <ChromePicker
        color={item.color}
        onChange={(color) => {
          const updatedItem = { ...item };
          updatedItem.color = color.hex;
          upsert(updatedItem);
        }}
      />

      <ChromePicker
        color={item.strokeColor ?? undefined}
        onChange={(color) => {
          const updatedItem = { ...item };
          updatedItem.strokeColor = color.hex;
          upsert(updatedItem);
        }}
      />

      <button
        onClick={() => {
          increaseStrokeWidth(1);
        }}
      >
        Увеличить очертание
      </button>

      <button
        onClick={() => {
          increaseStrokeWidth(-1);
        }}
      >
        Уменьшить очертание
      </button>
    </div>
  );
}
