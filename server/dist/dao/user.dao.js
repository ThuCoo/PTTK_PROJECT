"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findByUsername = findByUsername;
exports.findById = findById;
exports.getAllUsers = getAllUsers;
exports.createUser = createUser;
const db_1 = require("../db");
async function findByUsername(username) {
    const result = await (0, db_1.query)('SELECT id, username, password_hash, ho_ten, role, email FROM users WHERE username = $1', [username]);
    return result.rows[0] || null;
}
async function findById(id) {
    const result = await (0, db_1.query)('SELECT id, username, ho_ten, role, email FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
}
async function getAllUsers() {
    const result = await (0, db_1.query)('SELECT id, username, ho_ten, role, email, created_at FROM users ORDER BY id');
    return result.rows;
}
async function createUser(username, passwordHash, hoTen, role, email) {
    const result = await (0, db_1.query)(`INSERT INTO users (username, password_hash, ho_ten, role, email)
     VALUES ($1, $2, $3, $4, $5) RETURNING id, username, ho_ten, role, email`, [username, passwordHash, hoTen, role, email]);
    return result.rows[0];
}
