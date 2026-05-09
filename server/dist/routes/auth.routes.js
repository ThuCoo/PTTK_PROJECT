"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthBUS = __importStar(require("../bus/auth.bus"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400).json({ success: false, error: 'Tên đăng nhập và mật khẩu là bắt buộc' });
            return;
        }
        const result = await AuthBUS.login(username, password);
        res.json({ success: true, data: result });
    }
    catch (err) {
        res.status(401).json({ success: false, error: err.message });
    }
});
// GET /api/auth/me
router.get('/me', auth_1.authMiddleware, async (req, res) => {
    try {
        const user = await AuthBUS.getMe(req.user.userId);
        res.json({ success: true, data: user });
    }
    catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});
// POST /api/auth/users (quan_ly only)
router.post('/users', auth_1.authMiddleware, auth_1.requireQl, async (req, res) => {
    try {
        const { username, password, ho_ten, role, email } = req.body;
        const user = await AuthBUS.createUser(username, password, ho_ten, role, email);
        res.status(201).json({ success: true, data: user });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
// GET /api/auth/users (quan_ly only)
router.get('/users', auth_1.authMiddleware, auth_1.requireQl, async (_req, res) => {
    try {
        const users = await AuthBUS.getAllUsers();
        res.json({ success: true, data: users });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
exports.default = router;
