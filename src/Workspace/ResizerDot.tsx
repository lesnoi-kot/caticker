import { ResizerType } from "./types";

type Props = React.ComponentPropsWithoutRef<"div"> & { position: ResizerType };

export default function ResizerDot({ position, ...rest }: Props) {
  return (
    <div
      draggable={false}
      className={`workspace__stage-item__anchor workspace__stage-item__anchor--${position}`}
      {...rest}
    ></div>
  );
}
