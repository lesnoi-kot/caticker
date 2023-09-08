type Props = React.ComponentPropsWithoutRef<"div"> & {
  position: "bottom" | "right";
};

export default function ResizerDot({ position, ...rest }: Props) {
  const classModifier = position === "bottom" ? "b" : "r";

  return (
    <div
      draggable={false}
      className={`workspace__stage-item__anchor workspace__stage-item__anchor--${classModifier}`}
      {...rest}
    ></div>
  );
}
