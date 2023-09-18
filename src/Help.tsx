function Help() {
  return (
    <div className="mt-16 prose lg:prose-xl prose-a:text-blue-500">
      <h2>Справка</h2>
      <p>
        Взято из{" "}
        <a
          href="https://core.telegram.org/stickers#static-stickers-and-emoji"
          target="_blank"
        >
          Telegram docs
        </a>
      </p>
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
      <h3>Image Requirements</h3>
      <ul>
        <li>
          For stickers, one side must be exactly 512 pixels in size – the other
          side can be 512 pixels or less.
        </li>
        <li>
          The image file must be in either <code>.PNG</code> or{" "}
          <code>.WEBP</code> format.
        </li>
      </ul>

      <blockquote className="text-[0.9em]">
        Tip: a transparent background, white stroke and black shadow effect will
        make your sticker stand out.
      </blockquote>

      <h3>Uploading Images</h3>
      <div>
        <p>
          Once your stickers are ready, start a chat with the{" "}
          <a href="https://t.me/Stickers" target="_blank">
            @Stickers
          </a>{" "}
          bot and send the command <code>/newpack</code>.
        </p>
        <p>
          For more info about using the{" "}
          <a href="https://t.me/Stickers" target="_blank">
            @Stickers
          </a>{" "}
          bot, click{" "}
          <a
            href="https://core.telegram.org/stickers#using-the-stickers-bot"
            target="_blank"
          >
            here
          </a>
          .
        </p>
      </div>
    </div>
  );
}

export default Help;
