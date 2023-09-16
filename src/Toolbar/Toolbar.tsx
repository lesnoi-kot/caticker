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
import { useTransformStore } from "../store/transforms";
import { runInUndoHistory } from "../store/undo";
import { FigureType, WorkspaceItemType } from "../store/types";

import "./Toolbar.css";

export default function Toolbar() {
  return (
    <div className="toolbar">
      <ItemMenu />
      <MainMenu />
    </div>
  );
}

function MainMenu() {
  const { upsert, selectOne } = useWorkspaceStoreActions();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex gap-4 flex-col">
      <div className="flex gap-4 items-start justify-center">
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
          <button>Добавить картинку</button>
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
          Добавить текст
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
          Добавить прямоугольник
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
          Добавить кружок
        </button>
      </div>

      <div className="flex gap-4 items-start justify-center">
        <StageColorPicker />
        <RenderPanel />
      </div>
    </div>
  );
}

function ItemMenu() {
  const selectedItemIds = useSelectedItemIds();
  const selectedItems = useWorkspaceItems(selectedItemIds);
  const layerUp = useWorkspaceStore((store) => store.layerUp);
  const layerDown = useWorkspaceStore((store) => store.layerDown);
  const removeMultiple = useWorkspaceStore((store) => store.removeMultiple);
  const rotateAround = useTransformStore((store) => store.rotateAround);
  const rotateToAround = useTransformStore((store) => store.rotateToAround);
  const scaleTo = useTransformStore((store) => store.scaleTo);

  if (selectedItems.length === 0) {
    return null;
  }

  const oneSelected = selectedItems.length === 1;
  const [firstSelected] = selectedItems;

  const changeOrder = (direction: "up" | "down") => {
    if (direction === "up") {
      selectedItemIds.forEach((id) => {
        layerUp(id);
      });
    } else {
      selectedItemIds.forEach((id) => {
        layerDown(id);
      });
    }
  };

  return (
    <div className="toolbar__menus">
      <div className="toolbar__transform-menu">
        <button
          onClick={() => {
            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                rotateAround(id, -90);
              });
            });
          }}
        >
          ↶ 90°
        </button>

        <button
          onClick={() => {
            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                rotateToAround(id, 0);
              });
            });
          }}
        >
          0°
        </button>

        <button
          onClick={() => {
            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                rotateAround(id, 90);
              });
            });
          }}
        >
          90° ↷
        </button>

        <button
          title="Оригинальный масштаб"
          onClick={() => {
            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                scaleTo(id, 1, 1);
              });
            });
          }}
        >
          1x
        </button>

        <button
          title="Слой вверх"
          onClick={() => {
            runInUndoHistory(() => {
              changeOrder("up");
            });
          }}
        >
          ↥
        </button>

        <button
          title="Слой вниз"
          onClick={() => {
            runInUndoHistory(() => {
              changeOrder("down");
            });
          }}
        >
          ↧
        </button>

        <button
          onClick={() => {
            //
          }}
        >
          Скопировать
        </button>

        <button
          onClick={() => {
            runInUndoHistory(() => {
              removeMultiple(selectedItemIds);
            });
          }}
        >
          Удалить
        </button>
      </div>

      {oneSelected && firstSelected.type === WorkspaceItemType.Text && (
        <TextEdit item={firstSelected as WorkspaceText} />
      )}
      {oneSelected && firstSelected.type === WorkspaceItemType.Figure && (
        <FigureEdit item={firstSelected as WorkspaceFigure} />
      )}
    </div>
  );
}

function StageColorPicker() {
  const { modifySettings } = useWorkspaceStoreActions();
  const stageSettings = useWorkspaceStore((store) => store.settings);

  return (
    <div>
      <p>Фоновый цвет</p>
      <ColorPicker
        color={stageSettings.stageColor}
        onChange={(color) => {
          modifySettings({ stageColor: color });
        }}
      />
    </div>
  );
}
