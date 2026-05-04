Tên Use-Case
Nhận phòng
Mô tả
Use-case tổng quát điều phối toàn bộ quy trình từ khi khách đến chi nhánh, bao gồm: kiểm tra hồ sơ, xác nhận điều kiện lưu trú, thực hiện ký hợp đồng, thanh toán và hoàn tất bàn giao tài sản trên hệ thống.
Actor
Nhân viên quản lý
Điều kiện kích hoạt
Người dùng chọn chức năng "Tiếp nhận nhận phòng" trên màn hình quản lý lịch hẹn.
Tiền điều kiện
Nhân viên đã đăng nhập thành công vào hệ thống. Khách hàng đã có thông tin đặt cọc/lịch hẹn trước đó.
Hậu điều kiện
Trạng thái phòng/giường chuyển sang "Đang sử dụng". Hợp đồng và biên bản bàn giao tài sản được lưu trữ chính thức.
Luồng sự kiện chính
1. Hệ thống hiển thị giao diện danh sách khách hàng đến nhận phòng theo lịch hẹn.
2. Người dùng chọn khách hàng tương ứng để bắt đầu quy trình.
3. Hệ thống gọi Use case: Kiểm tra giấy tờ và xác nhận thông tin (Include) để cập nhật dữ liệu cư trú.
4. Hệ thống gọi Use case: Kiểm tra điều kiện lưu trú (Include) để phê duyệt đối tượng thuê.
5. Sau khi đủ điều kiện, hệ thống gọi Use case: Lập và xác nhận hợp đồng (Include) để khởi tạo văn bản pháp lý.
6. Hệ thống gọi Use case: Thanh toán (Include) để xác nhận các khoản thu kỳ đầu.
7. Sau khi xác nhận thanh toán thành công, hệ thống tự động hiển thị danh mục tài sản/vật dụng đi kèm của phòng/giường (nệm, tủ, chìa khóa...).
8. Người dùng thực hiện tích chọn (check) trạng thái thực tế của từng vật dụng trên giao diện bàn giao.
9. Người dùng nhấn nút "Hoàn tất bàn giao".
10. Hệ thống lưu biên bản bàn giao, cập nhật trạng thái phòng thành "Đang sử dụng" và kích hoạt thời hạn cư trú của hợp đồng.
11. Kết thúc Use-case.
Luồng sự kiện phụ
Không




Tên Use-Case
Kiểm tra giấy tờ
Mô tả
Use-case cho phép nhân viên sale tìm kiếm thông tin đặt cọc và nhập/cập nhật dữ liệu giấy tờ tùy thân, thông tin cư trú của khách hàng (cá nhân hoặc nhóm) vào hệ thống.
Actor
Nhân viên sale
Điều kiện kích hoạt
Nhân viên sale chọn chức năng "Kiểm tra giấy tờ" trên giao diện hệ thống khi tiến hành làm thủ tục cho khách đến nhận phòng.
Tiền điều kiện
Người dùng (Nhân viên sale) đã đăng nhập vào hệ thống; Khách hàng đã có mã/thông tin đặt cọc được lưu trước đó.
Hậu điều kiện
Dữ liệu giấy tờ tùy thân và thông tin cư trú của khách hàng được hệ thống lưu trữ thành công.
Luồng sự kiện chính
1. Hệ thống hiển thị màn hình tra cứu đặt cọc.
2. Người dùng nhập mã đặt cọc hoặc số điện thoại khách hàng.
3. Hệ thống truy xuất cơ sở dữ liệu và hiển thị chi tiết thông tin cọc (số giường, số lượng người, khu vực).
4. Người dùng nhập liệu thông tin giấy tờ tùy thân và dữ liệu cư trú của khách hàng(cá nhân)/thành viên nhóm.
5. Hệ thống kiểm tra tính hợp lệ của format dữ liệu nhập vào (các trường bắt buộc).
6. Hệ thống lưu trữ dữ liệu, thông báo thành công và chuyển trạng thái hồ sơ sang "Chờ kiểm tra điều kiện".
7. Kết thúc Use-Case.
Luồng sự kiện phụ
A3 – Không tìm thấy thông tin đặt cọc (rẽ nhánh tại B3)
1. Hệ thống hiển thị thông báo "Không tìm thấy dữ liệu đặt cọc phù hợp".
2. Quay lại B2 trong luồng chính.
A5.1 – Dữ liệu nhập không hợp lệ hoặc thiếu (rẽ nhánh tại B5)
1. Hệ thống hiển thị cảnh báo đỏ tại các trường dữ liệu bị thiếu hoặc sai định dạng.
2. Quay lại B4 trong luồng chính.
A5.2 – Số lượng người nhập vượt quá số giường đã cọc (rẽ nhánh tại B5)
1. Hệ thống cảnh báo "Số lượng người cư trú vượt quá số lượng giường/phòng đặt cọc".
2. Hệ thống khóa nút lưu. Nhân viên sale điều chỉnh lại danh sách nhập liệu. Quay lại B4.




Tên Use-Case
Kiểm tra điều kiện lưu trú
Mô tả
Use-case cho phép hệ thống hỗ trợ nhân viên quản lý xác nhận xem khách hàng hoặc từng thành viên trong nhóm có đáp ứng quy định lưu trú (giới tính, khu vực...) hay không.
Actor
Nhân viên quản lý
Điều kiện kích hoạt
Nhân viên quản lý chọn chức năng "Kiểm tra điều kiện lưu trú" sau khi thông tin giấy tờ đã được nhân viên sale cập nhật.
Tiền điều kiện
Người dùng đã đăng nhập; Hồ sơ khách hàng đang ở trạng thái "Chờ kiểm tra điều kiện".
Hậu điều kiện
Trạng thái hồ sơ khách hàng được cập nhật thành "Đủ điều kiện" hoặc "Từ chối".
Luồng sự kiện chính
1. Hệ thống hiển thị danh sách các hồ sơ đang chờ kiểm tra điều kiện.
2. Người dùng chọn một hồ sơ.
3. Hệ thống trích xuất dữ liệu khách hàng đối chiếu tự động với quy định của phòng/khu vực và hiển thị kết quả gợi ý.
4. Người dùng thao tác chọn nút "Đạt" cho cá nhân/từng thành viên nhóm.
5. Hệ thống ghi nhận, cập nhật trạng thái hồ sơ thành "Đủ điều kiện chờ ký hợp đồng".
6. Kết thúc Use-Case.
Luồng sự kiện phụ
A4.1 – Cá nhân không đủ điều kiện (rẽ nhánh tại B4)
1. Người dùng thao tác chọn nút "Từ chối".
2. Hệ thống cập nhật trạng thái hồ sơ thành "Đã hủy do không đạt điều kiện", tự động đóng luồng nhận phòng hiện tại.
3. Kết thúc Use-Case.
A4.2 – Có thành viên trong nhóm không đủ điều kiện (rẽ nhánh tại B4)
1. Người dùng tích chọn "Từ chối" cho thành viên vi phạm.
2. Hệ thống loại thành viên đó ra khỏi danh sách tạo hợp đồng.
3. Người dùng thao tác xác nhận tiếp tục quy trình với các thành viên hợp lệ còn lại.
4. Quay lại B5 trong luồng chính.




Tên Use-Case
Lập và xác nhận hợp đồng
Mô tả
Use-case hệ thống tự động sinh bản thảo hợp đồng thuê phòng dựa trên dữ liệu đã có và cho phép nhân viên thao tác xác nhận lưu hợp đồng.
Actor
Nhân viên phụ trách
Điều kiện kích hoạt
Nhân viên phụ trách truy cập module "Quản lý hợp đồng" và chọn tạo hợp đồng mới.
Tiền điều kiện
Người dùng đã đăng nhập; Hồ sơ khách hàng ở trạng thái "Đủ điều kiện chờ ký hợp đồng".
Hậu điều kiện
Hợp đồng được số hóa lưu vào hệ thống; Phiếu thanh toán kỳ đầu được tự động sinh ra.
Luồng sự kiện chính
1. Người dùng chọn hồ sơ khách hàng cần làm hợp đồng.
2. Hệ thống tự động trích xuất thông tin khách hàng, số giường, đơn giá, phí dịch vụ, kỳ thanh toán và map vào template hợp đồng.
3. Hệ thống hiển thị bản thảo hợp đồng trên màn hình để rà soát.
4. Người dùng click chọn "Xác nhận tạo hợp đồng".
5. Hệ thống lưu trữ văn bản hợp đồng với trạng thái "Đã ký".
6. Hệ thống tự động sinh một phiếu yêu cầu thanh toán chuyển sang bộ phận kế toán.
7. Kết thúc Use-Case.
Luồng sự kiện phụ
A4 – Hủy ký hợp đồng (rẽ nhánh tại B4)
1. Người dùng thao tác chọn nút "Hủy hợp đồng".
2. Hệ thống ghi nhận lý do, chuyển trạng thái hồ sơ thành "Hủy thuê" và giải phóng tình trạng cọc của giường/phòng.
3. Kết thúc Use-Case.




Use-Case
Nội dung
Tên Use-Case
Thanh toán
Mô tả
Use-case cho phép hệ thống hiển thị công nợ, ghi nhận số tiền thanh toán thực tế của khách và cấp quyền bàn giao phòng.
Actor
Nhân viên kế toán
Điều kiện kích hoạt
Nhân viên kế toán mở chức năng "Thu tiền kỳ đầu" từ giao diện quản lý tài chính.
Tiền điều kiện
Người dùng đã đăng nhập; Có phiếu yêu cầu thanh toán được sinh ra từ UC Lập hợp đồng.
Hậu điều kiện
Công nợ được gạch, trạng thái hồ sơ đổi thành "Đã thanh toán" và quyền bàn giao phòng được mở.
Luồng sự kiện chính
1. Hệ thống hiển thị danh sách các phiếu thanh toán đang chờ.
2. Người dùng click chọn phiếu của khách hàng hiện tại.
3. Hệ thống tính toán và hiển thị chi tiết số tiền phải thu.
4. Người dùng nhập số tiền thực thu và chọn phương thức thanh toán vào hệ thống.
5. Hệ thống kiểm tra số tiền nhập vào khớp với tổng phải thu.
6. Hệ thống lưu giao dịch, xuất biên lai điện tử và kích hoạt cờ "Cho phép bàn giao phòng".
7. Kết thúc Use-Case.
Luồng sự kiện phụ
A5 – Thanh toán chưa đủ số tiền (rẽ nhánh tại B5)
1. Hệ thống phát hiện số tiền nhập vào nhỏ hơn số tiền phải thu.
2. Hệ thống báo đỏ khoản nợ còn thiếu. Chỉ ghi nhận giao dịch "Thu tạm ứng".
3. Hệ thống KHÔNG kích hoạt cờ "Cho phép bàn giao phòng" (trạng thái giữ nguyên là chưa thanh toán xong).
4. Kết thúc Use-Case (chờ thao tác thanh toán bổ sung sau).


