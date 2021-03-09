module.exports = {
    apps : [
        {
          name: "wa-stickerbot",
          script: "./index.ts",
          watch: true,
          env: {
            "IMGFLIP_USERNAME": "YOUR_IMGFLIP_USERNAME",
            "IMGFLIP_PASSWORD": "YOUR_IMGFLIP_PASSWORD",
            "TENOR_API": "YOUR_TENOR_API_KEY",
            "GIPHY_API": "YOUR_GIPHY_API_KEY",
            "NODE_ENV": "production"
          }
        }
    ]
  }
