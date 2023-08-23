import { useRef } from "react";

import {
  WorkspaceItem,
  WorkspaceItemType,
  makePictureItem,
  makeTextItem,
  useWorkspaceStore,
} from "../store/workspace";
import "./Toolbar.css";

export default function Toolbar() {
  const store = useWorkspaceStore();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="toolbar">
      <label
        htmlFor="picture"
        onClick={() => {
          fileRef?.current?.click();
        }}
      >
        <input
          ref={fileRef}
          type="file"
          name="picture"
          id="picture"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              store.upsert(makePictureItem(file));
            }
          }}
          hidden
        />
        <button>Загрузить картинку</button>
      </label>
      <button
        onClick={() => {
          store.upsert(makeTextItem());
        }}
      >
        Добавить текст
      </button>
      <button
        onClick={() => {
          renderSticker({
            width: 512,
            height: 512,
            workspaceItems: Object.values(store.sprites),
            imageType: "image/png",
          });
        }}
      >
        Скачать
      </button>
      <canvas id="canvas" hidden></canvas>
    </div>
  );
}

type RenderStickerArguments = {
  width: number;
  height: number;
  workspaceItems: WorkspaceItem[];
  imageType: string;
};

async function renderSticker(args: RenderStickerArguments) {
  const { width, height, workspaceItems, imageType } = args;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, 512, 512);

  workspaceItems.forEach((sprite) => {
    if (sprite.type === WorkspaceItemType.Picture) {
      const img = document.getElementById(sprite.id) as HTMLImageElement;

      if (img) {
        ctx.drawImage(img, img.offsetLeft, img.offsetTop);
      }
    } else if (sprite.type === WorkspaceItemType.Text) {
      const textEl = document.getElementById(sprite.id) as HTMLDivElement;

      if (textEl) {
        ctx.fillStyle = "black";
        ctx.font = window.getComputedStyle(textEl).font;
        ctx.textBaseline = "top";
        ctx.fillText(
          textEl.textContent ?? "",
          textEl.offsetLeft,
          textEl.offsetTop
        );
      }
    }
  });

  const blob = await canvas.convertToBlob({ type: imageType });
  window.open(URL.createObjectURL(blob), "_blank");
}
