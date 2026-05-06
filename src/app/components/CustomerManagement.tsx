import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Search, Plus, X, Save, AlertCircle, RefreshCw } from 'lucide-react';
import { khachHangApi } from '../../services/api';

const EMPTY_FORM = {
  ho_ten: '', phone: '', email: '', cccd: '', gioi_tinh: 'Nam' as 'Nam' | 'Nữ',
  so_nguoi: 1, khu_vuc: '', loai_phong: '', khoang_gia: '',
  ngay_vao: '', thoi_han_thue: 6, ghi_chu: '', loai_thue: 'Thuê ở ghép', trang_thai: 'Đang tư vấn',
};

const STATUS_COLORS: Record<string, string> = {
  'Đang tư vấn': 'bg-blue-100 text-blue-700',
  'Đã lên lịch xem phòng': 'bg-yellow-100 text-yellow-700',
  'Đồng ý thuê': 'bg-green-100 text-green-700',
  'Chưa quyết định': 'bg-slate-100 text-slate-700',
  'Không tiếp tục thuê': 'bg-red-100 text-red-700',
};

export function CustomerManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers', search, filterStatus],
    queryFn: () => khachHangApi.getAll({ search: search || undefined, trang_thai: filterStatus || undefined }),
    staleTime: 10_000,
  });

  const createMutation = useMutation({
    mutationFn: khachHangApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); closeForm(); },
    onError: (err: any) => setFormError(err.response?.data?.error || 'Lỗi tạo khách hàng'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => khachHangApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); closeForm(); },
    onError: (err: any) => setFormError(err.response?.data?.error || 'Lỗi cập nhật'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, trang_thai }: { id: number; trang_thai: string }) =>
      khachHangApi.updateStatus(id, trang_thai),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });

  const openCreate = () => { setForm({ ...EMPTY_FORM }); setEditingId(null); setFormError(''); setShowForm(true); };
  const openEdit = (kh: any) => {
    setForm({
      ho_ten: kh.ho_ten, phone: kh.phone, email: kh.email ?? '', cccd: kh.cccd ?? '',
      gioi_tinh: kh.gioi_tinh, so_nguoi: kh.so_nguoi, khu_vuc: kh.khu_vuc ?? '',
      loai_phong: kh.loai_phong ?? '', khoang_gia: kh.khoang_gia ?? '',
      ngay_vao: kh.ngay_vao?.split('T')[0] ?? '', thoi_han_thue: kh.thoi_han_thue ?? 6,
      ghi_chu: kh.ghi_chu ?? '', loai_thue: kh.loai_thue ?? 'Thuê ở ghép',
      trang_thai: kh.trang_thai,
    });
    setEditingId(kh.id); setFormError(''); setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); setFormError(''); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.ho_ten.trim() || !form.phone.trim()) {
      setFormError('Họ tên và số điện thoại là bắt buộc'); return;
    }
    if (editingId !== null) updateMutation.mutate({ id: editingId, data: form });
    else createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý khách hàng</h1>
          <p className="text-slate-600 mt-1">Theo dõi thông tin và trạng thái khách hàng</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => refetch()} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" /> Thêm khách hàng
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, SĐT, email..."
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tất cả trạng thái</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Không thể tải dữ liệu. Kiểm tra kết nối backend.
          </div>
        )}
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {['Mã phiếu', 'Họ tên', 'SĐT', 'Giới tính', 'Loại phòng', 'Ngày vào', 'Trạng thái', 'Hành động'].map(h => (
                <th key={h} className="text-left py-3 px-4 text-sm font-semibold text-slate-700">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-slate-100">
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="py-4 px-4">
                      <div className="h-4 bg-slate-200 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : customers.length === 0 ? (
              <tr><td colSpan={8} className="py-12 text-center text-slate-500">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                Không tìm thấy khách hàng nào
              </td></tr>
            ) : (
              customers.map((kh: any) => (
                <tr key={kh.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 font-medium text-blue-600">{kh.ma_phieu}</td>
                  <td className="py-3 px-4">
                    <p className="font-medium text-slate-900">{kh.ho_ten}</p>
                    <p className="text-xs text-slate-500">{kh.email}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{kh.phone}</td>
                  <td className="py-3 px-4 text-slate-700">{kh.gioi_tinh}</td>
                  <td className="py-3 px-4 text-slate-700">{kh.loai_phong || '—'}</td>
                  <td className="py-3 px-4 text-slate-700">
                    {kh.ngay_vao ? new Date(kh.ngay_vao).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={kh.trang_thai}
                      onChange={e => statusMutation.mutate({ id: kh.id, trang_thai: e.target.value })}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${STATUS_COLORS[kh.trang_thai] || 'bg-slate-100 text-slate-700'}`}
                    >
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => openEdit(kh)} className="text-xs px-3 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                      Sửa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="p-4 border-t border-slate-200 text-sm text-slate-600">
          {isLoading ? '' : `${customers.length} khách hàng`}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {editingId ? 'Cập nhật khách hàng' : 'Thêm khách hàng mới'}
              </h2>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6">
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Họ và tên *', key: 'ho_ten', type: 'text', colSpan: 2 },
                  { label: 'Số điện thoại *', key: 'phone', type: 'tel' },
                  { label: 'Email', key: 'email', type: 'email' },
                  { label: 'CCCD', key: 'cccd', type: 'text' },
                  { label: 'Số người', key: 'so_nguoi', type: 'number' },
                  { label: 'Khu vực mong muốn', key: 'khu_vuc', type: 'text' },
                  { label: 'Loại phòng', key: 'loai_phong', type: 'text' },
                  { label: 'Ngày vào dự kiến', key: 'ngay_vao', type: 'date' },
                  { label: 'Thời hạn thuê (tháng)', key: 'thoi_han_thue', type: 'number' },
                ].map(({ label, key, type, colSpan }) => (
                  <div key={key} className={colSpan === 2 ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                    <input
                      type={type} value={(form as any)[key]}
                      onChange={e => setForm({ ...form, [key]: type === 'number' ? parseInt(e.target.value) : e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giới tính *</label>
                  <select value={form.gioi_tinh} onChange={e => setForm({ ...form, gioi_tinh: e.target.value as 'Nam' | 'Nữ' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại thuê</label>
                  <select value={form.loai_thue} onChange={e => setForm({ ...form, loai_thue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                    <option>Thuê ở ghép</option>
                    <option>Thuê nguyên phòng</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ghi chú</label>
                  <textarea value={form.ghi_chu} onChange={e => setForm({ ...form, ghi_chu: e.target.value })}
                    rows={2} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button onClick={closeForm} className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSubmit} disabled={isPending}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
                {isPending ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang lưu...</> : <><Save className="w-4 h-4" />Lưu</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
