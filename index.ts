import { create, Client, decryptMedia, ConfigObject } from '@open-wa/wa-automate';
import { Mp4StickerConversionProcessOptions, StickerMetadata } from '@open-wa/wa-automate/dist/api/model/media';
import { MessageTypes } from '@open-wa/wa-automate/dist/api/model';
import mime from 'mime-types';
import axios from 'axios'

// Begin changes here

const meta: StickerMetadata = {
  author: 'Helvio',
  pack: 'Sticker Bot',
  keepScale: true
};

const config: ConfigObject  = {
  sessionId: "sticker_bot",
  authTimeout: 60,
  blockCrashLogs: false,
  disableSpins: true,
  headless: true,
  logConsole: false,
  logConsoleErrors: true,
  popup: true,
  qrTimeout: 0,
  bypassCSP: true,
  chromiumArgs: ['--no-sandbox'],
  sessionData: process.env.SESSION_DATA
};

const videoOpts: Mp4StickerConversionProcessOptions = {
  crop: true,
  fps: 10,
  loop: 0,
  log: true,
  startTime: '00:00:00.0',
  endTime: '00:00:15.0'
};

const giphySearch: any = {
  api_key: 'xV08BBGGwayvb8RsgiYLUfgKU3mMaDxp',
  lang: 'pt',
  limit: 1,
  q: 'placeholder'
};

// Don't change anything starting from here

const start = (client: Client) => {

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  void client.onAnyMessage(async message => {
    // Skips personal chats
    if(!message.isGroupMsg) {
      return;
    }

    // Handles Media
    if (message.type === MessageTypes.IMAGE || message.type === MessageTypes.VIDEO) {
      const filename = `${message.t}.${mime.extension(message.mimetype || '') || ''}`;
      const mediaData = await decryptMedia(message);
      const dataURL = `data:${message.mimetype};base64,${mediaData.toString('base64')}`;

      if(filename.endsWith('.mp4')) {
        // Sends as Video Sticker
        console.log('MP4/GIF Sticker', filename);
        videoOpts.endTime = '00:00:15.0';

        for(let i = 15; i > 0; i--)
        {
          videoOpts.endTime = `00:00:${i.toString().padStart(2, '0')}.0`;
          try {
            void await client.sendMp4AsSticker(message.from, dataURL, videoOpts, meta);
            break;
          } catch {
            console.log(`Video is too long. ${videoOpts.endTime} max.`);
          }
        }
      } else {
        // Sends as Image sticker
        console.log('IMAGE Sticker', filename);
        void await client.sendImageAsSticker(message.from, dataURL, meta);
      }
    } else {
      console.log(message.body.toLowerCase().match(/sticker d[a|e|o]s? (.*)/));
      const keyword = message.body.toLowerCase().match(/sticker d[a|e|o]s? (.*)/);
      if(keyword !== null) {
        giphySearch.q = keyword[1];
        console.log('Searching for', giphySearch);
        const gifs = await (await axios.get('https://api.giphy.com/v1/gifs/search', { params: giphySearch })).data;
        console.log(gifs.data[0].id);
        void await client.sendGiphyAsSticker(message.from, gifs.data[0].id);
      }
    }
  });

  // Click "Use Here" when another WhatsApp Web page is open
  void client.onStateChanged(state => {
    if(state === "CONFLICT" || state === "UNLAUNCHED") {
      void client.forceRefocus();
    }
  });
};

void create(config).then(client => start(client));