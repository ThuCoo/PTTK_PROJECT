import { query } from "../db";
import { Phong } from "../types";

export async function getAll(
  khuVuc?: string,
  trangThai?: string,
  search?: string,
): Promise<Phong[]> {
  let sql = "SELECT * FROM phong WHERE 1=1";
  const params: any[] = [];
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
  sql += " ORDER BY ma_phong";
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(maPhong: string): Promise<Phong | null> {
  const result = await query("SELECT * FROM phong WHERE ma_phong = $1", [
    maPhong,
  ]);
  return result.rows[0] || null;
}

export async function getByMaPhong(maPhong: string): Promise<Phong | null> {
  const result = await query("SELECT * FROM phong WHERE ma_phong = $1", [
    maPhong,
  ]);
  return result.rows[0] || null;
}

export async function updateStatus(
  maPhong: string,
  trangThai: string,
): Promise<void> {
  await query("UPDATE phong SET trang_thai = $1 WHERE ma_phong = $2", [
    trangThai,
    maPhong,
  ]);
}

export async function incrementOccupied(
  maPhong: string,
  delta: number,
): Promise<void> {
  await query(
    `UPDATE phong SET dang_o = GREATEST(0, LEAST(suc_chua_toi_da, dang_o + $1)) WHERE ma_phong = $2`,
    [delta, maPhong],
  );
}

export async function releaseResources(maHopDong: string): Promise<void> {
  // 1. Truy xuất thông tin để biết hợp đồng này là "Thuê nguyên phòng" hay "Ở ghép" (Thuê giường)
  const contractInfo = await query(
    `SELECT 
        pdk.hinh_thuc_thue, 
        pkp.ma_phong
     FROM hop_dong hd
     JOIN hoa_don_coc hdc ON hd.ma_hoa_don = hdc.ma_hoa_don
     JOIN phieu_dang_ky pdk ON hdc.ma_phieu_dk = pdk.ma_phieu_dk
     LEFT JOIN phieu_dang_ky_phong pkp ON pdk.ma_phieu_dk = pkp.ma_phieu_dk
     WHERE hd.ma_hop_dong = $1`,
    [maHopDong],
  );

  if (contractInfo.rows.length === 0) return; // Không tìm thấy hợp đồng

  const { hinh_thuc_thue, ma_phong } = contractInfo.rows[0];

  // TRƯỜNG HỢP 1: THUÊ NGUYÊN PHÒNG
  if (hinh_thuc_thue === "Thuê nguyên phòng" && ma_phong) {
    await query(
      `UPDATE phong SET trang_thai = 'Còn trống' WHERE ma_phong = $1`,
      [ma_phong],
    );
    await query(`UPDATE giuong SET trang_thai = 'Trống' WHERE ma_phong = $1`, [
      ma_phong,
    ]);
    console.log(`Đã giải phóng toàn bộ phòng ${ma_phong}`);
  } else {
    // TRƯỜNG HỢP 2: Ở GHÉP (THUÊ THEO GIƯỜNG)
    const beds = await query(
      `SELECT ma_giuong FROM hop_dong_giuong WHERE ma_hop_dong = $1`,
      [maHopDong],
    );

    if (beds.rows.length > 0) {
      const bedIds = beds.rows.map((b: any) => b.ma_giuong);
      const placeholders = bedIds
        .map((_: any, i: number) => `$${i + 1}`)
        .join(",");
      await query(
        `UPDATE giuong SET trang_thai = 'Trống' WHERE ma_giuong IN (${placeholders})`,
        bedIds,
      );
      await query(
        `UPDATE phong 
         SET trang_thai = 'Còn trống' 
         WHERE ma_phong IN (
            SELECT DISTINCT ma_phong FROM giuong WHERE ma_giuong IN (${placeholders})
         )`,
        bedIds,
      );
      console.log(`Đã giải phóng các giường: ${bedIds.join(", ")}`);
    }
  }
}

export async function getStats(): Promise<{
  tong: number;
  dang_thue: number;
  trong: number;
}> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang sử dụng') as dang_thue,
       COUNT(*) FILTER (WHERE trang_thai = 'Trống') as trong
     FROM phong`,
  );
  return {
    tong: parseInt(result.rows[0].tong, 10),
    dang_thue: parseInt(result.rows[0].dang_thue, 10),
    trong: parseInt(result.rows[0].trong, 10),
  };
}
