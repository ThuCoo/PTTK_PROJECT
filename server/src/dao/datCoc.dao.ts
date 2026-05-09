import { query } from "../db";
import { DatCoc } from "../types";

export async function getAll(
  search?: string,
  trangThai?: string,
): Promise<DatCoc[]> {
  let sql = `
    SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
    FROM dat_coc d
    LEFT JOIN khach_hang k ON d.khach_hang_id = k.ma_khach_hang
    LEFT JOIN phong p ON d.phong_id = p.ma_phong
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (d.ma_coc ILIKE $${idx} OR k.ho_ten ILIKE $${idx} OR k.sdt ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND d.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += " ORDER BY d.ngay_tao DESC";
  // Exclude encrypted image data from list view for performance
  const result = await query(sql, params);
  return result.rows.map((r) => ({ ...r, anh_chung_tu_encrypted: undefined }));
}

export async function getById(id: number): Promise<DatCoc | null> {
  const result = await query(
    `SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong
     FROM dat_coc d
     LEFT JOIN khach_hang k ON d.khach_hang_id = k.ma_khach_hang
     LEFT JOIN phong p ON d.phong_id = p.ma_phong
     WHERE d.id = $1`,
    [id],
  );
  return result.rows[0] || null;
}

export async function getByMaCoc(maCoc: string): Promise<DatCoc | null> {
  const result = await query(
    `SELECT d.*, k.ho_ten as ten_khach, k.sdt as phone_khach, p.ma_phong, k.so_nguoi as num_people
     FROM dat_coc d
     LEFT JOIN khach_hang k ON d.khach_hang_id = k.ma_khach_hang
     LEFT JOIN phong p ON d.phong_id = p.ma_phong
     WHERE d.ma_coc = $1 OR k.sdt = $1`,
    [maCoc],
  );
  return result.rows[0] || null;
}

export async function create(data: {
  ma_coc: string;
  khach_hang_id: number;
  phong_id: number;
  so_giuong: number;
  so_tien: number;
  han_thanh_toan: Date;
}): Promise<DatCoc> {
  const result = await query(
    `INSERT INTO dat_coc (ma_coc, khach_hang_id, phong_id, so_giuong, so_tien, han_thanh_toan)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [
      data.ma_coc,
      data.khach_hang_id,
      data.phong_id,
      data.so_giuong,
      data.so_tien,
      data.han_thanh_toan,
    ],
  );
  return result.rows[0];
}

export async function uploadProof(
  id: number,
  encryptedData: string,
  mimeType: string,
  phuongThuc: string,
): Promise<void> {
  await query(
    `UPDATE dat_coc
     SET anh_chung_tu_encrypted=$1,
         mime_type=$2,
         phuong_thuc=$3,
         trang_thai='Đang xử lý',
         ghi_chu=NULL,
         nguoi_xac_nhan=NULL,
         ngay_xac_nhan=NULL
     WHERE id=$4`,
    [encryptedData, mimeType, phuongThuc, id],
  );
}

export async function confirm(id: number, nguoiXacNhan: string): Promise<void> {
  await query(
    `UPDATE dat_coc SET trang_thai='Đã xác nhận', nguoi_xac_nhan=$1, ngay_xac_nhan=NOW() WHERE id=$2`,
    [nguoiXacNhan, id],
  );
}

export async function reject(id: number, ghiChu: string): Promise<void> {
  await query(
    `UPDATE dat_coc
     SET trang_thai='Không hợp lệ',
         ghi_chu=$1
     WHERE id=$2`,
    [ghiChu, id],
  );
}

export async function refund(id: number, ghiChu: string): Promise<void> {
  await query(
    `UPDATE dat_coc
     SET trang_thai='Hoàn tiền',
         ghi_chu=$1,
         nguoi_xac_nhan=NULL,
         ngay_xac_nhan=NULL
     WHERE id=$2`,
    [ghiChu, id],
  );
}

export async function cancel(id: number): Promise<void> {
  await query(
    `UPDATE dat_coc SET trang_thai='Quá hạn thanh toán' WHERE id=$1`,
    [id],
  );
}

export async function markOverdue(): Promise<
  Array<{ id: number; phong_id: number }>
> {
  const result = await query(
    `UPDATE dat_coc
     SET trang_thai='Quá hạn thanh toán'
     WHERE trang_thai='Chờ thanh toán'
       AND han_thanh_toan < NOW()
     RETURNING id, phong_id`,
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
     FROM dat_coc`,
  );
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
