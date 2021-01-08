import { create, Client, ConfigObject, decryptMedia } from '@open-wa/wa-automate';
import mime from 'mime';

const config: ConfigObject = {
  sessionId: "sticker_bot",
  authTimeout: 60,
  blockCrashLogs: true,
  disableSpins: true,
  headless: true,
  logConsole: true,
  logConsoleErrors: true,
  popup: true,
  qrTimeout: 0
};

const videoOpts = {
  crop: true,
  endTime: '00:00:07.0',
  fps: 10,
  loop: 0,
  startTime: '00:00:00.0'
}

function start(client: Client) {
  client.onAnyMessage(async message => {

    // Handles Attachments
    if (message.mimetype) {
      const filename = `${message.t}.${mime.getExtension(message.mimetype)}`;
      const mediaData = await decryptMedia(message);
      const base64 = `data:${message.mimetype};base64,${mediaData.toString(
        'base64'
      )}`;

      if(filename.endsWith('.mp4')) {
        // Sends as Video Sticker
        // tslint:disable-next-line: no-console
        console.log('MP4/GIF Sticker', filename);
        try {
          await client.sendMp4AsSticker(message.chatId, base64, videoOpts);
        } catch {
          await client.reply(message.chatId, `Video is too long. ${videoOpts.endTime} max.`, message.id, true);
        }
      } else if (!filename.endsWith('.webp')) {
        // Sends as Image sticker
        // tslint:disable-next-line: no-console
        console.log('IMAGE Sticker', filename);
        await client.sendImageAsSticker(message.chatId, base64);
      }

    } else {
      // Get the content of the message, hopefully a link
      const txt = message.caption || message.body || message.content;

      // Checks whether the message is a hyperlink
      if (txt.toLowerCase().startsWith('http://') || txt.toLowerCase().startsWith('https://')) {
        // Sends an image URL as a Sticker
        // tslint:disable-next-line: no-console
        console.log('URL Sticker', txt);
        await client.sendStickerfromUrl(message.chatId, txt);
      }
    }
  });

  // Click "Use Here" when another WhatsApp Web page is open
  client.onStateChanged(state => {
    // tslint:disable-next-line: no-console
    console.log('statechanged', state)
    if(state==="CONFLICT" || state==="UNLAUNCHED") client.forceRefocus();

    // tslint:disable-next-line: no-console
    if(state==='UNPAIRED') console.log('LOGGED OUT!!!!')
  });
};

create(config).then(client => start(client));
