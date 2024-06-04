import { useEffect, useRef, useState } from "react";
import clsx from "clsx";

import { WorkspaceText, useWorkspaceStore } from "@/store/workspace";
import { runInUndoHistory } from "@/store/undo";
import { useTransformStore } from "@/store/transforms";

import type { ItemComponentInterface } from "../types";
import css from "./stageItems.module.css";

type Props = ItemComponentInterface<WorkspaceText>;

export default function Text({ item, transform }: Props) {
  const [editable, setEditable] = useState(false);
  const remove = useWorkspaceStore((store) => store.remove);
  const upsert = useWorkspaceStore((store) => store.upsert);
  const resize = useTransformStore((store) => store.resize);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editable && ref.current) {
      ref.current.focus();
    }
  }, [editable]);

  useEffect(() => {
    if (ref.current && ref.current.scrollHeight > transform.height) {
      resize(item.id, undefined, ref.current.scrollHeight);
    }
  }, [
    resize,
    item.id,
    item.fontSize,
    item.fontFamily,
    transform.width,
    transform.height,
  ]);

  return (
    <div
      onDoubleClick={() => {
        if (!editable) {
          setEditable(true);
          setTimeout(() => {
            ref.current?.focus();
            ref.current?.select();
          });
        }
      }}
    >
      <textarea
        id={item.id}
        ref={ref}
        disabled={!editable}
        suppressContentEditableWarning
        className={clsx(css.stageItem, css.text)}
        role="textbox"
        draggable={false}
        style={{
          width: `${transform.width}px`,
          height: `${transform.height}px`,
          fontSize: `${item.fontSize}px`,
          fontFamily: item.fontFamily,
          fontStyle: item.fontItalic ? "italic" : "unset",
          color: item.color,
          WebkitTextStrokeColor:
            item.strokeWidth > 0 ? item.strokeColor : "unset",
          WebkitTextStrokeWidth: `${item.strokeWidth}px`,
        }}
        onChange={(event) => {
          if (event.target.scrollHeight > transform.height) {
            resize(item.id, undefined, event.target.scrollHeight);
          }
        }}
        onMouseDown={stopPropagation}
        onKeyDown={(event) => {
          event.stopPropagation();
          blurOnEscape(event);
        }}
        onKeyUp={stopPropagation}
        onBlur={(e) => {
          setEditable(false);

          if (!(e.target.value ?? "").trim()) {
            runInUndoHistory(() => {
              remove(item.id);
            });
          } else {
            runInUndoHistory(() => {
              upsert({
                ...item,
                text: e.target.value,
              });
            });
          }
        }}
        defaultValue={item.text}
      />
    </div>
  );
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

function stopPropagation(event: React.UIEvent) {
  event.stopPropagation();
}
