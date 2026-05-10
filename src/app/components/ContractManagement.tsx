import { useState } from 'react';
import { FileText, Search, Download, Eye, Calendar, User } from 'lucide-react';
import { formatVND } from '../../utils/formatUtils';

export function ContractManagement() {
  const [selectedContract, setSelectedContract] = useState<any>(null);

  const contracts = [
    {
      id: 1,
      code: 'HD001',
      customer: 'Nguyễn Văn A',
      phone: '0901234567',
      room: 'P301',
      beds: 2,
      startDate: '01/05/2026',
      endDate: '01/11/2026',
      duration: 6,
      rentPerBed: 1800000,
      totalRent: 3600000,
      deposit: 7200000,
      status: 'Đang hiệu lực',
      signedDate: '28/04/2026'
    },
    {
      id: 2,
      code: 'HD002',
      customer: 'Trần Thị B',
      phone: '0912345678',
      room: 'P205',
      beds: 1,
      startDate: '05/05/2026',
      endDate: '05/11/2026',
      duration: 6,
      rentPerBed: 2500000,
      totalRent: 2500000,
      deposit: 5000000,
      status: 'Chờ ký',
      signedDate: null
    },
    {
      id: 3,
      code: 'HD003',
      customer: 'Lê Văn C',
      phone: '0923456789',
      room: 'P412',
      beds: 3,
      startDate: '15/04/2026',
      endDate: '15/10/2026',
      duration: 6,
      rentPerBed: 1500000,
      totalRent: 4500000,
      deposit: 9000000,
      status: 'Đang hiệu lực',
      signedDate: '10/04/2026'
    },
    {
      id: 4,
      code: 'HD004',
      customer: 'Phạm Thị D',
      phone: '0934567890',
      room: 'P108',
      beds: 1,
      startDate: '01/11/2025',
      endDate: '01/05/2026',
      duration: 6,
      rentPerBed: 2200000,
      totalRent: 2200000,
      deposit: 4400000,
      status: 'Đã kết thúc',
      signedDate: '25/10/2025'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Đang hiệu lực':
        return 'bg-green-100 text-green-700';
      case 'Chờ ký':
        return 'bg-yellow-100 text-yellow-700';
      case 'Đã kết thúc':
        return 'bg-slate-100 text-slate-700';
      case 'Đã hủy':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Quản lý hợp đồng</h1>
        <p className="text-slate-600 mt-1">Quản lý và theo dõi hợp đồng thuê phòng</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[
          { label: 'Tổng hợp đồng', value: '156', color: 'bg-blue-500' },
          { label: 'Đang hiệu lực', value: '134', color: 'bg-green-500' },
          { label: 'Chờ ký', value: '8', color: 'bg-yellow-500' },
          { label: 'Sắp hết hạn', value: '14', color: 'bg-orange-500' },
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <FileText className="w-6 h-6 text-white" />
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
                  placeholder="Tìm kiếm theo mã HĐ, tên khách hàng..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Tất cả trạng thái</option>
                <option>Đang hiệu lực</option>
                <option>Chờ ký</option>
                <option>Đã kết thúc</option>
              </select>
            </div>

            <div className="space-y-3">
              {contracts.map((contract) => (
                <div
                  key={contract.id}
                  onClick={() => setSelectedContract(contract)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedContract?.id === contract.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <p className="font-bold text-slate-900">{contract.code}</p>
                      </div>
                      <p className="text-sm text-slate-600">{contract.customer}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(contract.status)}`}>
                      {contract.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Phòng</p>
                      <p className="font-medium text-slate-900">{contract.room}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Thời hạn</p>
                      <p className="font-medium text-slate-900">{contract.duration} tháng</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Giá thuê/tháng</p>
                      <p className="font-medium text-blue-600">{formatVND(contract.totalRent)} VNĐ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          {!selectedContract ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center text-center">
              <FileText className="w-16 h-16 text-slate-300 mb-4" />
              <p className="text-slate-500">Chọn một hợp đồng để xem chi tiết</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">Chi tiết hợp đồng</h2>
                <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(selectedContract.status)}`}>
                  {selectedContract.status}
                </span>
              </div>

              <div className="space-y-4">
                <div className="pb-4 border-b border-slate-200">
                  <p className="text-sm text-slate-600 mb-1">Mã hợp đồng</p>
                  <p className="font-bold text-lg text-blue-600">{selectedContract.code}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Thông tin khách thuê
                  </p>
                  <p className="font-medium text-slate-900">{selectedContract.customer}</p>
                  <p className="text-sm text-slate-600">{selectedContract.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Phòng thuê</p>
                  <p className="font-medium text-slate-900">{selectedContract.room}</p>
                  <p className="text-sm text-slate-600">{selectedContract.beds} giường</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Thời hạn thuê
                  </p>
                  <p className="text-sm text-slate-900">
                    <strong>Từ:</strong> {selectedContract.startDate}
                  </p>
                  <p className="text-sm text-slate-900">
                    <strong>Đến:</strong> {selectedContract.endDate}
                  </p>
                  <p className="text-sm font-medium text-blue-600 mt-1">
                    ({selectedContract.duration} tháng)
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Giá thuê/giường/tháng</p>
                  <p className="font-bold text-slate-900">{formatVND(selectedContract.rentPerBed)} VNĐ</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Tổng tiền thuê/tháng</p>
                  <p className="font-bold text-lg text-blue-600">{formatVND(selectedContract.totalRent)} VNĐ</p>
                </div>

                <div>
                  <p className="text-sm text-slate-600 mb-1">Tiền cọc</p>
                  <p className="font-medium text-slate-900">{formatVND(selectedContract.deposit)} VNĐ</p>
                </div>

                {selectedContract.signedDate && (
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Ngày ký</p>
                    <p className="font-medium text-slate-900">{selectedContract.signedDate}</p>
                  </div>
                )}

                <div className="pt-4 space-y-2">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                    <Eye className="w-4 h-4" />
                    Xem hợp đồng
                  </button>
                  <button className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Tải xuống PDF
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
