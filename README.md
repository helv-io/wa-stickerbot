# wa-stickerbot

WhatsApp Sticker Bot. Any images, GIFs or Videos you receive will be converted to a Sticker!
Can also search for GIFs and Stickers through GIPHY and Tenor, as well as create memes from Imgflip.

### Pre Requisites

1. Ubuntu or another Debian distribution.
2. NodeJS:
   `curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash - sudo apt install -y nodejs`
3. ffmpeg:
   `sudo apt install ffmpeg`
4. A phone with WhatsApp installed
5. pm2 Package Manager `sudo npm install -g pm2`

### Downloading the source

1. `cd /opt`
2. `git clone https://github.com/Helvio88/wa-stickerbot`
3. `cd wa-stickerbot`
4. `npm install`
5. `ts-node index.ts`
6. Use your WhatsApp Client to scan the WhatsApp Web QR Code, then press `CTRL+c`
7. `sudo pm2 startup`
8. `sudo pm2 start index.ts --name stickerbot`
9. `sudo pm2 save`

Now pm2 will start your Whatsapp Stickerbot on System Startup

To restart:
`sudo pm2 restart all`
