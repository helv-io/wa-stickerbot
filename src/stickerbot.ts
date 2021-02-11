import { create, Client, decryptMedia, ConfigObject } from '@open-wa/wa-automate';
import { ChatId } from '@open-wa/wa-automate/dist/api/model/aliases';
import { StickerMetadata } from '@open-wa/wa-automate/dist/api/model/media';
import mime from 'mime-types';

// Begin changes here

const meta: StickerMetadata = {
  "author": "Helvio",
  "pack": "Sticker Bot",
  "keepScale": true
};

const config: ConfigObject = {
  "sessionId": "sticker_bot",
  "authTimeout": 60,
  "blockCrashLogs": true,
  "disableSpins": true,
  "headless": true,
  "logConsole": true,
  "logConsoleErrors": true,
  "popup": true,
  "qrTimeout": 0
};

// Don't change anything starting from here

function start(client: Client) {
  client.onMessage(async message => {

    if(!message.isGroupMsg) {
      console.log('Private Message. No stickers.')
      return;
    }

    const chatId: ChatId = message.from;
    console.log(message.mimetype, message.t);

    // Handles Attachments
    if (message.mimetype) {
      const filename = `${message.t}.${mime.extension(message.mimetype)}`;
      const mediaData = await decryptMedia(message);
      const base64 = `data:${message.mimetype};base64,${mediaData.toString(
        'base64'
      )}`;

      console.log(filename);

      if(filename.endsWith('.mp4')) {
        // Sends as Video Sticker
        console.log('MP4/GIF Sticker', filename);
        const videoOpts = {
          crop: false,
          fps: 10,
          loop: 0,
          startTime: '00:00:00.0',
          endTime: '00:00:15.0'
        }
        for(let i = 15; i > 0; i--)
        {
          videoOpts.endTime = `00:00:${i.toString().padStart(2, '0')}.0`;
          try {
            console.log(chatId, videoOpts, meta);
            await client.sendMp4AsSticker(chatId, base64, videoOpts, meta);
            break;
          } catch {
            console.log(`Video is too long. ${videoOpts.endTime} max.`);
          }
        }
      } else if (!filename.endsWith('.webp')) {
        // Sends as Image sticker
        console.log('IMAGE Sticker', filename);
        console.log(chatId, meta);
        await client.sendImageAsSticker(chatId, base64, meta);
      }

    } else {
      // Get the content of the message, hopefully a link
      const txt = message.caption || message.body || message.content;

      // Checks whether the message is a hyperlink
      if (txt.toLowerCase().startsWith('http://') || txt.toLowerCase().startsWith('https://')) {
        // Sends an image URL as a Sticker
        console.log('URL Sticker', txt);
        await client.sendStickerfromUrl(chatId, txt);
      }
    }
  });

  // Click "Use Here" when another WhatsApp Web page is open
  client.onStateChanged(state => {
    console.log('statechanged', state)
    if(state==="CONFLICT" || state==="UNLAUNCHED") client.forceRefocus();
    if(state==='UNPAIRED') console.log('LOGGED OUT!!!!')
  });
};

create(config).then(client => start(client));
