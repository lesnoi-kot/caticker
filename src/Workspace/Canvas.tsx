import { ReactNode, useCallback, useRef } from "react";

import { STICKER_MAX_SIZE } from "../constants";
import { useWorkspaceStore } from "../store/workspace";
import { HistoryComparer, useUndoStore } from "../store/undo";
import { getRelativeXY } from "../utils/events";
import { WorkspaceContex, useCreateWorkspaceRef } from "./hooks";

import ResizerDot from "./ResizerDot";

function Canvas({ children }: { children: ReactNode }) {
  const workspaceHandlers = useCreateWorkspaceRef();
  const { workspaceRef } = workspaceHandlers;
  const currResizer = useRef<"right" | "bottom">("right");
  const historyComparer = useRef<HistoryComparer>(new HistoryComparer());
  const pushHistory = useUndoStore((store) => store.push);

  const settings = useWorkspaceStore((store) => store.settings);
  const modifySettings = useWorkspaceStore((store) => store.modifySettings);

  const onResize = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const mouse = getRelativeXY(workspaceRef.current, event);

      if (currResizer.current === "right") {
        modifySettings({
          stageWidth: Math.min(STICKER_MAX_SIZE, Math.floor(mouse.x)),
        });
      } else {
        modifySettings({
          stageHeight: Math.min(STICKER_MAX_SIZE, Math.floor(mouse.y)),
        });
      }
    },
    [workspaceRef, modifySettings]
  );

  const onResizeEnd = useCallback(() => {
    document.removeEventListener("mousemove", onResize);

    document.body.classList.remove("cursor-s-resize");
    document.body.classList.remove("cursor-e-resize");

    const possibleHistoryAction =
      historyComparer.current.compareToCurrentStates();

    if (possibleHistoryAction) {
      pushHistory(possibleHistoryAction);
    }
  }, [onResize, pushHistory]);

  const onResizeStart = useCallback(
    (resizer: "right" | "bottom") => {
      currResizer.current = resizer;
      historyComparer.current.start();

      if (resizer === "right") {
        document.body.classList.add("cursor-e-resize");
      } else if (resizer === "bottom") {
        document.body.classList.add("cursor-s-resize");
      }

      document.addEventListener("mousemove", onResize);
      document.addEventListener("mouseup", onResizeEnd, { once: true });
    },
    [onResize, onResizeEnd]
  );

  return (
    <div
      ref={workspaceRef}
      className="workspace__result-window"
      style={{
        width: `${settings.stageWidth}px`,
        height: `${settings.stageHeight}px`,
        backgroundColor: settings.stageColor,
        borderRadius: settings.roundBorders ? "15px" : "unset",
      }}
    >
      <div className="absolute w-full h-full top-0 left-0 bg-checkered -z-50"></div>
      <WorkspaceContex.Provider value={workspaceHandlers}>
        {settings.stageHeight === STICKER_MAX_SIZE && (
          <ResizerDot
            position="right"
            onMouseDown={() => {
              onResizeStart("right");
            }}
          />
        )}
        {settings.stageWidth === STICKER_MAX_SIZE && (
          <ResizerDot
            position="bottom"
            onMouseDown={() => {
              onResizeStart("bottom");
            }}
          />
        )}
        {children}
      </WorkspaceContex.Provider>
    </div>
  );
}

export default Canvas;
