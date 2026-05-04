import { Users, Bed, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

export function Dashboard() {
  const stats = [
    { label: 'Tổng khách hàng', value: '247', icon: Users, color: 'bg-blue-500' },
    { label: 'Phòng đang thuê', value: '156', icon: Bed, color: 'bg-green-500' },
    { label: 'Phòng trống', value: '44', icon: Bed, color: 'bg-yellow-500' },
    { label: 'Doanh thu tháng', value: '450M', icon: DollarSign, color: 'bg-purple-500' },
  ];

  const recentActivities = [
    { type: 'checkin', customer: 'Nguyễn Văn A', room: 'P301', time: '30 phút trước' },
    { type: 'deposit', customer: 'Trần Thị B', room: 'P205', time: '1 giờ trước' },
    { type: 'appointment', customer: 'Lê Văn C', room: 'P412', time: '2 giờ trước' },
    { type: 'checkout', customer: 'Phạm Thị D', room: 'P108', time: '3 giờ trước' },
  ];

  const upcomingAppointments = [
    { customer: 'Hoàng Văn E', phone: '0901234567', time: '14:00', room: 'P501' },
    { customer: 'Đỗ Thị F', phone: '0912345678', time: '15:30', room: 'P302' },
    { customer: 'Vũ Văn G', phone: '0923456789', time: '16:00', room: 'P215' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Tổng quan hệ thống</h1>
        <p className="text-slate-600 mt-1">Chào mừng trở lại! Đây là tổng quan hoạt động hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Hoạt động gần đây</h2>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'checkin' ? 'bg-green-100' :
                  activity.type === 'deposit' ? 'bg-blue-100' :
                  activity.type === 'appointment' ? 'bg-yellow-100' :
                  'bg-red-100'
                }`}>
                  {activity.type === 'checkin' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {activity.type === 'deposit' && <DollarSign className="w-5 h-5 text-blue-600" />}
                  {activity.type === 'appointment' && <Clock className="w-5 h-5 text-yellow-600" />}
                  {activity.type === 'checkout' && <TrendingUp className="w-5 h-5 text-red-600" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{activity.customer}</p>
                  <p className="text-sm text-slate-600">{activity.room} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Lịch xem phòng hôm nay</h2>
          <div className="space-y-4">
            {upcomingAppointments.map((apt, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                <div className="bg-blue-600 text-white px-3 py-2 rounded-lg text-center">
                  <p className="text-sm font-bold">{apt.time}</p>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{apt.customer}</p>
                  <p className="text-sm text-slate-600">{apt.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{apt.room}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
