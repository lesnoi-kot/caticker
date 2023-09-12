import { ReactNode, useCallback, useRef } from "react";

import {
  useWorkspaceItemIds,
  useWorkspaceItem,
  WorkspaceItemType,
  useWorkspaceStore,
  STICKER_MAX_SIZE,
  WorkspaceFigure,
  WorkspacePicture,
  WorkspaceText,
} from "../store/workspace";
import { WorkspaceContex, useCreateWorkspaceRef } from "./hooks";
import { getRelativeXY } from "../utils/events";

import Picture from "./Picture";
import Text from "./Text";
import TransformContainer from "./TransformContainer";
import KeyboardHandler from "./KeyboardHandler";
import Figure from "./Figure";
import AreaSelector from "./AreaSelector";
import ResizerDot from "./ResizerDot";
import { HistoryComparer, useUndoStore } from "../store/undo";

import "./Workspace.css";

export default function Workspace() {
  return (
    <div className="workspace">
      <WorkspaceResultWindow>
        <KeyboardHandler />
        <AreaSelector />
        <Items />
      </WorkspaceResultWindow>
    </div>
  );
}

function Items() {
  const itemIds = useWorkspaceItemIds();

  return (
    <>
      {itemIds.map((id) => (
        <SwitchItem key={id} id={id} />
      ))}
    </>
  );
}

function SwitchItem({ id }: { id: string }) {
  const item = useWorkspaceItem(id);

  switch (item.type) {
    case WorkspaceItemType.Picture:
      return (
        <TransformContainer id={id} canResize canRotate>
          <Picture item={item as WorkspacePicture} />
        </TransformContainer>
      );
    case WorkspaceItemType.Text:
      return (
        <TransformContainer id={id} canResize canRotate>
          <Text item={item as WorkspaceText} />
        </TransformContainer>
      );
    case WorkspaceItemType.Figure:
      return (
        <TransformContainer id={id} canResize canRotate>
          <Figure item={item as WorkspaceFigure} />
        </TransformContainer>
      );
    default:
      break;
  }

  return null;
}

type WorkspaceResultWindowProps = {
  children: ReactNode;
};

const WorkspaceResultWindow = ({ children }: WorkspaceResultWindowProps) => {
  const workspaceHandlers = useCreateWorkspaceRef();
  const { workspaceRef } = workspaceHandlers;
  const currResizer = useRef("");
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

    const possibleHistoryAction =
      historyComparer.current.compareToCurrentStates();

    if (possibleHistoryAction) {
      pushHistory(possibleHistoryAction);
    }
  }, [onResize, pushHistory]);

  const onResizeStart = useCallback(
    (resizer: string) => {
      currResizer.current = resizer;
      historyComparer.current.start();
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
      }}
    >
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
};
