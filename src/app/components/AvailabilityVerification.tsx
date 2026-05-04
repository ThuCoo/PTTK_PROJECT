import { useState } from 'react';
import { CheckCircle, Circle, XCircle, AlertCircle, FileText, ClipboardCheck } from 'lucide-react';

export function AvailabilityVerification() {
  const [selectedRegistration, setSelectedRegistration] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [roomStatus, setRoomStatus] = useState('available');
  const [statusNote, setStatusNote] = useState('');

  // Danh sách phiếu đăng ký đã chọn phòng và đồng ý thuê
  const registrations = [
    {
      id: 1,
      code: 'PDK001',
      customer: 'Nguyễn Văn A',
      phone: '0901234567',
      idCard: '001234567890',
      address: 'Hà Nội',
      numPeople: 2,
      gender: 'Nam',
      area: 'Khu A',
      room: 'P301',
      roomType: 'Phòng 4 người',
      price: 1800000,
      selectedDate: '28/04/2026',
      status: 'Đã chọn phòng',
      currentStep: 1
    },
    {
      id: 2,
      code: 'PDK002',
      customer: 'Trần Thị B',
      phone: '0912345678',
      idCard: '001234567891',
      address: 'TP.HCM',
      numPeople: 1,
      gender: 'Nữ',
      area: 'Khu B',
      room: 'P205',
      roomType: 'Phòng 2 người',
      price: 2500000,
      selectedDate: '30/04/2026',
      status: 'Đang kiểm tra',
      currentStep: 2
    },
    {
      id: 3,
      code: 'PDK003',
      customer: 'Lê Văn C',
      phone: '0923456789',
      idCard: '001234567892',
      address: 'Đà Nẵng',
      numPeople: 4,
      gender: 'Nam',
      area: 'Khu A',
      room: 'P412',
      roomType: 'Phòng 4 người nguyên căn',
      price: 1500000,
      selectedDate: '01/05/2026',
      status: 'Chờ kiểm tra phòng',
      currentStep: 3
    },
  ];

  const steps = [
    { id: 1, title: 'Rà soát điều kiện', icon: FileText },
    { id: 2, title: 'Kiểm tra phòng', icon: ClipboardCheck },
    { id: 3, title: 'Nhập tình trạng', icon: AlertCircle },
    { id: 4, title: 'Xác nhận nội quy', icon: CheckCircle },
  ];

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Danh sách phiếu đăng ký */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Phiếu đăng ký chờ xử lý</h2>
            <div className="space-y-3">
              {registrations.map((reg) => (
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
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        {reg.code}
                      </span>
                      <p className="font-medium text-slate-900 mt-1">{reg.customer}</p>
                      <p className="text-sm text-slate-600">{reg.room} - {reg.area}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{reg.numPeople} người</span>
                    <span className={`px-2 py-1 rounded-full ${
                      reg.status === 'Đã chọn phòng' ? 'bg-yellow-100 text-yellow-700' :
                      reg.status === 'Đang kiểm tra' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
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
                    <span className="text-slate-600">CCCD:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.idCard}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Địa chỉ:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.address}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng đã chọn:</span>
                    <p className="font-medium text-blue-600">{selectedRegistration.room} - {selectedRegistration.area}</p>
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
                    <span className="text-slate-600">Giá thuê:</span>
                    <p className="font-medium text-slate-900">{selectedRegistration.price.toLocaleString()} VNĐ/tháng</p>
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
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Xác nhận đạt điều kiện
                    </button>
                  </div>
                </div>
              )}

              {/* Bước 2: Đã gửi yêu cầu kiểm tra */}
              {currentStep === 2 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 2: Gửi yêu cầu kiểm tra tình trạng phòng</h2>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                    <p className="text-sm text-blue-800">
                      Yêu cầu kiểm tra tình trạng phòng <strong>{selectedRegistration.room}</strong> đã được gửi đến quản lý.
                      Vui lòng chờ quản lý kiểm tra và phản hồi.
                    </p>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Tiếp tục
                    </button>
                  </div>
                </div>
              )}

              {/* Bước 3: Nhập tình trạng phòng */}
              {currentStep === 3 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 3: Nhập tình trạng phòng (Quản lý)</h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">Tình trạng phòng *</label>
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
                            <span className="font-medium text-slate-900">Phòng khả dụng</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            Phòng còn trống, tình trạng tốt, sẵn sàng cho khách thuê
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
                            <span className="font-medium text-slate-900">Phòng không khả dụng</span>
                          </div>
                          <p className="text-sm text-slate-600 mt-1">
                            Phòng đã được cọc bởi người khác hoặc đang sửa chữa
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
                      placeholder="Nhập ghi chú về tình trạng phòng (nếu có)..."
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
                            Nếu gửi trạng thái "Không khả dụng", phòng <strong>{selectedRegistration.room}</strong> sẽ được gỡ khỏi phiếu đăng ký này và khách hàng cần chọn phòng khác.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={() => {
                        if (roomStatus === 'unavailable') {
                          alert('Phòng không khả dụng. Hệ thống sẽ gỡ phòng khỏi phiếu đăng ký.');
                          setSelectedRegistration(null);
                          setCurrentStep(1);
                        } else {
                          setCurrentStep(4);
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

              {/* Bước 4: Xác nhận nội quy */}
              {currentStep === 4 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Bước 4: Xác nhận đồng ý tuân thủ nội quy</h2>

                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-1">Phòng khả dụng!</p>
                        <p className="text-sm text-green-700">
                          Phòng <strong>{selectedRegistration.room}</strong> đã được xác nhận sẵn sàng cho khách thuê.
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
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Quay lại
                    </button>
                    <button
                      onClick={() => {
                        alert('Hoàn tất! Phiếu đăng ký sẽ được chuyển sang trang "Đặt cọc".');
                        setSelectedRegistration(null);
                        setCurrentStep(1);
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
