import { ItemGeometryInfo } from "../store/transforms";
import {
  FIGURE_BASE_SIZE,
  FigureType,
  WorkspaceAnyItem,
  WorkspaceFigure,
  WorkspaceItemType,
  WorkspacePicture,
  WorkspaceText,
} from "../store/workspace";

type RenderStickerArguments = {
  width: number;
  height: number;
  workspaceItems: WorkspaceAnyItem[];
  transformItems: Record<string, ItemGeometryInfo>;
  imageType: string;
  backgroundColor?: string;
};

export async function renderSticker(args: RenderStickerArguments) {
  const {
    width,
    height,
    workspaceItems,
    transformItems,
    imageType,
    backgroundColor,
  } = args;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = backgroundColor ?? "transparent";
  ctx.fillRect(0, 0, width, height);

  for (const item of workspaceItems) {
    const g = transformItems[item.id];

    ctx.save();
    ctx.setTransform(g.transform);

    if (item.type === WorkspaceItemType.Picture) {
      await renderImage(ctx, args, item);
    } else if (item.type === WorkspaceItemType.Text) {
      renderText(ctx, args, item);
    } else if (item.type === WorkspaceItemType.Figure) {
      renderFigure(ctx, args, item);
    }

    ctx.restore();
  }

  const blob = await canvas.convertToBlob({ type: imageType });
  window.open(URL.createObjectURL(blob), "_blank");
}

async function renderImage(
  ctx: OffscreenCanvasRenderingContext2D,
  args: RenderStickerArguments,
  picture: WorkspacePicture
) {
  const img = await window.createImageBitmap(picture.file);
  const transform = args.transformItems[picture.id];

  ctx.drawImage(img, 0, 0, transform.unscaledWidth, transform.unscaledHeight);
}

function renderFigure(
  ctx: OffscreenCanvasRenderingContext2D,
  args: RenderStickerArguments,
  item: WorkspaceFigure
) {
  ctx.fillStyle = item.color;

  if (item.figure === FigureType.Rect) {
    ctx.fillRect(0, 0, FIGURE_BASE_SIZE, FIGURE_BASE_SIZE);
  } else if (item.figure === FigureType.Circle) {
    ctx.beginPath();
    const k = FIGURE_BASE_SIZE / 2;
    ctx.ellipse(k, k, k, k, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function renderText(
  ctx: OffscreenCanvasRenderingContext2D,
  args: RenderStickerArguments,
  item: WorkspaceText
) {
  const { text, color, strokeColor, strokeWidth, fontFamily, fontSize } = item;

  ctx.strokeStyle = strokeColor ?? "black";
  ctx.lineWidth = strokeWidth;
  ctx.fillStyle = color;
  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "top";
  drawMultilineText(ctx, text, fontSize, strokeWidth);
}

function drawMultilineText(
  ctx: OffscreenCanvasRenderingContext2D,
  text: string,
  fontSize: number,
  lineWidth: number
) {
  const lines = text.split("\n");

  lines.forEach((line, i) => {
    ctx.fillText(line, 0, fontSize * i);
    if (lineWidth !== 0) {
      ctx.strokeText(line, 0, fontSize * i);
    }
  });
}
