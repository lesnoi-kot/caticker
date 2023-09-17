import { getDataURLOfBlob } from "../utils/events";
import { downloadURL, newWindow } from "../utils/popup";

export const worker = new Worker(
  new URL("./workerEntrypoint.ts", import.meta.url),
  {
    type: "module",
  }
);

type WorkerMessage = {
  type: "stickerBLOB";
  blob: Blob;
  extra: {
    operation: "preview" | "download";
  };
};

worker.addEventListener(
  "message",
  async (message: MessageEvent<WorkerMessage>) => {
    if (message.data.type === "stickerBLOB") {
      const stickerURL = await getDataURLOfBlob(message.data.blob);

      if (message.data.extra.operation === "preview") {
        newWindow(stickerURL);
      } else if (message.data.extra.operation === "download") {
        downloadURL(
          stickerURL,
          `sticker.${message.data.blob.type.split("/")[1]}`
        );
      }
    }
  }
);
