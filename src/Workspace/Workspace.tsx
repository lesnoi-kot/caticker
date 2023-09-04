import { useRef } from "react";

import {
  useWorkspaceItemIds,
  useWorkspaceItem,
  WorkspaceItemType,
} from "../store/workspace";
import { WorkspaceContex } from "./hooks";

import Picture from "./Picture";
import Text from "./Text";
import ItemContainer from "./ItemContainer";
import KeyboardHandler from "./KeyboardHandler";
import Figure from "./Figure";
import AreaSelector from "./AreaSelector";

import "./Workspace.css";

export default function Workspace() {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const selectTool = useWorkspaceSelectTool(workspaceRef);

  return (
    <div className="workspace">
      <KeyboardHandler />

      <div ref={workspaceRef} className="workspace__result-window">
        <div
          ref={selectTool.selectorRef}
          className="workspace__result-selector"
        />
        <Items />
        <WorkspaceContex.Provider value={workspaceRef}>
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
