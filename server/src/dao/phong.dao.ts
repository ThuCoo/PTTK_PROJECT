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
  let sql = 'SELECT * FROM Phong WHERE 1=1';
  const params: any[] = [];
  let idx = 1;
  if (khuVuc) { sql += ` AND KhuVuc = $${idx++}`; params.push(khuVuc); }
  if (trangThai) { sql += ` AND TrangThai = $${idx++}`; params.push(trangThai); }
  if (search) { sql += ` AND MaPhong ILIKE $${idx++}`; params.push(`%${search}%`); }
  sql += ' ORDER BY MaPhong';
  const result = await query(sql, params);
  return result.rows;
}

export async function getById(id: string): Promise<Phong | null> {
  const result = await query('SELECT * FROM Phong WHERE MaPhong = $1', [id]);
  return result.rows[0] || null;
}

export async function getByMaPhong(maPhong: string): Promise<Phong | null> {
  const result = await query('SELECT * FROM Phong WHERE MaPhong = $1', [maPhong]);
  return result.rows[0] || null;
}

export async function updateStatus(id: string, trangThai: string): Promise<void> {
  await query('UPDATE Phong SET TrangThai = $1 WHERE MaPhong = $2', [trangThai, id]);
}

export async function getStats(): Promise<{ tong: number; dang_thue: number; trong: number }> {
  const result = await query(
    `SELECT
       COUNT(*) as tong,
       COUNT(*) FILTER (WHERE TrangThai = 'Đang thuê') as dang_thue,
       COUNT(*) FILTER (WHERE TrangThai = 'Còn trống') as trong
     FROM Phong`
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
      pdk.hinhthucthue, 
      pdk.songuoidukien, 
      pdk.khuvucmongmuon, 
      kh.gioitinh
    FROM phieudangky pdk
    JOIN khachhang kh ON pdk.makhachhang = kh.makhachhang
    WHERE pdk.maphieudk = $1
  `, [maPhieuDK]);
  
  if (phieuResult.rows.length === 0) return [];
  
  const { hinhthucthue, songuoidukien, khuvucmongmuon, gioitinh } = phieuResult.rows[0];
  console.log('Toi day roi ne1')
  // Query phòng với thông tin giường
  let sql = `
    SELECT 
      p.*,
      COUNT(g.magiuong) FILTER (WHERE g.magiuong IS NOT NULL) as tong_giuong,
      COUNT(g.magiuong) FILTER (WHERE g.magiuong IS NOT NULL AND g.trangthai = 'Trống') as giuong_trong
    FROM phong p
    LEFT JOIN giuong g ON p.maphong = g.maphong
    WHERE p.gioitinhapdung = $1 AND p.trangthai = 'Còn trống'
  `;
  
  const params: any[] = [gioitinh];
  let idx = 2;
  
  if (hinhthucthue === 'Ở ghép') {
    // Ở ghép: cần đủ giường trống và phòng phải có giường
    sql += ` GROUP BY p.maphong`;
    sql += ` HAVING COUNT(g.magiuong) FILTER (WHERE g.magiuong IS NOT NULL AND g.trangthai = 'Trống') >= $${idx}`;
    params.push(songuoidukien);
  } else {
    // Thuê nguyên phòng: cần sức chứa đủ
    sql += ` AND p.succhuatoida >= $${idx}`;
    params.push(songuoidukien);
    sql += ` GROUP BY p.maphong`;
  }
  
  const result = await query(sql, params);
  
  // Sắp xếp theo similarity với khuvucmongmuon + tên phòng
  const sorted = result.rows.sort((a, b) => {
    // Ưu tiên 1: khu vực match
    const simA = calculateSimilarity(a.khuvuc || '', khuvucmongmuon || '');
    const simB = calculateSimilarity(b.khuvuc || '', khuvucmongmuon || '');
    
    if (simA !== simB) return simB - simA; // Giảm dần theo similarity
    
    // Ưu tiên 2: tên phòng (A->Z)
    return a.maphong.localeCompare(b.maphong);
  });
  console.log('ans ne ',sorted)
  return sorted;
}
