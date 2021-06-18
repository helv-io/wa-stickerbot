"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imgflip = exports.tenorSearch = exports.giphySearch = exports.mp4StickerConversionOptions = exports.botOptions = exports.clientConfig = exports.circleMeta = exports.stickerMeta = void 0;
// Begin changes here
// https://docs.openwa.dev/modules/api_model_media.html#stickermetadata
exports.stickerMeta = {
    author: 'Helvio',
    pack: 'Sticker Bot',
    keepScale: true
};
exports.circleMeta = {
    author: 'Helvio',
    pack: 'Sticker Bot',
    keepScale: true,
    circle: true
};
// https://docs.openwa.dev/interfaces/api_model.configobject.html
exports.clientConfig = {
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
    chromiumArgs: ['--no-sandbox']
};
// Number of stickers when seraching for multiples
// Interact with Groups only
// Custom Instructions
exports.botOptions = {
    stickers: 10,
    groupsOnly: true,
    interactIn: true,
    interactOut: true,
    inMessage: "meme epic\nMEMES\nNOOB\nBOT",
    outMessage: "meme Left Exit\nMEMES STICKERS TRANSAR\nCROSSFIT E SOLID\u00C3O\nTROUXA QUE SAIU"
};
// https://docs.openwa.dev/modules/api_model_media.html#mp4stickerconversionprocessoptions
exports.mp4StickerConversionOptions = {
    crop: true,
    fps: 10,
    loop: 0,
    log: true,
    startTime: '00:00:00.0',
    endTime: '00:00:15.0'
};
// https://developers.giphy.com/docs/api/endpoint#search
exports.giphySearch = {
    api_key: process.env.GIPHY_API || '',
    lang: 'pt',
    limit: 1,
    q: 'placeholder',
    type: 'gif'
};
// https://tenor.com/gifapi/documentation#endpoints-search
exports.tenorSearch = {
    key: process.env.TENOR_API || '',
    locale: 'pt_BR',
    media_filter: 'minimal',
    limit: 1,
    q: 'placeholder',
    type: 'gif'
};
// https://imgflip.com/api
exports.imgflip = {
    template_id: '',
    boxes: [],
    username: process.env.IMGFLIP_USERNAME || '',
    password: process.env.IMGFLIP_PASSWORD || ''
};
