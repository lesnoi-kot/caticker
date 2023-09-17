import { WorkspaceFigure, useWorkspaceStore } from "../store/workspace";
import ColorPicker from "../HistoryAwareColorPicker";

export default function FigureEdit({ item }: { item: WorkspaceFigure }) {
  const upsert = useWorkspaceStore((store) => store.upsert);

  return (
    <div className="flex flex-col gap-4">
      <p>Цвет фигуры</p>
      <ColorPicker
        color={item.color}
        onChange={(color) => {
          upsert({ ...item, color });
        }}
      />
    </div>
  );
}
