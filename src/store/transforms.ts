import { combine } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { createWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";
import geometry from "@flatten-js/core";

export type ItemGeometryInfo = {
  translate: { x: number; y: number };
  scale: { x: number; y: number };
  rotationAround: DOMPoint;
  rotation: number;

  transform: DOMMatrixReadOnly;
  unscaledWidth: number;
  unscaledHeight: number;
  polygon: geometry.Polygon;
};

type CreateActionOptions = {
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
              unscaledWidth: options?.width ?? 0,
              unscaledHeight: options?.height ?? 0,
              translate: { x: options?.x ?? 0, y: options?.y ?? 0 },
              rotation: 0,
              rotationAround: new DOMPoint(0, 0),
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

        recalculate: (itemId: string) => {
          set((state) => {
            const g = state.items[itemId];

            g.transform = new DOMMatrix()
              .translateSelf(g.translate.x, g.translate.y)
              .multiplySelf(
                new DOMMatrixReadOnly()
                  .translate(g.rotationAround.x, g.rotationAround.y)
                  .rotate(0, 0, g.rotation)
                  .translate(-g.rotationAround.x, -g.rotationAround.y)
              )
              .scaleSelf(g.scale.x, g.scale.y);

            const p1 = g.transform.transformPoint(new DOMPoint(0, 0));
            const p2 = g.transform.transformPoint(
              new DOMPoint(g.unscaledWidth, 0)
            );
            const p3 = g.transform.transformPoint(
              new DOMPoint(g.unscaledWidth, g.unscaledHeight)
            );
            const p4 = g.transform.transformPoint(
              new DOMPoint(0, g.unscaledHeight)
            );

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

          get().recalculate(itemId);
        },

        translateTo: (itemId: string, x: number, y: number) => {
          set((state) => {
            state.items[itemId].translate.x = x;
            state.items[itemId].translate.y = y;
          });

          get().recalculate(itemId);
        },

        rotateAround: (itemId: string, deg: number, p?: DOMPoint) => {
          set((state) => {
            state.items[itemId].rotation += deg;

            if (p) {
              state.items[itemId].rotationAround = p;
            }
          });

          get().recalculate(itemId);
        },

        rotateToAround: (itemId: string, deg: number, p?: DOMPoint) => {
          set((state) => {
            state.items[itemId].rotation = deg;
            if (p) {
              state.items[itemId].rotationAround = p;
            }
          });

          get().recalculate(itemId);
        },

        scaleTo: (itemId: string, x: number | null, y: number | null) => {
          set((state) => {
            if (x) {
              state.items[itemId].scale.x = x;
            }
            if (y) {
              state.items[itemId].scale.y = y;
            }
          });

          get().recalculate(itemId);
        },

        resize: (itemId: string, w: number, h: number) => {
          set((state) => {
            state.items[itemId].unscaledWidth = w;
            state.items[itemId].unscaledHeight = h;
          });

          get().recalculate(itemId);
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

export const useTransformActions = () => {
  const translate = useTransformStore((store) => store.translate);
  const translateTo = useTransformStore((store) => store.translateTo);
  const rotateToAround = useTransformStore((store) => store.rotateToAround);
  const scaleTo = useTransformStore((store) => store.scaleTo);
  const create = useTransformStore((store) => store.create);
  const resize = useTransformStore((store) => store.resize);

  return {
    translate,
    translateTo,
    rotateToAround,
    scaleTo,
    create,
    resize,
  };
};
