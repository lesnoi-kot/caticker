import { useEffect, useRef } from "react";

import { WorkspaceText, useWorkspaceStore } from "../store/workspace";
import type { ItemComponentInterface } from "./types";

type Props = ItemComponentInterface<WorkspaceText>;

export default function Text(props: Props) {
  const { item, selected } = props;
  const remove = useWorkspaceStore((store) => store.remove);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
  });

  return (
    <div
      ref={ref}
      id={item.id}
      contentEditable={selected}
      className="workspace__stage-text"
      draggable={false}
      onBlur={() => {
        if (!(ref.current?.textContent ?? "").trim()) {
          remove(item.id);
        }
      }}
    />
  );
}
