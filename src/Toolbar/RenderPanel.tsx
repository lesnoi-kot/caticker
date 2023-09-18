import { useEffect, useState } from "react";

import {
  useWorkspaceItemIds,
  useWorkspaceItems,
  useWorkspaceStore,
} from "../store/workspace";
import { useTransformStore } from "../store/transforms";
import {
  renderSticker,
  type RenderStickerArguments,
} from "../renderer/renderSticker";
import { getDataURLOfBlob } from "../utils/events";
import { downloadURL, newWindow } from "../utils/popup";

export type SupportedRenderFormat = "webp" | "png";

export default function RenderPanel() {
  const [format, setFormat] = useState<SupportedRenderFormat>("webp");
  const roundBorders = useWorkspaceStore(
    (store) => store.settings.roundBorders
  );
  const modifySettings = useWorkspaceStore((store) => store.modifySettings);
  const sortedItemsIds = useWorkspaceItemIds();
  const stageItems = useWorkspaceItems(sortedItemsIds);

  const onFormatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormat(e.target.value as SupportedRenderFormat);
  };

  const prepareRenderArgs = (): RenderStickerArguments => {
    const { settings } = useWorkspaceStore.getState();
    const { items: transformItems } = useTransformStore.getState();

    return {
      width: settings.stageWidth,
      height: settings.stageHeight,
      backgroundColor: settings.stageColor,
      workspaceItems: stageItems,
      transformItems,
      imageType: `image/${format}`,
      roundBorders,
    };
  };

  const onRenderStickerClick = async () => {
    const blob = await renderSticker(prepareRenderArgs());
    const dataURL = await getDataURLOfBlob(blob);
    newWindow(dataURL);
  };

  const onRenderDownloadClick = async () => {
    const blob = await renderSticker(prepareRenderArgs());
    const dataURL = await getDataURLOfBlob(blob);
    downloadURL(dataURL, `sticker.${format}`);
  };

  useEffect(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case "KeyQ":
          onRenderStickerClick();
          break;
        case "KeyW":
          onRenderDownloadClick();
          break;
        default:
          break;
      }
    };

    document.addEventListener("keypress", onKeyPress);

    return () => {
      document.removeEventListener("keypress", onKeyPress);
    };
  });

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">Рендер</p>

      <div className="flex flex-row gap-2">
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
      </div>

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
      <button onClick={onRenderStickerClick}>
        Превью&nbsp;<kbd>q</kbd>
      </button>
      <button onClick={onRenderDownloadClick}>
        Скачать&nbsp;<kbd>w</kbd>
      </button>
    </div>
  );
}
