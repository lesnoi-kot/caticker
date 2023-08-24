import { useRef } from "react";

import {
  useWorkspaceItemIds,
  useWorkspaceItem,
  WorkspaceItemType,
} from "../store/workspace";
import { useWorkspaceSelectTool } from "./hooks";

import Picture from "./Picture";
import Text from "./Text";
import ItemContainer from "./ItemContainer";
import KeyboardHandler from "./KeyboardHandler";

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
  const View = item.type === WorkspaceItemType.Picture ? Picture : Text;
  return <ItemContainer id={id} View={View} />;
}
