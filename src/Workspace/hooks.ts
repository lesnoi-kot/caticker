import {
  RefObject,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { useTransformStore } from "../store/transforms";
import { useWorkspaceStore } from "../store/workspace";

export const useTransformActions = (itemId: string) => {
  const _translate = useTransformStore((store) => store.translate);
  const _translateTo = useTransformStore((store) => store.translateTo);
  const _rotateToAround = useTransformStore((store) => store.rotateToAround);
  const _scaleTo = useTransformStore((store) => store.scaleTo);
  const _createGeometry = useTransformStore((store) => store.create);
  const _resize = useTransformStore((store) => store.resize);

  const translate = useCallback(
    (dx: number, dy: number) => {
      _translate(itemId, dx, dy);
    },
    [itemId, _translate]
  );

  const translateTo = useCallback(
    (x: number, y: number) => {
      _translateTo(itemId, x, y);
    },
    [itemId, _translateTo]
  );

  const rotateToAround = useCallback(
    (deg: number, p: DOMPoint) => {
      _rotateToAround(itemId, deg, p);
    },
    [itemId, _rotateToAround]
  );

  const scaleXTo = useCallback(
    (factor: number) => {
      _scaleTo(itemId, factor, null);
    },
    [itemId, _scaleTo]
  );

  const scaleYTo = useCallback(
    (factor: number) => {
      _scaleTo(itemId, null, factor);
    },
    [itemId, _scaleTo]
  );

  const createGeometry = useCallback(() => {
    _createGeometry(itemId);
  }, [itemId, _createGeometry]);

  const resize = useCallback(
    (w: number, h: number) => {
      _resize(itemId, w, h);
    },
    [itemId, _resize]
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
  onTransformContainerMouseDown: (itemId: string, event: MouseEvent) => void;
};

export const WorkspaceContex = createContext<WorkspaceContexData | null>(null);

export const useWorkspaceRef = (): WorkspaceContexData => {
  const ref = useContext(WorkspaceContex);

  if (!ref) {
    throw new Error("Workspace ref not provided");
  }

  return ref;
};

export const useCreateWorkspaceRef = () => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const selectOne = useWorkspaceStore((store) => store.selectOne);
  const toggleSelect = useWorkspaceStore((store) => store.toggleSelect);
  const translate = useTransformStore((store) => store.translate);
  const holding = useRef(false);

  const onMouseMove = useCallback(
    (event: MouseEvent) => {
      if (holding.current) {
        Array.from(useWorkspaceStore.getState().selectedItems).forEach((id) => {
          translate(id, event.movementX, event.movementY);
        });
      }
    },
    [translate]
  );

  const onMouseUp = useCallback(() => {
    holding.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const onTransformContainerMouseDown = useCallback(
    (targetId: string, event: MouseEvent) => {
      if (event.button === 0) {
        holding.current = true;

        const alreadySelected = useWorkspaceStore
          .getState()
          .selectedItems.has(targetId);

        if (event.ctrlKey) {
          toggleSelect(targetId);
        } else if (!alreadySelected) {
          selectOne(targetId);
        }
      }
    },
    [selectOne, toggleSelect]
  );

  const handlers = useMemo(
    () => ({
      workspaceRef,
      onTransformContainerMouseDown,
    }),
    [onTransformContainerMouseDown]
  );

  return handlers;
};
