import clsx from "clsx";

import { type ResizerType } from "../types";

import css from "./ui.module.css";

type Props = React.ComponentPropsWithoutRef<"div"> & { position: ResizerType };

export default function ResizerDot({ position, ...rest }: Props) {
  return (
    <div
      className={clsx(css.anchor, css[`anchor--${position}`])}
      draggable={false}
      {...rest}
    ></div>
  );
}
