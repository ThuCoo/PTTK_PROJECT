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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.createUser = createUser;
exports.getMe = getMe;
exports.getAllUsers = getAllUsers;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const UserDAO = __importStar(require("../dao/user.dao"));
const SALT_ROUNDS = 10;
const JWT_EXPIRES = '24h';
async function login(username, password) {
    const userRow = await UserDAO.findByUsername(username);
    if (!userRow) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    const valid = await bcrypt_1.default.compare(password, userRow.password_hash);
    if (!valid) {
        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    const payload = {
        userId: userRow.id,
        username: userRow.username,
        role: userRow.role,
    };
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: JWT_EXPIRES });
    const user = {
        id: userRow.id,
        username: userRow.username,
        ho_ten: userRow.ho_ten,
        role: userRow.role,
        email: userRow.email,
    };
    return { token, user };
}
async function createUser(username, password, hoTen, role, email) {
    const existing = await UserDAO.findByUsername(username);
    if (existing) {
        throw new Error('Tên đăng nhập đã tồn tại');
    }
    if (password.length < 6) {
        throw new Error('Mật khẩu phải có ít nhất 6 ký tự');
    }
    const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
    return UserDAO.createUser(username, passwordHash, hoTen, role, email);
}
async function getMe(userId) {
    return UserDAO.findById(userId);
}
async function getAllUsers() {
    return UserDAO.getAllUsers();
}
