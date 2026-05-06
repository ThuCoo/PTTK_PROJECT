import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Search, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { thanhToanApi } from '../../services/api';

const STATUS_COLOR: Record<string, string> = {
  'Đã thanh toán': 'bg-green-100 text-green-700',
  'Chưa thanh toán': 'bg-yellow-100 text-yellow-700',
  'Quá hạn': 'bg-red-100 text-red-700',
};

const STATUS_ICON = {
  'Đã thanh toán': <CheckCircle className="w-5 h-5 text-green-600" />,
  'Chưa thanh toán': <Clock className="w-5 h-5 text-yellow-600" />,
  'Quá hạn': <AlertTriangle className="w-5 h-5 text-red-600" />,
};

export function PaymentManagement() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [payMethod, setPayMethod] = useState('Chuyển khoản');

  const { data: payments = [], isLoading, refetch } = useQuery({
    queryKey: ['payments', search, filterStatus],
    queryFn: () => thanhToanApi.getAll({ search: search || undefined, trang_thai: filterStatus || undefined }),
    staleTime: 10_000,
  });

  const { data: stats } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: thanhToanApi.getStats,
  });

  const payMutation = useMutation({
    mutationFn: ({ id, phuong_thuc }: { id: number; phuong_thuc: string }) => thanhToanApi.pay(id, phuong_thuc),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      qc.invalidateQueries({ queryKey: ['payment-stats'] });
      setSelected((prev: any) => ({ ...prev, trang_thai: 'Đã thanh toán', phuong_thuc: payMethod, ngay_thanh_toan: new Date().toISOString() }));
      alert('Đã xác nhận thanh toán thành công!');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Lỗi xác nhận thanh toán'),
  });

  const handlePay = () => {
    if (!selected) return;
    payMutation.mutate({ id: selected.id, phuong_thuc: payMethod });
  };

  const statCards = [
    { label: 'Tổng phải thu', value: stats?.tong_phai_thu ?? 0, color: 'bg-blue-500' },
    { label: 'Đã thu', value: stats?.da_thu ?? 0, color: 'bg-green-500' },
    { label: 'Chưa thu', value: stats?.chua_thu ?? 0, color: 'bg-yellow-500' },
    { label: 'Quá hạn', value: stats?.qua_han ?? 0, color: 'bg-red-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý thanh toán</h1>
          <p className="text-slate-600 mt-1">Theo dõi và xử lý các khoản thanh toán định kỳ</p>
        </div>
        <button onClick={() => refetch()} className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <RefreshCw className={`w-5 h-5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {statCards.map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-slate-900">{Number(s.value).toLocaleString()}đ</p>
              </div>
              <div className={`${s.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Tìm kiếm theo mã phiếu, tên khách hàng..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Tất cả trạng thái</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Chưa thanh toán">Chưa thanh toán</option>
                <option value="Quá hạn">Quá hạn</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    {['Mã phiếu', 'Khách hàng', 'Kỳ thanh toán', 'Số tiền', 'Trạng thái'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-sm font-medium text-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        {Array.from({ length: 5 }).map((__, j) => (
                          <td key={j} className="py-4 px-4"><div className="h-4 bg-slate-200 rounded animate-pulse" /></td>
                        ))}
                      </tr>
                    ))
                  ) : payments.map((p: any) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${selected?.id === p.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-blue-600">{p.ma_phieu}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">{p.ten_khach}</p>
                        <p className="text-xs text-slate-600">{p.ma_phong}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-900">{p.thang}</p>
                        <p className="text-xs text-slate-600">Hạn: {p.han_thanh_toan ? new Date(p.han_thanh_toan).toLocaleDateString('vi-VN') : '—'}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{Number(p.tong_tien).toLocaleString()} VNĐ</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLOR[p.trang_thai] || 'bg-slate-100 text-slate-700'}`}>
                          {p.trang_thai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {!selected ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một phiếu thanh toán để xem chi tiết</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Chi tiết thanh toán</h2>
                {(STATUS_ICON as any)[selected.trang_thai]}
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Mã phiếu thu</p>
                  <p className="font-bold text-lg text-blue-600">{selected.ma_phieu}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-900">{selected.ten_khach}</p>
                  <p className="text-sm text-slate-600">{selected.ma_phong}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Kỳ thanh toán</p>
                  <p className="font-medium text-slate-900">{selected.thang}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Chi tiết các khoản</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tiền thuê phòng</span>
                    <span className="font-medium text-slate-900">{Number(selected.tien_thue).toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tiền điện</span>
                    <span className="font-medium text-slate-900">{Number(selected.tien_dien).toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tiền nước</span>
                    <span className="font-medium text-slate-900">{Number(selected.tien_nuoc).toLocaleString()} VNĐ</span>
                  </div>
                  {selected.phi_xe > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Phí gửi xe</span>
                      <span className="font-medium text-slate-900">{Number(selected.phi_xe).toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="font-bold text-blue-600 text-lg">{Number(selected.tong_tien).toLocaleString()} VNĐ</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Hạn thanh toán</p>
                  <p className="font-medium text-red-600">{selected.han_thanh_toan ? new Date(selected.han_thanh_toan).toLocaleDateString('vi-VN') : '—'}</p>
                </div>

                {selected.ngay_thanh_toan && (
                  <>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Ngày thanh toán</p>
                      <p className="font-medium text-green-600">{new Date(selected.ngay_thanh_toan).toLocaleString('vi-VN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Phương thức</p>
                      <p className="font-medium text-slate-900">{selected.phuong_thuc}</p>
                    </div>
                  </>
                )}

                {selected.trang_thai !== 'Đã thanh toán' && (
                  <div className="pt-4 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức thanh toán</label>
                      <select value={payMethod} onChange={e => setPayMethod(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Tiền mặt">Tiền mặt</option>
                        <option value="Chuyển khoản">Chuyển khoản</option>
                        <option value="MoMo">MoMo</option>
                        <option value="ZaloPay">ZaloPay</option>
                      </select>
                    </div>
                    <button
                      onClick={handlePay}
                      disabled={payMutation.isPending}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      {payMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đã thu tiền'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
