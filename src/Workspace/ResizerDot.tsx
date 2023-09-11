import { ResizerType } from "./types";

type Props = React.ComponentPropsWithoutRef<"div"> & { position: ResizerType };

const classModifiers: Record<ResizerType, string> = {
  bottom: "b",
  right: "r",
  "bottom-right": "rb",
};

export default function ResizerDot({ position, ...rest }: Props) {
  return (
    <div
      draggable={false}
      className={`workspace__stage-item__anchor workspace__stage-item__anchor--${classModifiers[position]}`}
      {...rest}
    ></div>
  );
}
