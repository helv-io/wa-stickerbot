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
  q: 'placeholder',
  type: 'gif'
};

const tenorSearch: any = {
  key: 'SNS0GPOLUFOQ',
  locale: 'pt_BR',
  media_filter: 'minimal',
  limit: 1,
  q: 'placeholder',
  type: 'gif'
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
      // Handles REGEXes
      const keywords = message.body.match(/(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i);

      if(keywords !== null) {
        giphySearch.limit = keywords[2].toLowerCase() === 's' ? 10 : 1;
        giphySearch.q = keywords[3];
        tenorSearch.limit = giphySearch.limit;
        tenorSearch.q = giphySearch.q;

        videoOpts.crop = false;

        console.log('Searching for', giphySearch.q);

        // Attributions
        await client.sendImageAsSticker(message.from, 'attributions/giphy.gif');
        await client.sendImageAsSticker(message.from, 'attributions/tenor.png');

        // GIPHY GIFs
        ['gifs', 'stickers'].forEach(async (type: string) => {
          const giphys = await (await axios.get(`https://api.giphy.com/v1/${type}/search`, { params: giphySearch })).data;

          await giphys.data.forEach((giphy: any) => {
            const url = giphy.images.original.webp.replace(/media[0-9]/, 'i');
            const size = giphy.images.original.webp_size;
            const altUrl = giphy.images.fixed_width.webp.replace(/media[0-9]/, 'i');
            const altSize = giphy.images.fixed_width.webp_size;

            try {
              if(size <= 1400000) {
                console.log(size, url);
                client.sendStickerfromUrl(message.from, url);
              } else if(altSize <= 1400000) {
                console.log(altSize, altUrl);
                client.sendStickerfromUrl(message.from, altUrl);
              }
            } catch {
              console.log('Sticker too big:', size, altSize);
            }
          });
        });

        // Tenor GIFs
        const tenors = await (await axios.get('https://g.tenor.com/v1/search', {params: tenorSearch})).data;

        await tenors.results.forEach((tenor: any) => {
          const url = tenor.media[0].gif.url;
          const size = tenor.media[0].gif.size;
          const altUrl = tenor.media[0].tinygif.url;
          const altSize = tenor.media[0].tinygif.size;

          try {
            if(size <= 1400000) {
              console.log(size, url);
              client.sendStickerfromUrl(message.from, url);
            } else if(altSize <= 1400000) {
              console.log(altSize, altUrl);
              client.sendStickerfromUrl(message.from, altUrl);
            }
          } catch {
            console.log('Sticker too big:', size, altSize);
          }
        });
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

void create(config).then((client: Client) => start(client));