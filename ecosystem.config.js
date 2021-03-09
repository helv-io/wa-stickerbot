module.exports = {
    apps : [
        {
          name: "wa-stickerbot",
          script: "./index.ts",
          watch: true,
          env: {
            "IMGFLIP_USERNAME": "helvio",
            "IMGFLIP_PASSWORD": "wsfh1988",
            "TENOR_API": "SNS0GPOLUFOQ",
            "GIPHY_API": "xV08BBGGwayvb8RsgiYLUfgKU3mMaDxp"
          }
        }
    ]
  }