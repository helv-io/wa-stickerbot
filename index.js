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
var axios_1 = __importDefault(require("axios"));
console.log('Environment Variables:');
console.log(process.env);
var start = function (client) { return __awaiter(void 0, void 0, void 0, function () {
    var ioImages, ioVideos, ioMemes, ioStickers, ioRefreshes, adminGroups;
    return __generator(this, function (_a) {
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
        // Message Handlers
        void client.onMessage(function (message) { return __awaiter(void 0, void 0, void 0, function () {
            var groupId, media, _a, i, _b, _c, _d, _e, _f, _g, action, _h, groupInfo, _j, _k, _l, _m, _o, _p, stats, url, text, textUrlA, textUrlS, b64a, b64s, _q, _r, searches, giphyURLs, tenorURLs, _s, _t;
            return __generator(this, function (_u) {
                switch (_u.label) {
                    case 0: return [4 /*yield*/, client.iAmAdmin()];
                    case 1:
                        // Refresh adminGroups
                        adminGroups = _u.sent();
                        console.log("Admin in groups: " + JSON.stringify(adminGroups, undefined, 4));
                        groupId = message.chatId;
                        console.log("Group ID: " + groupId);
                        // Skips personal chats unless specified
                        if (!message.isGroupMsg && config_1.botOptions.groupsOnly)
                            return [2 /*return*/];
                        // Skips non-administered groups
                        if (message.isGroupMsg && !adminGroups.includes(groupId))
                            return [2 /*return*/];
                        if (!(message.isGroupMsg && groupId)) return [3 /*break*/, 34];
                        if (!(message.type === wa_automate_1.MessageTypes.IMAGE ||
                            message.type === wa_automate_1.MessageTypes.VIDEO ||
                            message.type === wa_automate_1.MessageTypes.AUDIO ||
                            message.type === wa_automate_1.MessageTypes.VOICE ||
                            message.type === wa_automate_1.MessageTypes.STICKER)) return [3 /*break*/, 34];
                        // Handles Media
                        // Start typing
                        return [4 /*yield*/, client.simulateTyping(message.from, true)];
                    case 2:
                        // Handles Media
                        // Start typing
                        _u.sent();
                        return [4 /*yield*/, (0, mediaHandler_1.getMedia)(message)];
                    case 3:
                        media = _u.sent();
                        if (!(message.type === wa_automate_1.MessageTypes.STICKER)) return [3 /*break*/, 8];
                        _u.label = 4;
                    case 4:
                        _u.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, client.sendImage(message.from, media.dataURL, media.filename, '')];
                    case 5:
                        _u.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        _a = _u.sent();
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 33];
                    case 8:
                        if (!media.filename.endsWith('.mp4')) return [3 /*break*/, 21];
                        // Sends as Video Sticker
                        console.log('MP4/GIF Sticker', media.filename);
                        ioVideos.inc();
                        i = 15;
                        _u.label = 9;
                    case 9:
                        if (!(i > 0)) return [3 /*break*/, 20];
                        _u.label = 10;
                    case 10:
                        _u.trys.push([10, 18, , 19]);
                        _u.label = 11;
                    case 11:
                        _u.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, client.sendMp4AsSticker(message.from, media.dataURL, (0, mediaHandler_1.getConversionOptions)(i), config_1.stickerMeta)];
                    case 12:
                        _u.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        _b = _u.sent();
                        return [3 /*break*/, 14];
                    case 14:
                        _u.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, client.sendMp4AsSticker(message.from, media.dataURL, (0, mediaHandler_1.getConversionOptions)(i), config_1.circleMeta)];
                    case 15:
                        _u.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        _c = _u.sent();
                        return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 20];
                    case 18:
                        _d = _u.sent();
                        console.log("Video is too long. Reducing length.");
                        return [3 /*break*/, 19];
                    case 19:
                        i--;
                        return [3 /*break*/, 9];
                    case 20: return [3 /*break*/, 33];
                    case 21:
                        if (!media.filename.endsWith('.oga')) return [3 /*break*/, 26];
                        _u.label = 22;
                    case 22:
                        _u.trys.push([22, 24, , 25]);
                        return [4 /*yield*/, client.sendPtt(message.from, media.dataURL, 'true_0000000000@c.us_JHB2HB23HJ4B234HJB')];
                    case 23:
                        _u.sent();
                        return [3 /*break*/, 25];
                    case 24:
                        _e = _u.sent();
                        return [3 /*break*/, 25];
                    case 25: return [3 /*break*/, 33];
                    case 26:
                        // Sends as Image sticker
                        console.log('IMAGE Sticker', media.filename);
                        ioImages.inc();
                        _u.label = 27;
                    case 27:
                        _u.trys.push([27, 29, , 30]);
                        return [4 /*yield*/, client.sendImageAsSticker(message.from, media.dataURL, config_1.stickerMeta)];
                    case 28:
                        _u.sent();
                        return [3 /*break*/, 30];
                    case 29:
                        _f = _u.sent();
                        return [3 /*break*/, 30];
                    case 30:
                        _u.trys.push([30, 32, , 33]);
                        return [4 /*yield*/, client.sendImageAsSticker(message.from, media.dataURL, config_1.circleMeta)];
                    case 31:
                        _u.sent();
                        return [3 /*break*/, 33];
                    case 32:
                        _g = _u.sent();
                        return [3 /*break*/, 33];
                    case 33: return [2 /*return*/];
                    case 34: return [4 /*yield*/, (0, textHandler_1.getTextAction)(message.body)];
                    case 35:
                        action = _u.sent();
                        if (!action) return [3 /*break*/, 78];
                        // Start typing
                        return [4 /*yield*/, client.simulateTyping(message.from, true)];
                    case 36:
                        // Start typing
                        _u.sent();
                        _h = action;
                        switch (_h) {
                            case textHandler_1.actions.INSTRUCTIONS: return [3 /*break*/, 37];
                            case textHandler_1.actions.LINK: return [3 /*break*/, 43];
                            case textHandler_1.actions.MEME_LIST: return [3 /*break*/, 46];
                            case textHandler_1.actions.STATS: return [3 /*break*/, 49];
                            case textHandler_1.actions.MEME: return [3 /*break*/, 51];
                            case textHandler_1.actions.TEXT: return [3 /*break*/, 55];
                            case textHandler_1.actions.STICKER: return [3 /*break*/, 67];
                        }
                        return [3 /*break*/, 78];
                    case 37:
                        console.log('Sending instructions');
                        if (!message.isGroupMsg) return [3 /*break*/, 40];
                        return [4 /*yield*/, client.getGroupInfo(groupId)];
                    case 38:
                        groupInfo = _u.sent();
                        return [4 /*yield*/, client.sendText(message.from, groupInfo.description)];
                    case 39:
                        _u.sent();
                        return [3 /*break*/, 42];
                    case 40: return [4 /*yield*/, client.sendText(message.from, 'No Group Instructions.')];
                    case 41:
                        _u.sent();
                        _u.label = 42;
                    case 42: return [3 /*break*/, 78];
                    case 43:
                        if (!message.isGroupMsg)
                            return [2 /*return*/];
                        console.log('Sending Link');
                        _k = (_j = client).sendText;
                        _l = [message.from];
                        return [4 /*yield*/, client.getGroupInviteLink(message.from)];
                    case 44: return [4 /*yield*/, _k.apply(_j, _l.concat([_u.sent()]))];
                    case 45:
                        _u.sent();
                        return [3 /*break*/, 78];
                    case 46:
                        console.log('Sending meme list');
                        _o = (_m = client).sendText;
                        _p = [message.from];
                        return [4 /*yield*/, (0, imgflipHandler_1.getImgflipList)()];
                    case 47: return [4 /*yield*/, _o.apply(_m, _p.concat([_u.sent()]))];
                    case 48:
                        _u.sent();
                        return [3 /*break*/, 78];
                    case 49:
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
                    case 50:
                        _u.sent();
                        return [3 /*break*/, 78];
                    case 51:
                        console.log("Sending (" + message.body.split('\n').join(')(') + ")");
                        ioMemes.inc();
                        return [4 /*yield*/, (0, imgflipHandler_1.getImgflipImage)(message.body)];
                    case 52:
                        url = _u.sent();
                        return [4 /*yield*/, client.sendImage(message.from, url, 'imgflip', url)];
                    case 53:
                        _u.sent();
                        return [4 /*yield*/, client.sendStickerfromUrl(message.from, url, undefined, config_1.stickerMeta)];
                    case 54:
                        _u.sent();
                        return [3 /*break*/, 78];
                    case 55:
                        text = message.body.slice(6);
                        textUrlA = "https://api.xteam.xyz/attp?text=" + encodeURIComponent(text);
                        textUrlS = "https://api.xteam.xyz/ttp?text=" + encodeURIComponent(text);
                        console.log("Sending (" + text + ")");
                        ioStickers.inc();
                        return [4 /*yield*/, axios_1.default.get(textUrlA)];
                    case 56:
                        b64a = _u.sent();
                        return [4 /*yield*/, axios_1.default.get(textUrlS)];
                    case 57:
                        b64s = _u.sent();
                        _u.label = 58;
                    case 58:
                        _u.trys.push([58, 61, , 62]);
                        if (!(b64a.status === 200)) return [3 /*break*/, 60];
                        return [4 /*yield*/, client.sendImageAsSticker(message.from, b64a.data.result, config_1.stickerMeta)];
                    case 59:
                        _u.sent();
                        _u.label = 60;
                    case 60: return [3 /*break*/, 62];
                    case 61:
                        _q = _u.sent();
                        return [3 /*break*/, 62];
                    case 62:
                        _u.trys.push([62, 65, , 66]);
                        if (!(b64s.status === 200)) return [3 /*break*/, 64];
                        return [4 /*yield*/, client.sendImageAsSticker(message.from, b64s.data.result, config_1.stickerMeta)];
                    case 63:
                        _u.sent();
                        _u.label = 64;
                    case 64: return [3 /*break*/, 66];
                    case 65:
                        _r = _u.sent();
                        return [3 /*break*/, 66];
                    case 66: return [3 /*break*/, 78];
                    case 67:
                        searches = (0, stickerHandler_1.getStickerSearches)(message.body);
                        console.log('Sending Stickers for', searches.giphySearch.q);
                        return [4 /*yield*/, (0, giphyHandler_1.getGiphys)(searches.giphySearch)];
                    case 68:
                        giphyURLs = _u.sent();
                        return [4 /*yield*/, (0, tenorHandler_1.getTenors)(searches.tenorSearch)];
                    case 69:
                        tenorURLs = _u.sent();
                        if (!giphyURLs) return [3 /*break*/, 73];
                        _u.label = 70;
                    case 70:
                        _u.trys.push([70, 72, , 73]);
                        return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/giphy.gif', config_1.stickerMeta)];
                    case 71:
                        _u.sent();
                        return [3 /*break*/, 73];
                    case 72:
                        _s = _u.sent();
                        return [3 /*break*/, 73];
                    case 73:
                        if (!tenorURLs) return [3 /*break*/, 77];
                        _u.label = 74;
                    case 74:
                        _u.trys.push([74, 76, , 77]);
                        return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/tenor.png', config_1.stickerMeta)];
                    case 75:
                        _u.sent();
                        return [3 /*break*/, 77];
                    case 76:
                        _t = _u.sent();
                        return [3 /*break*/, 77];
                    case 77:
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
                        return [3 /*break*/, 78];
                    case 78: 
                    // Stop typing
                    return [4 /*yield*/, client.simulateTyping(message.from, false)];
                    case 79:
                        // Stop typing
                        _u.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Participants Handler
        // registerParticipantsListener(client)
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
    });
}); };
(0, wa_automate_1.create)(config_1.clientConfig).then(function (client) { return start(client); });
