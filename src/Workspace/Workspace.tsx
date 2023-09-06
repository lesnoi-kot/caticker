import { useRef, useCallback } from "react";

import {
  useWorkspaceItemIds,
  useWorkspaceItem,
  WorkspaceItemType,
  useWorkspaceStore,
  STICKER_MAX_SIZE,
} from "../store/workspace";
import { WorkspaceContex } from "./hooks";
import { getRelativeXY } from "../utils/events";

import Picture from "./Picture";
import Text from "./Text";
import ItemContainer from "./ItemContainer";
import KeyboardHandler from "./KeyboardHandler";
import Figure from "./Figure";
import AreaSelector from "./AreaSelector";

import "./Workspace.css";

export default function Workspace() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const settings = useWorkspaceStore((store) => store.settings);
  const modifySettings = useWorkspaceStore((store) => store.modifySettings);

  const onMouseMove = useCallback((event: React.MouseEvent) => {
    const mouse = getRelativeXY(workspaceRef.current!, event.nativeEvent);
    document.querySelector(
      ".workspace__result-coords"
    )!.textContent = `${mouse.x} ${mouse.y}`;
  }, []);

  const onResizeX = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const mouse = getRelativeXY(workspaceRef.current, event);

      modifySettings({ stageWidth: Math.min(512, Math.floor(mouse.x)) });
    },
    [modifySettings]
  );
  const onResizeY = useCallback(
    (event: MouseEvent) => {
      if (!workspaceRef.current) {
        return;
      }

      const mouse = getRelativeXY(workspaceRef.current, event);
      modifySettings({ stageHeight: Math.min(512, Math.floor(mouse.y)) });
    },
    [modifySettings]
  );

  const onResizerMouseDown = useCallback((onResizeFn: EventListener) => {
    document.addEventListener("mousemove", onResizeFn);

    document.addEventListener(
      "mouseup",
      () => {
        document.removeEventListener("mousemove", onResizeFn);
      },
      { once: true }
    );
  }, []);

  return (
    <div className="workspace">
      <div
        ref={workspaceRef}
        className="workspace__result-window"
        style={{
          width: `${settings.stageWidth}px`,
          height: `${settings.stageHeight}px`,
          backgroundColor: settings.stageColor,
        }}
        onMouseMove={onMouseMove}
      >
        <div className="workspace__result-coords"></div>

        {settings.stageHeight === STICKER_MAX_SIZE && (
          <div
            draggable={false}
            className={`workspace__stage-item__anchor workspace__stage-item__anchor--r`}
            onMouseDown={() => {
              onResizerMouseDown(onResizeX);
            }}
          ></div>
        )}

        {settings.stageWidth === STICKER_MAX_SIZE && (
          <div
            draggable={false}
            className={`workspace__stage-item__anchor workspace__stage-item__anchor--b`}
            onMouseDown={() => {
              onResizerMouseDown(onResizeY);
            }}
          ></div>
        )}

        {/* <div className="workspace__result-dot"></div>
        <div className="workspace__result-origin"></div> */}
        <WorkspaceContex.Provider value={workspaceRef}>
          <KeyboardHandler />
          <AreaSelector />
          <Items />
        </WorkspaceContex.Provider>
      </div>
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
      return <ItemContainer id={id} View={Picture} canResize />;
    case WorkspaceItemType.Text:
      return <ItemContainer id={id} View={Text} canResize />;
    case WorkspaceItemType.Figure:
      return <ItemContainer id={id} View={Figure} canResize />;
    default:
      break;
  }

  return null;
}
