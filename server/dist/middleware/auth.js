"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.requireQl = requireQl;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Không có token xác thực' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = payload;
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
}
/** Only allow quan_ly role */
function requireQl(req, res, next) {
    if (req.user?.role !== 'quan_ly') {
        res.status(403).json({ success: false, error: 'Chỉ Quản lý mới có quyền thực hiện' });
        return;
    }
    next();
}
