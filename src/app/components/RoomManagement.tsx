import { useState } from 'react';
import { Search, Filter, Bed, Users, DollarSign, MapPin } from 'lucide-react';

export function RoomManagement() {
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const rooms = [
    {
      id: 'P301',
      area: 'Khu A',
      type: 'Phòng 4 người',
      capacity: 4,
      occupied: 4,
      price: '1.800.000',
      status: 'Đang sử dụng',
      gender: 'Nam'
    },
    {
      id: 'P302',
      area: 'Khu A',
      type: 'Phòng 4 người',
      capacity: 4,
      occupied: 2,
      price: '1.800.000',
      status: 'Còn giường',
      gender: 'Nam'
    },
    {
      id: 'P205',
      area: 'Khu B',
      type: 'Phòng 2 người',
      capacity: 2,
      occupied: 0,
      price: '2.500.000',
      status: 'Trống',
      gender: 'Nữ'
    },
    {
      id: 'P412',
      area: 'Khu A',
      type: 'Phòng 6 người',
      capacity: 6,
      occupied: 0,
      price: '1.500.000',
      status: 'Đã cọc',
      gender: 'Nam'
    },
    {
      id: 'P108',
      area: 'Khu C',
      type: 'Phòng 2 người',
      capacity: 2,
      occupied: 0,
      price: '2.200.000',
      status: 'Trống',
      gender: 'Nữ'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Trống':
        return 'bg-green-100 text-green-700';
      case 'Còn giường':
        return 'bg-yellow-100 text-yellow-700';
      case 'Đang sử dụng':
        return 'bg-blue-100 text-blue-700';
      case 'Đã cọc':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý phòng/giường</h1>
        <p className="text-slate-600 mt-1">Kiểm tra và quản lý tình trạng phòng/giường</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã phòng..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <select
              value={filterArea}
              onChange={(e) => setFilterArea(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả khu vực</option>
              <option value="A">Khu A</option>
              <option value="B">Khu B</option>
              <option value="C">Khu C</option>
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="available">Trống</option>
              <option value="partial">Còn giường</option>
              <option value="occupied">Đang sử dụng</option>
              <option value="deposited">Đã cọc</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className={`p-4 ${room.gender === 'Nam' ? 'bg-blue-50' : 'bg-pink-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-900">{room.id}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <MapPin className="w-4 h-4" />
                {room.area} • {room.gender}
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Bed className="w-4 h-4" />
                  {room.type}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Users className="w-4 h-4" />
                  Sức chứa
                </div>
                <span className="text-sm font-medium text-slate-900">
                  {room.occupied}/{room.capacity} người
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <DollarSign className="w-4 h-4" />
                  Giá thuê
                </div>
                <span className="text-sm font-bold text-blue-600">
                  {room.price} VNĐ/tháng
                </span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    room.occupied === 0 ? 'bg-green-500' :
                    room.occupied < room.capacity ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${(room.occupied / room.capacity) * 100}%` }}
                />
              </div>

              <button className="w-full mt-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                Xem chi tiết
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
