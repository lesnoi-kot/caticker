export const worker = new Worker(
  new URL("./workerEntrypoint.ts", import.meta.url),
  {
    type: "module",
  }
);

type WorkerMessage = {
  type: "stickerBLOB";
  data: Blob;
};

worker.addEventListener("message", (message: MessageEvent<WorkerMessage>) => {
  if (message.data.type === "stickerBLOB") {
    const stickerURL = URL.createObjectURL(message.data.data);

    setTimeout(() => {
      URL.revokeObjectURL(stickerURL);
    }, 2 * 60 * 1000);

    window.open(stickerURL, "_blank");
  }
});
