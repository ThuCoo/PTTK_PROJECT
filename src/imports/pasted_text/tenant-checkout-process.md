Tên Use Case
Trả phòng và hoàn cọc
Mô tả
Use Case bắt đầu khi khách hàng (hoặc đại diện nhóm) liên hệ với nhân viên sale để đăng ký thời gian trả phòng và cung cấp thông tin hợp đồng/phiếu đặt cọc

Use Case mô tả quy trình khi khách hàng (hoặc đại diện nhóm thuê) thực hiện thủ tục trả phòng/giường đến bước hoàn tất thủ tục kết thúc lưu trú. 
Dòng cơ bản
Khách hàng yêu cầu hoàn trả phòng
Thực hiện nghiệp vụ “Tiếp nhận yêu cầu trả phòng”
Nhân viên quản lý chuyển phiếu kiểm tra phòng cho Nhân viên kế toán.
Nhân viên kế toán xác định tỷ lệ hoàn cọc cơ bản dựa trên tình trạng thuê và thời gian lưu trú (80%, 50%, 70% hoặc 100%)
Nhân viên kế toán tính toán khấu trừ các chi phí phát sinh (tiền thuê/điện nước còn nợ, chi phí sửa chữa, tiền phạt,...)
Nhân viên kế toán lập bảng đối soát phiếu thanh toán và báo lại cho Nhân viên quản lý
Nhân viên quản lý thông báo chi tiết các khoản khấu trừ và số tiền hoàn cọc (hoặc cần thanh toán thêm) cho khách hàng
Khách hàng xác nhận đồng ý với kết quả đối soát
Khách hàng thanh toán khoản phát sinh (nếu có) hoặc thống nhất phương thức nhận hoàn cọc (tiền mặt/chuyển khoản)
Nhân viên quản lý chuẩn bị biên bản trả phòng và thanh lý hợp đồng thuê
Nhân viên kế toán thực hiện hoàn cọc cho khách hàng theo đúng số tiền đã đối soát
Nhân viên quản lý thu hồi chìa khóa/thẻ ra vào và cập nhật lại thông tin bàn giao tài sản
Nhân viên quản lý ghi nhận phòng/giường trống trên hệ thống để sẵn sàng cho khách mới
Dòng thay thế
A8: Tại bước 8, nếu khách không đồng ý kết quả đối soát thì 
Quản lý giải thích từng khoản khấu trừ và gửi bảng chi tiết đối soát.
Nếu khách vẫn chưa đồng ý, quy trình tạm dừng ở trạng thái chờ xử lý khiếu nại và quay lại bước 2, không thực hiện từ bước 9 trở đi
A7: Tại bước 7, nếu chi phí phát sinh lớn hơn tiền cọc được hoàn, Quản lý thông báo số tiền chênh lệch khách phải nộp thêm:
Khách thanh toán đủ thì quy trình tiếp tục.
Nếu khách chưa thanh toán, hồ sơ trả phòng chưa được hoàn tất, không thực hiện từ bước 8 trở đi




Tên Use Case
Tiếp nhận yêu cầu trả phòng
Mô tả
Use Case bắt đầu khi Nhân viên quản lý bắt đầu kiểm tra sau khi nhận thông báo khách đến thời điểm trả phòng.

Use Case mô tả nghiệp vụ tiếp nhận thông tin trả phòng, kiểm tra tính hợp lệ của hồ sơ thuê đến kiểm tra thực tế phòng/giường trước khi chuyển sang nghiệp vụ xử lý trả phòng và hoàn cọc
Dòng cơ bản
Khách hàng gửi yêu cầu đăng ký trả phòng cho nhân viên sale.
Nhân viên sale tiếp nhận yêu cầu trả phòng.
Nhân viên sale kiểm tra thông tin hợp đồng/phiếu đặt cọc của khách hàng.
Nếu thông tin hợp lệ, nhân viên sale ghi nhận yêu cầu trả phòng.
Nhân viên sale xác nhận thời gian trả phòng với khách hàng.
Nhân viên sale thông báo lịch trả phòng cho khách hàng.
Đến thời điểm trả phòng, quản lý lập phiếu kiểm tra chỗ ở
Quản lý kiểm tra tình trạng thực tế phòng/giường, bao gồm hiện trạng tài sản, vệ sinh và các hư hỏng nếu có.
Quản lý đối chiếu tình trạng thực tế với thông tin hợp đồng, danh mục tài sản đã cấp và hồ sơ thuê tương ứng.
Nếu có hư hỏng hoặc mất mát, quản lý ghi nhận chi tiết các hư hỏng, mất mát phát sinh.
Quản lý tổng hợp thông tin kiểm tra.
Dòng thay thế
A3: Tại bước 3, nếu thông tin hợp đồng/phiếu đặt cọc không hợp lệ hoặc chưa đầy đủ, nhân viên sale yêu cầu khách hàng bổ sung thông tin. Sau khi khách hàng bổ sung, use case quay lại bước 3.
A8: Tại bước 8, nếu quản lý kiểm tra và không phát hiện hư hỏng hoặc mất mát, bỏ qua bước 10 và chuyển sang bước 11.
A9: Tại bước 9, nếu thông tin phòng/giường thực tế không khớp với hồ sơ thuê hoặc tài sản bàn giao ban đầu, quản lý ghi nhận sai lệch và tổng hợp thông tin kiểm tra để chuyển sang xử lý ở nghiệp vụ tiếp theo.




USECASE HỆ THỐNG
SƠ ĐỒ 1

Tên Use Case
Đăng nhập
Mô tả
Use case cho phép người dùng đăng nhập vào hệ thống để thực hiện các chức năng của mình

Sự kiện kích hoạt
Người dùng chọn chức năng đăng nhập từ màn hình hệ thống.

Tác nhân
Nhân viên sale, Nhân viên quản lý, Admin.
Use-case liên quan
Được include bởi: Tiếp nhận yêu cầu trả phòng, Kiểm tra trả phòng.

Tiền điều kiện
Người dùng đã có tài khoản hợp lệ trên hệ thống.

Hậu điều kiện
Người dùng đăng nhập thành công và vào đúng giao diện theo vai trò.
Dòng sự kiện chính
Hệ thống hiển thị màn hình đăng nhập.
Người dùng nhập tên đăng nhập và mật khẩu.
Hệ thống kiểm tra thông tin đăng nhập.
Hệ thống xác định vai trò người dùng.
Hệ thống hiển thị màn hình chính tương ứng với quyền của người dùng.
Kết thúc use case.



Dòng sự kiện phụ
A2 – Thông tin đăng nhập không hợp lệ
Hệ thống thông báo sai tên đăng nhập hoặc mật khẩu.
Hệ thống hiển thị lại màn hình đăng nhập.
Quay lại bước 2.
A2 – Tài khoản bị khóa / không hoạt động
Hệ thống thông báo tài khoản không được phép đăng nhập.
Kết thúc use case






Tên Use Case
Đăng xuất
Mô tả
Use case cho phép người dùng kết thúc phiên làm việc với hệ thống

Sự kiện kích hoạt
Người dùng chọn chức năng đăng xuất.

Tác nhân
Nhân viên sale, Nhân viên quản lý, Admin
Use-case liên quan
không

Tiền điều kiện
Người dùng đã đăng nhập vào hệ thống.

Hậu điều kiện
Phiên làm việc bị hủy và người dùng trở về màn hình đăng nhập/trang chủ.
Dòng sự kiện chính
Người dùng chọn chức năng đăng xuất.
Hệ thống yêu cầu xác nhận đăng xuất.
Người dùng xác nhận.
Hệ thống hủy phiên đăng nhập hiện tại.
Hệ thống hiển thị màn hình đăng nhập.
Kết thúc use case.

Dòng sự kiện phụ
A1 – Người dùng hủy thao tác đăng xuất
Người dùng chọn không xác nhận.
Hệ thống quay về màn hình đang làm việc.




Tên Use Case
Tiếp nhận yêu cầu trả phòng
Mô tả
Use case cho phép nhân viên sale tiếp nhận yêu cầu trả phòng từ khách hàng, kiểm tra tính hợp lệ của thông tin ban đầu, ghi nhận yêu cầu và xác nhận lịch trả phòng.

Sự kiện kích hoạt
Khách hàng hoặc đại diện nhóm thuê liên hệ yêu cầu trả phòng.

Tác nhân
Nhân viên sale

Use-case liên quan
<<include>> Đăng nhập.

Tiền điều kiện
Nhân viên sale đã đăng nhập.
Khách thuê đã có hồ sơ thuê/hợp đồng trên hệ thống.

Hậu điều kiện
Yêu cầu trả phòng được ghi nhận trên hệ thống, kèm thời gian trả phòng dự kiến và trạng thái chờ kiểm tra thực tế.
Dòng sự kiện chính
Khách hàng gửi yêu cầu đăng ký trả phòng cho nhân viên sale.
Nhân viên sale chọn chức năng Tiếp nhận yêu cầu trả phòng.
Hệ thống hiển thị màn hình nhập thông tin yêu cầu trả phòng.
Nhân viên sale nhập mã hợp đồng/phiếu đặt cọc và thông tin khách hàng.
Hệ thống kiểm tra tồn tại của hồ sơ thuê tương ứng.
Hệ thống hiển thị thông tin thuê hiện tại: khách thuê, phòng/giường, chi nhánh, thời gian thuê, tình trạng hợp đồng.
Nhân viên sale nhập thời gian khách dự kiến trả phòng và các ghi chú cần thiết.
Hệ thống kiểm tra tính hợp lệ của yêu cầu trả phòng.
Nhân viên sale xác nhận lưu yêu cầu.
Hệ thống ghi nhận yêu cầu trả phòng và chuyển trạng thái hồ sơ sang Chờ kiểm tra trả phòng.
Nhân viên sale thông báo lại lịch trả phòng cho khách hàng.
Kết thúc use case.



Dòng sự kiện phụ
A5 – Không tìm thấy hợp đồng/phiếu đặt cọc
Hệ thống thông báo không tìm thấy hồ sơ thuê.
Nhân viên sale kiểm tra lại thông tin.
Quay lại bước 4.
A5 – Hồ sơ không hợp lệ để tạo yêu cầu trả phòng
 (đã thanh lý trước đó hoặc đã có yêu cầu trả phòng đang xử lý)
Hệ thống thông báo hồ sơ không thể tiếp nhận yêu cầu mới.
Kết thúc use case.
A6 – Thông tin khách cung cấp chưa đầy đủ hoặc chưa đúng
Hệ thống hoặc nhân viên sale phát hiện thiếu/sai thông tin.
Nhân viên sale yêu cầu khách bổ sung.
Sau khi bổ sung xong, quay lại bước 4.
A11 – Khách muốn thay đổi thời gian trả phòng ngay lúc tiếp nhận
Nhân viên sale cập nhật thời gian mới.
Hệ thống kiểm tra tính hợp lệ của thời gian mới.
Quay lại bước 9. 




Tên Use Case
Kiểm tra trả phòng

Mô tả
Use case cho phép nhân viên quản lý kiểm tra tình trạng thực tế của phòng/giường và tài sản khi khách trả phòng, đối chiếu với hồ sơ thuê, sau đó lập biên bản kiểm tra để chuyển sang bước đối soát và hoàn cọc.

Sự kiện kích hoạt
Đến thời điểm khách hàng thực hiện trả phòng theo lịch đã đăng ký.

Tác nhân
Nhân viên quản lý

Use-case liên quan
<<include>> Đăng nhập.

Tiền điều kiện
Nhân viên quản lý đã đăng nhập.
Đã tồn tại yêu cầu trả phòng hợp lệ trên hệ thống.
Hồ sơ thuê đang ở trạng thái còn hiệu lực

Hậu điều kiện
Biên bản kiểm tra trả phòng được lưu; thông tin kiểm tra được chuyển sang kế toán/quản lý để đối soát các khoản hoàn cọc và chi phí phát sinh
Dòng sự kiện chính
Nhân viên quản lý chọn chức năng Kiểm tra trả phòng.
Hệ thống hiển thị danh sách các yêu cầu trả phòng đến hạn/chờ xử lý.
Nhân viên quản lý chọn hồ sơ khách cần kiểm tra.
Hệ thống hiển thị thông tin hợp đồng, phòng/giường, danh sách tài sản bàn giao, tiền cọc và các nghĩa vụ liên quan.
Nhân viên quản lý kiểm tra hiện trạng thực tế phòng/giường.
Nhân viên quản lý kiểm tra tình trạng vệ sinh, mức độ hư hỏng, mất mát tài sản nếu có.
Nhân viên quản lý đối chiếu hiện trạng thực tế với hợp đồng và danh sách tài sản đã bàn giao.
Nhân viên quản lý nhập kết quả kiểm tra vào hệ thống.
Hệ thống tổng hợp kết quả kiểm tra và cho phép lập biên bản kiểm tra trả phòng.
Nhân viên quản lý xác nhận hoàn tất kiểm tra.
Hệ thống lưu biên bản kiểm tra và chuyển dữ liệu sang bước đối soát/phiếu thanh toán để tính khoản hoàn cọc hoặc khoản khách phải trả thêm.
Kết thúc use case



Dòng sự kiện phụ
A6 – Không phát hiện hư hỏng hoặc mất mát
Nhân viên quản lý xác nhận hiện trạng bình thường.
Hệ thống ghi nhận không có khoản bồi thường từ tài sản.
Quay lại bước 9.
A6 – Có hư hỏng hoặc mất mát tài sản
Nhân viên quản lý ghi nhận chi tiết tài sản hư hỏng/mất mát.
Hệ thống cho phép nhập mô tả, số lượng, mức độ, chi phí dự kiến khấu trừ.
Quay lại bước 9.
A7 – Hiện trạng phòng/giường không khớp hồ sơ bàn giao ban đầu
Hệ thống cảnh báo có chênh lệch so với dữ liệu bàn giao.
Nhân viên quản lý ghi chú nguyên nhân và xác nhận chênh lệch.
Quay lại bước 9.
A3 – Không tìm thấy yêu cầu trả phòng tương ứng
Hệ thống thông báo không có hồ sơ trả phòng phù hợp.
Kết thúc use case.
A5 – Không thể hoàn tất kiểm tra do khách vắng mặt / chưa bàn giao đủ chìa khóa, thẻ từ
Nhân viên quản lý ghi nhận lý do chưa hoàn tất.
Hệ thống lưu trạng thái Kiểm tra chưa hoàn tất.
Kết thúc use case.





SƠ ĐỒ 2


Tên Use Case
Đối soát thanh toán trả phòng

Mô tả
Use case cho phép nhân viên kế toán kiểm tra, tính toán và đối chiếu các khoản tiền liên quan đến việc trả phòng của khách hàng, bao gồm tiền cọc được hoàn, tiền thuê còn nợ, tiền điện nước/dịch vụ, chi phí sửa chữa, bồi thường hư hỏng và các khoản phạt nếu có.

Sự kiện kích hoạt
Nhân viên kế toán nhận được thông tin kiểm tra trả phòng từ nhân viên quản lý.

Tác nhân
Nhân viên kế toán

Use-case liên quan
<<include>> Đăng nhập.

Tiền điều kiện
Nhân viên kế toán đã đăng nhập vào hệ thống. Hồ sơ trả phòng của khách hàng đã được nhân viên quản lý kiểm tra và chuyển sang kế toán.

Hậu điều kiện
Hệ thống ghi nhận kết quả đối soát. Phiếu thanh toán/bảng đối soát được tạo. Nếu còn dư tiền cọc thì chuyển sang xử lý hoàn cọc; nếu khách còn thiếu tiền thì ghi nhận khoản cần thanh toán thêm.
Dòng sự kiện chính
Nhân viên kế toán chọn chức năng Đối soát thanh toán trả phòng.
Hệ thống hiển thị danh sách hồ sơ trả phòng đang chờ đối soát.
Nhân viên kế toán chọn hồ sơ khách hàng cần xử lý.
Hệ thống hiển thị thông tin hợp đồng, phiếu đặt cọc, thời gian lưu trú, số tiền cọc và biên bản kiểm tra trả phòng.
Nhân viên kế toán kiểm tra tình trạng thuê và thời gian lưu trú của khách hàng.
Hệ thống hỗ trợ xác định tỷ lệ hoàn cọc cơ bản theo quy định:
Chưa ký hợp đồng hoặc hủy thuê: hoàn 80% tiền cọc.
Đã ký hợp đồng, chưa hết hạn thuê, lưu trú dưới 6 tháng: hoàn 50% tiền cọc.
Đã ký hợp đồng, chưa hết hạn thuê, lưu trú trên 6 tháng: hoàn 70% tiền cọc.
Hết hạn thuê theo hợp đồng: hoàn 100% tiền cọc.
 Các mức hoàn này được nêu trực tiếp trong quy trình trả phòng và hoàn cọc của đề .
Nhân viên kế toán nhập hoặc xác nhận các khoản cần khấu trừ, gồm: tiền thuê còn nợ, tiền điện nước/dịch vụ, chi phí sửa chữa, bồi thường hư hỏng/mất mát và khoản phạt vi phạm nếu có.
Hệ thống tính kết quả đối soát:

 Số tiền cuối cùng = Tiền cọc được hoàn theo tỷ lệ - Các khoản khấu trừ phát sinh


Hệ thống hiển thị kết quả đối soát cho nhân viên kế toán kiểm tra.
Nhân viên kế toán xác nhận kết quả đối soát.
Hệ thống lập bảng đối soát/phiếu thanh toán.
Hệ thống cập nhật trạng thái hồ sơ trả phòng là Đã đối soát.
Hệ thống chuyển kết quả cho nhân viên quản lý để làm việc với khách hàng.
Kết thúc Use Case.




Dòng sự kiện phụ
A1. Sau đối soát, khách hàng được hoàn cọc
Điều kiện rẽ nhánh: Số tiền cọc được hoàn lớn hơn các khoản khấu trừ.
Hệ thống hiển thị số tiền khách hàng được hoàn.
Nhân viên kế toán xác nhận phương thức hoàn tiền: tiền mặt hoặc chuyển khoản.
Hệ thống chuyển hồ sơ sang Use Case Hoàn cọc.
Quay lại bước 12 của dòng sự kiện chính.
A2. Sau đối soát, khách hàng phải thanh toán thêm
Điều kiện rẽ nhánh: Các khoản phát sinh lớn hơn số tiền cọc được hoàn.
Hệ thống hiển thị số tiền khách hàng còn phải thanh toán.
Nhân viên kế toán lập yêu cầu thanh toán bổ sung.
Khách hàng thực hiện thanh toán theo hướng dẫn.
Nhân viên kế toán xác nhận thanh toán.
Hệ thống cập nhật trạng thái đã hoàn tất thanh toán.
Quay lại bước 12 của dòng sự kiện chính.
A3. Thiếu biên bản kiểm tra trả phòng
Điều kiện rẽ nhánh: Hồ sơ chưa có thông tin kiểm tra tình trạng phòng/giường.
Hệ thống thông báo hồ sơ chưa đủ dữ liệu để đối soát.
Nhân viên kế toán gửi yêu cầu bổ sung thông tin cho nhân viên quản lý.
Hệ thống tạm dừng xử lý hồ sơ.
Use Case kết thúc.
A4. Thông tin khoản khấu trừ không hợp lệ
Điều kiện rẽ nhánh: Số tiền nhập sai, thiếu lý do khấu trừ hoặc khoản khấu trừ không có căn cứ.
Hệ thống hiển thị thông báo lỗi.
Nhân viên kế toán kiểm tra và nhập lại thông tin.
Quay lại bước 7 của dòng sự kiện chính.





Tên Use Case
Hoàn cọc

Mô tả
Use case cho phép nhân viên kế toán thực hiện hoàn trả tiền cọc cho khách hàng sau khi đã có kết quả đối soát hợp lệ và khách hàng đã hoàn tất xác nhận/thanh lý hợp đồng.

Sự kiện kích hoạt
Hồ sơ trả phòng có kết quả đối soát là Có số dư hoàn cọc và khách hàng đã xác nhận kết quả đối soát.

Tác nhân
Nhân viên kế toán

Use-case liên quan
<<include>> Đăng nhập; <<include>> Đối soát thanh toán trả phòng

Tiền điều kiện
Nhân viên kế toán đã đăng nhập. Hồ sơ đã được đối soát. Số tiền đối soát lớn hơn 0. Khách hàng đã xác nhận kết quả đối soát và hoàn tất thủ tục thanh lý/trả phòng.

Hậu điều kiện
Giao dịch hoàn cọc được ghi nhận. Hồ sơ trả phòng được cập nhật trạng thái Đã hoàn cọc hoặc Hoàn tất trả phòng.
Dòng sự kiện chính
Nhân viên kế toán chọn chức năng Hoàn cọc.
Hệ thống thực hiện “Đối soát thanh toán trả phòng” để kiểm tra hồ sơ đã có kết quả đối soát hợp lệ.
Hệ thống hiển thị danh sách hồ sơ có trạng thái Chờ hoàn cọc.
Nhân viên kế toán chọn hồ sơ cần hoàn cọc.
Hệ thống hiển thị thông tin khách hàng, hợp đồng, số tiền cọc ban đầu, kết quả đối soát và số tiền được hoàn.
Nhân viên kế toán chọn phương thức hoàn cọc: tiền mặt hoặc chuyển khoản.
Nhân viên kế toán nhập thông tin hoàn tiền: ngày hoàn, số tiền hoàn, tài khoản nhận nếu chuyển khoản, ghi chú/chứng từ nếu có.
Hệ thống kiểm tra số tiền hoàn có khớp với kết quả đối soát hay không.
Nhân viên kế toán xác nhận hoàn cọc.
Hệ thống ghi nhận giao dịch hoàn cọc.
Hệ thống cập nhật trạng thái hồ sơ là Đã hoàn cọc.
Hệ thống lưu chứng từ hoàn cọc nếu có.
Kết thúc Use Case.



Dòng sự kiện phụ
A1. Hồ sơ chưa có kết quả đối soát
Điều kiện rẽ nhánh: Hồ sơ chưa được đối soát hoặc chưa có bảng đối soát/phiếu thanh toán.
Hệ thống thông báo hồ sơ chưa đủ điều kiện hoàn cọc.
Hệ thống yêu cầu thực hiện Use Case Đối soát thanh toán trả phòng trước.
Use Case kết thúc.
A2. Số tiền đối soát không phát sinh hoàn cọc
Điều kiện rẽ nhánh: Số tiền đối soát nhỏ hơn hoặc bằng 0.
Hệ thống hiển thị thông báo khách hàng không có số dư hoàn cọc.
Nhân viên kế toán không thể thực hiện hoàn cọc.
Use Case kết thúc.
A3. Khách hàng chưa xác nhận kết quả đối soát
Hệ thống thông báo hồ sơ chưa được khách hàng xác nhận.
Nhân viên kế toán chuyển hồ sơ về trạng thái Chờ khách xác nhận.
Use Case kết thúc.
A4. Số tiền hoàn nhập vào không khớp kết quả đối soát
Hệ thống hiển thị thông báo số tiền hoàn không hợp lệ.
Nhân viên kế toán kiểm tra và nhập lại số tiền.
Quay lại bước 7 của dòng sự kiện chính.
A5. Hoàn tiền thất bại
Hệ thống hiển thị thông báo hoàn tiền thất bại.
Nhân viên kế toán kiểm tra lại phương thức hoàn tiền hoặc thông tin tài khoản nhận.
Hệ thống giữ trạng thái 




Tên Use Case
Hoàn trả phòng

Mô tả
Use case cho phép nhân viên quản lý/kế toán hoàn tất thủ tục trả phòng, thanh lý hợp đồng và cập nhật trạng thái phòng/giường.

Sự kiện kích hoạt
Khách hàng hoàn tất thanh toán và xác nhận trả phòng.

Tác nhân
Nhân viên quản lý

Use-case liên quan
<<include>> Đăng nhập.

Tiền điều kiện
Đã có biên bản trả phòng; các khoản thanh toán hoặc hoàn cọc đã được xử lý.

Hậu điều kiện
Hợp đồng được thanh lý, phòng/giường được cập nhật trạng thái trống.
Dòng sự kiện chính
Nhân viên chọn chức năng hoàn trả phòng.
Hệ thống hiển thị hồ sơ trả phòng của khách hàng.
Nhân viên kiểm tra thông tin hợp đồng, biên bản trả phòng và tình trạng thanh toán.
Nhân viên xác nhận hoàn tất trả phòng.
Hệ thống cập nhật trạng thái hợp đồng là đã thanh lý.
Hệ thống cập nhật phòng/giường thành trạng thái trống.
Hệ thống ghi nhận thời điểm khách kết thúc lưu trú.
Kết thúc Use Case.



Dòng sự kiện phụ
A1. Chưa hoàn tất thanh toán
Hệ thống hiển thị thông báo hồ sơ chưa đủ điều kiện hoàn trả phòng.
Nhân viên chuyển hồ sơ về bước xử lý thanh toán.
Use Case kết thúc.
A2. Chưa có biên bản trả phòng
Hệ thống yêu cầu lập biên bản trả phòng.
Nhân viên thực hiện lập biên bản.
Quay lại bước 3.


