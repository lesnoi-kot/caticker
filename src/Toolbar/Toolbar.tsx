import { useRef } from "react";

import {
  makePictureItem,
  makeTextItem,
  makeFigureItem,
  useWorkspaceStore,
  useWorkspaceItems,
  WorkspaceText,
  WorkspaceFigure,
  useSelectedItemIds,
  useWorkspaceStoreActions,
} from "../store/workspace";
import ColorPicker from "../HistoryAwareColorPicker";
import TextEdit from "./TextEdit";
import FigureEdit from "./FigureEdit";
import RenderPanel from "./RenderPanel";
import { runInUndoHistory } from "../store/undo";
import { FigureType, WorkspaceItemType } from "../store/types";

import "./Toolbar.css";

export default function Toolbar() {
  return (
    <div className="flex flex-col gap-8">
      <MainMenu />
      <ItemMenu />

      <div className="flex gap-8 items-start">
        <StageColorPicker />
        <RenderPanel />
      </div>
    </div>
  );
}

function MainMenu() {
  const { upsert, selectOne } = useWorkspaceStoreActions();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-4 flex-col">
      <p className="font-bold">Добавить</p>
      <div className="flex gap-4 items-start">
        <label
          htmlFor="picture"
          onClick={() => {
            fileRef?.current?.click();
          }}
        >
          <input
            ref={fileRef}
            type="file"
            name="picture"
            id="picture"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                const pictureItem = makePictureItem(file);

                runInUndoHistory(() => {
                  upsert(pictureItem);
                  selectOne(pictureItem.id);
                });
              }

              // Reset file input to always trigger change event.
              event.target.value = "";
            }}
            hidden
          />
          <button>Изображение</button>
        </label>
        <button
          onClick={() => {
            const textItem = makeTextItem();

            runInUndoHistory(() => {
              upsert(textItem);
              selectOne(textItem.id);
            });
          }}
        >
          Текст
        </button>
        <button
          onClick={() => {
            const figureItem = makeFigureItem(FigureType.Rect);

            runInUndoHistory(() => {
              upsert(figureItem);
              selectOne(figureItem.id);
            });
          }}
        >
          Прямоугольник
        </button>
        <button
          onClick={() => {
            const figureItem = makeFigureItem(FigureType.Circle);

            runInUndoHistory(() => {
              upsert(figureItem);
              selectOne(figureItem.id);
            });
          }}
        >
          Кружок
        </button>
      </div>
    </div>
  );
}

function ItemMenu() {
  const selectedItemIds = useSelectedItemIds();
  const selectedItems = useWorkspaceItems(selectedItemIds);
  const oneSelected = selectedItems.length === 1;
  const [firstSelected] = selectedItems;

  return (
    <>
      {oneSelected && firstSelected.type === WorkspaceItemType.Text && (
        <TextEdit item={firstSelected as WorkspaceText} />
      )}
      {oneSelected && firstSelected.type === WorkspaceItemType.Figure && (
        <FigureEdit item={firstSelected as WorkspaceFigure} />
      )}
    </>
  );
}

function StageColorPicker() {
  const { modifySettings } = useWorkspaceStoreActions();
  const stageSettings = useWorkspaceStore((store) => store.settings);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-bold">Фоновый цвет</p>
      <ColorPicker
        color={stageSettings.stageColor}
        onChange={(color) => {
          modifySettings({ stageColor: color });
        }}
      />
    </div>
  );
}
