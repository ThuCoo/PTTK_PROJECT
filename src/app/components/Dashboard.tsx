import { useQuery } from "@tanstack/react-query";
import { Users, Bed, DollarSign, Clock, RefreshCw } from "lucide-react";
import { dashboardApi } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K`;
  return amount.toString();
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return `${Math.floor(diff / 86400)} ngày trước`;
}

export function Dashboard() {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: dashboardApi.getStats,
    refetchInterval: 60_000,
  });

  const stats = [
    {
      label: "Tổng khách hàng",
      value: data ? String(data.tong_khach_hang) : "—",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Phòng đang thuê",
      value: data ? String(data.phong_dang_thue) : "—",
      icon: Bed,
      color: "bg-green-500",
    },
    {
      label: "Phòng trống",
      value: data ? String(data.phong_trong) : "—",
      icon: Bed,
      color: "bg-yellow-500",
    },
    {
      label: "Doanh thu tháng",
      value: data ? formatCurrency(data.doanh_thu_thang) : "—",
      icon: DollarSign,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-full px-8 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[42px] font-extrabold tracking-tight text-[#132238]">
            Tổng quan hệ thống
          </h1>
          <p className="mt-2 text-[20px] text-slate-600">
            Chào mừng, <strong>{user?.ho_ten}</strong>! Đây là tổng quan hoạt
            động hôm nay.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-[16px] font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-[18px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Không thể kết nối máy chủ. Vui lòng đảm bảo backend đang chạy trên
          port 3001.
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="mb-1 text-sm text-slate-600">{stat.label}</p>
                  <p
                    className={`text-[38px] font-extrabold tracking-tight text-[#132238] ${isLoading ? "opacity-50" : ""}`}
                  >
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${stat.color}`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
          <h2 className="mb-5 text-[26px] font-extrabold tracking-tight text-[#132238]">
            Hoạt động gần đây
          </h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))
            ) : data?.hoat_dong_gan_day?.length ? (
              data.hoat_dong_gan_day.map((activity: any, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-4 border-b border-slate-100 pb-4 last:border-0"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e8f0ff]">
                    <DollarSign className="h-5 w-5 text-[#1f63ff]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#132238]">
                      {activity.customer}
                    </p>
                    <p className="text-sm text-slate-600">
                      {activity.room} • {timeAgo(activity.time)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-slate-500">
                Chưa có hoạt động nào
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
          <h2 className="mb-5 text-[26px] font-extrabold tracking-tight text-[#132238]">
            Lịch xem phòng hôm nay
          </h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"
                >
                  <div className="h-12 w-14 rounded-2xl bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />
                  </div>
                </div>
              ))
            ) : data?.lich_xem_hom_nay?.length ? (
              data.lich_xem_hom_nay.map((apt: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4"
                >
                  <div className="min-w-[72px] rounded-2xl bg-[#1f63ff] px-3 py-2 text-center text-white">
                    <p className="text-sm font-bold">
                      {new Date(apt.thoi_gian).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-[#132238]">
                      {apt.ten_khach}
                    </p>
                    <p className="text-sm text-slate-600">{apt.phone_khach}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#132238]">
                      {apt.ma_phong ?? "TBD"}
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${apt.trang_thai === "Đã xác nhận" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                    >
                      {apt.trang_thai}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center">
                <Clock className="mx-auto mb-2 h-12 w-12 text-slate-300" />
                <p className="text-sm text-slate-500">
                  Không có lịch xem phòng hôm nay
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
