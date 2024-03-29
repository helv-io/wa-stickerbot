# wa-stickerbot

[![Build Status](https://jenkins.helv.io/buildStatus/icon?job=helvio%2Fwa-stickerbot)](https://jenkins.helv.io/job/helvio/job/wa-stickerbot/)

WhatsApp Sticker Bot. Any images, GIFs or Videos you receive will be converted to a Sticker!
Can also search for GIFs and Stickers through GIPHY and Tenor, as well as create memes from [memegen].

## Pre Requisites

1. [Docker]
2. Image: `helvio/wa-stickerbot`
3. `amd64` or `arm64`

## Downloading and running the container

### Main commands

`docker run -d --name wa-stickerbot -p 3000:3000 -v [/your/data/folder]:/data helvio/wa-stickerbot`

### How to scan the QR Code

Once the container is running, you need to link your phone to it. To do so, you have a few options:

- `http://localhost:3000/qr` to see a small page with the QR Code to scan.
- `docker logs -f wa-stickerbot` to open the live log. The QR will be printed there.

## Environment Variables

All variables are optional

| Variable                   | Description                           | Default             |
| -------------------------- | ------------------------------------- | ------------------- |
| WA_SESSION_ID              | Session ID / File Names               | session             |
| GIPHY_API                  | [Giphy] API Key                       | (blank)             |
| GIPHY_LANGUAGE             | [Giphy Language] code                 | pt                  |
| TENOR_API                  | [Tenor] API Key                       | (blank)             |
| TENOR_LOCALE               | [Tenor Locale]                        | pt_BR               |
| SB_AUTHOR                  | Sticker Author Name                   | Helvio              |
| SB_PACK                    | Sticker Pack Name                     | Sticker Bot         |
| SB_DONATION                | Donation Link / Text                  | pix@helv.io         |
| SB_DONATION_MESSAGE_CHANCE | 1 chance in X of a donation message   | 30                  |
| SB_STICKERS                | Number of Stickers to sead (each API) | 10                  |
| SB_STICKER_QUALITY         | Quality (0-100) of Sticker WebP       | 70                  |
| SB_GROUP_ADMIN_ONLY        | Only interact if bot is Group Admin   | true                |
| SB_GROUPS_ONLY             | Only interact with Group Chats        | true                |
| SB_WELCOME_MESSAGE         | Optional Welcome Message (Groups)     | true                |
| WHISPER_ENDPOINT           | URL for your local Whisper AI         | http://whisper:9000 |

[docker]: https://docs.docker.com/engine/install/
[giphy]: https://developers.giphy.com/branch/master/docs/api/
[giphy language]: https://developers.giphy.com/docs/optional-settings/#language-support
[tenor]: https://tenor.com/gifapi
[tenor locale]: https://developers.google.com/tenor/guides/localization
[memegen]: https://github.com/jacebrowning/memegen
