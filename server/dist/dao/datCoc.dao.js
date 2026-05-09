"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.getByMaCoc = getByMaCoc;
exports.create = create;
exports.uploadProof = uploadProof;
exports.confirm = confirm;
exports.reject = reject;
exports.refund = refund;
exports.cancel = cancel;
exports.markOverdue = markOverdue;
exports.getStats = getStats;
const db_1 = require("../db");
async function getAll(search, trangThai) {
    let sql = `
    SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
    FROM dat_coc d
    LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phong p ON d.ma_phong = p.ma_phong
    WHERE 1=1
  `;
    const params = [];
    let idx = 1;
    if (search) {
        sql += ` AND (d.ma_coc ILIKE $${idx} OR k.ho_ten ILIKE $${idx} OR k.phone ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
    }
    if (trangThai) {
        sql += ` AND d.trang_thai = $${idx++}`;
        params.push(trangThai);
    }
    sql += " ORDER BY d.ngay_tao DESC";
    // Exclude encrypted image data from list view for performance
    const result = await (0, db_1.query)(sql, params);
    return result.rows.map((r) => ({ ...r, anh_chung_tu_encrypted: undefined }));
}
async function getById(id) {
    const result = await (0, db_1.query)(`SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM dat_coc d
     LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON d.ma_phong = p.ma_phong
     WHERE d.ma_coc = $1`, [id]);
    return result.rows[0] || null;
}
async function getByMaCoc(maCoc) {
    const result = await (0, db_1.query)(`SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong, k.so_nguoi as num_people
     FROM dat_coc d
     LEFT JOIN khach_hang k ON d.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phong p ON d.ma_phong = p.ma_phong
     WHERE d.ma_coc = $1 OR k.sdt = $1`, [maCoc]);
    return result.rows[0] || null;
}
async function create(data) {
    const result = await (0, db_1.query)(`INSERT INTO dat_coc (ma_coc, ma_khach_hang, ma_phong, so_giuong, so_tien, han_thanh_toan)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [
        data.ma_coc,
        data.ma_khach_hang,
        data.ma_phong,
        data.so_giuong,
        data.so_tien,
        data.han_thanh_toan,
    ]);
    return result.rows[0];
}
async function uploadProof(id, encryptedData, mimeType, phuongThuc) {
    await (0, db_1.query)(`UPDATE dat_coc
     SET anh_chung_tu_encrypted=$1,
         mime_type=$2,
         phuong_thuc=$3,
         trang_thai='Đang xử lý',
         ghi_chu=NULL,
         nguoi_xac_nhan=NULL,
         ngay_xac_nhan=NULL
     WHERE ma_coc=$4`, [encryptedData, mimeType, phuongThuc, id]);
}
async function confirm(id, nguoiXacNhan) {
    await (0, db_1.query)(`UPDATE dat_coc SET trang_thai='Đã xác nhận', nguoi_xac_nhan=$1, ngay_xac_nhan=NOW() WHERE ma_coc=$2`, [nguoiXacNhan, id]);
}
async function reject(id, ghiChu) {
    await (0, db_1.query)(`UPDATE dat_coc
     SET trang_thai='Không hợp lệ',
         ghi_chu=$1
     WHERE ma_coc=$2`, [ghiChu, id]);
}
async function refund(id, ghiChu) {
    await (0, db_1.query)(`UPDATE dat_coc
     SET trang_thai='Hoàn tiền',
         ghi_chu=$1,
         nguoi_xac_nhan=NULL,
         ngay_xac_nhan=NULL
     WHERE ma_coc=$2`, [ghiChu, id]);
}
async function cancel(id) {
    await (0, db_1.query)(`UPDATE dat_coc SET trang_thai='Quá hạn thanh toán' WHERE ma_coc=$1`, [id]);
}
async function markOverdue() {
    const result = await (0, db_1.query)(`UPDATE dat_coc
     SET trang_thai='Quá hạn thanh toán'
     WHERE trang_thai='Chờ thanh toán'
       AND han_thanh_toan < NOW()
     RETURNING ma_coc as id, ma_phong as phong_id`);
    return result.rows;
}
async function getStats() {
    const result = await (0, db_1.query)(`SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ thanh toán') as cho_thanh_toan,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang xử lý') as dang_xu_ly,
       COUNT(*) FILTER (WHERE trang_thai = 'Không hợp lệ') as khong_hop_le,
       COUNT(*) FILTER (WHERE trang_thai = 'Đã xác nhận') as da_xac_nhan,
       COUNT(*) FILTER (WHERE trang_thai IN ('Quá hạn thanh toán', 'Đã hủy (quá hạn)')) as qua_han,
       COUNT(*) FILTER (WHERE trang_thai = 'Hoàn tiền') as hoan_tien
     FROM dat_coc`);
    const r = result.rows[0];
    return {
        tong: parseInt(r.tong, 10),
        cho_thanh_toan: parseInt(r.cho_thanh_toan, 10),
        dang_xu_ly: parseInt(r.dang_xu_ly, 10),
        khong_hop_le: parseInt(r.khong_hop_le, 10),
        da_xac_nhan: parseInt(r.da_xac_nhan, 10),
        qua_han: parseInt(r.qua_han, 10),
        hoan_tien: parseInt(r.hoan_tien, 10),
    };
}
