import { useEffect, useRef, useState } from "react";

import { WorkspaceText, useWorkspaceStore } from "../store/workspace";
import type { ItemComponentInterface } from "./types";

type Props = ItemComponentInterface<WorkspaceText>;

export default function Text(props: Props) {
  const { item, selected } = props;
  const [editable, setEditable] = useState(true);
  const remove = useWorkspaceStore((store) => store.remove);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.textContent = "Введи текст!";
    }
  }, []);

  return (
    <div
      ref={ref}
      contentEditable={editable && selected}
      className="workspace__stage-text"
      draggable={false}
      style={{
        fontSize: `${item.fontSize}px`,
        fontFamily: item.fontFamily,
        color: item.color,
        WebkitTextStrokeColor: item.strokeColor ?? "unset",
        WebkitTextStrokeWidth: `${item.strokeWidth}px`,
      }}
      onDoubleClick={() => {
        setEditable(true);
      }}
      onBlur={() => {
        setEditable(false);

        if (!(ref.current?.textContent ?? "").trim()) {
          remove(item.id);
        }
      }}
    />
  );
}
