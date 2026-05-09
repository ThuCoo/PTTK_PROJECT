import { query } from '../db';
import { Phong } from '../types';

// Helper: tính độ tương tự giữa 2 string (0-1, 1 là giống hệt)
function calculateSimilarity(a: string, b: string): number {
  const strA = a.toLowerCase();
  const strB = b.toLowerCase();
  
  // Tuyệt đối match
  if (strA === strB) return 1;
  
  // Prefix match (ưu tiên cao)
  if (strB.startsWith(strA) || strA.startsWith(strB)) return 0.9;
  
  // Contains
  if (strA.includes(strB) || strB.includes(strA)) return 0.7;
  
  // Levenshtein distance
  const maxLen = Math.max(strA.length, strB.length);
  if (maxLen === 0) return 1;
  
  let dist = 0;
  const m = strA.length, n = strB.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dist = (strA[i - 1] === strB[j - 1]) ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + dist);
    }
  }
  
  return Math.max(0, 1 - (dp[m][n] / maxLen));
}

export async function getAll(khuVuc?: string, trangThai?: string, search?: string): Promise<Phong[]> {
  let sql = `SELECT ma_phong as MaPhong, loai_phong as LoaiPhong, suc_chua_toi_da as SucchuaToiDa, gia_thue_phong as GiaThuePhong, trang_thai as TrangThai, khu_vuc as KhuVuc, gioi_tinh_ap_dung as GioiTinhApDung, ma_chi_nhanh as MaChiNhanh FROM phong WHERE 1=1`;
  const params: any[] = [];
  let idx = 1;
  if (khuVuc) { sql += ` AND khu_vuc = $${idx++}`; params.push(khuVuc); }
  if (trangThai) { sql += ` AND trang_thai = $${idx++}`; params.push(trangThai); }
  if (search) { sql += ` AND ma_phong ILIKE $${idx++}`; params.push(`%${search}%`); }
  sql += ' ORDER BY ma_phong';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<Phong | null> {
  const result = await query('SELECT ma_phong as MaPhong, loai_phong as LoaiPhong, suc_chua_toi_da as SucchuaToiDa, gia_thue_phong as GiaThuePhong, trang_thai as TrangThai, khu_vuc as KhuVuc, gioi_tinh_ap_dung as GioiTinhApDung, ma_chi_nhanh as MaChiNhanh FROM phong WHERE ma_phong = $1', [id]);
  return result.rows[0] || null;
}

export async function getByMaPhong(maPhong: string): Promise<Phong | null> {
  const result = await query('SELECT ma_phong as MaPhong, loai_phong as LoaiPhong, suc_chua_toi_da as SucchuaToiDa, gia_thue_phong as GiaThuePhong, trang_thai as TrangThai, khu_vuc as KhuVuc, gioi_tinh_ap_dung as GioiTinhApDung, ma_chi_nhanh as MaChiNhanh FROM phong WHERE ma_phong = $1', [maPhong]);
  return result.rows[0] || null;
}

export async function updateStatus(id: string, trangThai: string): Promise<void> {
  await query('UPDATE phong SET trang_thai = $1 WHERE ma_phong = $2', [trangThai, id]);
}

export async function incrementOccupied(maPhong: string, delta: number): Promise<void> {
  await query(
    `UPDATE phong SET dang_o = GREATEST(0, LEAST(suc_chua_toi_da, dang_o + $1)) WHERE ma_phong = $2`,
    [delta, maPhong]
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
    [maHopDong]
  );

  if (contractInfo.rows.length === 0) return; // Không tìm thấy hợp đồng
  
  const { hinh_thuc_thue, ma_phong } = contractInfo.rows[0];

  // =========================================================
  // TRƯỜNG HỢP 1: THUÊ NGUYÊN PHÒNG
  // =========================================================
  if (hinh_thuc_thue === 'Thuê nguyên phòng' && ma_phong) {
    
    // a. Đặt lại trạng thái cả phòng thành "Còn trống"
    await query(`UPDATE phong SET trang_thai = 'Còn trống' WHERE ma_phong = $1`, [ma_phong]);
    
    // b. Đặt lại trạng thái tất cả các giường trong phòng đó thành "Trống"
    await query(`UPDATE giuong SET trang_thai = 'Trống' WHERE ma_phong = $1`, [ma_phong]);
    
    console.log(`Đã giải phóng toàn bộ phòng ${ma_phong}`);

  } 
  // =========================================================
  // TRƯỜNG HỢP 2: Ở GHÉP (THUÊ THEO GIƯỜNG)
  // =========================================================
  else {
    // a. Tìm tất cả các giường mà hợp đồng này đang nắm giữ
    const beds = await query(
      `SELECT ma_giuong FROM hop_dong_giuong WHERE ma_hop_dong = $1`, 
      [maHopDong]
    );

    if (beds.rows.length > 0) {
      // Lấy ra mảng các mã giường (VD: ['G101_1', 'G101_2'])
      const bedIds = beds.rows.map(b => b.ma_giuong);
      
      // Tạo chuỗi placeholder $1, $2, $3... cho câu query
      const placeholders = bedIds.map((_, i) => `$${i + 1}`).join(',');

      // b. Cập nhật các giường đó thành "Trống"
      await query(
        `UPDATE giuong SET trang_thai = 'Trống' WHERE ma_giuong IN (${placeholders})`, 
        bedIds
      );

      // c. RẤT QUAN TRỌNG: Cập nhật lại trạng thái phòng
      // Nếu phòng đang "Hết chỗ", khi có người trả giường, phòng phải chuyển thành "Còn trống"
      await query(
        `UPDATE phong 
         SET trang_thai = 'Còn trống' 
         WHERE ma_phong IN (
            SELECT DISTINCT ma_phong FROM giuong WHERE ma_giuong IN (${placeholders})
         )`,
        bedIds
      );
      
      console.log(`Đã giải phóng các giường: ${bedIds.join(', ')}`);
    }
  }
}

export async function getStats(): Promise<{ tong: number; dang_thue: number; trong: number }> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE trang_thai = 'Đang thuê') as dang_thue,
       COUNT(*) FILTER (WHERE trang_thai = 'Còn trống') as trong
     FROM phong`
  );
  return {
    tong:       parseInt(result.rows[0].tong, 10),
    dang_thue:  parseInt(result.rows[0].dang_thue, 10),
    trong:      parseInt(result.rows[0].trong, 10),
  };
}

export async function findPhongPhuHop(maPhieuDK: string): Promise<any[]> {
  // Lấy thông tin phiếu đăng ký
  const phieuResult = await query(`
    SELECT 
      pdk.hinh_thuc_thue as hinhthucthue, 
      pdk.so_nguoi_du_kien as songuoidukien, 
      pdk.khu_vuc_mong_muon as khuvucmongmuon, 
      kh.gioi_tinh as gioitinh
    FROM phieu_dang_ky pdk
    JOIN khach_hang kh ON pdk.ma_khach_hang = kh.ma_khach_hang
    WHERE pdk.ma_phieu_dk = $1
  `, [maPhieuDK]);
  
  if (phieuResult.rows.length === 0) return [];
  
  const { hinhthucthue, songuoidukien, khuvucmongmuon, gioitinh } = phieuResult.rows[0];
  
  // Query phòng với thông tin giường
  let sql = `
    SELECT 
      p.ma_phong as maphong,
      p.loai_phong as loaiphong,
      p.suc_chua_toi_da as succhuatoida,
      p.gia_thue_phong as giatheuphong,
      p.trang_thai as trangthai,
      p.khu_vuc as khuvuc,
      p.gioi_tinh_ap_dung as gioitinhapdung,
      p.ma_chi_nhanh as machinhnanh,
      COUNT(g.ma_giuong) FILTER (WHERE g.ma_giuong IS NOT NULL) as tong_giuong,
      COUNT(g.ma_giuong) FILTER (WHERE g.ma_giuong IS NOT NULL AND g.trang_thai = 'Trống') as giuong_trong
    FROM phong p
    LEFT JOIN giuong g ON p.ma_phong = g.ma_phong
    WHERE p.gioi_tinh_ap_dung = $1 AND p.trang_thai = 'Còn trống'
  `;
  
  const params: any[] = [gioitinh];
  let idx = 2;
  
  if (hinhthucthue === 'Ở ghép') {
    // Ở ghép: cần đủ giường trống và phòng phải có giường
    sql += ` GROUP BY p.ma_phong`;
    sql += ` HAVING COUNT(g.ma_giuong) FILTER (WHERE g.ma_giuong IS NOT NULL AND g.trang_thai = 'Trống') >= $${idx}`;
    params.push(songuoidukien);
  } else {
    // Thuê nguyên phòng: cần sức chứa đủ
    sql += ` AND p.suc_chua_toi_da >= $${idx}`;
    params.push(songuoidukien);
    sql += ` GROUP BY p.ma_phong`;
  }
  
  const result = await query(sql, params);
  
  // Lấy chi tiết giường cho từng phòng
  const roomsWithBeds = await Promise.all(
    result.rows.map(async (room: any) => {
      const bedsResult = await query(
        `SELECT ma_giuong as magiuong, trang_thai as trangthai FROM giuong WHERE ma_phong = $1 ORDER BY ma_giuong`,
        [room.maphong]
      );
      console.log('bed ne ',bedsResult)
      return {
        ...room,
        beds: bedsResult.rows.map((bed: any, index: number) => ({
          id: index + 1, // Thứ tự (1, 2, 3...)
          magiuong: bed.magiuong, // ✅ Mã giường thực (G101_1, G101_2...)
          status: bed.trangthai
        }))
      };
    })
  );
  
  // Sắp xếp theo similarity với khuvucmongmuon + tên phòng
  const sorted = roomsWithBeds.sort((a, b) => {
    // Ưu tiên 1: khu vực match
    const simA = calculateSimilarity(a.khuvuc || '', khuvucmongmuon || '');
    const simB = calculateSimilarity(b.khuvuc || '', khuvucmongmuon || '');
    
    if (simA !== simB) return simB - simA; // Giảm dần theo similarity
    
    // Ưu tiên 2: tên phòng (A->Z)
    return a.maphong.localeCompare(b.maphong);
  });
  console.log('ans ne ')
  console.dir(sorted, { depth: null });
  return sorted;
}

// ✅ Cập nhật giường được chọn
export async function updateAssignedBeds(
  maPhieuDK: string,
  maPhong: string,
  assignedBeds: Array<{ magiuong: string }>
): Promise<any> {
  try {

    // Update những giường được chọn thành 'Đang sử dụng'
    for (const assignment of assignedBeds) {
      if (assignment.magiuong) {
        await query(
          `UPDATE giuong SET trang_thai = 'Đang sử dụng' 
           WHERE ma_phong = $1 AND ma_giuong = $2`,
          [maPhong, assignment.magiuong]
        );
        await query(
          `INSERT INTO phieu_dang_ky_giuong (ma_phieu_dk, ma_giuong) 
           VALUES ($1, $2)
           ON CONFLICT (ma_phieu_dk, ma_giuong) DO NOTHING`,
          [maPhieuDK, assignment.magiuong]
        );
      }
    }

    // Return phòng cập nhật
    const result = await query(
      `SELECT ma_phong as maphong, loai_phong as loaiphong, suc_chua_toi_da as succhuatoida, gia_thue_phong as giatheuphong, trang_thai as trangthai, khu_vuc as khuvuc, gioi_tinh_ap_dung as gioitinhapdung, ma_chi_nhanh as machinhnanh FROM phong WHERE ma_phong = $1`,
      [maPhong]
    );

    // console.log('query giuong ',result)
    // await query(
    //   `UPDATE phieu_dang_ky SET trang_thai = '' WHERE ma_phieu_dk = $1`,
    // );
    return result.rows[0];
  } catch (error: any) {
    throw new Error(`Lỗi cập nhật giường: ${error.message}`);
  }
}
export async function unassignBed(maPhieuDK: string, maGiuong: string) {
  try {
    await query('BEGIN', []);

    // 1. Xóa liên kết trong bảng trung gian
    await query(
      `DELETE FROM phieu_dang_ky_giuong WHERE ma_phieu_dk = $1 AND ma_giuong = $2`,
      [maPhieuDK, maGiuong]
    );

    // 2. Cập nhật giường thành 'Trống'
    await query(
      `UPDATE giuong SET trang_thai = 'Trống' WHERE ma_giuong = $1`,
      [maGiuong]
    );

    await query('COMMIT', []);
    return { success: true };
  } catch (error) {
    await query('ROLLBACK', []);
    throw error;
  }
}
// Thêm hàm này vào file dao
export async function assignWholeRoom(maPhieuDK: string, maPhong: string) {
  try {
    await query('BEGIN', []);

    // 1. Lấy danh sách tất cả các giường của phòng này
    const bedsResult = await query(`SELECT ma_giuong FROM giuong WHERE ma_phong = $1`, [maPhong]);
    const allBeds = bedsResult.rows;
    if (allBeds.length === 0) throw new Error("Phòng này chưa được setup giường");

    // 2. Liên kết phiếu đăng ký với phòng
    await query(
      `INSERT INTO phieu_dang_ky_phong (ma_phieu_dk, ma_phong) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [maPhieuDK, maPhong]
    );

    // 3. Liên kết phiếu đăng ký với TẤT CẢ giường của phòng đó
    for (const bed of allBeds) {
      await query(
        `INSERT INTO phieu_dang_ky_giuong (ma_phieu_dk, ma_giuong) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [maPhieuDK, bed.ma_giuong]
      );
    }
    
    // 4. Cập nhật trạng thái của tất cả giường thành 'Đang sử dụng'
    await query(`UPDATE giuong SET trang_thai = 'Đang sử dụng' WHERE ma_phong = $1`, [maPhong]);
    
    // 5. Cập nhật trạng thái của phòng thành 'Hết chỗ'
    await query(`UPDATE phong SET trang_thai = 'Hết chỗ' WHERE ma_phong = $1`, [maPhong]);

    // 6. Cập nhật trạng thái phiếu đăng ký thành 'Đã chọn phòng'
    await query(`UPDATE phieu_dang_ky SET trang_thai = 'Đã chọn phòng' WHERE ma_phieu_dk = $1`, [maPhieuDK]);

    await query('COMMIT', []);
    return true;
  } catch (error) {
    await query('ROLLBACK', []);
    throw error;
  }
}