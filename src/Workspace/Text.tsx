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
    if (editable && ref.current) {
      ref.current.focus();
    }
  }, [editable]);

  return (
    <pre
      id={item.id}
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
      onClick={() => {
        setEditable(true);
      }}
      onFocus={placeCaretToTheEnd}
      onKeyDown={(event) => {
        event.stopPropagation();
        blurOnEscape(event);
      }}
      onKeyUp={stopPropagation}
      onKeyPress={stopPropagation}
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

function placeCaretToTheEnd(event: React.FocusEvent<HTMLPreElement>) {
  window.getSelection()?.selectAllChildren(event.target);
}

function blurOnEscape(e: React.KeyboardEvent<HTMLElement>) {
  if (
    e.key === "Escape" &&
    "blur" in e.target &&
    typeof e.target.blur === "function"
  ) {
    e.target.blur();
    window.getSelection()?.removeAllRanges();
    e.stopPropagation();
  }
}

function stopPropagation(event: React.KeyboardEvent) {
  event.stopPropagation();
}
