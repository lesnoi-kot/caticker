import {
  useWorkspaceItems,
  useWorkspaceItem,
  WorkspaceItemType,
} from "../store/workspace";

import "./Workspace.css";
import Picture from "./Picture";
import Text from "./Text";

export default function Workspace() {
  const itemIds = useWorkspaceItems();

  console.log("Workspace render", itemIds.slice());

  return (
    <div className="workspace">
      <div className="workspace__result-window">
        {itemIds.map((id) => (
          <SwitchItem key={id} id={id} />
        ))}
      </div>
    </div>
  );
}

function SwitchItem({ id }: { id: string }) {
  const item = useWorkspaceItem(id);

  if (item.type === WorkspaceItemType.Picture) {
    return <Picture item={item} />;
  }

  if (item.type === WorkspaceItemType.Text) {
    return <Text item={item} />;
  }

  return null;
}
