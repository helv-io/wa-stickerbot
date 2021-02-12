"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var wa_automate_1 = require("@open-wa/wa-automate");
var mime_types_1 = __importDefault(require("mime-types"));
var express_1 = __importDefault(require("express"));
// Begin changes here
var meta = {
    author: 'Helvio',
    pack: 'Sticker Bot',
    keepScale: true
};
var config = {
    sessionId: "sticker_bot",
    authTimeout: 60,
    blockCrashLogs: false,
    disableSpins: true,
    headless: true,
    logConsole: true,
    logConsoleErrors: true,
    popup: true,
    qrTimeout: 0,
    bypassCSP: true,
    chromiumArgs: ['--no-sandbox']
};
var videoOpts = {
    crop: false,
    fps: 10,
    loop: 0,
    log: true,
    startTime: '00:00:00.0',
    endTime: '00:00:15.0'
};
// Don't change anything starting from here
var start = function (client) {
    var m = function (message) {
        // Handles Attachments
        if (message.mimetype) {
            var filename_1 = message.t + "." + (mime_types_1.default.extension(message.mimetype) || '');
            var mediaData_1;
            wa_automate_1.decryptMedia(message).then(function (responseBuffer) {
                mediaData_1 = responseBuffer;
                var dataURL = "data:" + (message.mimetype || '') + ";base64," + mediaData_1.toString('base64');
                if (filename_1.endsWith('.mp4')) {
                    // Sends as Video Sticker
                    console.log('MP4/GIF Sticker', filename_1);
                    videoOpts.endTime = '00:00:15.0';
                    for (var i = 15; i > 0; i--) {
                        videoOpts.endTime = "00:00:" + i.toString().padStart(2, '0') + ".0";
                        try {
                            client.sendMp4AsSticker(message.from, dataURL, videoOpts, meta).then(function (s) { return console.log('sendMp4AsSticker', s); }, function (e) { return console.log('sendMp4AsSticker', e); });
                            break;
                        }
                        catch (_a) {
                            console.log("Video is too long. " + videoOpts.endTime + " max.");
                        }
                    }
                }
                else if (!filename_1.endsWith('.webp')) {
                    // Sends as Image sticker
                    console.log('IMAGE Sticker', filename_1);
                    client.sendImageAsSticker(message.from, dataURL).then(function (s) { return console.log('sendImageAsSticker', s); }, function (e) { return console.log('sendImageAsSticker', e); });
                }
            }, function (error) { return console.log(error); });
        }
    };
    var onAnyMsg = client.onAnyMessage(m);
    var onMsg = client.onMessage(m);
    onMsg.then(function () { return console.log('onMessage'); }, function (e) { return console.log('onMessage', e); });
    onAnyMsg.then(function () { return console.log('onAnyMessage'); }, function (e) { return console.log('onAnyMessage', e); });
    // Click "Use Here" when another WhatsApp Web page is open
    client.onStateChanged(function (state) {
        if (state === "CONFLICT" || state === "UNLAUNCHED") {
            client.forceRefocus().then(function () { return console.log('forceRefocus'); }, function (e) { return console.log('forceRefocus', e); });
        }
    }).then(function () { return console.log('onStateChanged'); }, function (e) { return console.log('onStateChanged', e); });
};
wa_automate_1.create(config).then(function (client) { return start(client); }).then(function () { return console.log('create'); }, function (n) { return console.log('create', n); });
var app = express_1.default();
app.get('/', function (req, res) { return res.send('Hello World'); });
app.listen(443);
