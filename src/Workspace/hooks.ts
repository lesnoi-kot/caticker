import { RefObject, createContext, useContext } from "react";

export const WorkspaceContex = createContext<RefObject<HTMLDivElement> | null>(
  null
);

export const useWorkspaceRef = () => {
  const ref = useContext(WorkspaceContex);

  if (!ref) {
    throw new Error("Workspace ref not provided");
  }

  return ref;
};
