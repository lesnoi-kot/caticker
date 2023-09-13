import { WorkspaceText, useWorkspaceStore } from "../store/workspace";
import { runInUndoHistory } from "../store/undo";
import ColorPicker from "../HistoryAwareColorPicker";

const FONT_INCREASE_SPEED = 7 / 100;

export default function TextEdit({ item }: { item: WorkspaceText }) {
  const upsert = useWorkspaceStore((store) => store.upsert);

  const increaseFontSize = (sign: number) => {
    runInUndoHistory(() => {
      upsert({
        ...item,
        fontSize: Math.max(
          1,
          item.fontSize + sign * Math.ceil(FONT_INCREASE_SPEED * item.fontSize)
        ),
      });
    });
  };

  const increaseStrokeWidth = (sign: number) => {
    runInUndoHistory(() => {
      upsert({ ...item, strokeWidth: Math.max(0, item.strokeWidth + sign) });
    });
  };

  const changeFont = (fontFamily: string) => {
    runInUndoHistory(() => {
      upsert({ ...item, fontFamily });
    });
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
        <ColorPicker
          color={item.color}
          onChange={(color) => {
            upsert({ ...item, color });
          }}
        />
      </div>

      <div>
        <p>Цвет очертания</p>
        <ColorPicker
          color={item.strokeColor ?? undefined}
          onChange={(color) => {
            upsert({ ...item, strokeColor: color });
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
