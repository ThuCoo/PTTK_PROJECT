import { useState } from 'react';
import { DollarSign, Search, CheckCircle, Clock, XCircle, AlertCircle, Upload, Image, X } from 'lucide-react';

export function DepositManagement() {
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showVerificationForm, setShowVerificationForm] = useState(false);

  const deposits = [
    {
      id: 1,
      code: 'DC001',
      customer: 'Nguyễn Văn A',
      phone: '0901234567',
      room: 'P301',
      beds: 2,
      amount: 7200000,
      date: '28/04/2026',
      deadline: '29/04/2026 14:00',
      status: 'Đã xác nhận',
      paymentMethod: 'Chuyển khoản',
      proofImage: '/proof1.jpg',
      verifiedBy: 'Quản lý - Nguyễn Văn X',
      verifiedDate: '28/04/2026 16:30'
    },
    {
      id: 2,
      code: 'DC002',
      customer: 'Trần Thị B',
      phone: '0912345678',
      room: 'P205',
      beds: 1,
      amount: 5000000,
      date: '30/04/2026',
      deadline: '01/05/2026 16:00',
      status: 'Chờ xác nhận',
      paymentMethod: 'Chuyển khoản',
      proofImage: '/proof2.jpg',
      verifiedBy: null,
      verifiedDate: null
    },
    {
      id: 3,
      code: 'DC003',
      customer: 'Lê Văn C',
      phone: '0923456789',
      room: 'P412',
      beds: 3,
      amount: 9000000,
      date: '01/05/2026',
      deadline: '02/05/2026 10:00',
      status: 'Chờ thanh toán',
      paymentMethod: null,
      proofImage: null,
      verifiedBy: null,
      verifiedDate: null
    },
    {
      id: 4,
      code: 'DC004',
      customer: 'Phạm Thị D',
      phone: '0934567890',
      room: 'P108',
      beds: 1,
      amount: 5500000,
      date: '29/04/2026',
      deadline: '30/04/2026 12:00',
      status: 'Đã hủy (quá hạn)',
      paymentMethod: null,
      proofImage: null,
      verifiedBy: null,
      verifiedDate: null
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return 'bg-green-100 text-green-700';
      case 'Chờ xác nhận':
        return 'bg-yellow-100 text-yellow-700';
      case 'Chờ thanh toán':
        return 'bg-blue-100 text-blue-700';
      case 'Đã hủy (quá hạn)':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã xác nhận':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Chờ xác nhận':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'Chờ thanh toán':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Đã hủy (quá hạn)':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý đặt cọc</h1>
        <p className="text-slate-600 mt-1">Theo dõi và xác nhận các giao dịch đặt cọc</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng đặt cọc', value: '89', color: 'bg-blue-500' },
          { label: 'Chờ thanh toán', value: '12', color: 'bg-yellow-500' },
          { label: 'Chờ xác nhận', value: '5', color: 'bg-orange-500' },
          { label: 'Đã xác nhận', value: '72', color: 'bg-green-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã cọc, tên khách hàng, SĐT..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Mã cọc</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Khách hàng</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Phòng</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Số tiền</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit.id}
                      onClick={() => setSelectedDeposit(deposit)}
                      className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                        selectedDeposit?.id === deposit.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-blue-600">{deposit.code}</p>
                        <p className="text-xs text-slate-500">{deposit.date}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">{deposit.customer}</p>
                        <p className="text-xs text-slate-600">{deposit.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">{deposit.room}</p>
                        <p className="text-xs text-slate-600">{deposit.beds} giường</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{deposit.amount.toLocaleString()} VNĐ</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(deposit.status)}`}>
                          {deposit.status}
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
          {!selectedDeposit ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một phiếu cọc để xem chi tiết</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Chi tiết đặt cọc</h2>
                {getStatusIcon(selectedDeposit.status)}
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Mã đặt cọc</p>
                  <p className="font-bold text-lg text-blue-600">{selectedDeposit.code}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-900">{selectedDeposit.customer}</p>
                  <p className="text-sm text-slate-600">{selectedDeposit.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Phòng đặt cọc</p>
                  <p className="font-medium text-slate-900">{selectedDeposit.room}</p>
                  <p className="text-sm text-slate-600">{selectedDeposit.beds} giường</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Số tiền cọc</p>
                  <p className="font-bold text-2xl text-slate-900">
                    {selectedDeposit.amount.toLocaleString()} VNĐ
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Công thức: 2 tháng × {selectedDeposit.beds} giường
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Ngày tạo</p>
                  <p className="font-medium text-slate-900">{selectedDeposit.date}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Hạn thanh toán</p>
                  <p className="font-medium text-red-600">{selectedDeposit.deadline}</p>
                </div>

                {selectedDeposit.paymentMethod && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Phương thức</p>
                    <p className="font-medium text-slate-900">{selectedDeposit.paymentMethod}</p>
                  </div>
                )}

                {selectedDeposit.verifiedBy && (
                  <>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Người xác nhận</p>
                      <p className="font-medium text-slate-900">{selectedDeposit.verifiedBy}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Ngày xác nhận</p>
                      <p className="font-medium text-slate-900">{selectedDeposit.verifiedDate}</p>
                    </div>
                  </>
                )}

                {selectedDeposit.status === 'Chờ xác nhận' && (
                  <>
                    {selectedDeposit.proofImage && (
                      <div>
                        <p className="text-sm text-slate-600 mb-2">Chứng từ thanh toán</p>
                        <div className="border border-slate-300 rounded-lg p-2">
                          <img
                            src={selectedDeposit.proofImage}
                            alt="Chứng từ thanh toán"
                            className="w-full h-48 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif"%3EChứng từ%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="pt-4 space-y-2">
                      <button
                        onClick={() => setShowVerificationForm(true)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Kiểm tra và xác nhận
                      </button>
                      <button className="w-full px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        Từ chối - Chứng từ không hợp lệ
                      </button>
                    </div>
                  </>
                )}

                {selectedDeposit.status === 'Chờ thanh toán' && (
                  <div className="pt-4 space-y-2">
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Thực hiện thanh toán
                    </button>
                    <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                      Gửi nhắc thanh toán
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form Thanh Toán */}
      {showPaymentForm && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Thanh toán đặt cọc</h2>
                <p className="text-sm text-slate-600 mt-1">Mã cọc: {selectedDeposit.code}</p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentMethod('');
                  setProofImage(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Số tiền cần thanh toán</p>
                <p className="text-3xl font-bold text-blue-600">
                  {selectedDeposit.amount.toLocaleString()} VNĐ
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Công thức: 2 tháng × {selectedDeposit.beds} giường
                </p>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Chọn phương thức thanh toán *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Chọn phương thức --</option>
                    <option value="transfer">Chuyển khoản ngân hàng</option>
                    <option value="cash">Tiền mặt</option>
                    <option value="momo">Ví MoMo</option>
                    <option value="zalopay">ZaloPay</option>
                  </select>
                </div>

                {paymentMethod === 'transfer' && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h3 className="font-medium text-slate-900 mb-3">Thông tin chuyển khoản</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Ngân hàng:</span>
                        <span className="font-medium text-slate-900">Vietcombank</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Số tài khoản:</span>
                        <span className="font-medium text-slate-900">0123456789</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Chủ tài khoản:</span>
                        <span className="font-medium text-slate-900">HomeStay Dorm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Nội dung CK:</span>
                        <span className="font-medium text-blue-600">{selectedDeposit.code} {selectedDeposit.customer}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Tải lên chứng từ/hình ảnh giao dịch *
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="proof-upload"
                    />
                    <label htmlFor="proof-upload" className="cursor-pointer">
                      {proofImage ? (
                        <div>
                          <img src={proofImage} alt="Preview" className="max-h-48 mx-auto mb-3 rounded" />
                          <p className="text-sm text-green-600 font-medium">Đã tải lên thành công</p>
                          <p className="text-xs text-slate-500 mt-1">Click để thay đổi</p>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                          <p className="text-sm text-slate-600 mb-1">
                            Click để tải lên ảnh chụp màn hình giao dịch
                          </p>
                          <p className="text-xs text-slate-500">
                            Hỗ trợ: JPG, PNG (tối đa 5MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800 mb-1">Lưu ý quan trọng:</p>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Thời hạn thanh toán: <strong>{selectedDeposit.deadline}</strong></li>
                        <li>• Chứng từ phải rõ ràng, đầy đủ thông tin giao dịch</li>
                        <li>• Quản lý sẽ kiểm tra và xác nhận trong vòng 2 giờ</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPaymentForm(false);
                  setPaymentMethod('');
                  setProofImage(null);
                }}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  if (!paymentMethod || !proofImage) {
                    alert('Vui lòng chọn phương thức thanh toán và tải lên chứng từ');
                    return;
                  }
                  alert('Đã gửi chứng từ thanh toán! Quản lý sẽ kiểm tra và xác nhận.');
                  setShowPaymentForm(false);
                  setPaymentMethod('');
                  setProofImage(null);
                }}
                disabled={!paymentMethod || !proofImage}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  paymentMethod && proofImage
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                Gửi chứng từ thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Xác Nhận (Quản lý) */}
      {showVerificationForm && selectedDeposit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-200 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Kiểm tra thanh toán cọc</h2>
                <p className="text-sm text-slate-600 mt-1">Mã cọc: {selectedDeposit.code}</p>
              </div>
              <button
                onClick={() => setShowVerificationForm(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-6">
                <h3 className="font-medium text-slate-900 mb-3">Thông tin thanh toán</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <p className="font-medium text-slate-900">{selectedDeposit.customer}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Số tiền:</span>
                    <p className="font-medium text-blue-600">{selectedDeposit.amount.toLocaleString()} VNĐ</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phương thức:</span>
                    <p className="font-medium text-slate-900">{selectedDeposit.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng:</span>
                    <p className="font-medium text-slate-900">{selectedDeposit.room}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-medium text-slate-900 mb-3">Chứng từ thanh toán</h3>
                <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                  {selectedDeposit.proofImage ? (
                    <img
                      src={selectedDeposit.proofImage}
                      alt="Chứng từ thanh toán"
                      className="w-full max-h-96 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect width="400" height="300" fill="%23f1f5f9"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8" font-family="sans-serif" font-size="18"%3EẢnh chứng từ thanh toán%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <Image className="w-16 h-16 mx-auto mb-3 text-slate-300" />
                      <p>Không có ảnh chứng từ</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú xác nhận</label>
                <textarea
                  rows={3}
                  placeholder="Nhập ghi chú nếu cần..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button
                onClick={() => setShowVerificationForm(false)}
                className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  if (confirm('Xác nhận từ chối chứng từ này?')) {
                    alert('Đã từ chối. Khách hàng cần thanh toán lại.');
                    setShowVerificationForm(false);
                  }
                }}
                className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                Từ chối
              </button>
              <button
                onClick={() => {
                  alert('Đã xác nhận thanh toán cọc thành công! Phòng chuyển sang trạng thái "Đã cọc".');
                  setShowVerificationForm(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Xác nhận đã nhận tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
