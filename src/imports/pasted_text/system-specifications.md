
Đặc tả hệ thống:
Sơ đồ 1

Tên Use Case
Ghi nhận thông tin khách hàng

Mô tả
Use case cho phép nhân viên sale nhập và lưu thông tin đăng ký thuê phòng/giường của khách hàng, bao gồm thông tin cá nhân và các yêu cầu thuê.

Sự kiện kích hoạt
Khách hàng liên hệ nhân viên sale để đăng ký thuê phòng hoặc thuê giường.

Tác nhân
Nhân viên sale

Use-case liên quan
<<extend>> Đăng nhập

Tiền điều kiện
Nhân viên sale đã đăng nhập vào hệ thống. Khách hàng đã cung cấp thông tin đăng ký thuê.

Hậu điều kiện
Thông tin khách hàng và yêu cầu thuê được lưu vào hệ thống để phục vụ kiểm tra phòng/giường và sắp xếp lịch xem phòng.
Dòng sự kiện chính
Nhân viên sale chọn chức năng Ghi nhận thông tin khách hàng.
Hệ thống hiển thị form nhập thông tin khách hàng.
Nhân viên sale nhập thông tin cá nhân của khách hàng.
Nhân viên sale nhập thông tin nhu cầu thuê: số lượng người ở, giới tính, khu vực mong muốn, loại phòng, mức giá, thời gian dự kiến vào ở, thời hạn thuê và các tiêu chí ưu tiên khác.
Hệ thống kiểm tra các trường thông tin bắt buộc.
Nhân viên sale xác nhận lưu thông tin.
Hệ thống lưu thông tin đăng ký của khách hàng.
Hệ thống hiển thị thông báo ghi nhận thành công.
Use case kết thúc. 



Dòng sự kiện phụ
A5 – Thiếu thông tin bắt buộc
Hệ thống hiển thị thông báo các trường thông tin chưa được nhập đầy đủ.
Nhân viên sale bổ sung thông tin còn thiếu.
Quay lại bước 5 của dòng sự kiện chính.
A7 – Thông tin khách hàng đã tồn tại
Hệ thống phát hiện số điện thoại/email/CCCD của khách hàng đã có trong hệ thống.
Hệ thống hiển thị thông tin khách hàng cũ.
Nhân viên sale chọn cập nhật thông tin hoặc tiếp tục tạo yêu cầu thuê mới.
Quay lại bước 6 của dòng sự kiện chính. 



Tên Use Case
Kiểm tra tình trạng và điều kiện

Mô tả
Use case cho phép nhân viên sale kiểm tra tình trạng phòng/giường còn trống và đối chiếu yêu cầu của khách hàng với điều kiện cho thuê của ký túc xá.

Sự kiện kích hoạt
Sau khi nhân viên sale đã ghi nhận thông tin và nhu cầu thuê của khách hàng.

Tác nhân
Nhân viên sale

Use-case liên quan
<<extend>> đăng nhập

Tiền điều kiện
Nhân viên sale đã đăng nhập. Thông tin khách hàng và yêu cầu thuê đã được ghi nhận.

Hậu điều kiện
Hệ thống trả về danh sách phòng/giường phù hợp hoặc thông báo không có lựa chọn phù hợp.
Dòng sự kiện chính
Nhân viên sale chọn chức năng Kiểm tra tình trạng và điều kiện.
Hệ thống hiển thị thông tin yêu cầu thuê của khách hàng.
Nhân viên sale chọn khu vực, loại phòng/giường hoặc tiêu chí cần kiểm tra.
Hệ thống kiểm tra tình trạng phòng/giường hiện có.
Hệ thống đối chiếu với điều kiện cho thuê: giới tính, sức chứa phòng, khu vực, mức giá, thời gian vào ở và các tiêu chí đi kèm.
Hệ thống hiển thị danh sách phòng/giường phù hợp.
Nhân viên sale chọn phòng/giường phù hợp để tư vấn hoặc sắp xếp lịch xem phòng cho khách.
Hệ thống ghi nhận kết quả kiểm tra.
Use case kết thúc.

Dòng sự kiện phụ
A6 – Không có phòng/giường phù hợp
Hệ thống thông báo không tìm thấy phòng/giường phù hợp.
Nhân viên sale điều chỉnh tiêu chí tìm kiếm hoặc tư vấn khách lựa chọn khác.
Quay lại bước 3 của dòng sự kiện chính.
A5 – Thông tin khách hàng không phù hợp điều kiện thuê
Hệ thống thông báo lý do không phù hợp, ví dụ: giới tính, số lượng người ở, khu vực hoặc sức chứa phòng không đáp ứng.
Nhân viên sale điều chỉnh thông tin hoặc tư vấn phương án khác cho khách hàng.
Use case kết thúc hoặc quay lại bước 3.


Sơ đồ 2

Tên Use Case
Lên lịch xem phòng

Mô tả
Use case cho phép nhân viên sale tạo hoặc cập nhật lịch hẹn xem phòng cho khách hàng dựa trên thông tin đăng ký thuê và nhu cầu thực tế của khách.

Sự kiện kích hoạt
Khách hàng có nhu cầu xem phòng lần đầu hoặc muốn hẹn xem thêm phòng sau khi chưa đưa ra quyết định thuê.

Tác nhân
Nhân viên sale

Use-case liên quan
<<Extend>> Đăng nhập.

Tiền điều kiện
Nhân viên sale đã đăng nhập. Thông tin đăng ký thuê của khách hàng đã được ghi nhận. Có phòng/giường phù hợp để tư vấn hoặc xem thực tế.

Hậu điều kiện
Lịch hẹn xem phòng được lưu vào hệ thống và gắn với phiếu đăng ký thuê của khách hàng.
Dòng sự kiện chính
Nhân viên sale chọn chức năng Lên lịch hẹn xem phòng.
Hệ thống hiển thị thông tin khách hàng và yêu cầu thuê đã ghi nhận.
Nhân viên sale chọn phòng/giường dự kiến cho khách xem.
Nhân viên sale nhập thời gian hẹn xem phòng.
Nhân viên sale nhập hình thức hoặc thông tin liên hệ xác nhận lịch hẹn với khách hàng.
Hệ thống kiểm tra tính hợp lệ của lịch hẹn.
Nhân viên sale xác nhận tạo lịch hẹn.
Hệ thống lưu lịch hẹn xem phòng.
Hệ thống cập nhật trạng thái phiếu đăng ký thuê là Đã lên lịch xem phòng.
Hệ thống hiển thị thông báo tạo lịch hẹn thành công.
Use case kết thúc.



Dòng sự kiện phụ
A6 – Thời gian hẹn không hợp lệ
Rẽ nhánh tại bước 6
Hệ thống phát hiện thời gian hẹn bị trùng, đã qua hoặc không phù hợp.
Hệ thống hiển thị thông báo lỗi.
Nhân viên sale nhập lại thời gian hẹn khác.
Quay lại bước 6 của dòng sự kiện chính.
A6 – Phòng/giường không còn phù hợp để xem
Rẽ nhánh tại bước 6
Hệ thống phát hiện phòng/giường đã được đặt cọc, giữ chỗ hoặc không còn khả dụng.
Hệ thống hiển thị thông báo cho nhân viên sale.
Nhân viên sale chọn phòng/giường khác phù hợp hơn.
Quay lại bước 3 của dòng sự kiện chính.
A9 – Khách hàng hủy lịch xem phòng
Nhân viên sale chọn lịch hẹn cần hủy.
Hệ thống hiển thị thông tin lịch hẹn.
Nhân viên sale xác nhận hủy lịch.
Hệ thống cập nhật trạng thái lịch hẹn là Đã hủy.
Use case kết thúc.




Tên Use Case
Cập nhật kết quả tư vấn

Mô tả
Use case cho phép nhân viên sale cập nhật kết quả sau khi tư vấn/xem phòng cho khách hàng, bao gồm phòng/giường đã tư vấn, nội quy đã trao đổi, quyết định của khách hàng và hướng xử lý tiếp theo.

Sự kiện kích hoạt
Sau khi nhân viên sale đã tư vấn hoặc dẫn khách hàng xem phòng.

Tác nhân
Nhân viên sale

Use-case liên quan
<<, Extend>>Đăng nhập, <<include>>Lên lịch hẹn xem phòng”

Tiền điều kiện
Nhân viên sale đã đăng nhập vào hệ thống. Thông tin đăng ký thuê của khách hàng đã được ghi nhận. Khách hàng đã được tư vấn hoặc xem phòng.

Hậu điều kiện
Hệ thống lưu kết quả tư vấn. Nếu khách đồng ý thuê, phiếu đăng ký được cập nhật để chuyển sang bước rà soát và thỏa thuận thuê. Nếu khách chưa quyết định, hệ thống ghi nhận nhu cầu hẹn xem thêm hoặc điều chỉnh tiêu chí thuê.
Dòng sự kiện chính
Nhân viên sale chọn chức năng Cập nhật kết quả tư vấn.
Hệ thống hiển thị danh sách khách hàng/phiếu đăng ký thuê đang chờ cập nhật kết quả tư vấn.
Nhân viên sale chọn phiếu đăng ký thuê của khách hàng cần cập nhật.
Hệ thống hiển thị thông tin đăng ký thuê của khách hàng, gồm: thông tin cá nhân, số lượng người ở, giới tính, khu vực mong muốn, loại phòng, mức giá, thời gian dự kiến vào ở, thời hạn thuê và các tiêu chí ưu tiên.
Nhân viên sale nhập kết quả tư vấn, gồm: phòng/giường đã tư vấn, nội quy đã trao đổi, chi phí thuê, chi phí dịch vụ, quy định đặt cọc và các lưu ý lưu trú.
Nhân viên sale cập nhật quyết định của khách hàng.
Nếu khách hàng đồng ý thuê, nhân viên sale chọn trạng thái Đồng ý thuê/Chờ rà soát và thỏa thuận thuê.
Hệ thống lưu kết quả tư vấn và cập nhật trạng thái phiếu đăng ký thuê.
Hệ thống hiển thị thông báo cập nhật kết quả tư vấn thành công.
Use case kết thúc.




Dòng sự kiện phụ
A6 – Khách hàng chưa đưa ra quyết định
Rẽ nhánh tại bước 6
Nhân viên sale chọn trạng thái Chưa quyết định.
Hệ thống yêu cầu nhân viên sale nhập ghi chú lý do, ví dụ: khách cần suy nghĩ thêm, muốn xem thêm phòng, hoặc muốn điều chỉnh tiêu chí thuê.
Nếu khách muốn hẹn xem thêm phòng, hệ thống thực hiện use case Lên lịch hẹn xem phòng.
Hệ thống lưu kết quả tư vấn với trạng thái Chưa quyết định.
Use case kết thúc.
A6 – Khách hàng muốn điều chỉnh tiêu chí thuê
Rẽ nhánh tại bước 6
Nhân viên sale chọn trạng thái Điều chỉnh tiêu chí thuê.
Hệ thống hiển thị form cập nhật tiêu chí thuê.
Nhân viên sale cập nhật lại thông tin như khu vực, loại phòng, mức giá, số lượng người ở, thời gian vào ở hoặc yêu cầu ưu tiên khác.
Hệ thống lưu thông tin điều chỉnh.
Hệ thống cập nhật trạng thái phiếu đăng ký là Cần tư vấn lại.
Use case kết thúc.
A6 – Khách hàng không tiếp tục thuê
Rẽ nhánh tại bước 6
Nhân viên sale chọn trạng thái Không tiếp tục thuê.
Hệ thống yêu cầu nhập lý do hủy nhu cầu thuê.
Nhân viên sale nhập lý do.
Hệ thống lưu kết quả tư vấn và cập nhật trạng thái phiếu đăng ký là Đã hủy.
Use case kết thúc.


