import { query } from "../db";

export const PhieuDangKyDAO = {
  getPendingVerification: async () => {
    const sql = `
      SELECT
        pdk.ma_phieu_dk as code,
        kh.ho_ten as customer,
        kh.sdt as phone,
        kh.cccd as idCard,
        pdk.khu_vuc_mong_muon as address,
        pdk.so_nguoi_du_kien as numPeople,
        kh.gioi_tinh as gender,
        pdk.khu_vuc_mong_muon as area,
        pdk.hinh_thuc_thue as rentalType,
        pdk.loai_phong as roomType,
        pdk.trang_thai as status,
        
        -- Lấy danh sách phòng/giường đã gán dưới dạng JSON Array
        COALESCE(
          (SELECT json_agg(json_build_object('room', pp.ma_phong))
           FROM phieu_dang_ky_phong pp WHERE pp.ma_phieu_dk = pdk.ma_phieu_dk),
           
          (SELECT json_agg(json_build_object('room', g.ma_phong, 'bed', g.ma_giuong))
           FROM phieu_dang_ky_giuong pg
           JOIN giuong g ON pg.ma_giuong = g.ma_giuong
           WHERE pg.ma_phieu_dk = pdk.ma_phieu_dk),
           
          '[]'::json
        ) as assignedRooms
        
      FROM phieu_dang_ky pdk
      JOIN khach_hang kh ON pdk.ma_khach_hang = kh.ma_khach_hang
      WHERE pdk.trang_thai IN ('Đã chọn phòng', 'Rà soát điều kiện', 'Kiểm tra phòng', 'Xác nhận nội quy')
      ORDER BY pdk.ngay_lap ASC
    `;
    
    const result = await query(sql);
    
    // Map dữ liệu cho giống UI
    return result.rows.map((row: any) => {
      let step = 1;
      let uiStatus = row.status;
      
      // Khởi tạo trạng thái ban đầu cho UI
      if (row.status === 'Đã chọn phòng') {
         uiStatus = 'Rà soát điều kiện';
         step = 1;
      } else if (row.status === 'Kiểm tra phòng') {
         step = 2;
      } else if (row.status === 'Xác nhận nội quy') {
         step = 3;
      }

      return {
        id: row.code, // Dùng mã phiếu làm ID
        code: row.code,
        customer: row.customer,
        phone: row.phone,
        idCard: row.idcard,
        address: row.address,
        numPeople: row.numpeople,
        gender: row.gender,
        area: row.area,
        rentalType: row.rentaltype,
        roomType: row.roomtype,
        status: uiStatus,
        currentStep: step,
        assignedRooms: row.assignedrooms
      };
    });
  },

  updateStatus: async (maPhieuDK: string, trangThai: string) => {
    await query(`UPDATE phieu_dang_ky SET trang_thai = $1 WHERE ma_phieu_dk = $2`, [trangThai, maPhieuDK]);
  },

  rejectRoom: async (maPhieuDK: string) => {
    // Nếu phòng/giường không khả dụng -> Xóa gán và trả về bước Chọn phòng
    await query(`DELETE FROM phieu_dang_ky_phong WHERE ma_phieu_dk = $1`, [maPhieuDK]);
    await query(`DELETE FROM phieu_dang_ky_giuong WHERE ma_phieu_dk = $1`, [maPhieuDK]);
    await query(`UPDATE phieu_dang_ky SET trang_thai = 'Chờ chọn phòng' WHERE ma_phieu_dk = $1`, [maPhieuDK]);
  },
  // Thêm hàm này vào dưới hàm rejectRoom
  completeVerificationAndCreateDeposit: async (maPhieuDK: string) => {
    // 1. Tính toán tiền cọc dựa trên hình thức thuê
    console.log(`Bắt đầu hoàn tất rà soát và tạo hóa đơn cọc cho phiếu đăng ký: ${maPhieuDK}`);
    const calcResult = await query(`
      SELECT 
        pdk.hinh_thuc_thue,
        p.gia_thue_phong,
        COALESCE(SUM(g.gia_thue_giuong), 0) as tong_tien_giuong
      FROM phieu_dang_ky pdk
      LEFT JOIN phieu_dang_ky_phong pdk_p ON pdk.ma_phieu_dk = pdk_p.ma_phieu_dk
      LEFT JOIN phong p ON pdk_p.ma_phong = p.ma_phong
      LEFT JOIN phieu_dang_ky_giuong pdk_g ON pdk.ma_phieu_dk = pdk_g.ma_phieu_dk
      LEFT JOIN giuong g ON pdk_g.ma_giuong = g.ma_giuong
      WHERE pdk.ma_phieu_dk = $1
      GROUP BY pdk.hinh_thuc_thue, p.gia_thue_phong
    `, [maPhieuDK]);

    if (calcResult.rows.length === 0) throw new Error("Không tìm thấy dữ liệu phòng/giường để tính cọc");
    
    const data = calcResult.rows[0];
    let soTienCoc = 0;

    // Áp dụng công thức: Tiền cọc = Tiền thuê 2 tháng
    if (data.hinh_thuc_thue === 'Thuê nguyên phòng') {
      soTienCoc = parseFloat(data.gia_thue_phong) * 2;
    } else {
      soTienCoc = parseFloat(data.tong_tien_giuong) * 2;
    }

    // 2. Tạo Mã Hóa Đơn ngẫu nhiên (Ví dụ: HDC16845...)
    const maHoaDon = `HDC${Math.floor(Date.now() / 1000).toString().slice(-6)}`;
    console.log(`Tạo hóa đơn cọc với mã: ${maHoaDon} và số tiền: ${soTienCoc}`);
    // 3. Tạo Hóa Đơn Cọc với trạng thái "Chờ thanh toán"
    await query(`
      INSERT INTO hoa_don_coc (ma_hoa_don, ngay_lap, so_tien_coc, trang_thai, ma_phieu_dk)
      VALUES ($1, CURRENT_DATE, $2, 'Chờ thanh toán', $3)
    `, [maHoaDon, soTienCoc, maPhieuDK]);

    // 4. Chuyển trạng thái Phiếu Đăng Ký
    // (Đã xong rà soát, chuyển cho Kế toán theo dõi cọc)
    await query(`
      UPDATE phieu_dang_ky SET trang_thai = 'Chờ đặt cọc' WHERE ma_phieu_dk = $1
    `, [maPhieuDK]);

    console.log(`Hoàn tất tạo hóa đơn cọc: ${maHoaDon}`);
    return { maHoaDon, soTienCoc };
  }
};
