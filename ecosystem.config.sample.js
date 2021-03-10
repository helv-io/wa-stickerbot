/* eslint-disable @typescript-eslint/naming-convention */
module.exports = {
  apps: [
    {
      name: "wa-stickerbot",
      script: "./index.ts",
      watch: true,
      env: {
        IMGFLIP_USERNAME: "",
        IMGFLIP_PASSWORD: "",
        TENOR_API: "",
        GIPHY_API: "",
        NODE_ENV: "production",
      },
    },
  ],
};
