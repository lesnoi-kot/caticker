import { useWorkspaceItemIds, useWorkspaceItem } from "@/store/workspace";
import { useItemTransform } from "@/store/transforms";
import { WorkspaceItemType } from "@/store/types";

import Picture from "./Picture";
import Text from "./Text";
import TransformContainer from "./TransformContainer";
import KeyboardHandler from "./KeyboardHandler";
import Figure from "./Figure";
import AreaSelector from "./AreaSelector";
import { SidebarMenu } from "./SidebarMenu";
import Canvas from "./Canvas";
import { Selection } from "./Selection";

import "./Workspace.css";

export default function Workspace() {
  return (
    <div className="flex items-center gap-4 relative min-h-[512px] min-w-[512px] w-full h-full">
      <Canvas>
        <KeyboardHandler />
        <AreaSelector />
        <Items />
        <Selection />
      </Canvas>
      <SidebarMenu />
    </div>
  );
}

function Items() {
  const itemIds = useWorkspaceItemIds();

  return (
    <>
      {itemIds.map((id) => (
        <TransformContainer key={id} id={id}>
          <SwitchItem id={id} />
        </TransformContainer>
      ))}
    </>
  );
}

function SwitchItem({ id }: { id: string }) {
  const item = useWorkspaceItem(id);
  const transform = useItemTransform(id);

  switch (item.type) {
    case WorkspaceItemType.Picture:
      return <Picture transform={transform} item={item} />;
    case WorkspaceItemType.Text:
      return <Text transform={transform} item={item} />;
    case WorkspaceItemType.Figure:
      return <Figure transform={transform} item={item} />;
    default:
      return null;
  }
}
