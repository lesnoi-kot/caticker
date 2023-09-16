import { useState } from "react";

import { useWorkspaceStore } from "../store/workspace";
import { useTransformStore } from "../store/transforms";
import type { RenderStickerArguments } from "../renderer/renderSticker";
import { worker } from "../renderer/worker";

export type SupportedRenderFormat = "webp" | "png";

export default function RenderPanel() {
  const [format, setFormat] = useState<SupportedRenderFormat>("webp");
  const roundBorders = useWorkspaceStore(
    (store) => store.settings.roundBorders
  );
  const modifySettings = useWorkspaceStore((store) => store.modifySettings);

  const onFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as SupportedRenderFormat);
  };

  const prepareRenderArgs = (): RenderStickerArguments => {
    const { settings, stageItems } = useWorkspaceStore.getState();
    const { items: transformItems } = useTransformStore.getState();

    return {
      width: settings.stageWidth,
      height: settings.stageHeight,
      backgroundColor: settings.stageColor,
      workspaceItems: Object.values(stageItems),
      transformItems,
      imageType: `image/${format}`,
      roundBorders,
    };
  };

  const onRenderStickerClick = () => {
    worker.postMessage({
      type: "renderSticker",
      data: prepareRenderArgs(),
      extra: {
        operation: "preview",
      },
    });
  };

  const onRenderDownloadClick = async () => {
    worker.postMessage({
      type: "renderSticker",
      data: prepareRenderArgs(),
      extra: {
        operation: "download",
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
              modifySettings({ roundBorders: e.target.checked });
            }}
            checked={roundBorders}
          />
          &nbsp;Закругленные края
        </label>

        <button onClick={onRenderStickerClick}>Превью</button>
        <button onClick={onRenderDownloadClick}>Скачать</button>
      </div>
    </div>
  );
}
