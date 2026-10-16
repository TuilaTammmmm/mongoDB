# BÀI TẬP LỚN: CƠ SỞ DỮ LIỆU PHÂN TÁN (MONGODB)
## Đề tài: Hệ thống Quản trị & Điều phối Vật tư Doanh nghiệp Phân tán (Distributed Materials & Warehouse Management System - WMS)

---

## 1. Giới thiệu Đề tài
Hệ thống **Quản trị & Điều phối Vật tư Doanh nghiệp Phân tán (WMS & Materials Management)** được thiết kế nhằm số hóa và tự động hóa toàn diện quy trình chuỗi cung ứng vật tư, trang thiết bị công nghiệp, vật liệu xây dựng cho các tập đoàn, tổng công ty sản xuất - xây lắp có mạng lưới tổng kho phân bố đa vùng miền (Tổng kho Miền Bắc - Hà Nội, Tổng kho Miền Nam - TP.HCM).

Hệ thống tận dụng triệt để các thế mạnh cốt lõi của **MongoDB** và **Cơ sở dữ liệu phân tán (Distributed Database)**:
- **Polymorphic Schema (Lược đồ Đa hình)**: Quản lý thông tin đa dạng của hàng nghìn chủng loại vật tư (Thép xây dựng, Cáp điện trung thế, Sơn công nghiệp, Bu-lông cơ khí...) trong cùng một collection với các trường thông số kỹ thuật (`specifications`) linh hoạt mà không cần tạo hàng chục bảng SQL rời rạc.
- **Embedded Documents & Arrays**: Nhúng chi tiết danh mục hàng hóa trong từng phiếu nhập/xuất kho, vị trí ô kệ (Aisle, Rack, Bin), thông số kiểm định chất lượng (QC) và chứng chỉ xuất xứ (CO/CQ).
- **Horizontal Sharding & Geo-Zone Sharding**: Phân mảnh ngang và gán vùng dữ liệu theo chi nhánh tổng kho (`warehouse_branch: "HN"` và `"HCM"`). Dữ liệu phát sinh tại tổng kho nào sẽ được lưu trữ và truy xuất trực tiếp tại máy chủ Shard vùng đó (*Targeted Query*), giúp tối ưu hóa băng thông mạng và độ trễ.
- **High Availability & Distributed ACID Transactions**: Đảm bảo sẵn sàng cao qua kiến trúc Replica Set 3 nodes và thực hiện giao dịch an toàn đa tài liệu (Multi-document Transaction) khi xuất kho cấp phát cho công trình: tự động trừ số lượng tồn kho khả dụng, tạo phiếu xuất kho và ghi nhật ký kiểm toán trong một phiên làm việc nguyên tử (*Atomic*).

---

## 2. Danh mục Toàn diện 20 Collections (Chia theo 6 Phân hệ Nghiệp vụ)

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│        HỆ THỐNG QUẢN TRỊ & ĐIỀU PHỐI VẬT TƯ DOANH NGHIỆP PHÂN TÁN (WMS)      │
├─────────────────────┬─────────────────────┬──────────────────────────────────┤
│ 1. Danh mục & Kho   │ 2. Đối tác & Mua sắm│ 3. Giao dịch Kho (Sharded)       │
│  - materials        │  - suppliers        │  - goods_receipts ⭐             │
│  - material_cats    │  - purchase_orders  │  - goods_issues ⭐               │
│  - warehouses       │  - supplier_contr   │  - stock_transfers (Liên kho)    │
│  - storage_locs     │  - supplier_evals   │  - material_returns (Thu hồi)    │
├─────────────────────┼─────────────────────┼──────────────────────────────────┤
│ 4. Tồn kho & KCS    │ 5. Dự án & Cấp phát │ 6. Tài chính & Kiểm toán         │
│  - inventory_stk ⭐ │  - material_requests│  - inventory_valuations (FIFO)   │
│  - material_batches │  - projects_depts   │  - material_audit_logs (TTL)     │
│  - stocktakes       │                     │                                  │
│  - quality_inspects │                     │                                  │
└─────────────────────┴─────────────────────┴──────────────────────────────────┘
```

### Chi tiết 20 Collections:
1. `materials`: Danh mục vật tư toàn hệ thống, mã vật tư duy nhất, lược đồ đa hình lưu trữ thông số kỹ thuật (*Polymorphic Specifications*).
2. `material_categories`: Nhóm phân loại vật tư (Cơ khí kết cấu, Thiết bị điện, Xi măng, Hóa chất sơn phủ) và quy định điều kiện bảo quản.
3. `warehouses`: Danh mục các tổng kho theo chi nhánh vùng miền (Tổng kho Long Biên - HN, Tổng kho Cát Lái - HCM, Kho Hòa Cầm - ĐN).
4. `storage_locations`: Quản lý chi tiết vị trí lưu trữ trong kho (Dãy kệ - Aisle, Tầng kệ - Rack, Ngăn chứa - Bin, Tải trọng tối đa).
5. `suppliers`: Hồ sơ nhà cung cấp chiến lược (Hòa Phát, CADIVI, VICEM, Jotun), mã số thuế, đánh giá độ tin cậy.
6. `purchase_orders`: Đơn đặt mua vật tư từ nhà cung cấp, tiến độ giao hàng và phê duyệt ngân sách.
7. `supplier_contracts`: Hợp đồng nguyên tắc cung ứng vật tư dài hạn, điều khoản thanh toán và hạn mức bảo lãnh.
8. `supplier_evaluations`: Đánh giá chất lượng định kỳ nhà cung cấp theo tiêu chuẩn SLA (Chất lượng vật tư, Tỷ lệ giao đúng hạn, Giá cả).
9. `goods_receipts` ⭐: **Phiếu Nhập kho (Sharded Collection)**: Ghi nhận vật tư nhập về kho kèm số lô, đơn giá, kiểm định nghiệm thu.
10. `goods_issues` ⭐: **Phiếu Xuất kho (Sharded Collection)**: Ghi nhận vật tư xuất cấp phát phục vụ thi công dự án, công trình hoặc phân xưởng.
11. `stock_transfers`: Phiếu điều phối luân chuyển vật tư liên kho giữa Tổng kho Miền Bắc và Miền Nam.
12. `material_returns`: Phiếu thu hồi vật tư thừa hoặc vật tư không đúng quy cách từ công trường hoàn trả về kho.
13. `inventory_stocks` ⭐: **Tồn kho vật tư theo chi nhánh (Sharded Collection)**: Lưu trữ số lượng thực tế, số lượng đã phân bổ, ngưỡng cảnh báo an toàn tối thiểu (*min_threshold*).
14. `material_batches`: Quản lý chi tiết từng lô sản xuất (Batch Number), ngày sản xuất, hạn dùng và mã số chứng chỉ xuất xưởng CO/CQ.
15. `stocktakes`: Biên bản kiểm kê định kỳ, đối soát sai lệch giữa số lượng tồn kho trên phần mềm và số lượng đếm thực tế tại kho.
16. `quality_inspections`: Biên bản kiểm định chất lượng KCS / QC vật tư đầu vào trước khi nhập kho.
17. `material_requests`: Đơn đề xuất xin cấp phát vật tư từ các chỉ huy trưởng công trình hoặc trưởng bộ phận sản xuất.
18. `projects_departments`: Danh mục công trình, dự án xây lắp (Dự án Cao tốc Bắc Nam, Nhà máy Điện gió, Tuyến Metro) và ngân sách vật tư được cấp.
19. `inventory_valuations`: Báo cáo định giá trị tài sản tồn kho theo phương pháp Nhập trước - Xuất trước (FIFO) hoặc Bình quân gia quyền.
20. `material_audit_logs`: Nhật ký kiểm toán bảo mật truy vết thao tác nhập/xuất/sửa đổi số liệu kho, tự động dọn dẹp sau 365 ngày bằng **TTL Index**.

---

## 3. Cấu trúc Thư mục Dự án

```text
BTL_CSDLPT/
├── .gitignore                          # Cấu hình bỏ qua các file tạm, logs, tài liệu cá nhân
├── docker/
│   ├── docker-compose.yml              # Dựng cụm Sharded Cluster phân tán (ConfigSvr, Shard 1 - HN, Shard 2 - HCM, Mongos Router)
│   └── init-cluster.ps1                # Script PowerShell 1-click kích hoạt Replica Sets & nạp Shard vào Router
├── scripts/
│   ├── 01_init_schema_and_indexes.js   # Tạo 20 Collections + Schema Validation + Indexes chuyên sâu
│   ├── 02_seed_data.js                 # Nạp dữ liệu thực tế cho 20 Collections (Nhà cung cấp, Tổng kho, Tồn kho, Phiếu xuất nhập)
│   ├── 03_setup_sharding.js            # Kích hoạt Sharding & cấu hình Zone Sharding (Kho Miền Bắc & Kho Miền Nam)
│   └── 04_advanced_queries.js          # 5 Aggregation Pipelines, Giao dịch ACID & Full-Text Search vật tư
└── README.md                           # Bản thuyết minh đề tài & Hướng dẫn tổng quan
```

---

## 4. Hướng dẫn Chạy Nhanh

### Bước 1: Khởi động cụm MongoDB Sharded Cluster bằng Docker
Mở PowerShell tại thư mục `docker/`:
```powershell
docker-compose up -d
.\init-cluster.ps1
```

### Bước 2: Khởi tạo CSDL, Nạp Dữ liệu & Cấu hình Phân tán
Mở PowerShell tại thư mục `scripts/`:
```powershell
# 1. Khởi tạo Schema và Indexes cho 20 Collections:
mongosh "mongodb://localhost:27017" < 01_init_schema_and_indexes.js

# 2. Nạp dữ liệu mẫu thực tế:
mongosh "mongodb://localhost:27017" < 02_seed_data.js

# 3. Kích hoạt Sharding và Phân vùng Zone Sharding:
mongosh "mongodb://localhost:27017" < 03_setup_sharding.js

# 4. Thực thi các truy vấn nâng cao, Aggregation Pipelines & Giao dịch ACID:
mongosh "mongodb://localhost:27017" < 04_advanced_queries.js
```
