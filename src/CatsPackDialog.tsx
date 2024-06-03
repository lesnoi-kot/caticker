import { MouseEventHandler, useRef } from "react";

import { makePictureItem, useWorkspaceStoreActions } from "./store/workspace";

import funny1 from "./assets/cats/funny1.png";
import grumpy1 from "./assets/cats/grumpy1.jpg";
import thinking1 from "./assets/cats/thinking1.png";
import vaska1 from "./assets/cats/vaska1.webp";
import grumpy2 from "./assets/cats/grumpy2.webp";
import chmonya from "./assets/cats/chmonya.webp";
import crying1 from "./assets/cats/crying1.png";
import wut1 from "./assets/cats/wut1.webp";

const images = [
  ["Задумчивый", thinking1],
  ["Устал...", grumpy1],
  ["Озорник", funny1],
  ["Васька", vaska1],
  ["Критически настроенный", grumpy2],
  ["Чмоня", chmonya],
  ["Зачем ты ето сделал", crying1],
  ["Wut", wut1],
];

export const catsPackDialogId = "cats-pack-dialog";

export default function CatsPackDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const { upsert, selectOne } = useWorkspaceStoreActions();

  const onItemClick: MouseEventHandler<HTMLImageElement> = async (event) => {
    const target = event.target as HTMLImageElement;
    const res = await fetch(target.src);
    const blob = await res.blob();

    const newItem = makePictureItem(blob);
    upsert(newItem, {
      width: target.naturalWidth,
      height: target.naturalHeight,
    });
    selectOne(newItem.id);

    ref.current?.close();
  };

  return (
    <dialog
      id={catsPackDialogId}
      ref={ref}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          ref.current?.close();
        }
      }}
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
      className=" modal"
    >
      <div className="modal-box">
        <form method="dialog">
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-base-content">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg text-[hotpink]">Пак котов</h3>
        <ul className="flex flex-row justify-center flex-wrap py-4 gap-8 max-w-sm">
          {images.map(([name, src]) => (
            <li className="basis-1/4" key={name}>
              <img
                src={src}
                onClick={onItemClick}
                alt={name}
                className="cursor-pointer"
                loading="lazy"
              />

              <span className="text-base-content">{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
