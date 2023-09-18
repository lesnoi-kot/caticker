import { useWorkspaceItemIds, useWorkspaceItem } from "../store/workspace";
import { WorkspaceItemType } from "../store/types";

import Picture from "./Picture";
import Text from "./Text";
import TransformContainer from "./TransformContainer";
import KeyboardHandler from "./KeyboardHandler";
import Figure from "./Figure";
import AreaSelector from "./AreaSelector";
import { SidebarMenu } from "./SidebarMenu";
import Canvas from "./Canvas";

import "./Workspace.css";
import CatsPackDialog from "./CatsPackDialog";

export default function Workspace() {
  return (
    <div className="workspace">
      <Canvas>
        <KeyboardHandler />
        <AreaSelector />
        <Items />
      </Canvas>
      <SidebarMenu />
      <CatsPackDialog />
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
          <Picture item={item} />
        </TransformContainer>
      );
    case WorkspaceItemType.Text:
      return (
        <TransformContainer id={id} canResize canRotate>
          <Text item={item} />
        </TransformContainer>
      );
    case WorkspaceItemType.Figure:
      return (
        <TransformContainer id={id} canResize canRotate>
          <Figure item={item} />
        </TransformContainer>
      );
    default:
      break;
  }

  return null;
}
