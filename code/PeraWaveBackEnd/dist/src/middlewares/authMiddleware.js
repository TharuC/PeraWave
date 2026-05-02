"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireModerator = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};
exports.verifyToken = verifyToken;
const requireModerator = (req, res, next) => {
    (0, exports.verifyToken)(req, res, () => {
        if (req.user && (req.user.role === 'MODERATOR' || req.user.role === 'SUPER_ADMIN')) {
            next();
        }
        else {
            return res.status(403).json({ error: 'Access denied. Moderator privileges required.' });
        }
    });
};
exports.requireModerator = requireModerator;
