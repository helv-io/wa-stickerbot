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
var model_1 = require("@open-wa/wa-automate/dist/api/model");
var mime_types_1 = __importDefault(require("mime-types"));
var axios_1 = __importDefault(require("axios"));
var qs_1 = __importDefault(require("qs"));
var normalize_diacritics_1 = require("normalize-diacritics");
var paramSerializer = function (p) {
    return qs_1.default.stringify(p, { arrayFormat: 'brackets' });
};
var meta = {
    author: 'Helvio',
    pack: 'Sticker Bot',
    keepScale: true,
};
var config = {
    sessionId: 'sticker_bot',
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
    sessionData: process.env.SESSION_DATA,
};
var videoOpts = {
    crop: true,
    fps: 10,
    loop: 0,
    log: true,
    startTime: '00:00:00.0',
    endTime: '00:00:15.0',
};
var giphySearch = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    api_key: process.env.GIPHY_API || '',
    lang: 'pt',
    limit: 1,
    q: 'placeholder',
    type: 'gif',
};
var tenorSearch = {
    key: process.env.TENOR_API || '',
    locale: 'pt_BR',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    media_filter: 'minimal',
    limit: 1,
    q: 'placeholder',
    type: 'gif',
};
var imgflip = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    template_id: '',
    boxes: [],
    username: process.env.IMGFLIP_USERNAME || '',
    password: process.env.IMGFLIP_PASSWORD || '',
};
// Don't change anything starting from here
var start = function (client) {
    // Log all participant changes
    void client.getAllGroups().then(function (groups) {
        console.log(JSON.stringify(groups, null, 4));
        groups.forEach(function (group) {
            var user1 = parseInt(group.id.user.split('-')[0], 10);
            var user2 = parseInt(group.id.user.split('-')[2], 10);
            var groupId = user1 + "-" + user2 + "@g.us";
            void client.onParticipantsChanged(groupId, function (event) {
                console.log(JSON.stringify(event, null, 4));
            });
        });
    });
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    void client.onMessage(function (message) { return __awaiter(void 0, void 0, void 0, function () {
        var filename, mediaData, dataURL, i, _a, keywords, response, memes, response_1, giphys, stickers, data, tenors, maker_1, memes, meme, i, p, url;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    // Skips personal chats
                    if (!message.isGroupMsg) {
                        return [2 /*return*/];
                    }
                    if (!(message.type === model_1.MessageTypes.IMAGE ||
                        message.type === model_1.MessageTypes.VIDEO)) return [3 /*break*/, 11];
                    filename = message.t + "." + (mime_types_1.default.extension(message.mimetype || '') || '');
                    return [4 /*yield*/, wa_automate_1.decryptMedia(message)];
                case 1:
                    mediaData = _b.sent();
                    dataURL = "data:" + (message.mimetype || '') + ";base64," + mediaData.toString('base64');
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
                    // Sends as Image sticker
                    console.log('IMAGE Sticker', filename);
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, dataURL, meta)];
                case 9:
                    void (_b.sent());
                    _b.label = 10;
                case 10: return [3 /*break*/, 23];
                case 11:
                    keywords = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i.exec(message.body);
                    // Send Usage Instructions
                    if (normalize_diacritics_1.normalizeSync(message.body.toLowerCase()) === 'instrucoes') {
                        response = "\n*Como falar com o  Bot*\n1\uFE0F\u20E3 \"STICKER(S)/FIGURINHA(S) DE ________\"\n_o bot vai mandar 3 stickers do tema pedido quando sticker/figurinha estiver no singular e 30 no plural_\n2\uFE0F\u20E3 \u201CMEMES\"\n_o bot vai enviar a lista de memes dispon\u00EDveis para serem feitos_\n3\uFE0F\u20E3 \u201Cmeme ________\"\n_para fazer o meme, \u00E9 preciso que voc\u00EA digite na primeira linha \"meme + nome do meme\" e nas pr\u00F3ximas linhas, dando enter, o n\u00FAmero de frases pelo qual o meme \u00E9 composto_\nEX:\nmeme drake hotline bling\nfazer stickers sozinho\ndeixar o bot fazer tudo\n";
                        void client.sendText(message.from, response);
                        return [2 /*return*/];
                    }
                    if (!(message.body.toLowerCase() === 'memes')) return [3 /*break*/, 13];
                    return [4 /*yield*/, axios_1.default.get('https://api.imgflip.com/get_memes')];
                case 12:
                    memes = (_b.sent()).data.data.memes;
                    response_1 = '';
                    memes.forEach(function (meme) { return (response_1 += meme.name + " (" + meme.box_count + ")\n"); });
                    void client.sendText(message.from, response_1);
                    return [2 /*return*/];
                case 13:
                    if (!(keywords !== null)) return [3 /*break*/, 20];
                    giphySearch.limit = keywords[2].toLowerCase() === 's' ? 10 : 1;
                    giphySearch.q = keywords[3];
                    tenorSearch.limit = giphySearch.limit;
                    tenorSearch.q = giphySearch.q;
                    videoOpts.crop = false;
                    console.log('Searching for', giphySearch.q);
                    // Attributions
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/giphy.gif', meta)];
                case 14:
                    // Attributions
                    _b.sent();
                    return [4 /*yield*/, client.sendImageAsSticker(message.from, 'attributions/tenor.png', meta)];
                case 15:
                    _b.sent();
                    if (!giphySearch.api_key) return [3 /*break*/, 18];
                    return [4 /*yield*/, axios_1.default.get("https://api.giphy.com/v1/gifs/search", {
                            params: giphySearch,
                        })];
                case 16:
                    giphys = (_b.sent()).data;
                    return [4 /*yield*/, axios_1.default.get("https://api.giphy.com/v1/stickers/search", {
                            params: giphySearch,
                        })];
                case 17:
                    stickers = (_b.sent()).data;
                    data = giphys.data.concat(stickers.data);
                    data.forEach(function (giphy) {
                        var url = giphy.images.original.webp.replace(/media[0-9]/, 'i');
                        var size = giphy.images.original.webp_size;
                        var altUrl = giphy.images.fixed_width.webp.replace(/media[0-9]/, 'i');
                        var altSize = giphy.images.fixed_width.webp_size;
                        try {
                            if (size <= '1400000') {
                                console.log(size, url);
                                void client.sendStickerfromUrl(message.from, url, undefined, meta);
                            }
                            else if (altSize <= '1400000') {
                                console.log(altSize, altUrl);
                                void client.sendStickerfromUrl(message.from, altUrl, undefined, meta);
                            }
                        }
                        catch (_a) {
                            console.log('Sticker too big:', size, altSize);
                        }
                    });
                    _b.label = 18;
                case 18:
                    if (!tenorSearch.key) return [3 /*break*/, 20];
                    return [4 /*yield*/, axios_1.default.get('https://g.tenor.com/v1/search', {
                            params: tenorSearch,
                        })];
                case 19:
                    tenors = (_b.sent()).data;
                    tenors.results.forEach(function (tenor) {
                        var url = tenor.media[0].gif.url;
                        var size = tenor.media[0].gif.size;
                        var altUrl = tenor.media[0].tinygif.url;
                        var altSize = tenor.media[0].tinygif.size;
                        try {
                            if (size <= 1400000) {
                                console.log(size, url);
                                void client.sendStickerfromUrl(message.from, url, undefined, meta);
                            }
                            else if (altSize <= 1400000) {
                                console.log(altSize, altUrl);
                                void client.sendStickerfromUrl(message.from, altUrl, undefined, meta);
                            }
                        }
                        catch (_a) {
                            console.log('Sticker too big:', size, altSize);
                        }
                    });
                    _b.label = 20;
                case 20:
                    maker_1 = message.body.split('\n');
                    if (!(maker_1[0].toLowerCase().includes('meme ') && imgflip.username)) return [3 /*break*/, 23];
                    return [4 /*yield*/, axios_1.default.get('https://api.imgflip.com/get_memes')];
                case 21:
                    memes = (_b.sent()).data.data.memes;
                    meme = memes.find(function (m) {
                        var name = m.name;
                        return name
                            .toLowerCase()
                            .includes(maker_1[0].toLowerCase().replace('meme ', ''));
                    });
                    if (!(meme && meme.box_count <= maker_1.length - 1)) return [3 /*break*/, 23];
                    imgflip.template_id = meme.id;
                    imgflip.boxes = [];
                    for (i = 1; i < maker_1.length; i++) {
                        imgflip.boxes.push({ text: maker_1[i] });
                    }
                    console.log(meme.name, "(" + maker_1.join(') (') + ")");
                    p = paramSerializer(imgflip);
                    return [4 /*yield*/, axios_1.default.get("https://api.imgflip.com/caption_image?" + p)];
                case 22:
                    url = (_b.sent()).data.data.url || '';
                    console.log(url);
                    void client.sendStickerfromUrl(message.from, url, undefined, meta);
                    void client.sendImage(message.from, url, maker_1[0], url);
                    _b.label = 23;
                case 23: return [2 /*return*/];
            }
        });
    }); });
    // Click "Use Here" when another WhatsApp Web page is open
    void client.onStateChanged(function (state) {
        if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
            void client.forceRefocus();
        }
    });
};
void wa_automate_1.create(config).then(function (client) { return start(client); });
