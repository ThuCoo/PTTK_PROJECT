import { useState } from 'react';
import { Plus, Search, Edit, Eye, Phone, Mail, MapPin, ClipboardCheck, X } from 'lucide-react';

export function CustomerManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConsultationForm, setShowConsultationForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [consultationResult, setConsultationResult] = useState({
    roomsAdvised: '',
    rulesDiscussed: '',
    rentCost: '',
    serviceCost: '',
    depositPolicy: '',
    decision: 'agreed',
    notes: ''
  });

  const customers = [
    {
      id: 1,
      registrationCode: 'PDK001',
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      email: 'nguyenvana@email.com',
      idCard: '001234567890',
      gender: 'Nam',
      numPeople: 2,
      area: 'Khu A',
      roomType: 'Phòng 4 người',
      priceRange: '1.500.000 - 2.000.000',
      moveInDate: '15/05/2026',
      rentalPeriod: 6,
      notes: 'Cần gần trường đại học, yêu cầu phòng thoáng mát',
      rentalType: 'Thuê ở ghép',
      assignedRooms: [{ room: 'P301', bed: 2 }, { room: 'P302', bed: 1 }],
      status: 'Đang tư vấn',
      date: '01/05/2026'
    },
    {
      id: 2,
      registrationCode: 'PDK002',
      name: 'Trần Thị B',
      phone: '0912345678',
      email: 'tranthib@email.com',
      idCard: '002345678901',
      gender: 'Nữ',
      numPeople: 1,
      area: 'Khu B',
      roomType: 'Phòng 2 người',
      priceRange: '2.000.000 - 2.500.000',
      moveInDate: '10/05/2026',
      rentalPeriod: 12,
      notes: 'Cần phòng yên tĩnh để học tập',
      rentalType: 'Thuê ở ghép',
      assignedRooms: [{ room: 'P205', bed: 1 }],
      status: 'Đã lên lịch xem phòng',
      date: '30/04/2026'
    },
    {
      id: 3,
      registrationCode: 'PDK003',
      name: 'Lê Văn C',
      phone: '0923456789',
      email: 'levanc@email.com',
      idCard: '003456789012',
      gender: 'Nam',
      numPeople: 4,
      area: 'Khu A',
      roomType: 'Phòng 6 người',
      priceRange: '1.200.000 - 1.500.000',
      moveInDate: '01/06/2026',
      rentalPeriod: 6,
      notes: 'Thuê cho nhóm 4 bạn sinh viên',
      rentalType: 'Thuê nguyên phòng',
      assignedRooms: [{ room: 'P412', bed: null }],
      status: 'Đồng ý thuê',
      date: '29/04/2026'
    },
  ];

  const formatAssignedRooms = (rooms: any[]) => {
    if (!rooms || rooms.length === 0) return null;
    return rooms.map((r: any) => r.bed ? `${r.room}/${r.bed}` : r.room).join(', ');
  };

  const handleOpenConsultation = (customer: any) => {
    setSelectedCustomer(customer);
    setShowConsultationForm(true);
  };

  const handleViewDetail = (customer: any) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Quản lý khách hàng</h1>
          <p className="text-slate-600 mt-1">Ghi nhận và quản lý thông tin khách hàng đăng ký thuê</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm khách hàng
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, số điện thoại, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Họ và tên</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Liên hệ</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Yêu cầu</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Trạng thái</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Ngày tạo</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-slate-900">{customer.name}</p>
                      <p className="text-sm text-slate-600">{customer.gender}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <Phone className="w-4 h-4" />
                        {customer.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <MapPin className="w-4 h-4" />
                        {customer.area}
                      </div>
                      <p className="text-sm text-slate-600">{customer.roomType}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      customer.status === 'Đang tư vấn' ? 'bg-yellow-100 text-yellow-700' :
                      customer.status === 'Đã lên lịch xem phòng' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{customer.date}</td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDetail(customer)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {(customer.status === 'Đang tư vấn' || customer.status === 'Đã lên lịch xem phòng') && (
                        <button
                          onClick={() => handleOpenConsultation(customer)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Cập nhật kết quả tư vấn"
                        >
                          <ClipboardCheck className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showConsultationForm && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Cập nhật kết quả tư vấn</h2>
                <p className="text-sm text-slate-600 mt-1">Khách hàng: {selectedCustomer.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowConsultationForm(false);
                  setSelectedCustomer(null);
                  setConsultationResult({
                    roomsAdvised: '',
                    rulesDiscussed: '',
                    rentCost: '',
                    serviceCost: '',
                    depositPolicy: '',
                    decision: 'agreed',
                    notes: ''
                  });
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-slate-900 mb-2">Thông tin đăng ký thuê</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Họ tên:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCustomer.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Giới tính:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCustomer.gender}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Khu vực:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCustomer.area}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Loại phòng:</span>
                    <span className="ml-2 font-medium text-slate-900">{selectedCustomer.roomType}</span>
                  </div>
                </div>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phòng/giường đã tư vấn *</label>
                  <input
                    type="text"
                    value={consultationResult.roomsAdvised}
                    onChange={(e) => setConsultationResult({...consultationResult, roomsAdvised: e.target.value})}
                    placeholder="VD: P301 - 2 giường, P302 - 4 giường"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nội quy đã trao đổi</label>
                  <textarea
                    rows={3}
                    value={consultationResult.rulesDiscussed}
                    onChange={(e) => setConsultationResult({...consultationResult, rulesDiscussed: e.target.value})}
                    placeholder="Các quy định về giờ giấc, khách, vệ sinh..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chi phí thuê (VNĐ/tháng)</label>
                    <input
                      type="text"
                      value={consultationResult.rentCost}
                      onChange={(e) => setConsultationResult({...consultationResult, rentCost: e.target.value})}
                      placeholder="1.800.000"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chi phí dịch vụ</label>
                    <input
                      type="text"
                      value={consultationResult.serviceCost}
                      onChange={(e) => setConsultationResult({...consultationResult, serviceCost: e.target.value})}
                      placeholder="Điện, nước, wifi..."
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quy định đặt cọc</label>
                  <input
                    type="text"
                    value={consultationResult.depositPolicy}
                    onChange={(e) => setConsultationResult({...consultationResult, depositPolicy: e.target.value})}
                    placeholder="VD: 2 tháng tiền thuê, thời hạn 24h"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Quyết định của khách hàng *</label>
                  <select
                    value={consultationResult.decision}
                    onChange={(e) => setConsultationResult({...consultationResult, decision: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="agreed">Đồng ý thuê - Chờ rà soát và thỏa thuận thuê</option>
                    <option value="undecided">Chưa quyết định - Cần suy nghĩ thêm</option>
                    <option value="view_more">Chưa quyết định - Muốn xem thêm phòng</option>
                    <option value="adjust">Điều chỉnh tiêu chí thuê</option>
                    <option value="declined">Không tiếp tục thuê</option>
                  </select>
                </div>

                {(consultationResult.decision === 'undecided' || consultationResult.decision === 'view_more' || consultationResult.decision === 'declined') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      {consultationResult.decision === 'declined' ? 'Lý do hủy *' : 'Ghi chú'}
                    </label>
                    <textarea
                      rows={3}
                      value={consultationResult.notes}
                      onChange={(e) => setConsultationResult({...consultationResult, notes: e.target.value})}
                      placeholder={
                        consultationResult.decision === 'declined'
                          ? 'Nhập lý do khách hàng không tiếp tục thuê...'
                          : 'Ghi chú thêm về yêu cầu của khách hàng...'
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>
                )}

                {consultationResult.decision === 'adjust' && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>Lưu ý:</strong> Sau khi lưu, khách hàng sẽ chuyển về trạng thái "Cần tư vấn lại"
                      và bạn cần cập nhật lại tiêu chí thuê trong hồ sơ khách hàng.
                    </p>
                  </div>
                )}

                {consultationResult.decision === 'view_more' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      <strong>Lưu ý:</strong> Sau khi lưu, hệ thống sẽ chuyển sang màn hình lên lịch xem phòng
                      để bạn sắp xếp lịch hẹn tiếp theo.
                    </p>
                  </div>
                )}
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowConsultationForm(false);
                  setSelectedCustomer(null);
                  setConsultationResult({
                    roomsAdvised: '',
                    rulesDiscussed: '',
                    rentCost: '',
                    serviceCost: '',
                    depositPolicy: '',
                    decision: 'agreed',
                    notes: ''
                  });
                }}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Lưu kết quả tư vấn
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Ghi nhận thông tin khách hàng</h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Họ và tên *</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số điện thoại *</label>
                    <input type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">CCCD</label>
                    <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Giới tính *</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Nam</option>
                      <option>Nữ</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Số lượng người ở *</label>
                    <input type="number" min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Khu vực mong muốn</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Khu A</option>
                      <option>Khu B</option>
                      <option>Khu C</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Loại phòng</label>
                    <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Phòng 2 người</option>
                      <option>Phòng 3 người</option>
                      <option>Phòng 4 người</option>
                      <option>Phòng 5 người</option>
                      <option>Phòng 6 người</option>
                      <option>Phòng 7 người</option>
                      <option>Giường ở ghép</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Mức giá (VNĐ/tháng)</label>
                    <input type="text" placeholder="VD: 1.500.000 - 2.000.000" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thời gian dự kiến vào ở</label>
                    <input type="date" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Thời hạn thuê (tháng)</label>
                    <input type="number" min="1" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú yêu cầu khác</label>
                  <textarea rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
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
                Lưu thông tin
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Chi tiết phiếu đăng ký thuê</h2>
                <p className="text-sm text-slate-600 mt-1">Mã phiếu: {selectedCustomer.registrationCode}</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCustomer(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-medium text-slate-900 mb-1">Trạng thái hiện tại</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    selectedCustomer.status === 'Đang tư vấn' ? 'bg-yellow-100 text-yellow-700' :
                    selectedCustomer.status === 'Đã lên lịch xem phòng' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {selectedCustomer.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-4">Thông tin cá nhân</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Họ và tên</label>
                      <p className="text-slate-900">{selectedCustomer.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Giới tính</label>
                      <p className="text-slate-900">{selectedCustomer.gender}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Số điện thoại</label>
                      <p className="text-slate-900">{selectedCustomer.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                      <p className="text-slate-900">{selectedCustomer.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">CCCD</label>
                      <p className="text-slate-900">{selectedCustomer.idCard}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Số lượng người ở</label>
                      <p className="text-slate-900">{selectedCustomer.numPeople} người</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="font-bold text-slate-900 mb-4">Yêu cầu thuê phòng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Khu vực mong muốn</label>
                      <p className="text-slate-900">{selectedCustomer.area}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Loại phòng</label>
                      <p className="text-slate-900">{selectedCustomer.roomType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Mức giá (VNĐ/tháng)</label>
                      <p className="text-slate-900">{selectedCustomer.priceRange}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Thời gian dự kiến vào ở</label>
                      <p className="text-slate-900">{selectedCustomer.moveInDate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Thời hạn thuê</label>
                      <p className="text-slate-900">{selectedCustomer.rentalPeriod} tháng</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Ngày đăng ký</label>
                      <p className="text-slate-900">{selectedCustomer.date}</p>
                    </div>
                  </div>
                </div>

                {selectedCustomer.notes && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-2">Ghi chú yêu cầu khác</h3>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-slate-700">{selectedCustomer.notes}</p>
                    </div>
                  </div>
                )}

                {selectedCustomer.assignedRooms && selectedCustomer.assignedRooms.length > 0 && (
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 mb-4">Phòng/Giường đã chọn</h3>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="mb-2">
                        <span className="text-sm text-green-700">Loại thuê: </span>
                        <span className="font-medium text-green-900">{selectedCustomer.rentalType}</span>
                      </div>
                      <div>
                        <span className="text-sm text-green-700">Phòng/Giường: </span>
                        <span className="font-medium text-green-900">{formatAssignedRooms(selectedCustomer.assignedRooms)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedCustomer(null);
                }}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenConsultation(selectedCustomer);
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Cập nhật kết quả tư vấn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
