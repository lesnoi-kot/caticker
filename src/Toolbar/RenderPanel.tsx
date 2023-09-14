import { useState } from "react";

import { useWorkspaceStore } from "../store/workspace";
import { renderSticker } from "../renderer/renderer";
import { useTransformStore } from "../store/transforms";

export type SupportedRenderFormat = "webp" | "png";

export default function RenderPanel() {
  const [format, setFormat] = useState<SupportedRenderFormat>("webp");

  const onFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as SupportedRenderFormat);
  };

  const onRenderStickerClick = () => {
    const { settings, stageItems } = useWorkspaceStore.getState();
    const { items: transformItems } = useTransformStore.getState();

    renderSticker({
      width: settings.stageWidth,
      height: settings.stageHeight,
      backgroundColor: settings.stageColor,
      workspaceItems: Object.values(stageItems),
      transformItems,
      imageType: `image/${format}`,
    });
  };

  return (
    <div>
      <p>Рендер</p>

      <div className="flex flex-col gap-4">
        <label>
          <input
            type="radio"
            name="renderFormat"
            value="webp"
            onChange={onFormatChange}
            checked={format === "webp"}
          />
          &nbsp;webp
        </label>

        <label>
          <input
            type="radio"
            name="renderFormat"
            value="png"
            onChange={onFormatChange}
            checked={format === "png"}
          />
          &nbsp;png
        </label>

        <button onClick={onRenderStickerClick}>Скачать</button>
      </div>
    </div>
  );
}
