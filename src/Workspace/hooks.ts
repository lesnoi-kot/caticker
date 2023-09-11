import {
  RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import { ResizerType } from "./types";
import {
  ItemGeometryInfo,
  TransformMutationRecorder,
  useTransformActions,
  useTransformStore,
} from "../store/transforms";
import { useWorkspaceStore } from "../store/workspace";
import { degToRad, distance, getOrigin, radToDeg } from "../utils/math";
import { getRelativeXY } from "../utils/events";
import { TransformAction, useUndoStore } from "../store/undo";

export const useItemTransformActions = (itemId: string) => {
  const actions = useTransformActions();

  const translate = useCallback(
    (dx: number, dy: number) => {
      actions.translate(itemId, dx, dy);
    },
    [itemId]
  );

  const translateTo = useCallback(
    (x: number, y: number) => {
      actions.translateTo(itemId, x, y);
    },
    [itemId]
  );

  const rotateToAround = useCallback(
    (deg: number, p: DOMPoint) => {
      actions.rotateToAround(itemId, deg, p);
    },
    [itemId]
  );

  const scaleXTo = useCallback(
    (factor: number) => {
      actions.scaleTo(itemId, factor, null);
    },
    [itemId]
  );

  const scaleYTo = useCallback(
    (factor: number) => {
      actions.scaleTo(itemId, null, factor);
    },
    [itemId]
  );

  const createGeometry = useCallback(() => {
    actions.createGeometry(itemId);
  }, [itemId]);

  const resize = useCallback(
    (w: number, h: number) => {
      actions.resize(itemId, w, h);
    },
    [itemId]
  );

  return {
    translate,
    translateTo,
    rotateToAround,
    scaleXTo,
    scaleYTo,
    createGeometry,
    resize,
  };
};

type WorkspaceContexData = {
  workspaceRef: RefObject<HTMLDivElement>;
  onItemPress: (itemId: string, event: MouseEvent) => void;
  onItemResizeStart: (
    itemId: string,
    type: ResizerType,
    event: MouseEvent
  ) => void;
  onItemRotateStart: (itemId: string, event: MouseEvent) => void;
};

export const WorkspaceContex = createContext<WorkspaceContexData | null>(null);

export const useWorkspaceRef = (): WorkspaceContexData => {
  const ref = useContext(WorkspaceContex);

  if (!ref) {
    throw new Error("Workspace ref not provided");
  }

  return ref;
};

export const useCreateWorkspaceRef = (): WorkspaceContexData => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const { translate, rotateToAround, scaleTo, translateTo } =
    useTransformActions();
  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const toggleSelect = useWorkspaceStore((store) => store.toggleSelect);
  const pushHistory = useUndoStore((store) => store.push);
  const resizeDirection = useRef<ResizerType>("bottom");
  const isPristine = useRef<boolean>(true);
  const transformRecorder = useRef<TransformMutationRecorder>(
    new TransformMutationRecorder()
  );

  const onItemDrag = useCallback(
    (event: MouseEvent) => {
      Array.from(useWorkspaceStore.getState().selectedItems).forEach((id) => {
        translate(id, event.movementX, event.movementY);
        isPristine.current = false;
      });
    },
    [translate]
  );

  const onItemResize = useCallback(
    (event: MouseEvent) => {
      const selectedIds = Array.from(
        useWorkspaceStore.getState().selectedItems
      );

      if (!workspaceRef.current || selectedIds.length === 0) {
        return;
      }

      const [selectedId] = selectedIds;

      const { unscaledWidth, unscaledHeight, rotation, transform } =
        getGeometry(selectedId);
      const mouse = getRelativeXY(workspaceRef.current, event);
      const rotationRad = degToRad(rotation);
      const origin = getOrigin(transform);
      const distToOrigin = distance(mouse, origin);
      const angleToOrigin = Math.atan2(mouse.y - origin.y, mouse.x - origin.x);

      if (resizeDirection.current.includes("right")) {
        scaleTo(
          selectedId,
          (distToOrigin * Math.cos(angleToOrigin - rotationRad)) /
            unscaledWidth,
          null
        );
      }

      if (resizeDirection.current.includes("bottom")) {
        scaleTo(
          selectedId,
          null,
          (distToOrigin * Math.sin(angleToOrigin - rotationRad)) /
            unscaledHeight
        );
      }

      isPristine.current = false;
    },
    [scaleTo]
  );

  const onItemRotate = useCallback(
    (event: MouseEvent) => {
      const selectedIds = Array.from(
        useWorkspaceStore.getState().selectedItems
      );

      if (!workspaceRef.current || selectedIds.length === 0) {
        return;
      }

      const [selectedId] = selectedIds;

      const g = getGeometry(selectedId);
      const { scale } = g;
      const center = getCenter(g);
      const scaledSize = getItemSize(g);
      const mouse = getRelativeXY(workspaceRef.current, event);

      const newRotation =
        Math.atan2(mouse.y - center.y, mouse.x - center.x) -
        (scale.x < 0 ? -Math.PI : 0);

      rotateToAround(
        selectedId,
        radToDeg(newRotation),
        new DOMPoint(scaledSize.x / 2, scaledSize.y / 2)
      );

      isPristine.current = false;
    },
    [rotateToAround]
  );

  const onModificationStart = useCallback(() => {
    transformRecorder.current.start();
  }, []);

  const onModificationEnd = useCallback(() => {
    const report = transformRecorder.current.compare();

    if (report.modified.length === 0) {
      return;
    }

    const historyAction: TransformAction = {
      type: "transform",
      before: {},
      after: {},
    };
    const state = useTransformStore.getState();
    report.modified.forEach((id) => {
      historyAction.before[id] = transformRecorder.current.snapshot[id];
      historyAction.after[id] = state.items[id];
    });

    pushHistory(historyAction);
  }, [pushHistory]);

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onItemResize);
    document.removeEventListener("mousemove", onItemDrag);
    document.removeEventListener("mousemove", onItemRotate);

    onModificationEnd();

    Array.from(useWorkspaceStore.getState().selectedItems).forEach((id) => {
      const g = getGeometry(id);
      const center = getCenter(g);
      const scaledSize = getItemSize(g);

      translateTo(id, center.x - scaledSize.x / 2, center.y - scaledSize.y / 2);
      rotateToAround(
        id,
        g.rotation,
        new DOMPoint(scaledSize.x / 2, scaledSize.y / 2)
      );
    });

    isPristine.current = true;
  }, [
    onItemResize,
    onItemDrag,
    onItemRotate,
    translateTo,
    rotateToAround,
    onModificationEnd,
  ]);

  const onItemPress = useCallback(
    (targetId: string, event: MouseEvent) => {
      if (event.button === 0) {
        const alreadySelected = useWorkspaceStore
          .getState()
          .selectedItems.has(targetId);

        if (event.ctrlKey) {
          toggleSelect(targetId);
        } else if (!alreadySelected) {
          selectOne(targetId);
        }

        onModificationStart();
        document.addEventListener("mousemove", onItemDrag);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      }
    },
    [selectOne, toggleSelect, onItemDrag, onModificationStart, onMouseUp]
  );

  const onItemRotateStart = useCallback(
    (itemId: string, event: MouseEvent) => {
      if (event.button === 0) {
        selectOne(itemId);
        onModificationStart();
        document.addEventListener("mousemove", onItemRotate);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      }
    },
    [selectOne, onItemRotate, onModificationStart, onMouseUp]
  );

  const onItemResizeStart = useCallback(
    (itemId: string, type: ResizerType, event: MouseEvent) => {
      if (event.button === 0) {
        selectOne(itemId);
        resizeDirection.current = type;
        onModificationStart();
        document.addEventListener("mousemove", onItemResize);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      }
    },
    [selectOne, onItemResize, onModificationStart, onMouseUp]
  );

  const handlers = useMemo(
    () => ({
      workspaceRef,
      onItemPress,
      onItemRotateStart,
      onItemResizeStart,
    }),
    [onItemPress, onItemRotateStart, onItemResizeStart]
  );

  return handlers;
};

export function getGeometry(itemId: string): ItemGeometryInfo {
  const geometry = useTransformStore.getState().items[itemId];
  return geometry;
}

function getCenter(g: ItemGeometryInfo): DOMPoint {
  const { unscaledWidth, unscaledHeight, transform } = g;
  return transform.transformPoint(
    new DOMPoint(unscaledWidth / 2, unscaledHeight / 2)
  );
}

export function getItemSize(g: ItemGeometryInfo): DOMPoint {
  const { scale, unscaledWidth, unscaledHeight } = g;
  return new DOMPoint(unscaledWidth * scale.x, unscaledHeight * scale.y);
}
