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
exports.registerParticipantsListener = exports.paramSerializer = void 0;
var qs_1 = __importDefault(require("qs"));
var config_1 = require("../config");
var imgflipHandler_1 = require("./imgflipHandler");
var paramSerializer = function (p) {
    return qs_1.default.stringify(p, { arrayFormat: 'brackets' });
};
exports.paramSerializer = paramSerializer;
var registerParticipantsListener = function (client) {
    client.onGlobalParticipantsChanged(function (event) { return __awaiter(void 0, void 0, void 0, function () {
        var groupId, _a, _b, _c, _d, _e, _f, _g, groupInfo;
        return __generator(this, function (_h) {
            switch (_h.label) {
                case 0:
                    groupId = event.chat;
                    _a = event.action;
                    switch (_a) {
                        case 'remove': return [3 /*break*/, 1];
                        case 'add': return [3 /*break*/, 4];
                    }
                    return [3 /*break*/, 8];
                case 1:
                    console.log('Removed', event.who);
                    if (!config_1.botOptions.interactOut) return [3 /*break*/, 3];
                    _c = (_b = client).sendImage;
                    _d = [groupId];
                    return [4 /*yield*/, imgflipHandler_1.getImgflipImage(config_1.botOptions.outMessage)];
                case 2:
                    _c.apply(_b, _d.concat([_h.sent(), '', "Adeus +" + event.who.toString().split('@')[0] + ", vai tarde!"]));
                    _h.label = 3;
                case 3: return [3 /*break*/, 8];
                case 4:
                    console.log('Added', event.who);
                    if (!config_1.botOptions.interactOut) return [3 /*break*/, 7];
                    _f = (_e = client).sendImage;
                    _g = [groupId];
                    return [4 /*yield*/, imgflipHandler_1.getImgflipImage(config_1.botOptions.inMessage)];
                case 5:
                    _f.apply(_e, _g.concat([_h.sent(), '', "Divirta-se, +" + event.who.toString().split('@')[0] + "!"]));
                    return [4 /*yield*/, client.getGroupInfo(groupId)];
                case 6:
                    groupInfo = _h.sent();
                    client.sendText(groupId, groupInfo.description);
                    _h.label = 7;
                case 7: return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); });
};
exports.registerParticipantsListener = registerParticipantsListener;
