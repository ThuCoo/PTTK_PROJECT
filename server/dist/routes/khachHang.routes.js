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
const KhachHangBUS = __importStar(require("../bus/khachHang.bus"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get('/', async (req, res) => {
    try {
        const { search, trang_thai } = req.query;
        const data = await KhachHangBUS.getAll(search, trang_thai);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const data = await KhachHangBUS.getById(req.params.id);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});
router.post('/', async (req, res) => {
    try {
        const data = await KhachHangBUS.create(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const data = await KhachHangBUS.update(req.params.id, req.body);
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.patch('/:id/status', async (req, res) => {
    try {
        await KhachHangBUS.updateStatus(req.params.id, req.body.trang_thai);
        res.json({ success: true, message: 'Cập nhật trạng thái thành công' });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
