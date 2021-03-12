import {
  create,
  Client,
  decryptMedia,
  ConfigObject,
} from '@open-wa/wa-automate';
import {
  Mp4StickerConversionProcessOptions,
  StickerMetadata,
} from '@open-wa/wa-automate/dist/api/model/media';
import { MessageTypes } from '@open-wa/wa-automate/dist/api/model';
import mime from 'mime-types';
import axios from 'axios';
import qs from 'qs';
import { GiphyGif, GiphyResponse, GiphySearch } from './types/Giphy';
import { TenorResponse, TenorSearch } from './types/Tenor';
import { ImgFlip, ImgFlipMeme, ImgFlipResponse } from './types/ImgFlip';
import { normalizeSync } from 'normalize-diacritics';

const ps = (p: any) => {
  return qs.stringify(p, { arrayFormat: 'brackets' });
};

const meta: StickerMetadata = {
  author: 'Helvio',
  pack: 'Sticker Bot',
  keepScale: true,
};

const config: ConfigObject = {
  sessionId: 'sticker_bot',
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
  sessionData: process.env.SESSION_DATA || '',
};

const videoOpts: Mp4StickerConversionProcessOptions = {
  crop: true,
  fps: 10,
  loop: 0,
  log: true,
  startTime: '00:00:00.0',
  endTime: '00:00:15.0',
};

const giphySearch: GiphySearch = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  api_key: process.env.GIPHY_API || '',
  lang: 'pt',
  limit: 1,
  q: 'placeholder',
  type: 'gif',
};

const tenorSearch: TenorSearch = {
  key: process.env.TENOR_API || '',
  locale: 'pt_BR',
  // eslint-disable-next-line @typescript-eslint/naming-convention
  media_filter: 'minimal',
  limit: 1,
  q: 'placeholder',
  type: 'gif',
};

const imgflip: ImgFlip = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  template_id: '',
  boxes: [],
  username: process.env.IMGFLIP_USERNAME || '',
  password: process.env.IMGFLIP_PASSWORD || '',
};

// Don't change anything starting from here

const start = (client: Client) => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  void client.onAnyMessage(async (message) => {
    // Skips personal chats
    if (!message.isGroupMsg) {
      return;
    }

    // Handles Media
    if (
      message.type === MessageTypes.IMAGE ||
      message.type === MessageTypes.VIDEO
    ) {
      const filename = `${message.t}.${
        mime.extension(message.mimetype || '') || ''
      }`;
      const mediaData = await decryptMedia(message);
      const dataURL = `data:${
        message.mimetype || ''
      };base64,${mediaData.toString('base64')}`;

      if (filename.endsWith('.mp4')) {
        // Sends as Video Sticker
        console.log('MP4/GIF Sticker', filename);
        videoOpts.endTime = '00:00:15.0';

        for (let i = 15; i > 0; i--) {
          videoOpts.endTime = `00:00:${i.toString().padStart(2, '0')}.0`;
          try {
            void (await client.sendMp4AsSticker(
              message.from,
              dataURL,
              videoOpts,
              meta
            ));
            break;
          } catch {
            console.log(`Video is too long. ${videoOpts.endTime} max.`);
          }
        }
      } else {
        // Sends as Image sticker
        console.log('IMAGE Sticker', filename);
        void (await client.sendImageAsSticker(message.from, dataURL, meta));
      }
    } else {
      // Handles Text Messages
      const keywords = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i.exec(
        message.body
      );

      if (keywords !== null) {
        giphySearch.limit = keywords[2].toLowerCase() === 's' ? 10 : 1;
        giphySearch.q = keywords[3];
        tenorSearch.limit = giphySearch.limit;
        tenorSearch.q = giphySearch.q;

        videoOpts.crop = false;

        console.log('Searching for', giphySearch.q);

        // Attributions
        await client.sendImageAsSticker(
          message.from,
          'attributions/giphy.gif',
          meta
        );
        await client.sendImageAsSticker(
          message.from,
          'attributions/tenor.png',
          meta
        );

        // GIPHY GIFs
        if (giphySearch.api_key) {
          const giphys = (
            await axios.get<GiphyResponse>(
              `https://api.giphy.com/v1/gifs/search`,
              {
                params: giphySearch,
              }
            )
          ).data;

          const stickers = (
            await axios.get<GiphyResponse>(
              `https://api.giphy.com/v1/stickers/search`,
              {
                params: giphySearch,
              }
            )
          ).data;

          const data = giphys.data.concat(stickers.data);

          data.forEach((giphy: GiphyGif) => {
            const url = giphy.images.original.webp.replace(/media[0-9]/, 'i');
            const size = giphy.images.original.webp_size;
            const altUrl = giphy.images.fixed_width.webp.replace(
              /media[0-9]/,
              'i'
            );
            const altSize = giphy.images.fixed_width.webp_size;

            try {
              if (size <= '1400000') {
                console.log(size, url);
                void client.sendStickerfromUrl(
                  message.from,
                  url,
                  undefined,
                  meta
                );
              } else if (altSize <= '1400000') {
                console.log(altSize, altUrl);
                void client.sendStickerfromUrl(
                  message.from,
                  altUrl,
                  undefined,
                  meta
                );
              }
            } catch {
              console.log('Sticker too big:', size, altSize);
            }
          });
        }

        // Tenor GIFs
        if (tenorSearch.key) {
          const tenors = (
            await axios.get<TenorResponse>('https://g.tenor.com/v1/search', {
              params: tenorSearch,
            })
          ).data;

          tenors.results.forEach((tenor) => {
            const url = tenor.media[0].gif.url;
            const size = tenor.media[0].gif.size;
            const altUrl = tenor.media[0].tinygif.url;
            const altSize = tenor.media[0].tinygif.size;

            try {
              if (size <= 1400000) {
                console.log(size, url);
                void client.sendStickerfromUrl(
                  message.from,
                  url,
                  undefined,
                  meta
                );
              } else if (altSize <= 1400000) {
                console.log(altSize, altUrl);
                void client.sendStickerfromUrl(
                  message.from,
                  altUrl,
                  undefined,
                  meta
                );
              }
            } catch {
              console.log('Sticker too big:', size, altSize);
            }
          });
        }
      }

      // imgflip Meme maker
      const maker = message.body.split('\n');
      if (maker[0].toLowerCase().includes('meme ') && imgflip.username) {
        const memes = (
          await axios.get<ImgFlipResponse>('https://api.imgflip.com/get_memes')
        ).data.data.memes;
        const meme = memes.find((m) => {
          const name: string = m.name;
          return name
            .toLowerCase()
            .includes(maker[0].toLowerCase().replace('meme ', ''));
        });

        if (meme && meme.box_count <= maker.length - 1) {
          imgflip.template_id = meme.id;
          imgflip.boxes = [];
          for (let i = 1; i < maker.length; i++) {
            imgflip.boxes.push({ text: maker[i] });
          }

          console.log(meme.name, meme.box_count);

          const p = ps(imgflip);
          const url =
            (
              await axios.get<ImgFlipResponse>(
                `https://api.imgflip.com/caption_image?${p}`
              )
            ).data.data.url || '';
          console.log(url);
          void client.sendStickerfromUrl(message.from, url, undefined, meta);
          void client.sendImage(message.from, url, maker[0], url);
        }
      }

      // imgFlip List Memes
      if (message.body.toLowerCase() === 'memes') {
        const memes: ImgFlipMeme[] = (
          await axios.get<ImgFlipResponse>('https://api.imgflip.com/get_memes')
        ).data.data.memes;
        let response = '';
        memes.forEach(
          (meme) => (response += `${meme.name} (${meme.box_count})\n`)
        );
        void client.sendText(message.from, response);
      }
    }
  });

  // Click "Use Here" when another WhatsApp Web page is open
  void client.onStateChanged((state) => {
    if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
      void client.forceRefocus();
    }
  });
};

void create(config).then((client: Client) => start(client));
