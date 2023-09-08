import { useTransformStore } from "../store/transforms";
import {
  BaseWorkspaceItem,
  FigureType,
  WorkspaceFigure,
  WorkspaceItemType,
  WorkspacePicture,
  WorkspaceText,
} from "../store/workspace";

type RenderStickerArguments = {
  width: number;
  height: number;
  workspaceItems: BaseWorkspaceItem[];
  imageType: string;
  backgroundColor?: string;
};

export async function renderSticker(args: RenderStickerArguments) {
  const { width, height, workspaceItems, imageType, backgroundColor } = args;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = backgroundColor ?? "transparent";
  ctx.fillRect(0, 0, width, height);

  const { items } = useTransformStore.getState();

  for (const item of workspaceItems) {
    const g = items[item.id];

    ctx.save();
    ctx.setTransform(g.transform);

    if (item.type === WorkspaceItemType.Picture) {
      const img = await window.createImageBitmap(
        (item as WorkspacePicture).file
      );
      ctx.drawImage(img, 0, 0, img.width, img.height);
    } else if (item.type === WorkspaceItemType.Text) {
      const { text, color, strokeColor, strokeWidth, fontFamily, fontSize } =
        item as WorkspaceText;

      ctx.strokeStyle = strokeColor ?? "black";
      ctx.lineWidth = strokeWidth;
      ctx.fillStyle = color;
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textBaseline = "top";
      drawMultilineText(ctx, text);
    } else if (item.type === WorkspaceItemType.Figure) {
      ctx.fillStyle = (item as WorkspaceFigure).color;

      if ((item as WorkspaceFigure).figure === FigureType.Rect) {
        ctx.fillRect(0, 0, 100, 100);
      } else if ((item as WorkspaceFigure).figure === FigureType.Circle) {
        ctx.beginPath();
        ctx.ellipse(50, 50, 50, 50, 0, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    ctx.restore();
  }

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
    // if (ctx.lineWidth !== 0) {
    //   ctx.strokeText(line, 0, 32 * i);
    // }
  });
}
