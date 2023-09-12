import { useRef } from "react";
import { ChromePicker } from "react-color";

import {
  makePictureItem,
  makeTextItem,
  makeFigureItem,
  useWorkspaceStore,
  FigureType,
  useWorkspaceItems,
  WorkspaceItemType,
  WorkspaceText,
  WorkspaceFigure,
  useSelectedItemIds,
} from "../store/workspace";
import TextEdit from "./TextEdit";
import FigureEdit from "./FigureEdit";
import RenderPanel from "./RenderPanel";
import { useTransformStore } from "../store/transforms";
import { runInUndoHistory } from "../store/undo";

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
  const store = useWorkspaceStore();
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="toolbar__main-menu">
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
                store.upsert(pictureItem);
                store.selectOne(pictureItem.id);
              });
            }
          }}
          hidden
        />
        <button>Добавить картинку</button>
      </label>
      <button
        onClick={() => {
          const textItem = makeTextItem();

          runInUndoHistory(() => {
            store.upsert(textItem);
            store.selectOne(textItem.id);
          });
        }}
      >
        Добавить текст
      </button>
      <button
        onClick={() => {
          const figureItem = makeFigureItem(FigureType.Rect);

          runInUndoHistory(() => {
            store.upsert(figureItem);
            store.selectOne(figureItem.id);
          });
        }}
      >
        Добавить прямоугольник
      </button>
      <button
        onClick={() => {
          const figureItem = makeFigureItem(FigureType.Circle);

          runInUndoHistory(() => {
            store.upsert(figureItem);
            store.selectOne(figureItem.id);
          });
        }}
      >
        Добавить кружок
      </button>

      <div>
        <div>
          <p>Фоновый цвет</p>
          <ChromePicker
            color={store.settings.stageColor}
            onChange={(color) => {
              runInUndoHistory(() => {
                store.modifySettings({
                  stageColor: color.hex,
                });
              });
            }}
          />
        </div>

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
          onClick={() => {
            runInUndoHistory(() => {
              selectedItemIds.forEach((id) => {
                scaleTo(id, 1, 1);
              });
            });
          }}
        >
          Оригинальный масштаб
        </button>

        <button
          onClick={() => {
            runInUndoHistory(() => {
              changeOrder("up");
            });
          }}
        >
          Вверх ↥
        </button>

        <button
          onClick={() => {
            runInUndoHistory(() => {
              changeOrder("down");
            });
          }}
        >
          Вниз ↧
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
