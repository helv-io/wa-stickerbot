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
var start = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var ioImages, ioVideos, ioMemes, ioStickers, ioRefreshes, adminGroups;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ioImages = io_1.default.counter({
                    name: 'Images',
                    id: 'images'
                });
                ioVideos = io_1.default.counter({
                    name: 'GIFs and Videos',
                    id: 'videos'
                });
                ioMemes = io_1.default.counter({
                    name: 'Memes',
                    id: 'memes'
                });
                ioStickers = io_1.default.counter({
                    name: 'Stickers',
                    id: 'sticker'
                });
                ioRefreshes = io_1.default.counter({
                    name: 'Refreshes',
                    id: 'refreshes'
                });
                return [4 /*yield*/, client.iAmAdmin()];
            case 1:
                adminGroups = _a.sent();
                console.log("Admin in groups: " + adminGroups);
                // Message Handlers
                void client.onMessage(function (message) { return __awaiter(void 0, void 0, void 0, function () {
                    var groupId, media, _a, i, _b, _c, _d, _e, _f, _g, action, _h, groupInfo, _j, _k, _l, _m, _o, _p, stats, url, text, textUrlA, textUrlS, b64a, b64s, _q, _r, searches, giphyURLs, tenorURLs, _s, _t;
                    return __generator(this, function (_u) {
                        switch (_u.label) {
                            case 0:
                                groupId = message.chatId;
                                console.log("Group ID: " + groupId);
                                // Skips personal chats unless specified
                                if (!message.isGroupMsg && config_1.botOptions.groupsOnly)
                                    return [2 /*return*/];
                                // Skips non-administered groups
                                if (!adminGroups.includes(groupId))
                                    return [2 /*return*/];
                                if (!(message.isGroupMsg && groupId)) return [3 /*break*/, 33];
                                if (!(message.type === wa_automate_1.MessageTypes.IMAGE ||
                                    message.type === wa_automate_1.MessageTypes.VIDEO ||
                                    message.type === wa_automate_1.MessageTypes.AUDIO ||
                                    message.type === wa_automate_1.MessageTypes.VOICE ||
                                    message.type === wa_automate_1.MessageTypes.STICKER)) return [3 /*break*/, 33];
                                // Handles Media
                                // Start typing
                                return [4 /*yield*/, client.simulateTyping(message.from, true)];
                            case 1:
                                // Handles Media
                                // Start typing
                                _u.sent();
                                return [4 /*yield*/, (0, mediaHandler_1.getMedia)(message)];
                            case 2:
                                media = _u.sent();
                                if (!(message.type === wa_automate_1.MessageTypes.STICKER)) return [3 /*break*/, 7];
                                _u.label = 3;
                            case 3:
                                _u.trys.push([3, 5, , 6]);
                                return [4 /*yield*/, client.sendImage(message.from, media.dataURL, media.filename, '')];
                            case 4:
                                _u.sent();
                                return [3 /*break*/, 6];
                            case 5:
                                _a = _u.sent();
                                return [3 /*break*/, 6];
                            case 6: return [3 /*break*/, 32];
                            case 7:
                                if (!media.filename.endsWith('.mp4')) return [3 /*break*/, 20];
                                // Sends as Video Sticker
                                console.log('MP4/GIF Sticker', media.filename);
                                ioVideos.inc();
                                i = 15;
                                _u.label = 8;
                            case 8:
                                if (!(i > 0)) return [3 /*break*/, 19];
                                _u.label = 9;
                            case 9:
                                _u.trys.push([9, 17, , 18]);
                                _u.label = 10;
                            case 10:
                                _u.trys.push([10, 12, , 13]);
                                return [4 /*yield*/, client.sendMp4AsSticker(message.from, media.dataURL, (0, mediaHandler_1.getConversionOptions)(i), config_1.stickerMeta)];
                            case 11:
                                _u.sent();
                                return [3 /*break*/, 13];
                            case 12:
                                _b = _u.sent();
                                return [3 /*break*/, 13];
                            case 13:
                                _u.trys.push([13, 15, , 16]);
                                return [4 /*yield*/, client.sendMp4AsSticker(message.from, media.dataURL, (0, mediaHandler_1.getConversionOptions)(i), config_1.circleMeta)];
                            case 14:
                                _u.sent();
                                return [3 /*break*/, 16];
                            case 15:
                                _c = _u.sent();
                                return [3 /*break*/, 16];
                            case 16: return [3 /*break*/, 19];
                            case 17:
                                _d = _u.sent();
                                console.log("Video is too long. Reducing length.");
                                return [3 /*break*/, 18];
                            case 18:
                                i--;
                                return [3 /*break*/, 8];
                            case 19: return [3 /*break*/, 32];
                            case 20:
                                if (!media.filename.endsWith('.oga')) return [3 /*break*/, 25];
                                _u.label = 21;
                            case 21:
                                _u.trys.push([21, 23, , 24]);
                                return [4 /*yield*/, client.sendPtt(message.from, media.dataURL, 'true_0000000000@c.us_JHB2HB23HJ4B234HJB')];
                            case 22:
                                _u.sent();
                                return [3 /*break*/, 24];
                            case 23:
                                _e = _u.sent();
                                return [3 /*break*/, 24];
                            case 24: return [3 /*break*/, 32];
                            case 25:
                                // Sends as Image sticker
                                console.log('IMAGE Sticker', media.filename);
                                ioImages.inc();
                                _u.label = 26;
                            case 26:
                                _u.trys.push([26, 28, , 29]);
                                return [4 /*yield*/, client.sendImageAsSticker(message.from, media.dataURL, config_1.stickerMeta)];
                            case 27:
                                _u.sent();
                                return [3 /*break*/, 29];
                            case 28:
                                _f = _u.sent();
                                return [3 /*break*/, 29];
                            case 29:
                                _u.trys.push([29, 31, , 32]);
                                return [4 /*yield*/, client.sendImageAsSticker(message.from, media.dataURL, config_1.circleMeta)];
                            case 30:
                                _u.sent();
                                return [3 /*break*/, 32];
                            case 31:
                                _g = _u.sent();
                                return [3 /*break*/, 32];
                            case 32: return [2 /*return*/];
                            case 33: return [4 /*yield*/, (0, textHandler_1.getTextAction)(message.body)];
                            case 34:
                                action = _u.sent();
                                if (!action) return [3 /*break*/, 77];
                                // Start typing
                                return [4 /*yield*/, client.simulateTyping(message.from, true)];
                            case 35:
                                // Start typing
                                _u.sent();
                                _h = action;
                                switch (_h) {
                                    case textHandler_1.actions.INSTRUCTIONS: return [3 /*break*/, 36];
                                    case textHandler_1.actions.LINK: return [3 /*break*/, 42];
                                    case textHandler_1.actions.MEME_LIST: return [3 /*break*/, 45];
                                    case textHandler_1.actions.STATS: return [3 /*break*/, 48];
                                    case textHandler_1.actions.MEME: return [3 /*break*/, 50];
                                    case textHandler_1.actions.TEXT: return [3 /*break*/, 54];
                                    case textHandler_1.actions.STICKER: return [3 /*break*/, 66];
                                }
                                return [3 /*break*/, 77];
                            case 36:
                                console.log('Sending instructions');
                                if (!message.isGroupMsg) return [3 /*break*/, 39];
                                return [4 /*yield*/, client.getGroupInfo(groupId)];
                            case 37:
                                groupInfo = _u.sent();
                                return [4 /*yield*/, client.sendText(message.from, groupInfo.description)];
                            case 38:
                                _u.sent();
                                return [3 /*break*/, 41];
                            case 39: return [4 /*yield*/, client.sendText(message.from, 'No Group Instructions.')];
                            case 40:
                                _u.sent();
                                _u.label = 41;
                            case 41: return [3 /*break*/, 77];
                            case 42:
                                if (!message.isGroupMsg)
                                    return [2 /*return*/];
                                console.log('Sending Link');
                                _k = (_j = client).sendText;
                                _l = [message.from];
                                return [4 /*yield*/, client.getGroupInviteLink(message.from)];
                            case 43: return [4 /*yield*/, _k.apply(_j, _l.concat([_u.sent()]))];
                            case 44:
                                _u.sent();
                                return [3 /*break*/, 77];
                            case 45:
                                console.log('Sending meme list');
                                _o = (_m = client).sendText;
                                _p = [message.from];
                                return [4 /*yield*/, (0, imgflipHandler_1.getImgflipList)()];
                            case 46: return [4 /*yield*/, _o.apply(_m, _p.concat([_u.sent()]))];
                            case 47:
                                _u.sent();
                                return [3 /*break*/, 77];
                            case 48:
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
                            case 49:
                                _u.sent();
                                return [3 /*break*/, 77];
                            case 50:
                                console.log("Sending (" + message.body.split('\n').join(')(') + ")");
                                ioMemes.inc();
                                return [4 /*yield*/, (0, imgflipHandler_1.getImgflipImage)(message.body)];
                            case 51:
                                url = _u.sent();
                                return [4 /*yield*/, client.sendImage(message.from, url, 'imgflip', url)];
                            case 52:
                                _u.sent();
                                return [4 /*yield*/, client.sendStickerfromUrl(message.from, url, undefined, config_1.stickerMeta)];
                            case 53:
                                _u.sent();
                                return [3 /*break*/, 77];
                            case 54:
                                text = message.body.slice(6);
                                textUrlA = "https://api.xteam.xyz/attp?text=" + encodeURIComponent(text);
                                textUrlS = "https://api.xteam.xyz/ttp?text=" + encodeURIComponent(text);
                                console.log("Sending (" + text + ")");
                                ioStickers.inc();
                                return [4 /*yield*/, axios_1.default.get(textUrlA)];
                            case 55:
                                b64a = _u.sent();
                                return [4 /*yield*/, axios_1.default.get(textUrlS)];
                            case 56:
                                b64s = _u.sent();
                                _u.label = 57;
                            case 57:
                                _u.trys.push([57, 60, , 61]);
                                if (!(b64a.status === 200)) return [3 /*break*/, 59];
                                return [4 /*yield*/, client.sendImageAsSticker(message.from, b64a.data.result, config_1.stickerMeta)];
                            case 58:
                                _u.sent();
                                _u.label = 59;
                            case 59: return [3 /*break*/, 61];
                            case 60:
                                _q = _u.sent();
                                return [3 /*break*/, 61];
                            case 61:
                                _u.trys.push([61, 64, , 65]);
                                if (!(b64s.status === 200)) return [3 /*break*/, 63];
                                return [4 /*yield*/, client.sendImageAsSticker(message.from, b64s.data.result, config_1.stickerMeta)];
                            case 62:
                                _u.sent();
                                _u.label = 63;
                            case 63: return [3 /*break*/, 65];
                            case 64:
                                _r = _u.sent();
                                return [3 /*break*/, 65];
                            case 65: return [3 /*break*/, 77];
                            case 66:
                                searches = (0, stickerHandler_1.getStickerSearches)(message.body);
                                console.log('Sending Stickers for', searches.giphySearch.q);
                                return [4 /*yield*/, (0, giphyHandler_1.getGiphys)(searches.giphySearch)];
                            case 67:
                                giphyURLs = _u.sent();
                                return [4 /*yield*/, (0, tenorHandler_1.getTenors)(searches.tenorSearch)];
                            case 68:
                                tenorURLs = _u.sent();
                                if (!giphyURLs) return [3 /*break*/, 72];
                                _u.label = 69;
                            case 69:
                                _u.trys.push([69, 71, , 72]);
                                return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/giphy.gif', config_1.stickerMeta)];
                            case 70:
                                _u.sent();
                                return [3 /*break*/, 72];
                            case 71:
                                _s = _u.sent();
                                return [3 /*break*/, 72];
                            case 72:
                                if (!tenorURLs) return [3 /*break*/, 76];
                                _u.label = 73;
                            case 73:
                                _u.trys.push([73, 75, , 76]);
                                return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/tenor.png', config_1.stickerMeta)];
                            case 74:
                                _u.sent();
                                return [3 /*break*/, 76];
                            case 75:
                                _t = _u.sent();
                                return [3 /*break*/, 76];
                            case 76:
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
                                return [3 /*break*/, 77];
                            case 77: 
                            // Stop typing
                            return [4 /*yield*/, client.simulateTyping(message.from, false)];
                            case 78:
                                // Stop typing
                                _u.sent();
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
                return [2 /*return*/];
        }
    });
}); };
(0, wa_automate_1.create)(config_1.clientConfig).then(function (client) { return start(client); });
