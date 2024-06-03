import clsx from "clsx";

import css from "./ui.module.css";

export default function RotatorHandle(
  props: React.ComponentPropsWithoutRef<"div">
) {
  return (
    <div
      className={clsx(css.anchor, css.rotatorHandle)}
      draggable={false}
      {...props}
    ></div>
  );
}
