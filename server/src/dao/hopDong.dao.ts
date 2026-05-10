import { query } from "../db";
import { HopDong, ThanhVienNhom } from "../types";
import { generateNextCode } from '../utils/generateCode';
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
  sql += " ORDER BY hd.created_at DESC";
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(maHopDong: string | number): Promise<HopDong | null> {
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
      data.ky_thanh_toan || 'Hàng tháng',
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
  await query(`UPDATE hop_dong SET trang_thai='Đã kết thúc' WHERE ma_hop_dong=$1`, [String(maHopDong)]);
}

export async function finalize(id: string): Promise<void> {
  await query(`UPDATE hop_dong SET trang_thai='Đã thanh lý' WHERE ma_hop_dong=$1`, [id]);
}

export async function recordCheckoutTime(
  id: string,
  checkoutTime: string,
): Promise<void> {
  await query(`UPDATE hop_dong SET ngay_tra_thuc_te=$1 WHERE ma_hop_dong=$2`, [
    checkoutTime,
    id,
  ]);
}
export async function getByStatus(trangThai: string): Promise<any[]> {
  const sql = `
    -- Bước 1: Gom tất cả tài nguyên (giường/phòng) của hợp đồng vào một bảng tạm
    WITH hop_dong_resources AS (
      -- Nhánh 1: Lấy từ thuê giường (Ở ghép)
      SELECT 
        hg.ma_hop_dong,
        g.ma_phong,
        hg.ma_giuong
      FROM hop_dong_giuong hg
      JOIN giuong g ON hg.ma_giuong = g.ma_giuong

      UNION -- Dùng UNION để gộp kết quả

      -- Nhánh 2: Lấy từ thuê phòng (Nguyên phòng)
      -- Đối với thuê phòng, ta lấy tất cả giường thuộc phòng đó
      SELECT 
        hp.ma_hop_dong,
        hp.ma_phong,
        g.ma_giuong
      FROM hop_dong_phong hp
      JOIN giuong g ON hp.ma_phong = g.ma_phong
    ),
    -- Bước 2: Nhóm lại để tính tổng số lượng
    hop_dong_summary AS (
      SELECT
        ma_hop_dong,
        COUNT(DISTINCT ma_giuong) as tong_so_giuong,
        string_agg(DISTINCT ma_phong, ', ') as danh_sach_phong
      FROM hop_dong_resources
      GROUP BY ma_hop_dong
    )
    -- Bước 3: Query chính kết nối với thông tin khách hàng
    SELECT 
      hd.ma_hop_dong,
      hd.ngay_nhan_phong as ngay_bat_dau,
      hd.trang_thai,
      k.ho_ten as ten_khach,
      hds.tong_so_giuong,
      hds.danh_sach_phong
    FROM hop_dong hd
    LEFT JOIN khach_hang k ON hd.ma_khach_hang = k.ma_khach_hang
    LEFT JOIN hop_dong_summary hds ON hd.ma_hop_dong = hds.ma_hop_dong
    WHERE hd.trang_thai = $1
    ORDER BY hd.ngay_lap DESC
  `;
  
  const result = await query(sql, [trangThai]);

  return result.rows.map(row => ({
    ma_hop_dong: row.ma_hop_dong,
    ten_khach: row.ten_khach, 
    phong: row.danh_sach_phong || 'N/A', 
    trang_thai_hd: row.trang_thai, 
    so_giuong: `${row.tong_so_giuong}`, 
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
export async function getAllPending() {
  console.log("Fetching all pending contracts...");
  const result = await query(
    `SELECT DISTINCT ON (h.ma_hoa_don)
        h.ma_hoa_don as MaHoaDon, 
        k.ho_ten as Hoten, 
        COALESCE(pdk_p.ma_phong, p_from_g.ma_phong) as MaPhong,
        COALESCE(p_from_p.gia_thue_phong, p_from_g.gia_thue_phong) as GiaThuePhong,
        pdk.hinh_thuc_thue as HinhThucThue
     FROM hoa_don_coc h
     JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk  
     JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     LEFT JOIN phong p_from_p ON pdk_p.ma_phong = p_from_p.ma_phong
     LEFT JOIN phieu_dang_ky_giuong pdk_g ON pdk.ma_phieu_dk = pdk_g.ma_phieu_dk
     LEFT JOIN giuong g ON pdk_g.ma_giuong = g.ma_giuong
     LEFT JOIN phong p_from_g ON g.ma_phong = p_from_g.ma_phong
     WHERE h.trang_thai = 'Đã xác nhận' 
       AND NOT EXISTS (SELECT 1 FROM hop_dong hd WHERE hd.ma_hoa_don = h.ma_hoa_don AND hd.trang_thai <> 'Chờ ký')
     ORDER BY h.ma_hoa_don`
  );
  //       AND pdk.trang_thai = 'Đủ điều kiện'
  return result.rows;
}
export async function updateStatus(maHopDong: string, trangThai: 'Đang hiệu lực' | 'Đã kết thúc') {
  if (trangThai === 'Đang hiệu lực') {
    // Nếu xác nhận HĐ -> Cập nhật trạng thái VÀ gán Ngày nhận phòng = NOW()
    await query(
      `UPDATE hop_dong SET trang_thai = $1, ngay_nhan_phong = NOW() WHERE ma_hop_dong = $2`, 
      [trangThai, maHopDong]
    );
  } else {
    // Nếu hủy HĐ -> Chỉ cập nhật trạng thái, không đụng tới Ngày nhận phòng
    await query(
      `UPDATE hop_dong SET trang_thai = $1 WHERE ma_hop_dong = $2`, 
      [trangThai, maHopDong]
    );
  }
  return { success: true };
}
export async function getDetailsByDepositCode(maHoaDonCoc: string) {
  // =====================================================================
  // QUERY 1: Lấy thông tin Hóa đơn, Khách hàng, Phiếu ĐK và Phòng (Gộp 4 câu query cũ)
  // =====================================================================
  const mainInfoResult = await query(
    `SELECT 
        h.ma_hoa_don, 
        h.so_tien_coc,
        pdk.ma_phieu_dk, 
        pdk.hinh_thuc_thue,
        k.ma_khach_hang, 
        k.ho_ten as ten_khach_hang,
        
        -- Lấy thông tin phòng dựa vào hình thức thuê
        -- COALESCE lấy giá trị đầu tiên KHÔNG NULL
        COALESCE(p_nguyen.ma_phong, p_ghep.ma_phong) as ma_phong,
        COALESCE(p_nguyen.khu_vuc, p_ghep.khu_vuc) as khu_vuc,
        COALESCE(p_nguyen.gia_thue_phong, p_ghep.gia_thue_phong) as gia_thue_phong
        
     FROM hoa_don_coc h
     JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk
     JOIN khach_hang k ON pdk.ma_khach_hang = k.ma_khach_hang
     
     -- Nhánh 1: Nếu là Thuê nguyên phòng
     LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
     LEFT JOIN phong p_nguyen ON pdk_p.ma_phong = p_nguyen.ma_phong
     
     -- Nhánh 2: Nếu là Ở ghép (Phải lấy ID phòng thông qua ID giường đầu tiên)
     LEFT JOIN (
        SELECT ma_phieu_dk, MAX(ma_giuong) as ma_giuong 
        FROM phieu_dang_ky_giuong GROUP BY ma_phieu_dk
     ) pdk_g ON pdk.ma_phieu_dk = pdk_g.ma_phieu_dk
     LEFT JOIN giuong g ON pdk_g.ma_giuong = g.ma_giuong
     LEFT JOIN phong p_ghep ON g.ma_phong = p_ghep.ma_phong
     
     WHERE h.ma_hoa_don = $1`,
    [maHoaDonCoc]
  );

  if (mainInfoResult.rows.length === 0) return null;
  const mainInfo = mainInfoResult.rows[0];

  // =====================================================================
  // QUERY 2: Lấy danh sách thành viên
  // =====================================================================
  const membersResult = await query(
    `SELECT kh.ho_ten, kh.cccd, kh.sdt, kh.ngay_sinh
     FROM phieu_dang_ky_khach_hang pk
     JOIN khach_hang kh ON pk.ma_khach_hang = kh.ma_khach_hang
     WHERE pk.ma_phieu_dk = $1`,
    [mainInfo.ma_phieu_dk]
  );
  mainInfo.members = membersResult.rows;

  // =====================================================================
  // QUERY 3: Lấy danh sách giường (Xử lý thông minh cả 2 TH)
  // =====================================================================
  // Dù là thuê phòng hay thuê giường, ta chỉ cần 1 câu query này:
  const bedsResult = await query(
    `SELECT g.ma_giuong, g.gia_thue_giuong, g.trang_thai
     FROM giuong g
     WHERE 
        -- Nếu là thuê giường: lấy các giường nằm trong phieu_dang_ky_giuong
        g.ma_giuong IN (SELECT ma_giuong FROM phieu_dang_ky_giuong WHERE ma_phieu_dk = $1)
        OR 
        -- Nếu là thuê phòng: lấy TẤT CẢ các giường thuộc phòng đó
        g.ma_phong IN (SELECT ma_phong FROM phieu_dang_ky_phong WHERE ma_phieu_dk = $1)`,
    [mainInfo.ma_phieu_dk]
  );
  mainInfo.beds = bedsResult.rows;

  // =====================================================================
  // QUERY 4: Lấy danh sách dịch vụ của phòng đó
  // =====================================================================
  if (mainInfo.ma_phong) {
    const servicesResult = await query(
      `SELECT dv.ma_dich_vu, dv.ten_dich_vu, dv.don_gia, dv.don_vi_tinh
       FROM dich_vu dv
       JOIN dich_vu_chi_nhanh dvc ON dv.ma_dich_vu = dvc.ma_dich_vu
       JOIN phong p ON dvc.ma_chi_nhanh = p.ma_chi_nhanh
       WHERE p.ma_phong = $1`,
      [mainInfo.ma_phong]
    );
    mainInfo.services = servicesResult.rows;
  } else {
    mainInfo.services = [];
  }
  // lấy mã hợp động
  const contractResult = await query(
    `SELECT ma_hop_dong FROM hop_dong WHERE ma_hoa_don = $1`,
    [mainInfo.ma_hoa_don]
  );
  mainInfo.ma_hop_dong = contractResult.rows.length > 0 ? contractResult.rows[0].ma_hop_dong : null;
  return mainInfo;
}
// Thêm hàm này vào file src/dao/hopDong.dao.ts

export async function getOrCreate(maHoaDonCoc: string) {
  // 1. Kiểm tra xem hợp đồng đã tồn tại chưa
  const existResult = await query(
    `SELECT ma_hop_dong as ma_hop_dong, ma_hoa_don as ma_hoa_don, trang_thai as trang_thai FROM hop_dong WHERE ma_hoa_don = $1`, 
    [maHoaDonCoc]
  );
  if (existResult.rows.length > 0) {
    return {
      MaHopDong: existResult.rows[0].ma_hop_dong,
      MaHoaDon: existResult.rows[0].ma_hoa_don,
      TrangThai: existResult.rows[0].trang_thai
    };
  }

  // 2. Nếu chưa, tạo mới hợp đồng
  const maHopDong = await generateNextCode('hd', 'hop_dong', 'ma_hop_dong');
  
  // Lấy thông tin khách từ phiếu đăng ký để gán
  const customerResult = await query(`
      SELECT pdk.ma_khach_hang as ma_khach_hang FROM hoa_don_coc h 
      JOIN phieu_dang_ky pdk ON h.ma_phieu_dk = pdk.ma_phieu_dk 
      WHERE h.ma_hoa_don = $1`, [maHoaDonCoc]);
      
  if (customerResult.rows.length === 0) throw new Error("Không thể tìm thấy khách hàng tương ứng với hóa đơn cọc");

  const maKhachHang = customerResult.rows[0].ma_khach_hang;

  const newContract = {
    MaHopDong: maHopDong,
    NgayLap: new Date(),
    TrangThai: 'Chờ ký',
    MaHoaDon: maHoaDonCoc,
    MaKhachHang: maKhachHang,
  };

  await query(
    `INSERT INTO hop_dong (ma_hop_dong, ngay_lap, trang_thai, ma_hoa_don, ma_khach_hang) 
     VALUES ($1, $2, $3, $4, $5)`,
    [newContract.MaHopDong, newContract.NgayLap, newContract.TrangThai, newContract.MaHoaDon, newContract.MaKhachHang]
  );
  return newContract;
}