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
const HopDongBUS = __importStar(require("../bus/hopDong.bus"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.get("/return-ready", async (_req, res) => {
    try {
        const data = await HopDongBUS.getReturnReady();
        res.json({ success: true, data });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get("/", async (req, res) => {
    try {
        const { search, trang_thai } = req.query;
        res.json({
            success: true,
            data: await HopDongBUS.getAll(search, trang_thai),
        });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get("/stats", async (_req, res) => {
    try {
        res.json({ success: true, data: await HopDongBUS.getStats() });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
router.get("/:id", async (req, res) => {
    try {
        res.json({
            success: true,
            data: await HopDongBUS.getById(req.params.id),
        });
    }
    catch (err) {
        res.status(404).json({ success: false, error: err.message });
    }
});
router.post("/", async (req, res) => {
    try {
        const data = await HopDongBUS.create(req.body);
        res.status(201).json({ success: true, data });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.post("/:id/sign", async (req, res) => {
    try {
        await HopDongBUS.sign(req.params.id);
        res.json({ success: true, message: "Hợp đồng đã ký thành công" });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.post("/:id/terminate", auth_1.requireQl, async (req, res) => {
    try {
        await HopDongBUS.terminate(req.params.id);
        res.json({ success: true, message: "Hợp đồng đã kết thúc" });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.post("/:id/room-return", async (req, res) => {
    try {
        const { roomReportNotes } = req.body;
        const result = await HopDongBUS.roomReturn(parseInt(req.params.id), roomReportNotes);
        res.json({ success: true, data: result });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
router.post("/:id/members", async (req, res) => {
    try {
        await HopDongBUS.addGroupMembers(parseInt(req.params.id), req.body.members || []);
        res.json({ success: true, message: "Đã thêm thành viên nhóm" });
    }
    catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});
exports.default = router;
