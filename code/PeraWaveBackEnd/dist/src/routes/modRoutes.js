"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modController_1 = require("../controllers/modController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
router.get('/users', authMiddleware_1.requireModerator, modController_1.getUsers);
router.get('/moderators', authMiddleware_1.requireModerator, modController_1.getModerators);
router.post('/users/warn', authMiddleware_1.requireModerator, modController_1.warnUser);
router.post('/users/suspend', authMiddleware_1.requireModerator, modController_1.suspendUser);
router.post('/users/delete', authMiddleware_1.requireModerator, modController_1.deleteUser);
router.get('/audit-logs', authMiddleware_1.requireModerator, modController_1.getModerationActions);
router.get('/stats', authMiddleware_1.requireModerator, modController_1.getPlatformStats);
exports.default = router;
