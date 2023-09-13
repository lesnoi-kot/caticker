import { useRef } from "react";
import { ChromePicker, ChromePickerProps } from "react-color";

import { HistoryComparer, useUndoStore } from "./store/undo";
import { getRGBAString } from "./utils/colors";

type Props = Omit<ChromePickerProps, "onChange" | "onChangeComplete"> & {
  onChange: (color: string, event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function HistoryAwareColorPicker({ onChange, ...props }: Props) {
  const pushHistory = useUndoStore((store) => store.push);
  const commited = useRef(true);
  const historyComparer = useRef<HistoryComparer>(new HistoryComparer());

  return (
    <ChromePicker
      {...props}
      onChange={(color, event) => {
        if (commited.current) {
          historyComparer.current.start();
          commited.current = false;
        }

        onChange(getRGBAString(color.rgb), event);
      }}
      onChangeComplete={() => {
        if (!commited.current) {
          const possibleAction =
            historyComparer.current.compareToCurrentStates();
          commited.current = true;

          if (possibleAction) {
            pushHistory(possibleAction);
          }
        }
      }}
    />
  );
}
