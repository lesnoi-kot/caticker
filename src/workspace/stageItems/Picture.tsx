import { useEffect, useMemo, useRef } from "react";
import clsx from "clsx";

import { useWorkspaceStore, type WorkspacePicture } from "@/store/workspace";
import { useTransformStore } from "@/store/transforms";

import type { ItemComponentInterface } from "../types";
import css from "./stageItems.module.css";

type Props = ItemComponentInterface<WorkspacePicture>;

function Picture({ item, transform }: Props) {
  const ref = useRef<HTMLImageElement>(null);
  const resize = useTransformStore((store) => store.resize);
  const imageSrc = useMemo(() => URL.createObjectURL(item.file), [item.file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  return (
    <img
      id={item.id}
      onLoad={(event) => {
        const img = event.target as HTMLImageElement;

        // Make the image fully visible in the canvas for user convinience.
        const halfStageWidth = Math.ceil(
          useWorkspaceStore.getState().settings.stageWidth / 2
        );

        let k = 1;

        if (img.naturalWidth > halfStageWidth) {
          k = halfStageWidth / img.naturalWidth;
        }

        resize(item.id, k * img.naturalWidth, k * img.naturalHeight);
      }}
      ref={ref}
      className={clsx(css.stageItem, css.picture)}
      style={{
        width: `${transform.width}px`,
        height: `${transform.height}px`,
      }}
      src={imageSrc}
      draggable={false}
    />
  );
}

export default Picture;
