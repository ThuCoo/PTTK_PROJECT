import { useState } from 'react';
import { CheckCircle, Circle, XCircle, AlertCircle, FileText, ClipboardCheck } from 'lucide-react';
import { useEffect } from 'react';
import { phieuDangKyApi } from '../../services/api'; 

export function AvailabilityVerification() {
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [roomStatus, setRoomStatus] = useState('available');
  const [statusNote, setStatusNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Danh sách phiếu đăng ký đã chọn phòng và đồng ý thuê
  const [registrations, setRegistrations] = useState<any[]>([]);
    const fetchData = async () => {
    try {
      const data = await phieuDangKyApi.getPendingVerification();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const formatAssignedRooms = (rooms: any[], rentalType: string) => {
    if (!rooms || rooms.length === 0) return 'Chưa chọn';
    if (rentalType === 'Thuê nguyên phòng') {
      return rooms.map(r => r.room).join(', ');
    }
    return rooms.map(r => `${r.room}/${r.bed}`).join(', ');
  };

  const steps = [
    { id: 1, title: 'Rà soát điều kiện', icon: FileText },
    { id: 2, title: 'Kiểm tra phòng', icon: ClipboardCheck },
    { id: 3, title: 'Xác nhận nội quy', icon: CheckCircle },
  ];

  const statusCards = [
    { id: 'all', label: 'Tất cả', count: registrations.length, color: 'bg-slate-500', icon: ClipboardCheck },
    { id: 'step1', label: 'Rà soát điều kiện', count: registrations.filter(r => r.status === 'Rà soát điều kiện').length, color: 'bg-blue-500', icon: FileText },
    { id: 'step2', label: 'Kiểm tra phòng', count: registrations.filter(r => r.status === 'Kiểm tra phòng').length, color: 'bg-yellow-500', icon: AlertCircle },
    { id: 'step3', label: 'Xác nhận nội quy', count: registrations.filter(r => r.status === 'Xác nhận nội quy').length, color: 'bg-green-500', icon: CheckCircle },
  ];

  const filteredRegistrations = filterStatus === 'all'
    ? registrations
    : registrations.filter(r => {
        if (filterStatus === 'step1') return r.status === 'Rà soát điều kiện';
        if (filterStatus === 'step2') return r.status === 'Kiểm tra phòng';
        if (filterStatus === 'step3') return r.status === 'Xác nhận nội quy';
        return true;
      });

  const checkConditions = () => {
    // Giả lập kiểm tra điều kiện
    return {
      gender: true,
      area: true,
      capacity: true,
      documents: true,
    };
  };

  const conditions = selectedRegistration ? checkConditions() : null;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Rà soát và thỏa thuận thuê</h1>
        <p className="text-slate-600 mt-1">Kiểm tra điều kiện và tình trạng phòng trước khi đặt cọc</p>
      </div>

      {/* Visual Cards - Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {statusCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => setFilterStatus(card.id)}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all text-left ${
                filterStatus === card.id
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-slate-900">{card.count}</p>
                </div>
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách phiếu đăng ký */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Phiếu đăng ký chờ xử lý</h2>
            <div className="space-y-3">
              {filteredRegistrations.map((reg) => (
                <button
                  key={reg.id}
                  onClick={() => {
                    setSelectedRegistration(reg);
                    setCurrentStep(reg.currentStep);
                  }}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    selectedRegistration?.id === reg.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="mb-2">
                    <p className="font-medium text-slate-900 mb-1">{reg.code}</p>
                    <p className="text-sm text-slate-600">{formatAssignedRooms(reg.assignedRooms, reg.rentalType)} - {reg.area}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{reg.numPeople} người</span>
                    <span className={`px-2 py-1 rounded-full ${
                      reg.status === 'Rà soát điều kiện' ? 'bg-blue-100 text-blue-700' :
                      reg.status === 'Kiểm tra phòng' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {reg.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quy trình xử lý */}
        <div className="lg:col-span-2">
          {!selectedRegistration ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <CheckCircle className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một phiếu đăng ký để bắt đầu kiểm tra</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Progress Steps */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={step.id} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <p className={`text-xs mt-2 text-center ${
                            currentStep >= step.id ? 'text-slate-900 font-medium' : 'text-slate-500'
                          }`}>
                            {step.title}
                          </p>
                        </div>
                        {index < steps.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 ${
                            currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Thông tin phiếu đăng ký */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin phiếu đăng ký</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Mã phiếu:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.code}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.customer}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Khu vực mong muốn:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.address}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">
                      {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'Phòng đã chọn:' : 'Giường đã chọn:'}
                    </span>
                    <p className="font-medium text-blue-600">
                      {formatAssignedRooms(selectedRegistration.assignedRooms, selectedRegistration.rentalType)}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số người:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.numPeople} người</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Giới tính:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Hình thức thuê:</span>
                    <p className="font-medium text-blue-600">{selectedRegistration.rentalType}</p>
                  </div>
                </div>
              </div>

              {/* Bước 1: Rà soát điều kiện */}
              {currentStep === 1 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 1: Rà soát điều kiện lưu trú</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-700">Giới tính phù hợp với phòng</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-700">Khu vực phù hợp</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-700">Số lượng người phù hợp sức chứa</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                      <span className="text-sm text-slate-700">Giấy tờ hợp lệ</span>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={async () => {
                        await phieuDangKyApi.updateStatus(selectedRegistration.code, 'Kiểm tra phòng');
                        setCurrentStep(2)
                        fetchData(); // Load lại data

                      }
                    }
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xác nhận đạt điều kiện
                    </button>
                  </div>
                </div>
              )}

              {/* Bước 2: Nhập tình trạng phòng */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Bước 3: Nhập tình trạng {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'phòng' : 'giường'} (Quản lý)
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Tình trạng {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'phòng' : 'giường'} *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50">
                        <input
                          type="radio"
                          name="roomStatus"
                          value="available"
                          checked={roomStatus === 'available'}
                          onChange={(e) => setRoomStatus(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="font-medium text-slate-900">
                              {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'Phòng khả dụng' : 'Giường khả dụng'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {selectedRegistration.rentalType === 'Thuê nguyên phòng'
                              ? 'Phòng còn trống, tình trạng tốt, sẵn sàng cho khách thuê'
                              : 'Giường còn trống, tình trạng tốt, sẵn sàng cho khách thuê'
                            }
                          </p>
                        </div>
                      </label>

                      <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50">
                        <input
                          type="radio"
                          name="roomStatus"
                          value="unavailable"
                          checked={roomStatus === 'unavailable'}
                          onChange={(e) => setRoomStatus(e.target.value)}
                          className="w-4 h-4 text-red-600"
                        />
                        <div className="ml-3 flex-1">
                          <div className="flex items-center gap-2">
                            <XCircle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-slate-900">
                              {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'Phòng không khả dụng' : 'Giường không khả dụng'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            {selectedRegistration.rentalType === 'Thuê nguyên phòng'
                              ? 'Phòng đã được cọc bởi người khác hoặc đang sửa chữa'
                              : 'Giường đã được cọc bởi người khác hoặc có vấn đề'
                            }
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú tình trạng</label>
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      rows={4}
                      placeholder={`Nhập ghi chú về tình trạng ${selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'phòng' : 'giường'} (nếu có)...`}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    ></textarea>
                  </div>

                  {roomStatus === 'unavailable' && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800 mb-1">Lưu ý:</p>
                          <p className="text-sm text-red-700">
                            Nếu gửi trạng thái "Không khả dụng", {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'phòng' : 'giường'} <strong>{formatAssignedRooms(selectedRegistration.assignedRooms, selectedRegistration.rentalType)}</strong> sẽ được gỡ khỏi phiếu đăng ký này và khách hàng cần chọn lại.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={async () => {
                        if (roomStatus === 'unavailable') {
                          await phieuDangKyApi.rejectAssignedRoom(selectedRegistration.code, statusNote);
                          alert(`${selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'Phòng' : 'Giường'} không khả dụng. Hệ thống đã gỡ khỏi phiếu đăng ký.`);
                          setSelectedRegistration(null);
                          setCurrentStep(1);
                          fetchData();
                        } else {
                          await phieuDangKyApi.updateStatus(selectedRegistration.code, 'Xác nhận nội quy');
                          setCurrentStep(3);
                          fetchData();
                        }
                      }}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        roomStatus === 'available'
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      Gửi tình trạng
                    </button>
                  </div>
                </div>
              )}

              {/* Bước 3: Xác nhận nội quy */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 3: Xác nhận đồng ý tuân thủ nội quy</h2>

                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-1">
                          {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'Phòng khả dụng!' : 'Giường khả dụng!'}
                        </p>
                        <p className="text-sm text-green-700">
                          {selectedRegistration.rentalType === 'Thuê nguyên phòng' ? 'Phòng' : 'Giường'} <strong>{formatAssignedRooms(selectedRegistration.assignedRooms, selectedRegistration.rentalType)}</strong> đã được xác nhận sẵn sàng cho khách thuê.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 p-6 border-2 border-slate-300 rounded-lg bg-slate-50">
                    <h3 className="font-bold text-slate-900 mb-3">Điều kiện thuê và nội quy ký túc xá</h3>
                    <ul className="space-y-2 text-sm text-slate-700">
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>Tuân thủ giờ giấc: Giờ vào cổng trước 23:00, giữ yên tĩnh sau 22:00</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>Không sử dụng các thiết bị điện công suất lớn (bếp điện, lò vi sóng...)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>Giữ gìn vệ sinh chung, không gây ồn ào ảnh hưởng người khác</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>Không chuyển nhượng, cho thuê lại phòng cho người khác</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>Thanh toán tiền phòng đúng hạn theo kỳ đã thỏa thuận</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Circle className="w-4 h-4 mt-1 flex-shrink-0" />
                        <span>Chịu trách nhiệm bồi thường khi làm hư hỏng tài sản</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mb-6">
                    <label className="flex items-start gap-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50 cursor-pointer">
                      <input type="checkbox" className="w-5 h-5 text-blue-600 mt-0.5" defaultChecked />
                      <span className="text-sm text-slate-900">
                        Khách hàng đã đọc, hiểu rõ và đồng ý tuân thủ các điều kiện thuê và nội quy ký túc xá
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          // 1. Gọi API mới tạo
                          console.log(`Gửi yêu cầu hoàn tất rà soát và tạo hóa đơn cọc cho phiếu đăng ký: ${selectedRegistration.code}`);
                          const res = await phieuDangKyApi.completeVerification(selectedRegistration.code);
                          
                          // 2. Kiểm tra nếu backend trả về success
                          if (res && res.success) {
                            const soTien = res.data?.soTienCoc || 0;
                            alert(`Hoàn tất rà soát! \nHệ thống đã tự động tạo Hóa Đơn Cọc cho Kế toán.\n\nSố tiền cọc cần thanh toán (2 tháng): ${soTien.toLocaleString('vi-VN')} VNĐ`);
                            
                            setSelectedRegistration(null);
                            setCurrentStep(1);
                            fetchData(); // Load lại danh sách 
                          } else {
                            // Bắt lỗi nếu Backend xử lý thất bại (VD: thiếu data phòng)
                            alert(`Lỗi từ hệ thống: ${res?.error || 'Không thể tạo hóa đơn cọc'}`);
                          }
                        } catch (error: any) {
                          // 3. Bắt lỗi Crash từ Server (Lỗi 500)
                          console.error("Chi tiết lỗi:", error.response?.data || error);
                          alert(`Có lỗi xảy ra: ${error.response?.data?.error || "Không thể kết nối đến Server"}`);
                        }
                      }}
                      className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Xác nhận hoàn tất
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
