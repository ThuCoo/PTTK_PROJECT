import { useState } from 'react';
import { DollarSign, Search, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export function PaymentManagement() {
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const payments = [
    {
      id: 1,
      invoiceCode: 'PT001',
      customer: 'Nguyễn Văn A',
      room: 'P301',
      month: 'Tháng 5/2026',
      rentAmount: 3600000,
      electricAmount: 250000,
      waterAmount: 160000,
      parkingAmount: 50000,
      totalAmount: 4060000,
      dueDate: '05/05/2026',
      paidDate: '03/05/2026',
      status: 'Đã thanh toán',
      paymentMethod: 'Chuyển khoản'
    },
    {
      id: 2,
      invoiceCode: 'PT002',
      customer: 'Trần Thị B',
      room: 'P205',
      month: 'Tháng 5/2026',
      rentAmount: 2500000,
      electricAmount: 180000,
      waterAmount: 80000,
      parkingAmount: 0,
      totalAmount: 2760000,
      dueDate: '05/05/2026',
      paidDate: null,
      status: 'Chưa thanh toán',
      paymentMethod: null
    },
    {
      id: 3,
      invoiceCode: 'PT003',
      customer: 'Lê Văn C',
      room: 'P412',
      month: 'Tháng 5/2026',
      rentAmount: 4500000,
      electricAmount: 320000,
      waterAmount: 240000,
      parkingAmount: 100000,
      totalAmount: 5160000,
      dueDate: '05/05/2026',
      paidDate: null,
      status: 'Chưa thanh toán',
      paymentMethod: null
    },
    {
      id: 4,
      invoiceCode: 'PT004',
      customer: 'Hoàng Văn D',
      room: 'P108',
      month: 'Tháng 5/2026',
      rentAmount: 2200000,
      electricAmount: 150000,
      waterAmount: 80000,
      parkingAmount: 50000,
      totalAmount: 2480000,
      dueDate: '01/05/2026',
      paidDate: null,
      status: 'Quá hạn',
      paymentMethod: null
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'bg-green-100 text-green-700';
      case 'Chưa thanh toán':
        return 'bg-yellow-100 text-yellow-700';
      case 'Quá hạn':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Đã thanh toán':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Chưa thanh toán':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'Quá hạn':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý thanh toán</h1>
        <p className="text-slate-600 mt-1">Theo dõi và xử lý các khoản thanh toán định kỳ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng phải thu', value: '450M', color: 'bg-blue-500' },
          { label: 'Đã thu', value: '380M', color: 'bg-green-500' },
          { label: 'Chưa thu', value: '50M', color: 'bg-yellow-500' },
          { label: 'Quá hạn', value: '20M', color: 'bg-red-500' },
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
            <div className="mb-6 flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã phiếu, tên khách hàng..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tất cả trạng thái</option>
                <option>Đã thanh toán</option>
                <option>Chưa thanh toán</option>
                <option>Quá hạn</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Mã phiếu</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Khách hàng</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Kỳ thanh toán</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Số tiền</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-700">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${
                        selectedPayment?.id === payment.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="py-4 px-4">
                        <p className="font-medium text-blue-600">{payment.invoiceCode}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-slate-900">{payment.customer}</p>
                        <p className="text-xs text-slate-600">{payment.room}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-slate-900">{payment.month}</p>
                        <p className="text-xs text-slate-600">Hạn: {payment.dueDate}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-900">{payment.totalAmount.toLocaleString()} VNĐ</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>
                          {payment.status}
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
          {!selectedPayment ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <DollarSign className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một phiếu thanh toán để xem chi tiết</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Chi tiết thanh toán</h2>
                {getStatusIcon(selectedPayment.status)}
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Mã phiếu thu</p>
                  <p className="font-bold text-lg text-blue-600">{selectedPayment.invoiceCode}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Khách hàng</p>
                  <p className="font-medium text-slate-900">{selectedPayment.customer}</p>
                  <p className="text-sm text-slate-600">{selectedPayment.room}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Kỳ thanh toán</p>
                  <p className="font-medium text-slate-900">{selectedPayment.month}</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Chi tiết các khoản</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tiền thuê phòng</span>
                    <span className="font-medium text-slate-900">{selectedPayment.rentAmount.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tiền điện</span>
                    <span className="font-medium text-slate-900">{selectedPayment.electricAmount.toLocaleString()} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tiền nước</span>
                    <span className="font-medium text-slate-900">{selectedPayment.waterAmount.toLocaleString()} VNĐ</span>
                  </div>
                  {selectedPayment.parkingAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Phí gửi xe</span>
                      <span className="font-medium text-slate-900">{selectedPayment.parkingAmount.toLocaleString()} VNĐ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="font-bold text-slate-900">Tổng cộng</span>
                    <span className="font-bold text-blue-600 text-lg">{selectedPayment.totalAmount.toLocaleString()} VNĐ</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Hạn thanh toán</p>
                  <p className="font-medium text-red-600">{selectedPayment.dueDate}</p>
                </div>

                {selectedPayment.paidDate && (
                  <>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Ngày thanh toán</p>
                      <p className="font-medium text-green-600">{selectedPayment.paidDate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Phương thức</p>
                      <p className="font-medium text-slate-900">{selectedPayment.paymentMethod}</p>
                    </div>
                  </>
                )}

                {selectedPayment.status !== 'Đã thanh toán' && (
                  <div className="pt-4 space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Phương thức thanh toán</label>
                      <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Tiền mặt</option>
                        <option>Chuyển khoản</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Số tiền thực thu</label>
                      <input
                        type="text"
                        value={selectedPayment.totalAmount.toLocaleString()}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                      Xác nhận đã thu tiền
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
