"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const modController_1 = require("../controllers/modController");
const router = express_1.default.Router();
router.get('/users', modController_1.getUsers);
router.post('/users/warn', modController_1.warnUser);
router.post('/users/suspend', modController_1.suspendUser);
router.post('/users/delete', modController_1.deleteUser);
exports.default = router;
