import { useState } from "react";
import {
  CheckCircle,
  FileText,
  CreditCard,
  Key,
  Plus,
  X,
  AlertCircle,
  Search,
} from "lucide-react";

export function CheckInProcess() {
  const [activeFunction, setActiveFunction] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [depositInfo, setDepositInfo] = useState<any>(null);
  const [groupMembers, setGroupMembers] = useState<any[]>([
    {
      id: 1,
      fullName: "",
      idCard: "",
      phone: "",
      permanentAddress: "",
      dateOfBirth: "",
      errors: {},
    },
  ]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const mockDeposits = [
    {
      depositCode: "DC001",
      phone: "0901234567",
      customerName: "Nguyễn Văn A",
      room: "P301",
      area: "Khu A",
      numBeds: 2,
      depositAmount: 7200000,
      depositDate: "15/04/2026",
      gender: "Nam",
      monthlyRent: 1800000,
    },
    {
      depositCode: "DC002",
      phone: "0912345678",
      customerName: "Trần Thị B",
      room: "P205",
      area: "Khu B",
      numBeds: 1,
      depositAmount: 5000000,
      depositDate: "18/04/2026",
      gender: "Nữ",
      monthlyRent: 2500000,
    },
  ];

  const pendingConditions = [
    {
      id: 3,
      depositCode: "PDK003",
      customerName: "KH003",
      room: "P412",
      area: "Khu A",
      numBeds: 6,
      gender: "Nam",
      numMale: 2,
      numFemale: 0,
      status: "Chờ kiểm tra điều kiện",
      members: [
        {
          id: 1,
          fullName: "Lê Văn C",
          idCard: "001234567891",
          gender: "Nam",
          dateOfBirth: "1998-05-10",
          approved: null,
        },
      ],
    },
    {
      id: 4,
      depositCode: "PDK004",
      customerName: "KH004",
      room: "P208",
      area: "Khu B",
      numBeds: 3,
      gender: "Nữ",
      numMale: 0,
      numFemale: 1,
      status: "Chờ kiểm tra điều kiện",
      members: [
        {
          id: 1,
          fullName: "Hoàng Thị E",
          idCard: "001234567893",
          gender: "Nữ",
          dateOfBirth: "2000-07-20",
          approved: null,
        },
      ],
    },
  ];

  const functions = [
    {
      id: "documents",
      title: "Kiểm tra giấy tờ",
      icon: FileText,
      color: "bg-blue-500",
      count: 5,
      description: "Tra cứu và xác nhận thông tin",
    },
    {
      id: "conditions",
      title: "Kiểm tra điều kiện",
      icon: CheckCircle,
      color: "bg-green-500",
      count: pendingConditions.length,
      description: "Phê duyệt điều kiện lưu trú",
    },
  ];

  const handleSearchDeposit = () => {
    setSearchError("");
    const found = mockDeposits.find(
      (d) => d.depositCode === searchQuery || d.phone === searchQuery,
    );
    if (found) {
      setDepositInfo(found);
      setGroupMembers([
        {
          id: 1,
          fullName: "",
          idCard: "",
          phone: "",
          permanentAddress: "",
          dateOfBirth: "",
          errors: {},
        },
      ]);
    } else {
      setSearchError("Không tìm thấy dữ liệu đặt cọc phù hợp");
      setDepositInfo(null);
    }
  };

  const addGroupMember = () => {
    if (!depositInfo || groupMembers.length >= depositInfo.numBeds) return;
    setGroupMembers([
      ...groupMembers,
      {
        id: Date.now(),
        fullName: "",
        idCard: "",
        phone: "",
        permanentAddress: "",
        dateOfBirth: "",
        errors: {},
      },
    ]);
  };

  const updateGroupMember = (id: number, field: string, value: string) => {
    setGroupMembers(
      groupMembers.map((m) =>
        m.id === id
          ? { ...m, [field]: value, errors: { ...m.errors, [field]: "" } }
          : m,
      ),
    );
  };

  const validateDocuments = () => {
    let hasError = false;
    const updated = groupMembers.map((member) => {
      const errors: any = {};
      if (!member.fullName?.trim()) {
        errors.fullName = "Bắt buộc";
        hasError = true;
      }
      if (!member.idCard?.trim()) {
        errors.idCard = "Bắt buộc";
        hasError = true;
      }
      return { ...member, errors };
    });
    setGroupMembers(updated);
    return !hasError;
  };

  const handleSaveDocuments = () => {
    if (!depositInfo) return;
    if (groupMembers.length > depositInfo.numBeds) {
      alert("Số lượng người cư trú vượt quá số lượng giường/phòng đặt cọc");
      return;
    }
    if (validateDocuments()) {
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setDepositInfo(null);
        setSearchQuery("");
      }, 1500);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Quy trình nhận phòng
        </h1>
        <p className="text-slate-600 mt-1">
          Quản lý các bước trong quy trình check-in
        </p>
      </div>

      {!activeFunction && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {functions.map((func) => {
            const Icon = func.icon;
            return (
              <button
                key={func.id}
                onClick={() => setActiveFunction(func.id)}
                className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-8 hover:border-blue-500 hover:shadow-md transition-all text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${func.color} w-16 h-16 rounded-lg flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                    {func.count} hồ sơ
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {func.title}
                </h3>
                <p className="text-sm text-slate-600">{func.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {activeFunction === "documents" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">
              Bước 1: Kiểm tra giấy tờ
            </h2>
            <button
              onClick={() => {
                setActiveFunction(null);
                setDepositInfo(null);
                setSearchQuery("");
              }}
              className="text-slate-600 hover:text-slate-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tra cứu đặt cọc
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearchDeposit()}
                  placeholder="0901234567"
                  className="flex-1 px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearchDeposit}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Tìm kiếm
                </button>
              </div>
              {searchError && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{searchError}</p>
                </div>
              )}
            </div>

            {depositInfo && (
              <div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <h3 className="text-base font-semibold text-slate-900 mb-3">
                    Thông tin đặt cọc
                  </h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <div>
                      <span className="text-slate-600">Mã đặt cọc:</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {depositInfo.depositCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-600">Khách hàng:</span>
                      <span className="ml-2 font-semibold text-slate-900">
                        {depositInfo.customerName}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Thông tin giấy tờ thành viên nhóm ({groupMembers.length}/
                      {depositInfo.numBeds})
                    </h3>
                    <button
                      onClick={addGroupMember}
                      disabled={groupMembers.length >= depositInfo.numBeds}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm thành viên
                    </button>
                  </div>

                  <div className="space-y-6">
                    {groupMembers.map((member, index) => (
                      <div
                        key={member.id}
                        className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-base font-semibold text-slate-900">
                            Thành viên {index + 1}
                          </h4>
                        </div>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                Họ và tên *
                              </label>
                              <input
                                type="text"
                                value={member.fullName}
                                onChange={(e) =>
                                  updateGroupMember(
                                    member.id,
                                    "fullName",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${member.errors.fullName ? "border-red-500" : "border-slate-300"}`}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-2">
                                CCCD/CMND *
                              </label>
                              <input
                                type="text"
                                value={member.idCard}
                                onChange={(e) =>
                                  updateGroupMember(
                                    member.id,
                                    "idCard",
                                    e.target.value,
                                  )
                                }
                                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${member.errors.idCard ? "border-red-500" : "border-slate-300"}`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <button
                      onClick={() => {
                        setDepositInfo(null);
                        setSearchQuery("");
                      }}
                      className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSaveDocuments}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Lưu và tiếp tục
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Thành công
            </h2>
            <p className="text-slate-600">
              Thao tác đã được thực hiện thành công
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
