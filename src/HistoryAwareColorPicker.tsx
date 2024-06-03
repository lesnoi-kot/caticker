import { useRef } from "react";
import { HslaStringColorPicker } from "react-colorful";
import { useDebouncedCallback } from "use-debounce";

import { HistoryComparer, useUndoStore } from "./store/undo";

export default function HistoryAwareColorPicker({
  onChange,
  color,
  ...props
}: React.ComponentProps<typeof HslaStringColorPicker>) {
  const pushHistory = useUndoStore((store) => store.push);
  const commited = useRef(true);
  const historyComparer = useRef<HistoryComparer>(new HistoryComparer());

  const debouncedOnChange = useDebouncedCallback(() => {
    if (!commited.current) {
      const possibleAction = historyComparer.current.compareToCurrentStates();
      if (possibleAction) {
        pushHistory(possibleAction);
      }
    }
    commited.current = true;
  }, 500);

  return (
    <HslaStringColorPicker
      {...props}
      color={color}
      onChange={(color) => {
        if (commited.current) {
          historyComparer.current.start();
        }
        commited.current = false;
        onChange?.(color);
        debouncedOnChange();
      }}
    />
  );
}
