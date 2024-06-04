import clsx from "clsx";

import { type ResizerType } from "../types";

import css from "./ui.module.css";

type Props = React.ComponentPropsWithoutRef<"div"> & { position: ResizerType };

const RESIZER_CURSOR_CLASS: Record<ResizerType, string> = {
  bottom: "cursor-s-resize",
  right: "cursor-e-resize",
  "bottom-right": "cursor-se-resize",
  top: "cursor-n-resize",
  left: "cursor-w-resize",
  "top-left": "cursor-nw-resize",
  "top-right": "cursor-ne-resize",
  "bottom-left": "cursor-sw-resize",
};

export default function ResizerDot({ position, ...rest }: Props) {
  return (
    <div
      className={clsx(
        css.anchor,
        css[`anchor--${position}`],
        RESIZER_CURSOR_CLASS[position]
      )}
      draggable={false}
      data-cursor-class={RESIZER_CURSOR_CLASS[position]}
      {...rest}
    ></div>
  );
}
