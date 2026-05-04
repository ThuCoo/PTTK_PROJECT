import { BarChart3, TrendingUp, Users, DollarSign, Download } from 'lucide-react';

export function Reports() {
  const monthlyData = [
    { month: 'T1', revenue: 420, occupancy: 92 },
    { month: 'T2', revenue: 435, occupancy: 94 },
    { month: 'T3', revenue: 450, occupancy: 95 },
    { month: 'T4', revenue: 445, occupancy: 93 },
    { month: 'T5', revenue: 460, occupancy: 96 },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Báo cáo & Thống kê</h1>
          <p className="text-slate-600 mt-1">Tổng hợp dữ liệu hoạt động và phân tích</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Download className="w-5 h-5" />
          Xuất báo cáo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Doanh thu tháng', value: '460M', change: '+8.5%', color: 'bg-blue-500', icon: DollarSign },
          { label: 'Tỷ lệ lấp đầy', value: '96%', change: '+3%', color: 'bg-green-500', icon: TrendingUp },
          { label: 'Khách hàng mới', value: '45', change: '+12%', color: 'bg-purple-500', icon: Users },
          { label: 'Hợp đồng mới', value: '38', change: '+5%', color: 'bg-orange-500', icon: BarChart3 },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
              </div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Doanh thu 5 tháng gần nhất</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{data.month}/2026</span>
                  <span className="text-sm font-bold text-blue-600">{data.revenue}M VNĐ</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(data.revenue / 500) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Tỷ lệ lấp đầy theo tháng</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">{data.month}/2026</span>
                  <span className="text-sm font-bold text-green-600">{data.occupancy}%</span>
                </div>
                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-green-600 h-full rounded-full transition-all"
                    style={{ width: `${data.occupancy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Thống kê theo khu vực</h2>
          <div className="space-y-4">
            {[
              { area: 'Khu A', rooms: 80, occupied: 76, revenue: 185 },
              { area: 'Khu B', rooms: 60, occupied: 58, revenue: 142 },
              { area: 'Khu C', rooms: 60, occupied: 56, revenue: 133 },
            ].map((area, index) => (
              <div key={index} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">{area.area}</h3>
                  <span className="text-sm text-slate-600">
                    {area.occupied}/{area.rooms} phòng
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Tỷ lệ lấp đầy</p>
                    <p className="font-bold text-green-600">{((area.occupied / area.rooms) * 100).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Doanh thu</p>
                    <p className="font-bold text-blue-600">{area.revenue}M VNĐ</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Top khách hàng</h2>
          <div className="space-y-3">
            {[
              { name: 'Nguyễn Văn A', room: 'P301', months: 8, total: 28800000 },
              { name: 'Trần Thị B', room: 'P205', months: 6, total: 15000000 },
              { name: 'Lê Văn C', room: 'P412', months: 8, total: 36000000 },
              { name: 'Phạm Thị D', room: 'P108', months: 6, total: 13200000 },
              { name: 'Hoàng Văn E', room: 'P501', months: 4, total: 10800000 },
            ].map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{customer.name}</p>
                  <p className="text-xs text-slate-600">{customer.room} • {customer.months} tháng</p>
                </div>
                <p className="font-bold text-blue-600">{customer.total.toLocaleString()} VNĐ</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
