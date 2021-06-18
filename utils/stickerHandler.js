"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStickerSearches = void 0;
var config_1 = require("../config");
var textHandler_1 = require("./textHandler");
var getStickerSearches = function (message) {
    var keywords = textHandler_1.stickerRegExp.exec(message) || [];
    var limit = keywords[2].toLowerCase() === 's' ? config_1.botOptions.stickers : 1;
    var q = keywords[3];
    config_1.giphySearch.limit = limit;
    config_1.tenorSearch.limit = limit;
    config_1.giphySearch.q = q;
    config_1.tenorSearch.q = q;
    return { giphySearch: config_1.giphySearch, tenorSearch: config_1.tenorSearch };
};
exports.getStickerSearches = getStickerSearches;
