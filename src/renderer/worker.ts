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

async function getDataURLOfBlob(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      res(String(reader.result ?? ""));
    };
    reader.onerror = () => {
      rej("FileReader error occured");
    };
    reader.readAsDataURL(blob);
  });
}

worker.addEventListener(
  "message",
  async (message: MessageEvent<WorkerMessage>) => {
    if (message.data.type === "stickerBLOB") {
      if (message.data.extra.operation === "preview") {
        const stickerURL = await getDataURLOfBlob(message.data.blob);
        window.open(stickerURL, "_blank");
      } else if (message.data.extra.operation === "download") {
        const a = document.createElement("a");
        a.href = await getDataURLOfBlob(message.data.blob);
        a.download = `sticker.${message.data.blob.type.split("/")[1]}`;
        a.target = "_self";
        a.click();
      }
    }
  }
);
