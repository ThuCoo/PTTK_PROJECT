import { useState } from 'react';
import { Search, AlertCircle, CheckCircle } from 'lucide-react';

export function CheckOutProcess() {
  const [selectedCheckout, setSelectedCheckout] = useState<any>(null);

  const checkoutRequests = [
    {
      id: 1,
      customer: 'Phạm Thị D',
      room: 'P108',
      contractCode: 'HD001',
      depositAmount: 5000000,
      checkoutDate: '05/05/2026',
      status: 'Chờ kiểm tra phòng',
      rentalMonths: 8,
      contractType: 'Hết hạn'
    },
    {
      id: 2,
      customer: 'Hoàng Văn E',
      room: 'P205',
      contractCode: 'HD002',
      depositAmount: 7200000,
      checkoutDate: '06/05/2026',
      status: 'Đang đối soát',
      rentalMonths: 4,
      contractType: 'Chưa hết hạn'
    },
  ];

  const calculateRefund = (contractType: string, months: number, deposit: number) => {
    let refundRate = 1.0;
    if (contractType === 'Hết hạn') {
      refundRate = 1.0;
    } else if (months >= 6) {
      refundRate = 0.7;
    } else {
      refundRate = 0.5;
    }
    return deposit * refundRate;
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý trả phòng</h1>
        <p className="text-slate-600 mt-1">Xử lý yêu cầu trả phòng và hoàn cọc</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Danh sách yêu cầu trả phòng</h2>
            <div className="space-y-3">
              {checkoutRequests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedCheckout(request)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    selectedCheckout?.id === request.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-slate-900">{request.customer}</p>
                      <p className="text-sm text-slate-600">{request.room}</p>
                    </div>
                    <span className="text-xs text-slate-500">{request.checkoutDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Mã HĐ: {request.contractCode}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      request.status === 'Chờ kiểm tra phòng' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedCheckout ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <Search className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một yêu cầu trả phòng để xử lý</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Thông tin hợp đồng</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Khách hàng:</span>
                    <p className="font-medium text-slate-900 mt-1">{selectedCheckout.customer}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phòng:</span>
                    <p className="font-medium text-slate-900 mt-1">{selectedCheckout.room}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Mã hợp đồng:</span>
                    <p className="font-medium text-slate-900 mt-1">{selectedCheckout.contractCode}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Tiền cọc:</span>
                    <p className="font-medium text-blue-600 mt-1">
                      {selectedCheckout.depositAmount.toLocaleString()} VNĐ
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-600">Thời gian lưu trú:</span>
                    <p className="font-medium text-slate-900 mt-1">{selectedCheckout.rentalMonths} tháng</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Loại hợp đồng:</span>
                    <p className={`font-medium mt-1 ${
                      selectedCheckout.contractType === 'Hết hạn' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {selectedCheckout.contractType}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Kiểm tra tình trạng phòng</h2>
                <div className="space-y-3 mb-4">
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Vệ sinh phòng sạch sẽ</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Tài sản đầy đủ, không hư hỏng</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <input type="checkbox" className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700">Đã thu hồi chìa khóa/thẻ từ</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Ghi chú hư hỏng/mất mát</label>
                  <textarea
                    rows={3}
                    placeholder="Mô tả chi tiết tình trạng hư hỏng hoặc mất mát (nếu có)..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Đối soát thanh toán</h2>

                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Tỷ lệ hoàn cọc:</strong> {selectedCheckout.contractType === 'Hết hạn' ? '100%' : selectedCheckout.rentalMonths >= 6 ? '70%' : '50%'}
                  </p>
                  <p className="text-xs text-blue-600">
                    {selectedCheckout.contractType === 'Hết hạn'
                      ? 'Hợp đồng đã hết hạn - Hoàn 100% tiền cọc'
                      : selectedCheckout.rentalMonths >= 6
                        ? 'Đã ở trên 6 tháng nhưng chưa hết hạn - Hoàn 70% tiền cọc'
                        : 'Đã ở dưới 6 tháng và chưa hết hạn - Hoàn 50% tiền cọc'
                    }
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm text-slate-600">Tiền cọc ban đầu</span>
                    <span className="font-medium text-slate-900">
                      {selectedCheckout.depositAmount.toLocaleString()} VNĐ
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-sm text-slate-600">Tiền cọc được hoàn ({selectedCheckout.contractType === 'Hết hạn' ? '100%' : selectedCheckout.rentalMonths >= 6 ? '70%' : '50%'})</span>
                    <span className="font-medium text-green-600">
                      {calculateRefund(selectedCheckout.contractType, selectedCheckout.rentalMonths, selectedCheckout.depositAmount).toLocaleString()} VNĐ
                    </span>
                  </div>

                  <div className="border-t border-slate-200 pt-3">
                    <h3 className="text-sm font-medium text-slate-900 mb-2">Các khoản khấu trừ</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Tiền thuê còn nợ" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="0" className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Tiền điện nước" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="0" className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Chi phí sửa chữa" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="0" className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="text" placeholder="Tiền phạt" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <input type="text" placeholder="0" className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900">Số tiền hoàn lại thực tế</span>
                      <span className="font-bold text-green-600 text-xl">
                        {calculateRefund(selectedCheckout.contractType, selectedCheckout.rentalMonths, selectedCheckout.depositAmount).toLocaleString()} VNĐ
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức hoàn cọc</label>
                  <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Tiền mặt</option>
                    <option>Chuyển khoản</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
                    Hủy
                  </button>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Xác nhận đối soát
                  </button>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Hoàn tất trả phòng
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
