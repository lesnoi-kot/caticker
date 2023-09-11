export default function RotatorHandle(
  props: React.ComponentPropsWithoutRef<"div">
) {
  return (
    <div
      draggable={false}
      className="workspace__stage-item__anchor workspace__stage-item__anchor-rotate"
      {...props}
    ></div>
  );
}
