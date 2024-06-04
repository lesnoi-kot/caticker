import {
  RefObject,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
} from "react";

import {
  getCenter,
  getGeometry,
  getGeometryOfSelection,
  useTransformActions,
  useTransformStore,
} from "@/store/transforms";
import { useWorkspaceStore } from "@/store/workspace";
import { HistoryComparer, useUndoStore } from "@/store/undo";
import { degToRad, distance, radToDeg } from "@/utils/math";
import { getRelativeXY } from "@/utils/events";

import { ResizerType } from "./types";

type WorkspaceContexData = {
  workspaceRef: RefObject<HTMLDivElement>;
  onItemPress: (itemId: string, event: MouseEvent) => void;
  onItemResizeStart: (type: ResizerType, event: MouseEvent) => void;
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
      const workspaceState = useWorkspaceStore.getState();
      const selectedIds = Array.from(workspaceState.selectedItems);

      if (!workspaceRef.current || selectedIds.length !== 1) {
        return;
      }

      const transformState = useTransformStore.getState();
      const mouse = getRelativeXY(workspaceRef.current, event);
      const isSingleSelect = selectedIds.length === 1;

      const { width, height, rotation, transform } =
        selectedIds.length === 1
          ? getGeometry(selectedIds[0])
          : getGeometryOfSelection(transformState, selectedIds);
      const rotationRad = degToRad(rotation);

      const normalizedOrigin = getOriginOfResizer(resizeDirection.current);
      const origin = transform.transformPoint(
        new DOMMatrixReadOnly()
          .scale(width, height)
          .transformPoint(normalizedOrigin)
      );
      const distToOrigin = distance(mouse, origin);
      const angleToOrigin = Math.atan2(mouse.y - origin.y, mouse.x - origin.x);

      if (resizeDirection.current.includes("top")) {
        const newScale =
          (distToOrigin * Math.cos(angleToOrigin - rotationRad + Math.PI / 2)) /
          height;

        selectedIds.forEach((selectedId) => {
          scaleTo(selectedId, null, newScale, normalizedOrigin);
        });
      }

      if (resizeDirection.current.includes("right")) {
        const newWidth = distToOrigin * Math.cos(angleToOrigin - rotationRad);
        const newScaleX = newWidth / width;

        selectedIds.forEach((selectedId) => {
          scaleTo(
            selectedId,
            (isSingleSelect ? 1 : transformState.items[selectedId].scale.x) *
              newScaleX,
            null,
            normalizedOrigin
          );
        });
      }

      if (resizeDirection.current.includes("bottom")) {
        const newScale =
          (distToOrigin * Math.sin(angleToOrigin - rotationRad)) / height;

        selectedIds.forEach((selectedId) => {
          scaleTo(selectedId, null, newScale, normalizedOrigin);
        });
      }

      if (resizeDirection.current.includes("left")) {
        const newScale =
          (distToOrigin * Math.cos(angleToOrigin - rotationRad + Math.PI)) /
          width;

        selectedIds.forEach((selectedId) => {
          scaleTo(selectedId, newScale, null, normalizedOrigin);
        });
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
      const mouse = getRelativeXY(workspaceRef.current, event);

      const newRotation =
        Math.atan2(mouse.y - center.y, mouse.x - center.x) -
        (scale.x < 0 ? -Math.PI : 0);

      rotateToAround(selectedId, radToDeg(newRotation));
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

    document.body.classList.remove(
      ...Array.from(document.body.classList.values()).filter((className) =>
        className.includes("cursor")
      )
    );

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
        document.body.classList.add("[&_*]:cursor-crosshair");
        document.addEventListener("mousemove", onItemRotate);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      }
    },
    [selectOne, onItemRotate, onModificationStart, onMouseUp]
  );

  const onItemResizeStart = useCallback(
    (type: ResizerType, event: MouseEvent) => {
      if (event.button === 0) {
        window.getSelection()?.removeAllRanges();
        document.body.classList.add(
          `[&_*]:${(event.target as HTMLElement).dataset.cursorClass ?? ""}`
        );

        resizeDirection.current = type;
        onModificationStart();

        document.addEventListener("mousemove", onItemResize);
        document.addEventListener("mouseup", onMouseUp, { once: true });
      }
    },
    [onItemResize, onModificationStart, onMouseUp]
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

function getOriginOfResizer(resizerType: ResizerType): DOMPointReadOnly {
  switch (resizerType) {
    case "top-left":
      return new DOMPointReadOnly(1, 1);
    case "top":
      return new DOMPointReadOnly(0, 1);
    case "top-right":
      return new DOMPointReadOnly(0, 1);
    case "right":
      return new DOMPointReadOnly(0, 0);
    case "bottom-right":
      return new DOMPointReadOnly(0, 0);
    case "bottom":
      return new DOMPointReadOnly(0, 0);
    case "bottom-left":
      return new DOMPointReadOnly(1, 0);
    case "left":
      return new DOMPointReadOnly(1, 0);
    default:
      throw new Error("Unexpected resizer type");
  }
}
