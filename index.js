"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var wa_automate_1 = require("@open-wa/wa-automate");
var mime_types_1 = __importDefault(require("mime-types"));
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
    logConsole: false,
    logConsoleErrors: true,
    popup: true,
    qrTimeout: 0,
    bypassCSP: true,
    chromiumArgs: ['--no-sandbox'],
    sessionData: process.env.SESSION_DATA
};
var videoOpts = {
    crop: true,
    fps: 10,
    loop: 0,
    log: true,
    startTime: '00:00:00.0',
    endTime: '00:00:15.0'
};
// Don't change anything starting from here
var start = function (client) {
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    void client.onAnyMessage(function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var filename, mediaData, dataURL, i, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Skips personal chats
                    if (!message.isGroupMsg) {
                        return [2 /*return*/];
                    }
                    if (!message.mimetype) return [3 /*break*/, 10];
                    filename = message.t + "." + (mime_types_1.default.extension(message.mimetype) || '');
                    return [4 /*yield*/, wa_automate_1.decryptMedia(message)];
                case 1:
                    mediaData = _b.sent();
                    dataURL = "data:" + message.mimetype + ";base64," + mediaData.toString('base64');
                    if (!filename.endsWith('.mp4')) return [3 /*break*/, 8];
                    // Sends as Video Sticker
                    console.log('MP4/GIF Sticker', filename);
                    videoOpts.endTime = '00:00:15.0';
                    i = 15;
                    _b.label = 2;
                case 2:
                    if (!(i > 0)) return [3 /*break*/, 7];
                    videoOpts.endTime = "00:00:" + i.toString().padStart(2, '0') + ".0";
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, client.sendMp4AsSticker(message.from, dataURL, videoOpts, meta)];
                case 4:
                    void (_b.sent());
                    return [3 /*break*/, 7];
                case 5:
                    _a = _b.sent();
                    console.log("Video is too long. " + videoOpts.endTime + " max.");
                    return [3 /*break*/, 6];
                case 6:
                    i--;
                    return [3 /*break*/, 2];
                case 7: return [3 /*break*/, 10];
                case 8:
                    if (!!filename.endsWith('.webp')) return [3 /*break*/, 10];
                    // Sends as Image sticker
                    console.log('IMAGE Sticker', filename);
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, dataURL, meta)];
                case 9:
                    void (_b.sent());
                    _b.label = 10;
                case 10: return [2 /*return*/];
            }
        });
    }); });
    // Click "Use Here" when another WhatsApp Web page is open
    void client.onStateChanged(function (state) {
        if (state === "CONFLICT" || state === "UNLAUNCHED") {
            void client.forceRefocus();
        }
    });
};
void wa_automate_1.create(config).then(function (client) { return start(client); });
