import { useState } from "react";
import { useWorkspaceStore } from "../store/workspace";
import { renderSticker } from "./renderer";

export type SupportedRenderFormat = "webp" | "png";

export default function RenderPanel() {
  const [format, setFormat] = useState<SupportedRenderFormat>("webp");
  const store = useWorkspaceStore();

  const onFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value);
  };

  return (
    <div className="toolbar__main-menu">
      <div>
        <p>Рендер</p>

        <label>
          <input
            type="radio"
            name="renderFormat"
            value="webp"
            onChange={onFormatChange}
            checked={format === "webp"}
          />
          webp
        </label>
        <br />
        <label>
          <input
            type="radio"
            name="renderFormat"
            value="png"
            onChange={onFormatChange}
            checked={format === "png"}
          />
          png
        </label>
        <br />
        <br />

        <button
          onClick={() => {
            renderSticker({
              width: store.settings.stageWidth,
              height: store.settings.stageHeight,
              workspaceItems: Object.values(store.stageItems),
              imageType: `image/${format}`,
              backgroundColor: store.settings.stageColor,
            });
          }}
        >
          Скачать
        </button>
      </div>
    </div>
  );
}
