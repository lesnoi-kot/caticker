import { useState } from "react";

import { useWorkspaceStore } from "../store/workspace";
import { useTransformStore } from "../store/transforms";
import { worker } from "../renderer/worker";

export type SupportedRenderFormat = "webp" | "png";

export default function RenderPanel() {
  const [format, setFormat] = useState<SupportedRenderFormat>("webp");
  const [roundCorners, setRoundCorners] = useState(true);

  const onFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as SupportedRenderFormat);
  };

  const onRenderStickerClick = () => {
    const { settings, stageItems } = useWorkspaceStore.getState();
    const { items: transformItems } = useTransformStore.getState();

    worker.postMessage({
      type: "renderSticker",
      data: {
        width: settings.stageWidth,
        height: settings.stageHeight,
        backgroundColor: settings.stageColor,
        workspaceItems: Object.values(stageItems),
        transformItems,
        imageType: `image/${format}`,
        roundBorders: roundCorners,
      },
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

        <label>
          <input
            type="checkbox"
            name="roundCorners"
            onChange={(e) => {
              setRoundCorners(e.target.checked);
            }}
            checked={roundCorners}
          />
          &nbsp;Закругленные края
        </label>

        <button onClick={onRenderStickerClick}>Скачать</button>
      </div>
    </div>
  );
}
