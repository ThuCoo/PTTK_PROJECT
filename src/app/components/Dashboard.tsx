import { useQuery } from '@tanstack/react-query';
import { Users, Bed, DollarSign, Clock, RefreshCw } from 'lucide-react';
import { dashboardApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toString();
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Vừa xong';
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  });

  const stats = [
    { label: 'Tổng khách hàng', value: data ? String(data.tong_khach_hang) : '—', icon: Users, color: 'bg-blue-500' },
    { label: 'Phòng đang thuê', value: data ? String(data.phong_dang_thue) : '—', icon: Bed, color: 'bg-green-500' },
    { label: 'Phòng trống', value: data ? String(data.phong_trong) : '—', icon: Bed, color: 'bg-yellow-500' },
    { label: 'Doanh thu tháng', value: data ? formatCurrency(data.doanh_thu_thang) : '—', icon: DollarSign, color: 'bg-purple-500' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tổng quan hệ thống</h1>
          <p className="text-slate-600 mt-1">
            Chào mừng, <strong>{user?.ho_ten}</strong>! Đây là tổng quan hoạt động hôm nay.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          ⚠️ Không thể kết nối máy chủ. Vui lòng đảm bảo backend đang chạy trên port 3001.
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold text-slate-900 ${isLoading ? 'opacity-50' : ''}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-3/4" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : data?.hoat_dong_gan_day?.length ? (
              data.hoat_dong_gan_day.map((activity: any, index: number) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{activity.customer}</p>
                    <p className="text-sm text-slate-600">{activity.room} • {timeAgo(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-sm text-center py-4">Chưa có hoạt động nào</p>
            )}
          </div>
        </div>

        {/* Today's appointments */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Lịch xem phòng hôm nay</h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="w-14 h-12 bg-slate-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-slate-200 rounded animate-pulse w-1/2" />
                  </div>
                </div>
              ))
            ) : data?.lich_xem_hom_nay?.length ? (
              data.lich_xem_hom_nay.map((apt: any, index: number) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-center min-w-[52px]">
                    <p className="text-sm font-bold">
                      {new Date(apt.thoi_gian).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{apt.ten_khach}</p>
                    <p className="text-sm text-slate-600">{apt.phone_khach}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900">{apt.ma_phong ?? 'TBD'}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      apt.trang_thai === 'Đã xác nhận' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{apt.trang_thai}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Không có lịch xem phòng hôm nay</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
