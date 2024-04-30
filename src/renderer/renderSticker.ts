import type { ItemGeometryInfo } from "@/store/transforms";
import type {
  WorkspaceAnyItem,
  WorkspaceFigure,
  WorkspacePicture,
  WorkspaceText,
} from "@/store/workspace";
import { FigureType, WorkspaceItemType } from "@/store/types";

export type RenderStickerArguments = {
  width: number;
  height: number;
  workspaceItems: WorkspaceAnyItem[];
  transformItems: Record<string, ItemGeometryInfo>;
  imageType: string;
  backgroundColor?: string;
  roundBorders?: boolean;
};

export async function renderSticker(
  args: RenderStickerArguments
): Promise<Blob> {
  const {
    width,
    height,
    workspaceItems,
    transformItems,
    imageType,
    backgroundColor,
    roundBorders,
  } = args;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, width, height);

  if (roundBorders) {
    ctx.roundRect(0, 0, width, height, [15]);
    ctx.clip();
  }

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

  return canvas.convertToBlob({ type: imageType });
}

async function renderImage(
  ctx: OffscreenCanvasRenderingContext2D,
  args: RenderStickerArguments,
  picture: WorkspacePicture
) {
  const img = await self.createImageBitmap(picture.file);
  const transform = args.transformItems[picture.id];

  ctx.drawImage(img, 0, 0, transform.width, transform.height);
}

function renderFigure(
  ctx: OffscreenCanvasRenderingContext2D,
  args: RenderStickerArguments,
  figure: WorkspaceFigure
) {
  ctx.fillStyle = figure.color;
  const { width, height } = args.transformItems[figure.id];

  if (figure.figure === FigureType.Rect) {
    ctx.fillRect(0, 0, width, height);
  } else if (figure.figure === FigureType.Circle) {
    ctx.beginPath();
    const x = width / 2,
      y = height / 2;
    ctx.ellipse(x, y, x, y, 0, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function renderText(
  ctx: OffscreenCanvasRenderingContext2D,
  args: RenderStickerArguments,
  item: WorkspaceText
) {
  const {
    text,
    color,
    strokeColor,
    strokeWidth,
    fontFamily,
    fontSize,
    fontItalic,
  } = item;

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = strokeWidth;
  ctx.fillStyle = color;
  ctx.font = `${fontItalic ? "italic " : ""}${fontSize}px "${fontFamily}"`;
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
