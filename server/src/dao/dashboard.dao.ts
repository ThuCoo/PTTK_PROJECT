import { query } from "../db";

export const DashboardDAO = {
  getOverview: async () => {
    const sql = `
      SELECT 
        -- 1. Tổng khách hàng
        (SELECT COUNT(*) FROM khach_hang) AS tong_khach_hang,
        
        -- 2. Phòng đang thuê (Phòng có ít nhất 1 giường Đang sử dụng)
        (SELECT COUNT(DISTINCT ma_phong) FROM giuong WHERE trang_thai = 'Đang sử dụng') AS phong_dang_thue,
        
        -- 3. Phòng trống (Tổng số phòng - Phòng đang thuê)
        (SELECT COUNT(*) FROM phong) - 
        (SELECT COUNT(DISTINCT ma_phong) FROM giuong WHERE trang_thai = 'Đang sử dụng') AS phong_trong,
        
        -- 4. Doanh thu tháng hiện tại (Tổng tiền từ thong_tin_gd)
        (SELECT COALESCE(SUM(so_tien_chuyen), 0) 
         FROM thong_tin_gd 
         WHERE EXTRACT(MONTH FROM thoi_gian_tt) = EXTRACT(MONTH FROM CURRENT_DATE) 
           AND EXTRACT(YEAR FROM thoi_gian_tt) = EXTRACT(YEAR FROM CURRENT_DATE)
        ) AS doanh_thu_thang,
        
          (SELECT COALESCE(
            json_agg(
              json_build_object(
                'id', l.id,
                'gio_xem', l.gio_xem,
                'trang_thai', l.trang_thai,
                'khach_hang', k.ho_ten,
                'sdt', k.sdt,
                -- ✅ ĐÃ THÊM MÃ PHÒNG VÀO ĐÂY
                'ma_phong', COALESCE(phong_truc_tiep.ma_phong, phong_qua_giuong.ma_phong)
              ) ORDER BY l.gio_xem ASC
            ), 
            '[]'::json
         )
         FROM lich_xem_phong l
         JOIN phieu_dang_ky p ON l.ma_phieu_dk = p.ma_phieu_dk
         JOIN khach_hang k ON p.ma_khach_hang = k.ma_khach_hang
         -- Lấy mã phòng theo 2 trường hợp:
         -- TH1: Nếu là thuê nguyên phòng (có bản ghi trong phieu_dang_ky_phong)
         LEFT JOIN phieu_dang_ky_phong phong_truc_tiep ON p.ma_phieu_dk = phong_truc_tiep.ma_phieu_dk
         -- TH2: Nếu là thuê giường (phải join qua bảng giuong để lấy mã phòng)
         LEFT JOIN phieu_dang_ky_giuong pdk_g ON p.ma_phieu_dk = pdk_g.ma_phieu_dk
         LEFT JOIN giuong g ON pdk_g.ma_giuong = g.ma_giuong
         LEFT JOIN phong phong_qua_giuong ON g.ma_phong = phong_qua_giuong.ma_phong
         WHERE l.ngay_xem = CURRENT_DATE
        ) AS lich_xem_hom_nay
    `;

    const result = await query(sql);
    return result.rows[0]; // Chỉ trả về 1 Object duy nhất chứa tất cả thông tin
  }
};