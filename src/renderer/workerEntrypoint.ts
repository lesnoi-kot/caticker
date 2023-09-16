import { RenderStickerArguments, renderSticker } from "./renderSticker";

type ClientMessage = {
  type: "renderSticker";
  data: RenderStickerArguments;
  extra: unknown;
};

self.onmessage = (message: MessageEvent<ClientMessage>) => {
  if (message.data.type === "renderSticker") {
    renderSticker(message.data.data).then((blob) => {
      self.postMessage({
        type: "stickerBLOB",
        blob,
        extra: message.data.extra,
      });
    });
  }
};
