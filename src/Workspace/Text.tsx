import { useEffect, useRef, useState } from "react";

import { WorkspaceText, useWorkspaceStore } from "../store/workspace";
import type { ItemComponentInterface } from "./types";
import { runInUndoHistory } from "../store/undo";

type Props = ItemComponentInterface<WorkspaceText>;

export default function Text({ item }: Props) {
  const [editable, setEditable] = useState(true);
  const remove = useWorkspaceStore((store) => store.remove);
  const upsert = useWorkspaceStore((store) => store.upsert);
  const ref = useRef<HTMLPreElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
    }
  }, []);

  return (
    <pre
      ref={ref}
      contentEditable={editable}
      suppressContentEditableWarning
      className="workspace__stage-text"
      role="textbox"
      draggable={false}
      style={{
        fontSize: `${item.fontSize}px`,
        fontFamily: item.fontFamily,
        fontStyle: item.fontItalic ? "italic" : "unset",
        color: item.color,
        WebkitTextStrokeColor:
          item.strokeWidth > 0 ? item.strokeColor : "unset",
        WebkitTextStrokeWidth: `${item.strokeWidth}px`,
      }}
      onDoubleClick={() => {
        setEditable(true);
      }}
      onBlur={(e) => {
        setEditable(false);

        if (!(ref.current?.textContent ?? "").trim()) {
          runInUndoHistory(() => {
            remove(item.id);
          });
        } else {
          runInUndoHistory(() => {
            upsert({
              ...item,
              text: (e.target as HTMLPreElement).innerText,
            });
          });
        }
      }}
    >
      {item.text}
    </pre>
  );
}
