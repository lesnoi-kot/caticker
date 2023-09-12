import { useEffect, useRef, useState } from "react";

import { WorkspaceText, useWorkspaceStore } from "../store/workspace";
import type { ItemComponentInterface } from "./types";
import { runInUndoHistory } from "../store/undo";

type Props = ItemComponentInterface<WorkspaceText>;

export default function Text({ item }: Props) {
  const [editable, setEditable] = useState(true);
  const remove = useWorkspaceStore((store) => store.remove);
  const upsert = useWorkspaceStore((store) => store.upsert);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <div
      ref={ref}
      contentEditable={editable}
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
      onChange={(e) => {
        runInUndoHistory(() => {
          upsert({
            ...item,
            text: (e.target as HTMLSpanElement).innerText,
          });
        });
      }}
      onBlur={() => {
        setEditable(false);

        if (!(ref.current?.textContent ?? "").trim()) {
          runInUndoHistory(() => {
            remove(item.id);
          });
        }
      }}
    >
      {item.text}
    </div>
  );
}
