# wa-stickerbot
WhatsApp Sticker Bot. Any images, GIFs or Videos you receive will be converted to a Sticker!

### Pre Requisites
1. Ubuntu or another Debian distribution.
2. NodeJS:
`curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt install -y nodejs`
3. ffmpeg:
`sudo apt install ffmpeg`
4. A phone with WhatsApp installed
5. [OPTIONAL] pm2 Package Manager

### Downloading the source
1. `cd /opt`
2. `git clone https://github.com/Helvio88/wa-stickerbot`
3. `cd wa-stickerbot`
4. `npm install`
5. `tsc`
6. `node dist/stickerbot.js`
7. Use your WhatsApp Client to scan the WhatsApp Web QR Code, then press `CTRL+c`
8. `sudo pm2 startup`
9. `sudo pm2 start dist/stickerbot.js`
10. `sudo pm2 save`

Now pm2 will start your Whatsapp Stickerbot on System Startup

To restart:
`sudo pm2 restart all`