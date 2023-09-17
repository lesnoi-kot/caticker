import clippy from "./assets/clippy.webp";

function Help() {
  return (
    <div className="flex flex-col gap-4 mt-20 max-w-md">
      <h2 className="text-2xl">
        Справка
        <img className="inline-block ml-4 h-12" src={clippy} />
      </h2>
      <a href="https://core.telegram.org/stickers#static-stickers-and-emoji">
        Telegram docs
      </a>
      <div>
        <p>
          Turn your favorite drawings and memes into packs of images that are
          easily to share and access on any device.
        </p>
        <p>
          To create static stickers and emoji for Telegram, you only need an
          image editor that lets you export in <code>.PNG</code> or
          <code>.WEBP</code> format.
        </p>
      </div>
      <h3 className="text-xl">Требования</h3>
      <ul>
        <li>
          For stickers, one side must be exactly 512 pixels in size – the other
          side can be 512 pixels or less.
        </li>
        <li>The image file must be in either .PNG or .WEBP format.</li>
      </ul>

      <blockquote>
        Tip: a transparent background, white stroke and black shadow effect will
        make your sticker stand out.
      </blockquote>

      <h3 className="text-xl">Загрузка изображений</h3>
      <div>
        <p>
          Once your stickers are ready, start a chat with the{" "}
          <a href="https://t.me/Stickers">@Stickers</a> bot and send the command{" "}
          <code>/newpack</code>.
        </p>
        <p>
          For more info about using the{" "}
          <a href="https://t.me/Stickers">@Stickers</a> bot, click{" "}
          <a href="https://core.telegram.org/stickers#using-the-stickers-bot">
            here
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default Help;
