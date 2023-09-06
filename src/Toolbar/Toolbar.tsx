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
} from "../store/workspace";
import { CommandType, ImperativeTransformEvent } from "../Workspace/types";
import TextEdit from "./TextEdit";
import FigureEdit from "./FigureEdit";

import "./Toolbar.css";
import RenderPanel from "./RenderPanel";

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
              store.upsert(pictureItem);
              store.selectOne(pictureItem.id);
            }
          }}
          hidden
        />
        <button>Добавить картинку</button>
      </label>
      <button
        onClick={() => {
          const textItem = makeTextItem();
          store.upsert(textItem);
          store.selectOne(textItem.id);
        }}
      >
        Добавить текст
      </button>
      <button
        onClick={() => {
          const figureItem = makeFigureItem(FigureType.Rect);
          store.upsert(figureItem);
          store.selectOne(figureItem.id);
        }}
      >
        Добавить прямоугольник
      </button>
      <button
        onClick={() => {
          const figureItem = makeFigureItem(FigureType.Circle);
          store.upsert(figureItem);
          store.selectOne(figureItem.id);
        }}
      >
        Добавить кружок
      </button>

      <div>
        <p>Фоновый цвет</p>
        <ChromePicker
          color={store.settings.stageColor}
          onChange={(color) => {
            store.modifySettings({
              stageColor: color.hex,
            });
          }}
        />
      </div>

      <RenderPanel />
    </div>
  );
}

function ItemMenu() {
  const selectedItemIds = Array.from(
    useWorkspaceStore((store) => store.selectedItems)
  );
  const selectedItems = useWorkspaceItems(selectedItemIds);
  const removeMultiple = useWorkspaceStore((store) => store.removeMultiple);

  if (selectedItems.length === 0) {
    return null;
  }

  const oneSelected = selectedItems.length === 1;
  const [firstSelected] = selectedItems;

  const dispatchToContainers = (command: CommandType) => {
    selectedItemIds.forEach((id) => {
      const event = new ImperativeTransformEvent(command);
      document.getElementById(id)!.dispatchEvent(event);
    });
  };

  const changeOrder = (direction: "up" | "down") => {
    selectedItemIds.forEach((id) => {
      const el = document.getElementById(`container-${id}`);

      if (el) {
        if (direction === "down") {
          el.parentElement?.prepend(el);
        } else {
          el.parentElement?.append(el);
        }
      }
    });
  };

  return (
    <div className="toolbar__menus">
      <div className="toolbar__transform-menu">
        <button
          onClick={() => {
            dispatchToContainers("-rotateZ");
          }}
        >
          ↶ 90°
        </button>

        <button
          onClick={() => {
            dispatchToContainers("rotateZ=0");
          }}
        >
          0°
        </button>

        <button
          onClick={() => {
            dispatchToContainers("+rotateZ");
          }}
        >
          90° ↷
        </button>

        <button
          onClick={() => {
            dispatchToContainers("originalScale");
          }}
        >
          Оригинальный масштаб
        </button>

        <button
          onClick={() => {
            changeOrder("up");
          }}
        >
          Вверх ↥
        </button>

        <button
          onClick={() => {
            changeOrder("down");
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
            removeMultiple(selectedItemIds);
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
