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
Object.defineProperty(exports, "__esModule", { value: true });
exports.actions = exports.getTextAction = exports.stickerRegExp = void 0;
var normalize_diacritics_1 = require("normalize-diacritics");
exports.stickerRegExp = /(sticker|figurinha)(s?) d[a|e|o]s? (.*)/i;
var getTextAction = function (message) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!message) return [3 /*break*/, 2];
                return [4 /*yield*/, normalize_diacritics_1.normalize(message.toLowerCase())];
            case 1:
                message = _a.sent();
                if (message === 'stats')
                    return [2 /*return*/, actions.STATS];
                if (message === 'memes')
                    return [2 /*return*/, actions.MEME_LIST];
                if (message === 'link')
                    return [2 /*return*/, actions.LINK];
                if (message === 'instrucoes' || message === 'rtfm')
                    return [2 /*return*/, actions.INSTRUCTIONS];
                if (exports.stickerRegExp.exec(message))
                    return [2 /*return*/, actions.STICKER];
                if (message.startsWith('meme '))
                    return [2 /*return*/, actions.MEME];
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
exports.getTextAction = getTextAction;
var actions;
(function (actions) {
    actions[actions["MEME_LIST"] = 1] = "MEME_LIST";
    actions[actions["MEME"] = 2] = "MEME";
    actions[actions["INSTRUCTIONS"] = 3] = "INSTRUCTIONS";
    actions[actions["STICKER"] = 4] = "STICKER";
    actions[actions["LINK"] = 5] = "LINK";
    actions[actions["STATS"] = 6] = "STATS";
})(actions = exports.actions || (exports.actions = {}));
