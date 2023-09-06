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

  const changeFont = (newFont: string) => {
    const updatedItem = { ...item };
    updatedItem.fontFamily = newFont;
    upsert(updatedItem);
  };

  return (
    <div className="toolbar__text-menu">
      <button
        onClick={() => {
          increaseFontSize(1);
        }}
        title="Увеличить шрифт"
      >
        A+
      </button>

      <button
        onClick={() => {
          increaseFontSize(-1);
        }}
        title="Уменьшить шрифт"
      >
        A-
      </button>

      <label>
        <p>Шрифт</p>
        <select
          name="text-font"
          onChange={(e) => {
            changeFont(e.target.value);
          }}
          value={item.fontFamily}
        >
          <option value="system-ui">Default</option>
          <option value="Arial">Arial</option>
          <option value="Verdana">Verdana</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
        </select>
      </label>

      <div>
        <p>Цвет текста</p>
        <ChromePicker
          color={item.color}
          onChange={(color) => {
            const updatedItem = { ...item };
            updatedItem.color = color.hex;
            upsert(updatedItem);
          }}
        />
      </div>

      <div>
        <p>Цвет очертания</p>
        <ChromePicker
          color={item.strokeColor ?? undefined}
          onChange={(color) => {
            const updatedItem = { ...item };
            updatedItem.strokeColor = color.hex;
            upsert(updatedItem);
          }}
        />
      </div>

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
