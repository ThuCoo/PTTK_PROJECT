import { useState } from 'react';
import { Calendar, Clock, Plus, Phone, Mail, MapPin, Eye, Edit, X as XIcon } from 'lucide-react';

export function AppointmentManagement() {
  const [showAddForm, setShowAddForm] = useState(false);

  const appointments = [
    {
      id: 1,
      registrationCode: 'PDK001',
      customer: 'Hoàng Văn E',
      phone: '0901234567',
      email: 'hoangvane@email.com',
      numPeople: 2,
      room: 'P501',
      area: 'Khu A',
      date: '02/05/2026',
      time: '14:00',
      status: 'Đã xác nhận',
      note: 'Khách muốn xem điều kiện vệ sinh'
    },
    {
      id: 2,
      registrationCode: 'PDK002',
      customer: 'Đỗ Thị F',
      phone: '0912345678',
      email: 'dothif@email.com',
      numPeople: 1,
      room: 'P302',
      area: 'Khu A',
      date: '02/05/2026',
      time: '15:30',
      status: 'Chờ xác nhận',
      note: ''
    },
    {
      id: 3,
      registrationCode: 'PDK003',
      customer: 'Vũ Văn G',
      phone: '0923456789',
      email: 'vuvang@email.com',
      numPeople: 4,
      room: 'P215',
      area: 'Khu B',
      date: '03/05/2026',
      time: '10:00',
      status: 'Đã xác nhận',
      note: 'Xem nhóm 4 người'
    },
    {
      id: 4,
      registrationCode: 'PDK004',
      customer: 'Nguyễn Thị H',
      phone: '0934567890',
      email: 'nguyenthih@email.com',
      numPeople: 1,
      room: 'P108',
      area: 'Khu C',
      date: '03/05/2026',
      time: '16:00',
      status: 'Đã hoàn thành',
      note: 'Khách đã xem và đồng ý thuê'
    },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý lịch xem phòng</h1>
          <p className="text-slate-600 mt-1">Sắp xếp và theo dõi lịch hẹn xem phòng với khách hàng</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Tạo lịch hẹn
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng lịch hẹn', value: '24', color: 'bg-blue-500' },
          { label: 'Hôm nay', value: '6', color: 'bg-green-500' },
          { label: 'Chờ xác nhận', value: '3', color: 'bg-yellow-500' },
          { label: 'Đã hoàn thành', value: '15', color: 'bg-purple-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tất cả trạng thái</option>
            <option>Chờ xác nhận</option>
            <option>Đã xác nhận</option>
            <option>Đã hoàn thành</option>
            <option>Đã hủy</option>
          </select>
          <select className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Tất cả khu vực</option>
            <option>Khu A</option>
            <option>Khu B</option>
            <option>Khu C</option>
          </select>
          <input
            type="date"
            className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Thời gian</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Khách hàng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Phòng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Ghi chú</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                        <Calendar className="w-4 h-4" />
                        {apt.date}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                          {apt.registrationCode}
                        </span>
                      </div>
                      <p className="font-medium text-slate-900">{apt.customer}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <Phone className="w-3 h-3" />
                        {apt.phone}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{apt.numPeople} người</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-slate-900">{apt.room}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                        <MapPin className="w-3 h-3" />
                        {apt.area}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{apt.note || '-'}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      apt.status === 'Đã xác nhận' ? 'bg-green-100 text-green-700' :
                      apt.status === 'Chờ xác nhận' ? 'bg-yellow-100 text-yellow-700' :
                      apt.status === 'Đã hoàn thành' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {apt.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Tạo lịch hẹn xem phòng</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chọn phiếu đăng ký thuê *</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>-- Chọn phiếu đăng ký thuê --</option>
                      <option>PDK001 - Nguyễn Văn A - 2 người - Khu A</option>
                      <option>PDK002 - Trần Thị B - 1 người - Khu B</option>
                      <option>PDK003 - Lê Văn C - 4 người - Khu A</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Chọn phiếu đăng ký của khách hàng đã ghi nhận thông tin</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chọn phòng dự kiến *</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>-- Chọn phòng --</option>
                      <option>P301 - Phòng 4 người - Khu A - 1.800.000đ</option>
                      <option>P205 - Phòng 2 người - Khu B - 2.500.000đ</option>
                      <option>P412 - Phòng 6 người - Khu A - 1.500.000đ</option>
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Phòng khách hàng sẽ được dẫn đi xem</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ngày hẹn *</label>
                    <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Giờ hẹn *</label>
                    <input type="time" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú về lịch hẹn</label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Khách muốn xem điều kiện vệ sinh, muốn xem cả phòng bên cạnh..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Tạo lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
