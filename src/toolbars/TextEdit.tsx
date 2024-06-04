import { WorkspaceText, useWorkspaceStore } from "../store/workspace";
import { runInUndoHistory } from "../store/undo";
import ColorPicker from "../HistoryAwareColorPicker";

const FONT_INCREASE_SPEED = 10 / 100;

const fonts = ["Arial", "Times New Roman", "Georgia", "Courier New", "Lobster"];

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

  const increaseStrokeWidth = (delta: number) => {
    runInUndoHistory(() => {
      upsert({ ...item, strokeWidth: Math.max(0, item.strokeWidth + delta) });
    });
  };

  const changeFont = (fontFamily: string) => {
    runInUndoHistory(() => {
      upsert({ ...item, fontFamily });
    });
  };

  return (
    <div className="flex items-start gap-12">
      <div className="flex flex-col gap-4">
        <p className="font-bold">Цвет текста</p>

        <ColorPicker
          color={item.color}
          onChange={(color) => {
            upsert({ ...item, color });
          }}
        />
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-bold">Шрифт</p>

        <div className="flex flex-row items-center gap-3">
          <button
            onClick={() => {
              increaseFontSize(1);
            }}
            title="Увеличить шрифт"
          >
            +
          </button>
          <span className="font-mono">{item.fontSize}px</span>
          <button
            onClick={() => {
              increaseFontSize(-1);
            }}
            title="Уменьшить шрифт"
          >
            -
          </button>
        </div>

        <label>
          <input
            type="checkbox"
            name="fontItalic"
            onChange={(e) => {
              upsert({ ...item, fontItalic: e.target.checked });
            }}
            checked={item.fontItalic}
          />
          &nbsp;<i>Italic</i>
        </label>

        <fieldset className="flex flex-col gap-2">
          {fonts.map((fontName) => (
            <label key={fontName} style={{ fontFamily: fontName }}>
              <input
                onChange={(e) => {
                  changeFont(e.target.value);
                }}
                type="radio"
                name="font"
                value={fontName}
                checked={item.fontFamily === fontName}
              />
              &nbsp;{fontName}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="flex flex-col gap-4">
        <p className="font-bold">Очертание</p>

        <div className="flex flex-row items-center gap-3">
          <button
            title="Увеличить очертание"
            onClick={() => {
              increaseStrokeWidth(0.5);
            }}
          >
            +
          </button>
          <span className="font-mono">{item.strokeWidth}px</span>
          <button
            title="Уменьшить очертание"
            onClick={() => {
              increaseStrokeWidth(-0.5);
            }}
          >
            -
          </button>
        </div>

        <ColorPicker
          color={item.strokeColor}
          onChange={(color) => {
            upsert({ ...item, strokeColor: color });
          }}
        />
      </div>
    </div>
  );
}
