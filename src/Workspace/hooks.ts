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
  getCenter,
  getGeometry,
  getItemSize,
  useTransformActions,
} from "../store/transforms";
import { useWorkspaceStore } from "../store/workspace";
import { degToRad, distance, getOrigin, radToDeg } from "../utils/math";
import { getRelativeXY } from "../utils/events";
import { HistoryComparer, useUndoStore } from "../store/undo";

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
  const {
    translate,
    rotateToAround,
    scaleTo,
    recalculatePolygonAndRotationPoint,
  } = useTransformActions();
  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const toggleSelect = useWorkspaceStore((store) => store.toggleSelect);
  const pushHistory = useUndoStore((store) => store.push);
  const resizeDirection = useRef<ResizerType>("bottom");
  const historyComparer = useRef<HistoryComparer>(new HistoryComparer());

  const onItemDrag = useCallback(
    (event: MouseEvent) => {
      Array.from(useWorkspaceStore.getState().selectedItems).forEach((id) => {
        translate(id, event.movementX, event.movementY);
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
    },
    [rotateToAround]
  );

  const onModificationStart = useCallback(() => {
    historyComparer.current.start();
  }, []);

  const onModificationEnd = useCallback(() => {
    const possibleHistoryAction =
      historyComparer.current.compareToCurrentStates();

    if (possibleHistoryAction) {
      pushHistory(possibleHistoryAction);
    }
  }, [pushHistory]);

  const onMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", onItemResize);
    document.removeEventListener("mousemove", onItemDrag);
    document.removeEventListener("mousemove", onItemRotate);

    onModificationEnd();

    useWorkspaceStore.getState().selectedItems.forEach((id) => {
      recalculatePolygonAndRotationPoint(id);
    });
  }, [
    onItemResize,
    onItemDrag,
    onItemRotate,
    onModificationEnd,
    recalculatePolygonAndRotationPoint,
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
        window.getSelection()?.removeAllRanges();

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
        window.getSelection()?.removeAllRanges();

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
