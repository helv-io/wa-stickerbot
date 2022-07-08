/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  apps: [
    {
      name: 'wa-stickerbot',
      script: 'ts-node ./index.ts',
      watch: true,
      env: {
        OPENAI_API_KEY: '',
        OPENAI_API_ORG: '',
        IMGFLIP_USERNAME: '',
        IMGFLIP_PASSWORD: '',
        TENOR_API: '',
        GIPHY_API: '',
        NODE_ENV: 'production'
      }
    }
  ]
}
