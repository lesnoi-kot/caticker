import { useWorkspaceItemIds, useWorkspaceItem } from "@/store/workspace";
import { useItemTransform } from "@/store/transforms";
import { WorkspaceItemType } from "@/store/types";

import Picture from "./stageItems/Picture";
import Text from "./stageItems/Text";
import TransformContainer from "./TransformContainer";
import KeyboardHandler from "./KeyboardHandler";
import Figure from "./stageItems/Figure";
import AreaSelector from "./AreaSelector";
import Canvas from "./Canvas";
import { Selection } from "./Selection";
import { WorkspaceContex, useCreateWorkspaceRef } from "./hooks";

export function Workspace() {
  const workspaceHandlers = useCreateWorkspaceRef();

  return (
    <div className="flex items-center gap-4 relative min-h-[512px] max-w-[512px]">
      <WorkspaceContex.Provider value={workspaceHandlers}>
        <KeyboardHandler />
        <Canvas>
          <AreaSelector />
          <Items />
          <Selection />
        </Canvas>
      </WorkspaceContex.Provider>
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
