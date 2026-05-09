"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.getByMaPhong = getByMaPhong;
exports.updateStatus = updateStatus;
exports.incrementOccupied = incrementOccupied;
exports.getStats = getStats;
const db_1 = require("../db");
async function getAll(khuVuc, trangThai, search) {
    let sql = 'SELECT * FROM phong WHERE 1=1';
    const params = [];
    let idx = 1;
    if (khuVuc) {
        sql += ` AND khu_vuc = $${idx++}`;
        params.push(khuVuc);
    }
    if (trangThai) {
        sql += ` AND trang_thai = $${idx++}`;
        params.push(trangThai);
    }
    if (search) {
        sql += ` AND ma_phong ILIKE $${idx++}`;
        params.push(`%${search}%`);
    }
    sql += ' ORDER BY ma_phong';
    const result = await (0, db_1.query)(sql, params);
    return result.rows;
}
async function getById(maPhong) {
    const result = await (0, db_1.query)('SELECT * FROM phong WHERE ma_phong = $1', [maPhong]);
    return result.rows[0] || null;
}
async function getByMaPhong(maPhong) {
    const result = await (0, db_1.query)('SELECT * FROM phong WHERE ma_phong = $1', [maPhong]);
    return result.rows[0] || null;
}
async function updateStatus(maPhong, trangThai) {
    await (0, db_1.query)('UPDATE phong SET trang_thai = $1 WHERE ma_phong = $2', [trangThai, maPhong]);
}
async function incrementOccupied(maPhong, delta) {
    await (0, db_1.query)(`UPDATE phong SET dang_o = GREATEST(0, LEAST(suc_chua_toi_da, dang_o + $1)) WHERE ma_phong = $2`, [delta, maPhong]);
}
async function getStats() {
    const result = await (0, db_1.query)(`SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang sử dụng') as dang_thue,
       COUNT(*) FILTER (WHERE trang_thai = 'Trống') as trong
     FROM phong`);
    return {
        tong: parseInt(result.rows[0].tong, 10),
        dang_thue: parseInt(result.rows[0].dang_thue, 10),
        trong: parseInt(result.rows[0].trong, 10),
    };
}
