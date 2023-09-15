import { RenderStickerArguments, renderSticker } from "./renderSticker";

type ClientMessage = {
  type: "renderSticker";
  data: RenderStickerArguments;
};

self.onmessage = (message: MessageEvent<ClientMessage>) => {
  if (message.data.type === "renderSticker") {
    renderSticker(message.data.data).then((blob) => {
      self.postMessage({
        type: "stickerBLOB",
        data: blob,
      });
    });
  }
};
