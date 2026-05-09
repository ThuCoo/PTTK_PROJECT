"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.getById = getById;
exports.create = create;
exports.uploadProof = uploadProof;
exports.confirm = confirm;
exports.reject = reject;
exports.refund = refund;
exports.markOverdue = markOverdue;
exports.getStats = getStats;
exports.getAllPhieuDangKy = getAllPhieuDangKy;
const db_1 = require("../db");
async function getAll(search, trangThai) {
    let sql = `
    SELECT h.ma_hoa_don as id, h.ma_hoa_don as ma_coc, h.so_tien_coc as so_tien,
           h.trang_thai as trang_thai, h.thoi_gian_coc as ngay_tao, h.ma_nv_ke_toan as nguoi_xac_nhan,
           k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong as ma_phong,
           dk.ma_khach_hang as khach_hang_id, dk.ma_phieu_dk as ma_phieu
    FROM hoa_don_coc h
    LEFT JOIN phieu_dang_ky dk ON h.ma_phieu_dk = dk.ma_phieu_dk
    LEFT JOIN khach_hang k ON dk.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
    LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
    WHERE 1=1
  `;
    const params = [];
    let idx = 1;
    if (search) {
        sql += ` AND (h.MaHoaDon ILIKE $${idx} OR k.HoTen ILIKE $${idx} OR k.Sdt ILIKE $${idx})`;
        params.push(`%${search}%`);
        idx++;
    }
    if (trangThai) {
        sql += ` AND h.TrangThai = $${idx++}`;
        params.push(trangThai);
    }
    sql += " ORDER BY h.ThoiGianCoc DESC";
    const result = await (0, db_1.query)(sql, params);
    return result.rows.map(r => ({
        id: r.id, ma_coc: r.ma_coc, khach_hang_id: r.khach_hang_id, phong_id: r.ma_phong,
        so_giuong: 1,
        so_tien: parseFloat(r.so_tien),
        ngay_tao: r.ngay_tao, trang_thai: r.trang_thai,
        ten_khach: r.ten_khach, phone_khach: r.phone_khach, ma_phong: r.ma_phong,
        nguoi_xac_nhan: r.nguoi_xac_nhan
    }));
}
async function getById(id) {
    const result = await (0, db_1.query)(`SELECT h.*, h.ma_hoa_don as ma_coc, h.trang_thai as trang_thai, h.so_tien_coc as so_tien,
            dk.ma_khach_hang as khach_hang_id,
            k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong as ma_phong,
            gd.ma_chung_tu as anh_chung_tu_encrypted, gd.phuong_thuc as phuong_thuc, gd.noi_dung as ghi_chu
     FROM hoa_don_coc h
     LEFT JOIN phieu_dang_ky dk ON h.ma_phieu_dk = dk.ma_phieu_dk
     LEFT JOIN khach_hang k ON dk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
     LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
     LEFT JOIN thong_tin_gd gd ON h.ma_hoa_don = gd.ma_hoa_don
     WHERE h.ma_hoa_don = $1`, [id]);
    if (!result.rows[0])
        return null;
    const r = result.rows[0];
    return {
        id: r.mahoa_don || r.ma_coc,
        ma_coc: r.ma_coc,
        khach_hang_id: r.khach_hang_id,
        phong_id: r.ma_phong, // we use ma_phong as id for UI compatibility
        so_tien: parseFloat(r.so_tien),
        han_thanh_toan: new Date(Date.now() + 86400000), // dummy
        trang_thai: r.trang_thai,
        anh_chung_tu_encrypted: r.anh_chung_tu_encrypted,
        phuong_thuc: r.phuong_thuc,
        ghi_chu: r.ghi_chu,
        ten_khach: r.ten_khach,
        phone_khach: r.phone_khach,
        ma_phong: r.ma_phong
    };
}
async function create(data) {
    const result = await (0, db_1.query)(`INSERT INTO hoa_don_coc (ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk)
     VALUES ($1, NOW(), $2, 'Chờ thanh toán', NOW(), $3) RETURNING *`, [
        data.ma_hoa_don,
        data.so_tien,
        data.ma_phieu_dk
    ]);
    return result.rows[0];
}
async function uploadProof(id, encryptedData, mimeType, phuongThuc) {
    // First, update status to "Đang xử lý"
    await (0, db_1.query)(`UPDATE hoa_don_coc SET trang_thai='Đang xử lý' WHERE ma_hoa_don=$1`, [id]);
    // Then insert/update ThongTinGD
    // We'll generate a random MaGiaoDich
    const maGd = "GD" + Math.floor(Math.random() * 1000000);
    await (0, db_1.query)(`INSERT INTO thong_tin_gd (ma_giao_dich, ma_chung_tu, noi_dung, thoi_gian_tt, phuong_thuc, ma_hoa_don)
     VALUES ($1, $2, $3, NOW(), $4, $5)`, [maGd, encryptedData, mimeType, phuongThuc, id]);
}
async function confirm(id, nguoiXacNhan) {
    await (0, db_1.query)(`UPDATE hoa_don_coc SET trang_thai='Đã xác nhận', ma_nv_ke_toan=$1 WHERE ma_hoa_don=$2`, [nguoiXacNhan, id]);
}
async function reject(id, ghiChu) {
    await (0, db_1.query)(`UPDATE hoa_don_coc SET trang_thai='Không hợp lệ' WHERE ma_hoa_don=$1`, [id]);
    await (0, db_1.query)(`UPDATE thong_tin_gd SET noi_dung=$1 WHERE ma_hoa_don=$2`, [ghiChu, id]);
}
async function refund(id, ghiChu) {
    await (0, db_1.query)(`UPDATE hoa_don_coc SET trang_thai='Hoàn tiền', ma_nv_ke_toan=NULL WHERE ma_hoa_don=$1`, [id]);
    await (0, db_1.query)(`UPDATE thong_tin_gd SET noi_dung=$1 WHERE ma_hoa_don=$2`, [ghiChu, id]);
}
async function markOverdue() {
    const result = await (0, db_1.query)(`UPDATE hoa_don_coc
     SET trang_thai='Quá hạn thanh toán'
     WHERE trang_thai='Chờ thanh toán'
       AND thoi_gian_coc < NOW() - INTERVAL '24 HOURS'
     RETURNING ma_hoa_don as id`);
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
     FROM hoa_don_coc`);
    const r = result.rows[0];
    return {
        tong: parseInt(r.tong || "0", 10),
        cho_thanh_toan: parseInt(r.cho_thanh_toan || "0", 10),
        dang_xu_ly: parseInt(r.dang_xu_ly || "0", 10),
        khong_hop_le: parseInt(r.khong_hop_le || "0", 10),
        da_xac_nhan: parseInt(r.da_xac_nhan || "0", 10),
        qua_han: parseInt(r.qua_han || "0", 10),
        hoan_tien: parseInt(r.hoan_tien || "0", 10),
    };
}
// Fetch PhieuDangKy for UI selection
async function getAllPhieuDangKy() {
    const result = await (0, db_1.query)(`
      SELECT pdk.MaPhieuDK as ma_phieu, pdk.TrangThai as trang_thai, 
             k.HoTen as ten_khach, k.Sdt as phone_khach
      FROM PhieuDangKy pdk
      LEFT JOIN KhachHang k ON pdk.MaKhachHang = k.MaKhachHang
      WHERE pdk.TrangThai = 'Chờ đặt cọc' OR pdk.TrangThai = 'Mới' OR pdk.TrangThai IS NULL
      ORDER BY pdk.NgayLap DESC
    `);
    return result.rows;
}
