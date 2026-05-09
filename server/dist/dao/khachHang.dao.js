"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.updateStatus = updateStatus;
exports.countAll = countAll;
const db_1 = require("../db");
async function getAll(search, trangThai) {
    let sql = `SELECT * FROM khach_hang WHERE 1=1`;
    const params = [];
    let idx = 1;
    if (search) {
        sql += ` AND (ho_ten ILIKE $${idx} OR sdt ILIKE $${idx} OR email ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
    }
    if (trangThai) {
        sql += ` AND trang_thai = $${idx}`;
        params.push(trangThai);
        idx++;
    }
    sql += ' ORDER BY created_at DESC';
    const result = await (0, db_1.query)(sql, params);
    return result.rows;
}
async function getById(maKhachHang) {
    const result = await (0, db_1.query)('SELECT * FROM khach_hang WHERE ma_khach_hang = $1', [maKhachHang]);
    return result.rows[0] || null;
}
async function create(data) {
    const result = await (0, db_1.query)(`INSERT INTO khach_hang
     (ma_khach_hang, ho_ten, sdt, email, cccd, gioi_tinh)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING *`, [data.ma_khach_hang, data.ho_ten, data.sdt, data.email, data.cccd, data.gioi_tinh]);
    return result.rows[0];
}
async function update(maKhachHang, data) {
    const fields = Object.keys(data).filter(k => k !== 'created_at');
    if (!fields.length)
        return getById(maKhachHang);
    const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const values = fields.map(f => data[f]);
    const result = await (0, db_1.query)(`UPDATE khach_hang SET ${sets} WHERE ma_khach_hang = $1 RETURNING *`, [maKhachHang, ...values]);
    return result.rows[0] || null;
}
async function updateStatus(maKhachHang, trangThai) {
    await (0, db_1.query)('UPDATE khach_hang SET trang_thai = $1 WHERE ma_khach_hang = $2', [trangThai, maKhachHang]);
}
async function countAll() {
    const result = await (0, db_1.query)('SELECT COUNT(*) as count FROM khach_hang');
    return parseInt(result.rows[0].count, 10);
}
