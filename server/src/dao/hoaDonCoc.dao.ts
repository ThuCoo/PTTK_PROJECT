import { query } from "../db";
import { DatCoc } from "../types";

export async function getAll(
  search?: string,
  trangThai?: string,
){
  let sql = `
    SELECT h.ma_hoa_don as id, h.ma_hoa_don as ma_coc, h.so_tien_coc as so_tien,
           h.trang_thai as trang_thai, h.thoi_gian_coc as ngay_tao, 
           k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong as ma_phong,
           dk.ma_khach_hang as khach_hang_id, dk.ma_phieu_dk as ma_phieu,
           
           -- CÁC TRƯỜNG MỚI ĐƯỢC THÊM VÀO
           nv.ho_ten as nguoi_xac_nhan,        -- Lấy tên nhân viên thay vì mã
           tgd.thoi_gian_tt as ngay_xac_nhan,  -- Ngày xác nhận chính là thời gian thanh toán
           tgd.phuong_thuc_tt as phuong_thuc      -- Lấy phương thức thanh toán

    FROM hoa_don_coc h
    LEFT JOIN phieu_dang_ky dk ON h.ma_phieu_dk = dk.ma_phieu_dk
    LEFT JOIN khach_hang k ON dk.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
    LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
    
    -- JOIN THÊM 2 BẢNG ĐỂ LẤY THÔNG TIN
    LEFT JOIN thong_tin_gd tgd ON h.ma_hoa_don = tgd.ma_hoa_don -- Bảng chứa thông tin giao dịch
    LEFT JOIN nhan_vien nv ON h.ma_nv_ke_toan = nv.ma_nhan_vien -- Bảng chứa tên nhân viên

    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (h.ma_hoa_don ILIKE $${idx} OR k.ho_ten ILIKE $${idx} OR k.sdt ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND h.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += " ORDER BY h.thoi_gian_coc DESC";
  var giuongs = await query(`SELECT count(*) as so_giuong, pg.ma_phieu_dk
     FROM phieu_dang_ky_giuong pg 
     GROUP BY pg.ma_phieu_dk`);
  const result = await query(sql, params);

  // CẬP NHẬT LẠI OBJECT TRẢ VỀ CHO FRONTEND
  return result.rows.map(r => ({
      id: r.id, 
      ma_coc: r.ma_coc, 
      khach_hang_id: r.khach_hang_id, 
      phong_id: r.ma_phong,
      so_giuong: parseInt(giuongs.rows.find((g: any) => g.ma_phieu_dk === r.ma_phieu)?.so_giuong || "0", 10),
      so_tien: parseFloat(r.so_tien),
      ngay_tao: r.ngay_tao, 
      trang_thai: r.trang_thai,
      ten_khach: r.ten_khach, 
      phone_khach: r.phone_khach, 
      ma_phong: r.ma_phong,
      
      // Thêm các trường mới vào đây
      nguoi_xac_nhan: r.nguoi_xac_nhan,
      ngay_xac_nhan: r.ngay_xac_nhan,
      phuong_thuc: r.phuong_thuc,
      // hạn thanh toán là ngày lập + 24h , // xử lí ở đây luôn
      han_thanh_toan:  new Date(new Date(r.ngay_tao).getTime() + 24 * 60 * 60 * 1000).toISOString(),
  }));
}

export async function getById(id: string): Promise<any | null> {
  const result = await query(
    `SELECT h.*, h.ma_hoa_don as ma_coc, h.trang_thai as trang_thai, h.so_tien_coc as so_tien,
            dk.ma_khach_hang as khach_hang_id,
            k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong as ma_phong,
            gd.ma_chung_tu as anh_chung_tu_encrypted, gd.phuong_thuc_tt as phuong_thuc_tt, gd.noi_dung_tt as ghi_chu
     FROM hoa_don_coc h
     LEFT JOIN phieu_dang_ky dk ON h.ma_phieu_dk = dk.ma_phieu_dk
     LEFT JOIN khach_hang k ON dk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pkp ON dk.ma_phieu_dk = pkp.ma_phieu_dk
     LEFT JOIN phong p ON pkp.ma_phong = p.ma_phong
     LEFT JOIN thong_tin_gd gd ON h.ma_hoa_don = gd.ma_hoa_don
     WHERE h.ma_hoa_don = $1`,
    [id],
  );
  if (!result.rows[0]) return null;
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

export async function create(data: {
  ma_hoa_don: string;
  ma_phieu_dk: string;
  so_tien: number;
}): Promise<any> {
  const result = await query(
    `INSERT INTO hoa_don_coc (ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, thoi_gian_coc, ma_phieu_dk)
     VALUES ($1, NOW(), $2, 'Chờ thanh toán', NOW(), $3) RETURNING *`,
    [
      data.ma_hoa_don,
      data.so_tien,
      data.ma_phieu_dk
    ],
  );
  return result.rows[0];
}

export async function uploadProof(
  id: string,
  encryptedData: string,
  mimeType: string,
  phuongThuc: string,
): Promise<void> {
  // First, update status to "Đang xử lý"
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Đang xử lý' WHERE ma_hoa_don=$1`,
    [id]
  );
  // Then insert/update ThongTinGD
  // We'll generate a random MaGiaoDich
  const maGd = "GD" + Math.floor(Math.random() * 1000000);
  await query(
    `INSERT INTO thong_tin_gd (ma_giao_dich, ma_chung_tu, noi_dung_tt, thoi_gian_tt, phuong_thuc_tt, ma_hoa_don)
     VALUES ($1, $2, $3, NOW(), $4, $5)`,
    [maGd, encryptedData, mimeType, phuongThuc, id]
  );
}

export async function confirm(id: string, nguoiXacNhan: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Đã xác nhận', ma_nv_ke_toan=$1 WHERE ma_hoa_don=$2`,
    [nguoiXacNhan, id],
  );
}

export async function reject(id: string, ghiChu: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Không hợp lệ' WHERE ma_hoa_don=$1`,
    [id],
  );
  await query(
    `UPDATE thong_tin_gd SET noi_dung_tt=$1 WHERE ma_hoa_don=$2`,
    [ghiChu, id]
  );
}

export async function refund(id: string, ghiChu: string): Promise<void> {
  await query(
    `UPDATE hoa_don_coc SET trang_thai='Hoàn tiền', ma_nv_ke_toan=NULL WHERE ma_hoa_don=$1`,
    [id],
  );
  await query(
    `UPDATE thong_tin_gd SET noi_dung=$1 WHERE ma_hoa_don=$2`,
    [ghiChu, id]
  );
}

export async function markOverdue(): Promise<Array<{ id: string }>> {
  const result = await query(
    `UPDATE hoa_don_coc
     SET trang_thai='Quá hạn thanh toán'
     WHERE trang_thai='Chờ thanh toán'
       AND thoi_gian_coc < NOW() - INTERVAL '24 HOURS'
     RETURNING ma_hoa_don as id`
  );
  return result.rows;
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ thanh toán') as cho_thanh_toan,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang xử lý') as dang_xu_ly,
       COUNT(*) FILTER (WHERE trang_thai = 'Không hợp lệ') as khong_hop_le,
       COUNT(*) FILTER (WHERE trang_thai = 'Đã xác nhận') as da_xac_nhan,
       COUNT(*) FILTER (WHERE trang_thai IN ('Quá hạn thanh toán', 'Đã hủy (quá hạn)')) as qua_han,
       COUNT(*) FILTER (WHERE trang_thai = 'Hoàn tiền') as hoan_tien
     FROM hoa_don_coc`
  );
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
export async function getAllPhieuDangKy(): Promise<any[]> {
    const result = await query(`
      SELECT pdk.ma_phieu_dk as ma_phieu, pdk.trang_thai as trang_thai, 
             k.ho_ten as ten_khach, k.sdt as phone_khach
      FROM phieu_dang_ky pdk
      LEFT JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
      WHERE pdk.trang_thai = 'Đã chọn phòng' OR pdk.trang_thai = 'Mới' OR pdk.trang_thai IS NULL
      ORDER BY pdk.ngay_lap DESC
    `);
    return result.rows;

}
