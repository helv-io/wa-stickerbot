import { create, Client, decryptMedia, ConfigObject, Message } from '@open-wa/wa-automate';
import { Mp4StickerConversionProcessOptions, StickerMetadata } from '@open-wa/wa-automate/dist/api/model/media';
import mime from 'mime-types';

// Begin changes here

const meta: StickerMetadata = {
  author: 'Helvio',
  pack: 'Sticker Bot',
  keepScale: true
};

const config: ConfigObject = {
  sessionId: "sticker_bot",
  authTimeout: 60,
  blockCrashLogs: false,
  disableSpins: true,
  headless: true,
  logConsole: true,
  logConsoleErrors: true,
  popup: true,
  qrTimeout: 0,
  bypassCSP: true,
  chromiumArgs: ['--no-sandbox'],
  sessionData: process.env.SESSION_DATA
};

const videoOpts: Mp4StickerConversionProcessOptions = {
  crop: false,
  fps: 10,
  loop: 0,
  log: true,
  startTime: '00:00:00.0',
  endTime: '00:00:15.0'
}

// Don't change anything starting from here

const start = (client: Client) => {

  const m = (message: Message) => {
    // Handles Attachments
    if (message.mimetype) {
      const filename = `${message.t}.${mime.extension(message.mimetype) || ''}`;
      let mediaData: Buffer;
      decryptMedia(message).then(
        responseBuffer => {
          mediaData = responseBuffer;
          const dataURL = `data:${message.mimetype || ''};base64,${mediaData.toString('base64')}`;

          if(filename.endsWith('.mp4')) {
            // Sends as Video Sticker
            console.log('MP4/GIF Sticker', filename);
            videoOpts.endTime = '00:00:15.0';

            for(let i = 15; i > 0; i--)
            {
              videoOpts.endTime = `00:00:${i.toString().padStart(2, '0')}.0`;
              try {
                client.sendMp4AsSticker(message.from, dataURL, videoOpts, meta).then(
                  s => console.log('+sendMp4AsSticker', s),
                  e => console.log('-sendMp4AsSticker', e)
                );
                break;
              } catch {
                console.log(`Video is too long. ${videoOpts.endTime} max.`);
              }
            }
          } else if (!filename.endsWith('.webp')) {
            // Sends as Image sticker
            console.log('IMAGE Sticker', filename);
            client.sendImageAsSticker(message.from, dataURL, meta).then(
              s => console.log('+sendImageAsSticker', s),
              e => console.log('-sendImageAsSticker', e)
            );
          }
        },
        error => console.log(error)
      );
    }
  }

  const onAnyMsg = client.onAnyMessage(m);
  const onMsg = client.onMessage(m);

  onMsg.then(
    () => console.log('+onMessage'),
    e => console.log('-onMessage', e)
  );

  onAnyMsg.then(
    () => console.log('+onAnyMessage'),
    e => console.log('-onAnyMessage', e)
  );

  // Click "Use Here" when another WhatsApp Web page is open
  client.onStateChanged(state => {
    if(state === "CONFLICT" || state === "UNLAUNCHED") {
      client.forceRefocus().then(
        () => console.log('+forceRefocus'),
        e => console.log('-forceRefocus', e));
    }
  }).then(
    () => console.log('+onStateChanged'),
    e => console.log('-onStateChanged', e)
  );
};

create(config).then(client => start(client)).then(
  () => console.log('+create'),
  n => console.log('-create', n)
);