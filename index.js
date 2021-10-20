#!/usr/bin/env ts-node
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
var http_1 = __importDefault(require("http"));
var io_1 = __importDefault(require("@pm2/io"));
var pm2_1 = __importDefault(require("pm2"));
var config_1 = require("./config");
var imgflipHandler_1 = require("./utils/imgflipHandler");
var stickerHandler_1 = require("./utils/stickerHandler");
var giphyHandler_1 = require("./utils/giphyHandler");
var tenorHandler_1 = require("./utils/tenorHandler");
var mediaHandler_1 = require("./utils/mediaHandler");
var textHandler_1 = require("./utils/textHandler");
var utils_1 = require("./utils/utils");
var axios_1 = __importDefault(require("axios"));
console.log('Environment Variables:');
console.log(process.env);
var start = function (client) {
    // Usage Counters
    var ioImages = io_1.default.counter({
        name: 'Images',
        id: 'images'
    });
    var ioVideos = io_1.default.counter({
        name: 'GIFs and Videos',
        id: 'videos'
    });
    var ioMemes = io_1.default.counter({
        name: 'Memes',
        id: 'memes'
    });
    var ioStickers = io_1.default.counter({
        name: 'Stickers',
        id: 'sticker'
    });
    var ioRefreshes = io_1.default.counter({
        name: 'Refreshes',
        id: 'refreshes'
    });
    // Message Handlers
    void client.onMessage(function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var groupId, media, i, _a, _b, _c, _d, _e, action, _f, groupInfo, _g, _h, _j, _k, _l, _m, stats, url, text, textUrlA, textUrlS, b64a, b64s, _o, _p, searches, giphyURLs, tenorURLs, _q, _r;
        return __generator(this, function (_s) {
            switch (_s.label) {
                case 0:
                    groupId = message.chatId;
                    // Skips personal chats unless specified
                    if (!message.isGroupMsg && config_1.botOptions.groupsOnly)
                        return [2 /*return*/];
                    if (!(message.type === wa_automate_1.MessageTypes.IMAGE ||
                        message.type === wa_automate_1.MessageTypes.VIDEO ||
                        message.type === wa_automate_1.MessageTypes.AUDIO)) return [3 /*break*/, 23];
                    // Start typing
                    return [4 /*yield*/, client.simulateTyping(message.from, true)];
                case 1:
                    // Start typing
                    _s.sent();
                    return [4 /*yield*/, (0, mediaHandler_1.getMedia)(message)];
                case 2:
                    media = _s.sent();
                    console.log(media.filename);
                    if (!media.filename.endsWith('.mp4')) return [3 /*break*/, 15];
                    // Sends as Video Sticker
                    console.log('MP4/GIF Sticker', media.filename);
                    ioVideos.inc();
                    i = 15;
                    _s.label = 3;
                case 3:
                    if (!(i > 0)) return [3 /*break*/, 14];
                    _s.label = 4;
                case 4:
                    _s.trys.push([4, 12, , 13]);
                    _s.label = 5;
                case 5:
                    _s.trys.push([5, 7, , 8]);
                    return [4 /*yield*/, client.sendMp4AsSticker(message.from, media.dataURL, (0, mediaHandler_1.getConversionOptions)(i), config_1.stickerMeta)];
                case 6:
                    _s.sent();
                    return [3 /*break*/, 8];
                case 7:
                    _a = _s.sent();
                    return [3 /*break*/, 8];
                case 8:
                    _s.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, client.sendMp4AsSticker(message.from, media.dataURL, (0, mediaHandler_1.getConversionOptions)(i), config_1.circleMeta)];
                case 9:
                    _s.sent();
                    return [3 /*break*/, 11];
                case 10:
                    _b = _s.sent();
                    return [3 /*break*/, 11];
                case 11: return [3 /*break*/, 14];
                case 12:
                    _c = _s.sent();
                    console.log("Video is too long. Reducing length.");
                    return [3 /*break*/, 13];
                case 13:
                    i--;
                    return [3 /*break*/, 3];
                case 14: return [3 /*break*/, 22];
                case 15:
                    // Sends as Image sticker
                    console.log('IMAGE Sticker', media.filename);
                    ioImages.inc();
                    _s.label = 16;
                case 16:
                    _s.trys.push([16, 18, , 19]);
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, media.dataURL, config_1.stickerMeta)];
                case 17:
                    _s.sent();
                    return [3 /*break*/, 19];
                case 18:
                    _d = _s.sent();
                    return [3 /*break*/, 19];
                case 19:
                    _s.trys.push([19, 21, , 22]);
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, media.dataURL, config_1.circleMeta)];
                case 20:
                    _s.sent();
                    return [3 /*break*/, 22];
                case 21:
                    _e = _s.sent();
                    return [3 /*break*/, 22];
                case 22: return [2 /*return*/];
                case 23: return [4 /*yield*/, (0, textHandler_1.getTextAction)(message.body)];
                case 24:
                    action = _s.sent();
                    if (!action) return [3 /*break*/, 67];
                    // Start typing
                    return [4 /*yield*/, client.simulateTyping(message.from, true)];
                case 25:
                    // Start typing
                    _s.sent();
                    _f = action;
                    switch (_f) {
                        case textHandler_1.actions.INSTRUCTIONS: return [3 /*break*/, 26];
                        case textHandler_1.actions.LINK: return [3 /*break*/, 32];
                        case textHandler_1.actions.MEME_LIST: return [3 /*break*/, 35];
                        case textHandler_1.actions.STATS: return [3 /*break*/, 38];
                        case textHandler_1.actions.MEME: return [3 /*break*/, 40];
                        case textHandler_1.actions.TEXT: return [3 /*break*/, 44];
                        case textHandler_1.actions.STICKER: return [3 /*break*/, 56];
                    }
                    return [3 /*break*/, 67];
                case 26:
                    console.log('Sending instructions');
                    if (!message.isGroupMsg) return [3 /*break*/, 29];
                    return [4 /*yield*/, client.getGroupInfo(groupId)];
                case 27:
                    groupInfo = _s.sent();
                    return [4 /*yield*/, client.sendText(message.from, groupInfo.description)];
                case 28:
                    _s.sent();
                    return [3 /*break*/, 31];
                case 29: return [4 /*yield*/, client.sendText(message.from, 'No Group Instructions.')];
                case 30:
                    _s.sent();
                    _s.label = 31;
                case 31: return [3 /*break*/, 67];
                case 32:
                    if (!message.isGroupMsg)
                        return [2 /*return*/];
                    console.log('Sending Link');
                    _h = (_g = client).sendText;
                    _j = [message.from];
                    return [4 /*yield*/, client.getGroupInviteLink(message.from)];
                case 33: return [4 /*yield*/, _h.apply(_g, _j.concat([_s.sent()]))];
                case 34:
                    _s.sent();
                    return [3 /*break*/, 67];
                case 35:
                    console.log('Sending meme list');
                    _l = (_k = client).sendText;
                    _m = [message.from];
                    return [4 /*yield*/, (0, imgflipHandler_1.getImgflipList)()];
                case 36: return [4 /*yield*/, _l.apply(_k, _m.concat([_s.sent()]))];
                case 37:
                    _s.sent();
                    return [3 /*break*/, 67];
                case 38:
                    stats = "*Current Usage*\n\n";
                    stats += "Images\n";
                    stats += ioImages.val() + "\n\n";
                    stats += "GIFs and Videos\n";
                    stats += ioVideos.val() + "\n\n";
                    stats += "Memes\n";
                    stats += ioMemes.val() + "\n\n";
                    stats += "Stickers\n";
                    stats += ioStickers.val() + "\n\n";
                    stats += "Refreshes\n";
                    stats += ioRefreshes.val() + "\n\n";
                    stats += "Reset on Bot Reboot or Update";
                    return [4 /*yield*/, client.sendText(message.from, stats)];
                case 39:
                    _s.sent();
                    return [3 /*break*/, 67];
                case 40:
                    console.log("Sending (" + message.body.split('\n').join(')(') + ")");
                    ioMemes.inc();
                    return [4 /*yield*/, (0, imgflipHandler_1.getImgflipImage)(message.body)];
                case 41:
                    url = _s.sent();
                    return [4 /*yield*/, client.sendImage(message.from, url, 'imgflip', url)];
                case 42:
                    _s.sent();
                    return [4 /*yield*/, client.sendStickerfromUrl(message.from, url, undefined, config_1.stickerMeta)];
                case 43:
                    _s.sent();
                    return [3 /*break*/, 67];
                case 44:
                    text = message.body.slice(6);
                    textUrlA = "https://api.xteam.xyz/attp?text=" + encodeURIComponent(text);
                    textUrlS = "https://api.xteam.xyz/ttp?text=" + encodeURIComponent(text);
                    console.log("Sending (" + text + ")");
                    ioStickers.inc();
                    return [4 /*yield*/, axios_1.default.get(textUrlA)];
                case 45:
                    b64a = (_s.sent());
                    return [4 /*yield*/, axios_1.default.get(textUrlS)];
                case 46:
                    b64s = (_s.sent());
                    _s.label = 47;
                case 47:
                    _s.trys.push([47, 50, , 51]);
                    if (!(b64a.status === 200)) return [3 /*break*/, 49];
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, b64a.data.result, config_1.stickerMeta)];
                case 48:
                    _s.sent();
                    _s.label = 49;
                case 49: return [3 /*break*/, 51];
                case 50:
                    _o = _s.sent();
                    return [3 /*break*/, 51];
                case 51:
                    _s.trys.push([51, 54, , 55]);
                    if (!(b64s.status === 200)) return [3 /*break*/, 53];
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, b64s.data.result, config_1.stickerMeta)];
                case 52:
                    _s.sent();
                    _s.label = 53;
                case 53: return [3 /*break*/, 55];
                case 54:
                    _p = _s.sent();
                    return [3 /*break*/, 55];
                case 55: return [3 /*break*/, 67];
                case 56:
                    searches = (0, stickerHandler_1.getStickerSearches)(message.body);
                    console.log('Sending Stickers for', searches.giphySearch.q);
                    return [4 /*yield*/, (0, giphyHandler_1.getGiphys)(searches.giphySearch)];
                case 57:
                    giphyURLs = _s.sent();
                    return [4 /*yield*/, (0, tenorHandler_1.getTenors)(searches.tenorSearch)];
                case 58:
                    tenorURLs = _s.sent();
                    if (!giphyURLs) return [3 /*break*/, 62];
                    _s.label = 59;
                case 59:
                    _s.trys.push([59, 61, , 62]);
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/giphy.gif', config_1.stickerMeta)];
                case 60:
                    _s.sent();
                    return [3 /*break*/, 62];
                case 61:
                    _q = _s.sent();
                    return [3 /*break*/, 62];
                case 62:
                    if (!tenorURLs) return [3 /*break*/, 66];
                    _s.label = 63;
                case 63:
                    _s.trys.push([63, 65, , 66]);
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/tenor.png', config_1.stickerMeta)];
                case 64:
                    _s.sent();
                    return [3 /*break*/, 66];
                case 65:
                    _r = _s.sent();
                    return [3 /*break*/, 66];
                case 66:
                    giphyURLs.concat(tenorURLs).forEach(function (url) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    _b.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, client.sendStickerfromUrl(message.from, url, undefined, config_1.stickerMeta)];
                                case 1:
                                    _b.sent();
                                    ioStickers.inc();
                                    return [3 /*break*/, 3];
                                case 2:
                                    _a = _b.sent();
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [3 /*break*/, 67];
                case 67: 
                // Stop typing
                return [4 /*yield*/, client.simulateTyping(message.from, false)];
                case 68:
                    // Stop typing
                    _s.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // Participants Handler
    (0, utils_1.registerParticipantsListener)(client);
    // Click "Use Here" when another WhatsApp Web page is open
    void client.onStateChanged(function (state) {
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
            void client.forceRefocus();
        }
    });
    // Status / Reload / Restart Web Server
    http_1.default
        .createServer(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var url, _a;
        var _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    url = (_b = req.url) === null || _b === void 0 ? void 0 : _b.toLowerCase();
                    _a = url;
                    switch (_a) {
                        case '/restart': return [3 /*break*/, 1];
                        case '/refresh': return [3 /*break*/, 2];
                    }
                    return [3 /*break*/, 4];
                case 1:
                    {
                        pm2_1.default.restart('wa-stickerbot', function () { });
                        console.log('Restarting wa-stickerbot...');
                        res.end('Restarting wa-stickerbot...');
                        return [3 /*break*/, 5];
                    }
                    _c.label = 2;
                case 2: return [4 /*yield*/, client.refresh()];
                case 3:
                    _c.sent();
                    ioRefreshes.inc();
                    console.log('Refreshed wa-stickerbot');
                    res.end('Refreshed wa-stickerbot');
                    return [3 /*break*/, 5];
                case 4:
                    res.end('Running');
                    _c.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    }); })
        .listen(6001);
};
(0, wa_automate_1.create)(config_1.clientConfig).then(function (client) { return start(client); });
