import { MouseEventHandler, useRef } from "react";

import { makePictureItem, useWorkspaceStoreActions } from "../store/workspace";

import funny1 from "../assets/cats/funny1.png";
import grumpy1 from "../assets/cats/grumpy1.jpg";
import thinking1 from "../assets/cats/thinking1.png";
import vaska1 from "../assets/cats/vaska1.webp";
import grumpy2 from "../assets/cats/grumpy2.webp";
import chmonya from "../assets/cats/chmonya.webp";

const images = [
  ["Задумчивый", thinking1],
  ["Устал...", grumpy1],
  ["Озорник", funny1],
  ["Васька", vaska1],
  ["Критически настроенный", grumpy2],
  ["Чмоня", chmonya],
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
      className="rounded"
    >
      <div className="p-4">
        <h3 className="text-xl mb-4">Пак котов</h3>
        <ul className="flex flex-row justify-center flex-wrap gap-8 max-w-sm">
          {images.map(([name, src]) => (
            <li className="basis-1/4" key={name}>
              <img
                src={src}
                onClick={onItemClick}
                alt={name}
                className="cursor-pointer"
                loading="lazy"
              />

              {name}
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
