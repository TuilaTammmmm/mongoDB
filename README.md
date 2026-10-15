# BÀI TẬP LỚN: CƠ SỞ DỮ LIỆU PHÂN TÁN (MONGODB)
## Đề tài: Hệ thống Quản lý Bệnh viện & Hồ sơ Y tế Điện tử Toàn diện (Full Enterprise HIS & EHR)

---

## 1. Giới thiệu Đề tài
Hệ thống **HIS & EHR** được thiết kế nhằm số hóa toàn diện quy trình tiếp nhận, khám chữa bệnh, chỉ định cận lâm sàng, điều trị nội trú, ngân hàng máu, phẫu thuật, giám sát ICU, cấp phát dược phẩm, quyết toán viện phí và giám định BHYT cho chuỗi bệnh viện đa khoa có nhiều cơ sở (Hà Nội, TP.HCM).

Hệ thống tận dụng tối đa các thế mạnh vượt trội của **MongoDB** và **Cơ sở dữ liệu phân tán (Distributed Database)**:
- **Polymorphic Schema (Lược đồ Đa hình)**: Cho phép lưu trữ bệnh án các chuyên khoa khác nhau (Tim mạch, Tiêu hóa, Mắt, Nhi) trong cùng một collection với các chỉ số sinh học chuyên sâu linh hoạt mà không cần tách nhiều bảng SQL phức tạp.
- **Embedded Documents & Arrays**: Nhúng lịch sử dị ứng, chi tiết đơn thuốc, kết quả xét nghiệm theo thời gian thực.
- **Horizontal Sharding & Geo-Zone Sharding**: Phân mảnh dữ liệu theo chi nhánh bệnh viện (`hospital_branch: "HN"` và `"HCM"`), đảm bảo dữ liệu bệnh nhân ở cơ sở nào được lưu trữ và xử lý trực tiếp tại cụm máy chủ vùng đó (*Targeted Query*).
- **High Availability & ACID Transactions**: Đảm bảo sẵn sàng cao qua Replica Set và giao dịch an toàn đa tài liệu khi hoàn tất bệnh án và trừ tồn kho dược.

---

## 2. Danh mục Toàn diện 20 Collections (Chia theo 6 Phân hệ Bệnh viện)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                  HỆ THỐNG QUẢN TRỊ BỆNH VIỆN TOÀN DIỆN (HIS & EHR)           │
├─────────────────────┬─────────────────────┬──────────────────────────────────┤
│ 1. Tiếp đón & BN    │ 2. Khám & Lâm sàng  │ 3. Điều trị Nội trú & Cấp cứu    │
│  - patients         │  - encounters ⭐    │  - inpatient_admissions          │
│  - appointments     │  - lab_tests        │  - surgical_operations           │
│  - vaccinations     │  - telemetry (ICU)  │  - blood_bank                    │
│  - patient_feedbacks│                     │  - hospital_transfers (115)      │
├─────────────────────┼─────────────────────┼──────────────────────────────────┤
│ 4. Dược & Kho VTYT  │ 5. Nhân sự & TBYT   │ 6. Tài chính, BHYT & An toàn     │
│  - pharmacy_inv ⭐  │  - departments      │  - invoices                      │
│  - prescriptions    │  - doctors          │  - insurance_claims (BHYT)       │
│  - med_suppliers    │  - medical_equipment│  - medical_audit_logs (HIPAA)    │
└─────────────────────┴─────────────────────┴──────────────────────────────────┘
```

### Chi tiết 20 Collections:
1. `patients`: Hồ sơ bệnh nhân, CCCD duy nhất, mảng dị ứng thuốc/thực phẩm nhúng (*Embed*).
2. `appointments`: Quản lý đặt lịch khám trực tuyến theo bác sĩ và chuyên khoa.
3. `vaccinations`: Lịch sử tiêm chủng, số mũi, lô vaccine và phản ứng sau tiêm.
4. `patient_feedbacks`: Khảo sát mức độ hài lòng (1-5 sao), thái độ phục vụ của nhân viên y tế.
5. `departments`: Danh mục khoa phòng, cơ sở chi nhánh, buồng bệnh, giường bệnh trống.
6. `doctors`: Thông tin bác sĩ, chứng chỉ hành nghề, học vị, lịch trực khám bệnh.
7. `medical_equipment`: Quản lý trang thiết bị máy móc (Máy MRI, CT, máy thở), lịch bảo trì định kỳ.
8. `encounters` ⭐: **Bệnh án cốt lõi (Polymorphic Sharded Collection)**: Chứa sinh hiệu, kết quả khám chuyên khoa đa hình, mã ICD-10.
9. `lab_tests`: Chỉ định cận lâm sàng LIS, các chỉ số sinh hóa, dải tham chiếu và cờ cảnh báo bất thường (*CRITICAL / HIGH*).
10. `surgical_operations`: Quản lý ca phẫu thuật, kíp mổ (phẫu thuật viên chính), phòng mổ, phương pháp gây mê.
11. `patient_vitals_telemetry`: Dữ liệu giám sát sinh hiệu liên tục (Monitor đầu giường khoa ICU: SpO2, nhịp tim, huyết áp động mạch).
12. `inpatient_admissions`: Quản lý điều trị nội trú, buồng bệnh, số giường, diễn tiến chăm sóc của điều dưỡng.
13. `blood_bank`: Ngân hàng máu, các nhóm máu (A, B, AB, O), loại chế phẩm (hồng cầu lắng, huyết tương), hạn sử dụng.
14. `hospital_transfers`: Quản lý chuyển viện cấp cứu 115, xe cứu thương, lý do chuyển tuyến trên.
15. `pharmacy_inventory` ⭐: **Kho dược theo chi nhánh (Sharded Collection)**: Quản lý thuốc, hoạt chất, số lô, tồn kho và ngưỡng báo động.
16. `prescriptions`: Đơn thuốc xuất viện, hướng dẫn dùng thuốc và tiến trình cấp phát tại quầy dược.
17. `medication_suppliers`: Danh mục công ty dược phẩm, hợp đồng cung ứng thuốc và đánh giá nhà cung cấp.
18. `invoices`: Hóa đơn viện phí, tự động tính tỷ lệ BHYT chi trả (80%) và số tiền bệnh nhân đồng chi trả.
19. `insurance_claims`: Hồ sơ đề nghị cơ quan Bảo hiểm Xã hội (BHYT) thanh toán chi phí khám chữa bệnh.
20. `medical_audit_logs`: Nhật ký truy vết an toàn bệnh án (tiêu chuẩn HIPAA), tự hủy sau 365 ngày bằng **TTL Index**.

---

## 3. Cấu trúc Thư mục Dự án

```text
BTL_CSDLPT/
├── .gitignore                          # Cấu hình bỏ qua các file tạm, logs, tài liệu txt/docx
├── docker/
│   ├── docker-compose.yml              # Dựng cụm Sharded Cluster phân tán (ConfigSvr, Shard 1, Shard 2, Mongos)
│   └── init-cluster.ps1                # Script PowerShell 1-click kích hoạt Replica Sets & nạp Shard vào Router
├── scripts/
│   ├── 01_init_schema_and_indexes.js   # Tạo 20 Collections + Schema Validation + Indexes nâng cao
│   ├── 02_seed_data.js                 # Nạp dữ liệu y tế mẫu thực tế cho 20 Collections
│   ├── 03_setup_sharding.js            # Kích hoạt Sharding & cấu hình Zone Sharding (Chi nhánh HN & HCM)
│   └── 04_advanced_queries.js          # 5 Aggregation Pipelines & Full-Text Search báo cáo dịch tễ/viện phí
└── README.md                           # Bản thuyết minh đề tài & Hướng dẫn tổng quan
```

---

## 4. Hướng dẫn Chạy Nhanh

Mở PowerShell tại thư mục `D:\BTL\BTL_CSDLPT\scripts`:
```powershell
# Chạy với MongoDB cục bộ hoặc qua mongos Router cổng 27017:
mongosh --port 27017 hospital_ehr_db < 01_init_schema_and_indexes.js
mongosh --port 27017 hospital_ehr_db < 02_seed_data.js
mongosh --port 27017 hospital_ehr_db < 04_advanced_queries.js
```
