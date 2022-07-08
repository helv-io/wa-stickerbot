# wa-stickerbot

WhatsApp Sticker Bot. Any images, GIFs or Videos you receive will be converted to a Sticker!
Can also search for GIFs and Stickers through GIPHY and Tenor, as well as create memes from Imgflip.

## Pre Requisites

1. [Docker]
2. Image: `helvio/wa-stickerbot`

## Downloading and running the container

### Main command

`docker run -d --name stickerbot -v [/your/data/folder]:/config helvio/wa-stickerbot`

### Environment Variables

| Variable                   | Description                           | Default     | Optional |
| -------------------------- | ------------------------------------- | ----------- | -------- |
| WA_SESSION_ID              | Session ID / File Names               | session     | yes      |
| WA_POPUP                   | TCP port for QR image                 | false       | yes      |
| GIPHY_API                  | [Giphy] API Key                       | (blank)     | yes      |
| GIPHY_LANGUAGE             | [Giphy Language] code                 | pt          | yes      |
| TENOR_API                  | [Tenor] API Key                       | (blank)     | yes      |
| TENOR_LOCALE               | [Tenor Locale]                        | pt_BR       | yes      |
| IMGFLIP_USERNAME           | [imgflip] username                    | (blank)     | yes      |
| IMGFLIP_PASSWORD           | [imgflip] password                    | (blank)     | yes      |
| SB_AUTHOR                  | Sticker Author Name                   | Helvio      | yes      |
| SB_PACK                    | Sticker Pack Name                     | Sticker Bot | yes      |
| SB_DONATION                | Donation Link / Text                  | pix@helv.io | yes      |
| SB_DONATION_MESSAGE_CHANCE | 1 chance in X of a donation message   | 30          | yes      |
| SB_STICKERS                | Number of Stickers to sead (each API) | 10          | yes      |
| SB_GROUP_ADMIN_ONLY        | Only interact if bot is Group Admin   | true        | yes      |
| SB_GROUPS_ONLY             | Only interact with Group Chats        | true        | yes      |

[docker]: https://docs.docker.com/engine/install/
[giphy]: https://developers.giphy.com/branch/master/docs/api/
[giphy language]: https://developers.giphy.com/docs/optional-settings/#language-support
[tenor]: https://tenor.com/gifapi
[tenor locale]: https://developers.google.com/tenor/guides/localization
[imgflip]: https://imgflip.com/signup
