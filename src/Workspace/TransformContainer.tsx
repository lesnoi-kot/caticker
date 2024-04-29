import { useEffect, useRef, memo, PropsWithChildren } from "react";

import { useTransformActions, useTransformStore } from "@/store/transforms";

import { useWorkspaceRef } from "./hooks";

type Props = PropsWithChildren & {
  id: string;
};

function TransformContainer({ id, children }: Props) {
  const { onItemPress } = useWorkspaceRef();
  const { resize } = useTransformActions();

  const innerRef = useRef<HTMLDivElement>(null);

  // If the inner HTML element changed in natural size (e.g. image loaded), update size info.
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      const innerElSize = entries[0].borderBoxSize;
      resize(id, innerElSize[0].inlineSize, innerElSize[0].blockSize);
    });

    if (innerRef.current) {
      resizeObserver.observe(innerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [id, resize]);

  // Update the "transform" style property according to the data in the state.
  useEffect(() => {
    return useTransformStore.subscribe((state, prevState) => {
      if (state.items[id] !== prevState.items[id]) {
        const geometry = state.items[id];

        if (geometry && innerRef.current) {
          innerRef.current.style.transform = geometry.transform.toString();
        }
      }
    });
  }, [id]);

  return (
    <div
      ref={innerRef}
      className="absolute origin-top-left"
      onMouseDown={(event) => {
        event.stopPropagation();

        onItemPress(id, event.nativeEvent);
      }}
      draggable={false}
    >
      {children}
    </div>
  );
}

export default memo(TransformContainer);
