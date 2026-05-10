import { query } from "../db";
import { HopDong, ThanhVienNhom } from "../types";

export async function getAll(
  search?: string,
  trangThai?: string,
): Promise<HopDong[]> {
  let sql = `
    SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
    FROM hop_dong hd
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    WHERE 1=1
  `;
  const params: any[] = [];
  let idx = 1;
  if (search) {
    sql += ` AND (hd.ma_hd ILIKE $${idx} OR k.ho_ten ILIKE $${idx})`;
    params.push(`%${search}%`);
    idx++;
  }
  if (trangThai) {
    sql += ` AND hd.trang_thai = $${idx++}`;
    params.push(trangThai);
  }
  sql += " ORDER BY hd.ngay_lap DESC";
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(
  maHopDong: string | number,
): Promise<HopDong | null> {
  const result = await query(
    `SELECT hd.*, k.ho_ten as ten_khach, k.sdt as phone_khach
     FROM hop_dong hd
     LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
     WHERE hd.ma_hop_dong = $1`,
    [String(maHopDong)],
  );
  return result.rows[0] || null;
}

export async function create(data: any): Promise<HopDong> {
  const result = await query(
    `INSERT INTO hop_dong
     (ma_hop_dong, ma_khach_hang, ma_phong, so_giuong, ngay_nhan_phong, ngay_lap, ky_thanh_toan, tien_ban_giao, trang_thai)
     VALUES ($1,$2,$3,$4,CURRENT_DATE,CURRENT_DATE,$5,$6,'Chờ ký') RETURNING *`,
    [
      data.ma_hop_dong || data.ma_hd,
      data.ma_khach_hang || data.khach_hang_id,
      data.ma_phong || data.phong_id,
      data.so_giuong,
      data.ky_thanh_toan || "Hàng tháng",
      data.tien_ban_giao || 0,
    ],
  );
  return result.rows[0];
}

export async function sign(maHopDong: string | number): Promise<void> {
  await query(
    `UPDATE hop_dong SET trang_thai='Đang hiệu lực', ngay_ky=CURRENT_DATE WHERE ma_hop_dong=$1`,
    [String(maHopDong)],
  );
}

export async function terminate(maHopDong: string | number): Promise<void> {
  await query(
    `UPDATE hop_dong SET trang_thai='Đã kết thúc' WHERE ma_hop_dong=$1`,
    [String(maHopDong)],
  );
}

export async function finalize(id: string): Promise<void> {
  await query(
    `UPDATE hop_dong SET trang_thai='Đã thanh lý' WHERE ma_hop_dong=$1`,
    [id],
  );
}

export async function recordCheckoutTime(
  id: number,
  checkoutTime: string,
): Promise<void> {
  await query(`UPDATE hop_dong SET ngay_tra_thuc_te=$1 WHERE ma_hop_dong=$2`, [
    checkoutTime,
    id,
  ]);
}

export async function getByStatus(trangThai: string): Promise<any[]> {
  // Changed return type for flexibility
  const sql = `
    -- Sử dụng subquery (CTE) để tính toán số giường và danh sách phòng cho mỗi hợp đồng trước
    WITH hop_dong_details AS (
      SELECT
        hg.ma_hop_dong,
        COUNT(hg.ma_giuong) as so_luong_giuong,
        -- string_agg dùng để nối tất cả mã phòng thành một chuỗi, ví dụ: "P101, P102"
        string_agg(DISTINCT p.ma_phong, ', ') as danh_sach_phong
      FROM hop_dong_giuong hg
      LEFT JOIN giuong g ON hg.ma_giuong = g.ma_giuong
      LEFT JOIN phong p ON g.ma_phong = p.ma_phong
      GROUP BY hg.ma_hop_dong
    )
    -- Query chính để lấy thông tin hợp đồng
    SELECT 
      hd.ma_hop_dong,
      hd.ngay_nhan_phong as ngay_bat_dau,
      hd.trang_thai,
      k.ho_ten as ten_khach,
      -- Lấy dữ liệu đã tính toán từ subquery ở trên
      COALESCE(hdd.so_luong_giuong, 0) as so_giuong, -- Nếu không có giường thì hiện số 0
      hdd.danh_sach_phong as phong
    FROM hop_dong hd
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    -- Kết nối với kết quả của subquery
    LEFT JOIN hop_dong_details hdd ON hd.ma_hop_dong = hdd.ma_hop_dong
    WHERE hd.trang_thai = $1
    ORDER BY hd.ngay_lap DESC
  `;

  const result = await query(sql, [trangThai]);

  // Đảm bảo dữ liệu trả về có tên key đúng với UI của bạn
  return result.rows.map((row) => ({
    ma_hop_dong: row.ma_hop_dong,
    ten_khach: row.ten_khach, // Đổi tên cho khớp UI
    phong: row.phong || "Chưa có", // Nếu phòng là null thì hiện "Chưa có"
    trang_thai_hd: row.trang_thai, // Đổi tên cho khớp UI
    so_giuong: `${row.so_giuong}`, // Thêm chữ "giường" cho đẹp
    ngay_bat_dau: row.ngay_bat_dau,
  }));
}

export async function addGroupMembers(
  hopDongId: number,
  members: ThanhVienNhom[],
): Promise<void> {
  for (const m of members) {
    await query(
      `INSERT INTO thanh_vien_nhom (hop_dong_id, ho_ten, cccd, phone, ngay_sinh, dia_chi_thuong_tru)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [hopDongId, m.ho_ten, m.cccd, m.phone, m.ngay_sinh, m.dia_chi_thuong_tru],
    );
  }
}

export async function getStats(): Promise<Record<string, number>> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang hiệu lực') as hieu_luc,
       COUNT(*) FILTER (WHERE trang_thai = 'Chờ ký') as cho_ky,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang hiệu lực' AND ngay_ket_thuc <= CURRENT_DATE + 30) as sap_het_han
     FROM hop_dong`,
  );
  const r = result.rows[0];
  return {
    tong: parseInt(r.tong, 10),
    hieu_luc: parseInt(r.hieu_luc, 10),
    cho_ky: parseInt(r.cho_ky, 10),
    sap_het_han: parseInt(r.sap_het_han, 10),
  };
}
