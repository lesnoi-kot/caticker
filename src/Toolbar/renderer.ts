import {
  BaseWorkspaceItem,
  FigureType,
  WorkspaceFigure,
  WorkspaceItemType,
  WorkspaceText,
} from "../store/workspace";

type RenderStickerArguments = {
  width: number;
  height: number;
  workspaceItems: BaseWorkspaceItem[];
  imageType: string;
};

export async function renderSticker(args: RenderStickerArguments) {
  const { width, height, workspaceItems, imageType } = args;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, 512, 512);

  workspaceItems.forEach((sprite) => {
    const transformContainer = document.getElementById(
      sprite.id
    ) as HTMLDivElement;

    if (!transformContainer) {
      return;
    }

    const transform = new DOMMatrix(
      window.getComputedStyle(transformContainer).transform
    );
    ctx.save();
    ctx.setTransform(transform);

    if (sprite.type === WorkspaceItemType.Picture) {
      const img = transformContainer.querySelector("img") as HTMLImageElement;

      if (img) {
        ctx.drawImage(img, 0, 0, img.width, img.height);
      }
    } else if (sprite.type === WorkspaceItemType.Text) {
      const { color, strokeColor, strokeWidth, fontFamily, fontSize } =
        sprite as WorkspaceText;
      const textEl = transformContainer.querySelector("div") as HTMLDivElement;

      if (textEl) {
        ctx.strokeStyle = strokeColor ?? "black";
        ctx.lineWidth = strokeWidth;
        ctx.fillStyle = color;
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.textBaseline = "top";
        drawMultilineText(ctx, textEl.innerText ?? "");
      }
    } else if (sprite.type === WorkspaceItemType.Figure) {
      ctx.fillStyle = (sprite as WorkspaceFigure).color;

      if ((sprite as WorkspaceFigure).figure === FigureType.Rect) {
        ctx.fillRect(0, 0, 100, 100);
      } else if ((sprite as WorkspaceFigure).figure === FigureType.Circle) {
        ctx.beginPath();
        ctx.ellipse(50, 50, 50, 50, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.restore();
  });

  const blob = await canvas.convertToBlob({ type: imageType });
  window.open(URL.createObjectURL(blob), "_blank");
}

function drawMultilineText(
  ctx: OffscreenCanvasRenderingContext2D,
  text: string
) {
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    ctx.fillText(line, 0, 32 * i);
    ctx.strokeText(line, 0, 32 * i);
  });
}
