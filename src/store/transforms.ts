import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { Draft } from "immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import geometry from "@flatten-js/core";

const DEFAULT_ITEM_SIZE = 100;

export type ItemGeometryInfo = {
  translate: { x: number; y: number };
  scale: { x: number; y: number };
  rotation: number;
  width: number;
  height: number;

  transform: DOMMatrixReadOnly;
  polygon: geometry.Polygon;
};

export type CreateActionOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export const useTransformStore = createWithEqualityFn(
  immer(
    combine(
      { items: Object.create(null) as Record<string, ItemGeometryInfo> },

      (set, get) => ({
        create: (itemId: string, options?: CreateActionOptions) => {
          if (get().items[itemId]) {
            return;
          }

          set((state) => {
            state.items[itemId] = {
              width: options?.width ?? DEFAULT_ITEM_SIZE,
              height: options?.height ?? DEFAULT_ITEM_SIZE,
              translate: { x: options?.x ?? 0, y: options?.y ?? 0 },
              rotation: 0,
              scale: { x: 1, y: 1 },
              transform: new DOMMatrix(),
              polygon: new geometry.Polygon(),
            };
          });
        },

        replace: (itemId: string, geometry: ItemGeometryInfo) => {
          set((state) => {
            state.items[itemId] = geometry;
          });
        },

        // Compute the item's transform matrix to utilize it in every rerender.
        recalculateTransformMatrix: (itemId: string) => {
          set((state) => {
            const g = state.items[itemId];

            g.transform = new DOMMatrix()
              .translateSelf(g.translate.x, g.translate.y)
              .rotateSelf(g.rotation)
              .scaleSelf(g.scale.x, g.scale.y);
          });
        },

        // Recalculate item's polygon to utilize it in area mouse selection.
        recalculatePolygon: (itemId: string) => {
          set((state) => {
            const g = state.items[itemId];

            // Recalculate the polygon.
            const p1 = g.transform.transformPoint(new DOMPoint(0, 0));
            const p2 = g.transform.transformPoint(new DOMPoint(g.width, 0));
            const p3 = g.transform.transformPoint(
              new DOMPoint(g.width, g.height)
            );
            const p4 = g.transform.transformPoint(new DOMPoint(0, g.height));

            g.polygon = new geometry.Polygon([
              geometry.point(p1.x, p1.y),
              geometry.point(p2.x, p2.y),
              geometry.point(p3.x, p3.y),
              geometry.point(p4.x, p4.y),
            ]);
          });
        },

        translate: (itemId: string, dx: number, dy: number) => {
          set((state) => {
            state.items[itemId].translate.x += dx;
            state.items[itemId].translate.y += dy;
          });

          useTransformStore.getState().recalculateTransformMatrix(itemId);
        },

        translateTo: (itemId: string, x: number, y: number) => {
          set((state) => {
            state.items[itemId].translate.x = x;
            state.items[itemId].translate.y = y;
          });

          useTransformStore.getState().recalculateTransformMatrix(itemId);
        },

        rotateToAround: (
          itemId: string,
          deg: number,
          origin: DOMPointReadOnly = new DOMPointReadOnly(0.5, 0.5)
        ) => {
          set((state) => {
            const item = state.items[itemId];
            const scaledSize = getItemSizeFromGeometry(item);
            const absoluteOrigin = new DOMPointReadOnly(
              origin.x * scaledSize.x,
              origin.y * scaledSize.y
            );
            const m = new DOMMatrixReadOnly()
              .translate(item.translate.x, item.translate.y)
              .rotate(item.rotation)
              .translate(absoluteOrigin.x, absoluteOrigin.y)
              .rotate(deg - item.rotation)
              .translate(-absoluteOrigin.x, -absoluteOrigin.y)
              .scale(item.scale.x, item.scale.y);
            const p = m.transformPoint(new DOMPoint(0, 0));

            item.rotation = deg;
            item.translate.x = p.x;
            item.translate.y = p.y;
          });

          useTransformStore.getState().recalculateTransformMatrix(itemId);
        },

        scaleTo: (
          itemId: string,
          x: number | null,
          y: number | null,
          origin: DOMPoint = new DOMPoint(0, 0)
        ) => {
          set((state) => {
            const item = state.items[itemId];
            const newScaleX = x ?? item.scale.x;
            const newScaleY = y ?? item.scale.y;

            const m = new DOMMatrixReadOnly()
              .translate(item.translate.x, item.translate.y)
              .rotate(item.rotation)
              .translate(
                origin.x * item.width * item.scale.x,
                origin.y * item.height * item.scale.y
              )
              .scale(newScaleX, newScaleY)
              .translate(-origin.x * item.width, -origin.y * item.height);
            const p = m.transformPoint(new DOMPoint(0, 0));

            // item.scale.x = newScaleX;
            // item.scale.y = newScaleY;
            item.width = item.width * newScaleX;
            item.height = item.height * newScaleY;
            item.translate.x = p.x;
            item.translate.y = p.y;
          });

          useTransformStore.getState().recalculateTransformMatrix(itemId);
        },

        resize: (itemId: string, w?: number, h?: number) => {
          set((state) => {
            if (w) {
              state.items[itemId].width = w;
            }
            if (h) {
              state.items[itemId].height = h;
            }
          });

          useTransformStore.getState().recalculatePolygon(itemId);
          useTransformStore.getState().recalculateTransformMatrix(itemId);
        },

        remove: (itemId: string) => {
          set((state) => {
            delete state.items[itemId];
          });
        },

        reset: () => {
          set((state) => {
            state.items = Object.create(null);
          });
        },
      })
    )
  ),
  shallow
);

export type TransformState = ReturnType<typeof useTransformStore.getState>;

export const mergeTransformState = (newState: TransformState) =>
  useTransformStore.setState(newState);

export const useItemTransform = (id: string) =>
  useTransformStore((state) => state.items[id]);

export const useTransformActions = () => {
  const translate = useTransformStore((store) => store.translate);
  const translateTo = useTransformStore((store) => store.translateTo);
  const rotateToAround = useTransformStore((store) => store.rotateToAround);
  const scaleTo = useTransformStore((store) => store.scaleTo);
  const create = useTransformStore((store) => store.create);
  const resize = useTransformStore((store) => store.resize);
  const replace = useTransformStore((store) => store.replace);
  const recalculatePolygonAndRotationPoint = useTransformStore(
    (store) => store.recalculatePolygon
  );

  return {
    translate,
    translateTo,
    rotateToAround,
    scaleTo,
    create,
    resize,
    replace,
    recalculatePolygonAndRotationPoint,
  };
};

export function getGeometry(itemId: string): ItemGeometryInfo {
  const geometry = useTransformStore.getState().items[itemId];
  return geometry;
}

export function getCenter(
  g: ItemGeometryInfo | Draft<ItemGeometryInfo>
): DOMPoint {
  const { width, height, transform } = g;
  return transform.transformPoint(new DOMPoint(width / 2, height / 2));
}

export function getItemSizeFromGeometry(
  g: ItemGeometryInfo | Draft<ItemGeometryInfo>
): DOMPointReadOnly {
  const { scale, width, height } = g;
  return new DOMPointReadOnly(width * scale.x, height * scale.y);
}

export function getItemSize(itemId: string): DOMPointReadOnly {
  return getItemSizeFromGeometry(getGeometry(itemId));
}

export function computeBoundingBox(state: TransformState, itemIds: string[]) {
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  const points: DOMPointReadOnly[] = itemIds.flatMap((itemId) => {
    const { transform, width, height } = state.items[itemId];
    return [
      transform.transformPoint(new DOMPointReadOnly(0, 0)),
      transform.transformPoint(new DOMPointReadOnly(width, 0)),
      transform.transformPoint(new DOMPointReadOnly(width, height)),
      transform.transformPoint(new DOMPointReadOnly(0, height)),
    ];
  });

  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
    transform: new DOMMatrixReadOnly().translate(minX, minY),
  };
}

export function getGeometryOfSelection(
  state: TransformState,
  itemIds: string[]
): ItemGeometryInfo {
  const { width, height, transform } = computeBoundingBox(state, itemIds);

  return {
    translate: transform.transformPoint(new DOMPointReadOnly(0, 0)),
    rotation: 0,
    scale: { x: 1, y: 1 },
    transform,

    width: width,
    height: height,
    polygon: new geometry.Polygon(),
  };
}
