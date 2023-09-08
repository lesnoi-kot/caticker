import { RefObject, createContext, useCallback, useContext } from "react";

import { useTransformStore } from "../store/transforms";

export const WorkspaceContex = createContext<RefObject<HTMLDivElement> | null>(
  null
);

export const useWorkspaceRef = () => {
  const ref = useContext(WorkspaceContex);

  if (!ref) {
    throw new Error("Workspace ref not provided");
  }

  return ref;
};

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
