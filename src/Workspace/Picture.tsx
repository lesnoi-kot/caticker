import { useEffect, useMemo, useRef } from "react";

import { useWorkspaceStore, type WorkspacePicture } from "../store/workspace";
import type { ItemComponentInterface } from "./types";

type Props = ItemComponentInterface<WorkspacePicture>;

function Picture(props: Props) {
  const { item } = props;
  const ref = useRef<HTMLImageElement>(null);

  const imageSrc = useMemo(() => URL.createObjectURL(item.file), [item.file]);

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  return (
    <img
      onLoad={(event) => {
        const img = event.target as HTMLImageElement;

        // Make the image fully visible in the canvas for user convinience.
        const halfStageWidth = Math.ceil(
          useWorkspaceStore.getState().settings.stageWidth / 2
        );
        if (img.width > halfStageWidth) {
          img.width = halfStageWidth;
        }
      }}
      ref={ref}
      className="workspace__stage-picture"
      src={imageSrc}
      draggable={false}
    />
  );
}

export default Picture;
