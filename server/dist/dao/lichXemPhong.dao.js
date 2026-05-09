"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.create = create;
exports.updateStatus = updateStatus;
exports.getTodayAppointments = getTodayAppointments;
const db_1 = require("../db");
async function getAll(date) {
    let sql = `
    SELECT l.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
    FROM lich_xem_phong l
    LEFT JOIN khach_hang k ON l.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phong p ON l.ma_phong = p.ma_phong
    WHERE 1=1
  `;
    const params = [];
    if (date) {
        sql += ` AND DATE(l.thoi_gian) = $1`;
        params.push(date);
    }
    sql += ' ORDER BY l.thoi_gian ASC';
    const result = await (0, db_1.query)(sql, params);
    return result.rows;
}
async function getById(id) {
    const result = await (0, db_1.query)(`SELECT l.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM lich_xem_phong l
     LEFT JOIN khach_hang k ON l.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON l.ma_phong = p.ma_phong
     WHERE l.ma_lich = $1`, [id]);
    return result.rows[0] || null;
}
async function create(data) {
    const result = await (0, db_1.query)(`INSERT INTO lich_xem_phong (ma_lich, ma_khach_hang, ma_phong, thoi_gian, ghi_chu)
     VALUES (md5(random()::text || clock_timestamp()::text), $1, $2, $3, $4) RETURNING *`, [data.ma_khach_hang, data.ma_phong || null, data.thoi_gian, data.ghi_chu]);
    return result.rows[0];
}
async function updateStatus(maLich, trangThai) {
    await (0, db_1.query)('UPDATE lich_xem_phong SET trang_thai = $1 WHERE ma_lich = $2', [trangThai, maLich]);
}
async function getTodayAppointments() {
    const result = await (0, db_1.query)(`SELECT l.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM lich_xem_phong l
     LEFT JOIN khach_hang k ON l.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON l.ma_phong = p.ma_phong
     WHERE DATE(l.thoi_gian) = CURRENT_DATE
     ORDER BY l.thoi_gian ASC`);
    return result.rows;
}
