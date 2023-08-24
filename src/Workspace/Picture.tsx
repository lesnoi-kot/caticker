import { useEffect, useMemo, useRef } from "react";

import type { WorkspacePicture } from "../store/workspace";
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
      ref={ref}
      className="workspace__stage-picture"
      src={imageSrc}
      draggable={false}
    />
  );
}

export default Picture;
