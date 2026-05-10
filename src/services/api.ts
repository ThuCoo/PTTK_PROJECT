import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect to login on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    }
    return Promise.reject(err);
  },
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    api.post("/auth/login", { username, password }).then((r) => r.data.data),
  me: () => api.get("/auth/me").then((r) => r.data.data),
  createUser: (data: any) =>
    api.post("/auth/users", data).then((r) => r.data.data),
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get("/dashboard").then((r) => r.data.data),
};

// ─── Customers ───────────────────────────────────────────────────────────────
export const khachHangApi = {
  getAll: (params?: { search?: string; trang_thai?: string }) =>
    api.get('/khach-hang', { params }).then(r => r.data.data),
  getById: (id: number) => api.get(`/khach-hang/${id}`).then(r => r.data.data),
  create: (data: any) => api.post('/khach-hang', data).then(r => r.data.data),
  update: (id: number, data: any) => api.put(`/khach-hang/${id}`, data).then(r => r.data.data),
updateStatus: (id: number, trang_thai: string) =>
    api.patch(`/khach-hang/${id}/status`, { trang_thai }).then(r => r.data.data),
};
// export const giuong
// ─── Rooms ───────────────────────────────────────────────────────────────────
export const phongApi = {
  getAll: (params?: { khu_vuc?: string; trang_thai?: string; search?: string }) =>
    api.get('/phong', { params }).then(r => r.data.data),
  getById: (id: number) => api.get(`/phong/${id}`).then(r => r.data.data),
  getStats: () => api.get('/phong/stats').then(r => r.data.data),
  findPhuHop: (maPhieuDK: string) =>
    api.get(`/phong/phu-hop/${maPhieuDK}`).then(r => r.data.data),  // ✅ API cập nhật giường được chọn
  updateAssignedBeds: (maphieu:string, maphong: string, assignedBeds: any[]) =>
    api.put(`/phong/${maphong}`, { assignedRooms: assignedBeds ,maPhieu:maphieu}).then(r => r.data),
  unassignBed: (maPhieuDK: string, maGiuong: string) => 
      api.delete(`/phong/unassign-bed`, { 
        data: { maPhieuDK, maGiuong } // Axios yêu cầu dùng { data: ... } cho DELETE body
      }).then(r => r.data.data),
   assignWholeRoom: (maPhieuDK: string, maPhong: string) =>
    api.post('/phong/assign-whole-room', { maPhieuDK, maPhong }).then(r => r.data),
};

// ─── Appointments ────────────────────────────────────────────────────────────
export const lichXemPhongApi = {
  getAll: (date?: string) =>
    api.get("/lich-xem-phong", { params: { date } }).then((r) => r.data.data),
  getToday: () => api.get("/lich-xem-phong/today").then((r) => r.data.data),
  create: (data: any) =>
    api.post("/lich-xem-phong", data).then((r) => r.data.data),
  updateStatus: (id: number, trang_thai: string) =>
    api
      .patch(`/lich-xem-phong/${id}/status`, { trang_thai })
      .then((r) => r.data),
};

// ─── Deposits ────────────────────────────────────────────────────────────────
export const datCocApi = {
  getAll: (params?: { search?: string; trang_thai?: string }) =>
    api.get("/dat-coc", { params }).then((r) => r.data.data),
  getPhieuDangKy: () =>
    api.get("/dat-coc/phieu-dang-ky").then((r) => r.data.data),
  getById: (id: number) => api.get(`/dat-coc/${id}`).then((r) => r.data.data),
  getStats: () => api.get("/dat-coc/stats").then((r) => r.data.data),
  search: (q: string) =>
    api.get("/dat-coc/search", { params: { q } }).then((r) => r.data.data),
  getProof: (id: number) =>
    api.get(`/dat-coc/${id}/proof`).then((r) => r.data.data),
  create: (data: any) => api.post("/dat-coc", data).then((r) => r.data.data),
  uploadProof: (id: number, formData: FormData) =>
    api
      .post(`/dat-coc/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  confirm: (id: number) =>
    api.post(`/dat-coc/${id}/confirm`).then((r) => r.data),
  reject: (id: number, ghi_chu: string) =>
    api.post(`/dat-coc/${id}/reject`, { ghi_chu }).then((r) => r.data),
  refund: (id: number, ghi_chu: string) =>
    api.post(`/dat-coc/${id}/refund`, { ghi_chu }).then((r) => r.data),
  getByPhone:(id:string)=> api.get(`/dat-coc/phone/${id}`).then(r=>r.data.data),
  saveMembers: (maHD: string, members: any[]) =>
    api.post(`/dat-coc/${maHD}/members`, { members }).then(r => r.data.data),
};

// ─── Contracts ───────────────────────────────────────────────────────────────
// export const hopDongApi = {
//   getAll: (params?: { search?: string; trang_thai?: string }) =>
//     api.get('/hop-dong', { params }).then(r => r.data.data),
//   getById: (id: number) => api.get(`/hop-dong/${id}`).then(r => r.data.data),
//   getStats: () => api.get('/hop-dong/stats').then(r => r.data.data),
//   create: (data: any) => api.post('/hop-dong', data).then(r => r.data.data),
//   sign: (id: number) => api.post(`/hop-dong/${id}/sign`).then(r => r.data),
//   terminate: (id: number) => api.post(`/hop-dong/${id}/terminate`).then(r => r.data),
//   addMembers: (id: number, members: any[]) =>
//     api.post(`/hop-dong/${id}/members`, { members }).then(r => r.data),
// };
export const hopDongApi = {
  getAll: (params?: { search?: string; trang_thai?: string }) =>
    api.get("/hop-dong", { params }).then((r) => r.data.data),
  getById: (id: number) => api.get(`/hop-dong/${id}`).then((r) => r.data.data),
  getStats: () => api.get("/hop-dong/stats").then((r) => r.data.data),
  create: (data: any) => api.post("/hop-dong", data).then((r) => r.data.data),
  sign: (id: number) => api.post(`/hop-dong/${id}/sign`).then((r) => r.data),
  terminate: (id: number) =>
    api.post(`/hop-dong/${id}/terminate`).then((r) => r.data),
  addMembers: (id: number, members: any[]) =>
    api.post(`/hop-dong/${id}/members`, { members }).then((r) => r.data),
  getAllPending: () => api.get('/hop-dong/pending').then(r => r.data.data),
  getOrCreate: (depositCode: string) => api.post('/hop-dong/get-or-create', { depositCode }).then(r => r.data.data),
  confirm: (contractId: string) => api.post(`/hop-dong/${contractId}/confirm`).then(r => r.data),
  cancel: (contractId: string) => api.post(`/hop-dong/${contractId}/cancel`).then(r => r.data),
  getReadyForReturn: () => api.get('/hop-dong/return-ready').then(r => r.data.data),
  roomReturn: (contractId: string) => api.post(`/hop-dong/${contractId}/room-return`).then(r => r.data.data),
};

// ─── Payments ────────────────────────────────────────────────────────────────
export const thanhToanApi = {
  getAll: (params?: { search?: string; trang_thai?: string }) =>
    api.get("/thanh-toan", { params }).then((r) => r.data.data),
  getById: (id: number) =>
    api.get(`/thanh-toan/${id}`).then((r) => r.data.data),
  getStats: () => api.get("/thanh-toan/stats").then((r) => r.data.data),
  create: (data: any) => api.post("/thanh-toan", data).then((r) => r.data.data),
  pay: (id: number, phuong_thuc: string) =>
    api.post(`/thanh-toan/${id}/pay`, { phuong_thuc }).then((r) => r.data),
  fetchUnpaid: (contractId: number) =>
    api.get(`/thanh-toan/contract/${contractId}/unpaid`).then((r) => r.data.data),
};
// ─── Phieu Dang Ky (Registrations Verification) ──────────────────────────────
export const phieuDangKyApi = {
  // Lấy danh sách các phiếu đang chờ rà soát
  getPendingVerification: () => 
    api.get('/phieu-dang-ky/pending-verification').then(r => r.data.data),
    
  // Cập nhật trạng thái của phiếu (Chuyển bước)
  updateStatus: (id: string, trang_thai: string, ghi_chu?: string) =>
    api.patch(`/phieu-dang-ky/${id}/status`, { trang_thai, ghi_chu }).then(r => r.data),
    
  // Báo cáo phòng/giường lỗi -> Hủy gán phòng và bắt chọn lại
  rejectAssignedRoom: (id: string, ghi_chu: string) =>
    api.post(`/phieu-dang-ky/${id}/reject-room`, { ghi_chu }).then(r => r.data),
  completeVerification: (id: string) =>
    api.post(`/phieu-dang-ky/${id}/complete-verification`).then(r => r.data),
};