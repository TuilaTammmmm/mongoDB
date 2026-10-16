/**
 * 02_seed_data.js
 * Script nạp dữ liệu mẫu thực tế, phong phú cho TOÀN BỘ 20 COLLECTIONS
 * Hệ thống Quản trị & Điều phối Vật tư Doanh nghiệp Phân tán (Distributed Materials & WMS)
 * Chạy trên mongosh: mongosh material_inventory_db < 02_seed_data.js
 */

const dbName = "material_inventory_db";
const dbInstance = db.getSiblingDB(dbName);

print(`======================================================================`);
print(`[1/4] Làm sạch dữ liệu cũ trong toàn bộ 20 Collections...`);
print(`======================================================================`);

const allCollections = [
  "materials", "material_categories", "warehouses", "storage_locations",
  "suppliers", "purchase_orders", "supplier_contracts", "supplier_evaluations",
  "goods_receipts", "goods_issues", "stock_transfers", "material_returns",
  "inventory_stocks", "material_batches", "stocktakes", "quality_inspections",
  "material_requests", "projects_departments", "inventory_valuations", "material_audit_logs"
];

allCollections.forEach(col => dbInstance.getCollection(col).deleteMany({}));

print(`[2/4] Nạp Danh mục Cơ sở: Nhà cung cấp, Kho bãi, Nhóm vật tư, Vị trí lưu trữ...`);

// 1. SUPPLIERS (Nhà cung cấp)
const supHoaPhat = new ObjectId();
const supCadivi = new ObjectId();
const supVicem = new ObjectId();
const supJotun = new ObjectId();

dbInstance.suppliers.insertMany([
  {
    _id: supHoaPhat,
    supplier_code: "SUP-HPG-01",
    company_name: "Tập đoàn Thép Hòa Phát (Hoa Phat Group)",
    tax_id: "0900189284",
    phone: "02439747755",
    email: "contact@hoaphat.com.vn",
    address: "66 Nguyễn Du, Hai Bà Trưng, Hà Nội",
    rating_score: 9.6
  },
  {
    _id: supCadivi,
    supplier_code: "SUP-CDV-02",
    company_name: "Công ty Cổ phần Dây Cáp Điện Việt Nam (CADIVI)",
    tax_id: "0300381564",
    phone: "02838299443",
    email: "cadivi@cadivi.vn",
    address: "70-72 Nam Kỳ Khởi Nghĩa, Quận 1, TP.HCM",
    rating_score: 9.4
  },
  {
    _id: supVicem,
    supplier_code: "SUP-VCM-03",
    company_name: "Tổng Công ty Xi măng Việt Nam (VICEM)",
    tax_id: "0100105398",
    phone: "02438512425",
    email: "vicem@vicem.vn",
    address: "228 Lê Duẩn, Đống Đa, Hà Nội",
    rating_score: 9.1
  },
  {
    _id: supJotun,
    supplier_code: "SUP-JOTUN-04",
    company_name: "Công ty TNHH Sơn Jotun Việt Nam",
    tax_id: "0301445412",
    phone: "02837404740",
    email: "vietnam@jotun.com",
    address: "KCN Sóng Thần 1, Dĩ An, Bình Dương",
    rating_score: 9.3
  }
]);

// 2. MATERIAL_CATEGORIES (Nhóm vật tư)
dbInstance.material_categories.insertMany([
  { category_code: "CAT-STEEL", name: "Thép và Kim loại kết cấu", description: "Thép cây vằn, thép hình I/H, tôn tấm", storage_condition: "DRY_VENTILATED" },
  { category_code: "CAT-CABLE", name: "Thiết bị Điện & Cáp truyền tải", description: "Dây cáp điện trung/hạ thế, tủ điện", storage_condition: "DRY_VENTILATED" },
  { category_code: "CAT-CEMENT", name: "Xi măng & Phụ gia bê tông", description: "Xi măng bao PCB40, xỉ hạt, tro bay", storage_condition: "DRY_VENTILATED" },
  { category_code: "CAT-PAINT", name: "Hóa chất & Sơn công nghiệp", description: "Sơn Epoxy chống rỉ, dung môi, chất tẩy dầu", storage_condition: "HAZARDOUS" }
]);

// 3. WAREHOUSES (Danh mục Kho theo Chi nhánh Miền)
dbInstance.warehouses.insertMany([
  { warehouse_code: "WH-HN-01", name: "Tổng kho Vật tư Miền Bắc (Long Biên)", branch: "HN", address: "Cụm Công nghiệp Sài Đồng, Long Biên, Hà Nội", manager: "Nguyễn Văn Hùng", capacity_sqm: 12000, is_active: true },
  { warehouse_code: "WH-HCM-01", name: "Tổng kho Vật tư Miền Nam (Cát Lái)", branch: "HCM", address: "Khu cảng Cát Lái, Phường Thạnh Mỹ Lợi, TP. Thủ Đức, TP.HCM", manager: "Lê Minh Trí", capacity_sqm: 18000, is_active: true },
  { warehouse_code: "WH-DN-01", name: "Kho Vật tư Khu vực Miền Trung (Hòa Cầm)", branch: "DN", address: "KCN Hòa Cầm, Cẩm Lệ, TP. Đà Nẵng", manager: "Phan Đình Hoàng", capacity_sqm: 6000, is_active: true }
]);

// 4. STORAGE_LOCATIONS (Vị trí lưu trữ)
dbInstance.storage_locations.insertMany([
  { location_code: "HN-A1-R01-B01", warehouse_code: "WH-HN-01", aisle: "A1", rack: NumberInt(1), bin: NumberInt(1), max_weight_kg: 5000, is_occupied: true },
  { location_code: "HN-B2-R03-B02", warehouse_code: "WH-HN-01", aisle: "B2", rack: NumberInt(3), bin: NumberInt(2), max_weight_kg: 2000, is_occupied: true },
  { location_code: "HCM-C1-R01-B01", warehouse_code: "WH-HCM-01", aisle: "C1", rack: NumberInt(1), bin: NumberInt(1), max_weight_kg: 8000, is_occupied: true },
  { location_code: "HCM-D3-R02-B04", warehouse_code: "WH-HCM-01", aisle: "D3", rack: NumberInt(2), bin: NumberInt(4), max_weight_kg: 1500, is_occupied: true }
]);

// 5. MATERIALS (Danh mục Vật tư - Đa hình Polymorphic Specifications)
dbInstance.materials.insertMany([
  {
    material_code: "MAT-STEEL-D20",
    name: "Thép thanh vằn D20 CB400V Hòa Phát",
    category_code: "CAT-STEEL",
    unit: "Tấn",
    description: "Thép cốt bê tông chịu lực cao cho móng và dầm cầu vượt",
    specifications: {
      standard: "TCVN 1651-2:2018",
      diameter_mm: 20,
      grade: "CB400V",
      tensile_strength_mpa: 570,
      material: "Thép hợp kim thấp carbon"
    },
    standard_price: 15500000,
    barcode: "8934567890123",
    is_active: true
  },
  {
    material_code: "MAT-CABLE-3X120",
    name: "Cáp đồng trung thế 24kV treo CADIVI 3x120 mm2",
    category_code: "CAT-CABLE",
    unit: "Mét",
    description: "Cáp ngầm trung thế cách điện XLPE, giáp băng kim loại",
    specifications: {
      voltage_kv: 24,
      conductor: "Đồng 99.99%",
      cores: 3,
      cross_section_sqmm: 120,
      standard: "IEC 60502-2",
      material: "Đồng cách điện XLPE"
    },
    standard_price: 485000,
    barcode: "8934567890456",
    is_active: true
  },
  {
    material_code: "MAT-CEM-PCB40",
    name: "Xi măng Poóc lăng hỗn hợp Vicem Hoàng Thạch PCB40",
    category_code: "CAT-CEMENT",
    unit: "Bao (50kg)",
    description: "Xi măng cường độ cao đóng bao 50kg chống thấm tốt",
    specifications: {
      standard: "TCVN 6260:2020",
      strength_grade: "PCB40",
      curing_days: 28,
      package_weight_kg: 50
    },
    standard_price: 92000,
    barcode: "8934567890789",
    is_active: true
  },
  {
    material_code: "MAT-PAINT-EPX01",
    name: "Sơn Epoxy lót 2 thành phần chống rỉ Jotun Penguard Primer",
    category_code: "CAT-PAINT",
    unit: "Thùng (20L)",
    description: "Sơn bảo vệ kết cấu thép ngâm nước và chịu môi trường biển khắc nghiệt",
    specifications: {
      base: "Epoxy Resin polyamide",
      solid_volume_pct: 72,
      pot_life_hours: 8,
      voc_g_l: 250,
      standard: "ISO 12944 C5-M"
    },
    standard_price: 3200000,
    barcode: "8934567890999",
    is_active: true
  }
]);

// 6. PROJECTS_DEPARTMENTS (Dự án & Công trình tiêu thụ)
const projCaoToc = new ObjectId();
const projNhaMay = new ObjectId();
const projCauCan = new ObjectId();

dbInstance.projects_departments.insertMany([
  {
    _id: projCaoToc,
    project_code: "PRJ-EXPRESS-01",
    name: "Dự án Cao tốc Bắc Nam (Đoạn Mai Sơn - QL45)",
    department_type: "CONSTRUCTION",
    manager: "Kỹ sư Trần Anh Quân",
    branch: "HN",
    allocated_budget: 150000000000,
    status: "IN_PROGRESS"
  },
  {
    _id: projNhaMay,
    project_code: "PRJ-PLANT-HCM",
    name: "Dự án Tổ hợp Nhà máy Điện Gió ngoài khơi Cần Giờ",
    department_type: "PRODUCTION",
    manager: "Kỹ sư Hoàng Minh Đức",
    branch: "HCM",
    allocated_budget: 85000000000,
    status: "IN_PROGRESS"
  },
  {
    _id: projCauCan,
    project_code: "PRJ-FLYOVER-03",
    name: "Công trình Nâng cấp Tuyến Metro số 1 Bến Thành - Suối Tiên",
    department_type: "CONSTRUCTION",
    manager: "Kỹ sư Đặng Quốc Huy",
    branch: "HCM",
    allocated_budget: 65000000000,
    status: "IN_PROGRESS"
  }
]);

print(`[3/4] Nạp Đơn mua hàng, Hợp đồng, Lô sản xuất, Kiểm định và Yêu cầu cấp phát...`);

// 7. PURCHASE_ORDERS (Đơn đặt mua từ NCC)
const po1HN = new ObjectId();
const po2HCM = new ObjectId();

dbInstance.purchase_orders.insertMany([
  {
    _id: po1HN,
    po_code: "PO-2026-HN-001",
    supplier_id: supHoaPhat,
    warehouse_branch: "HN",
    order_date: new Date("2026-10-01"),
    expected_delivery_date: new Date("2026-10-10"),
    total_amount: 1550000000,
    items: [
      { material_code: "MAT-STEEL-D20", quantity: NumberInt(100), unit_price: 15500000, amount: 1550000000 }
    ],
    status: "DELIVERED"
  },
  {
    _id: po2HCM,
    po_code: "PO-2026-HCM-002",
    supplier_id: supCadivi,
    warehouse_branch: "HCM",
    order_date: new Date("2026-10-05"),
    expected_delivery_date: new Date("2026-10-15"),
    total_amount: 970000000,
    items: [
      { material_code: "MAT-CABLE-3X120", quantity: NumberInt(2000), unit_price: 485000, amount: 970000000 }
    ],
    status: "DELIVERED"
  }
]);

// 8. SUPPLIER_CONTRACTS (Hợp đồng nguyên tắc)
dbInstance.supplier_contracts.insertMany([
  { contract_code: "CTR-HPG-2026", supplier_id: supHoaPhat, start_date: new Date("2026-01-01"), end_date: new Date("2028-12-31"), contract_value: 50000000000, payment_terms: "Thanh toán theo đợt 30 ngày sau nghiệm thu", status: "ACTIVE" },
  { contract_code: "CTR-CDV-2026", supplier_id: supCadivi, start_date: new Date("2026-03-01"), end_date: new Date("2027-12-31"), contract_value: 30000000000, payment_terms: "Thanh toán trong vòng 45 ngày", status: "ACTIVE" }
]);

// 9. SUPPLIER_EVALUATIONS (Đánh giá SLA NCC)
dbInstance.supplier_evaluations.insertMany([
  { supplier_id: supHoaPhat, period: "2026-Q3", quality_score: 98, delivery_score: 95, overall_score: 96.5, comments: "Chất lượng thép đồng đều, CO/CQ đầy đủ chuẩn quốc tế", evaluated_at: new Date("2026-10-01") },
  { supplier_id: supCadivi, period: "2026-Q3", quality_score: 95, delivery_score: 93, overall_score: 94.0, comments: "Dây cáp chịu tải thử nghiệm đạt 100% yêu cầu", evaluated_at: new Date("2026-10-02") }
]);

// 10. MATERIAL_BATCHES (Lô vật tư & Chứng chỉ CO/CQ)
dbInstance.material_batches.insertMany([
  { batch_number: "BATCH-HP-2610A", material_code: "MAT-STEEL-D20", mfg_date: new Date("2026-09-25"), exp_date: null, co_cq_number: "CO-CQ-HP-99812", origin_country: "Việt Nam", inspection_status: "PASSED" },
  { batch_number: "BATCH-CDV-2610B", material_code: "MAT-CABLE-3X120", mfg_date: new Date("2026-09-28"), exp_date: null, co_cq_number: "CO-CQ-CDV-44120", origin_country: "Việt Nam", inspection_status: "PASSED" },
  { batch_number: "BATCH-JT-2609C", material_code: "MAT-PAINT-EPX01", mfg_date: new Date("2026-08-15"), exp_date: new Date("2027-08-15"), co_cq_number: "CO-CQ-JT-12901", origin_country: "Na Uy / VN", inspection_status: "PASSED" }
]);

// 11. QUALITY_INSPECTIONS (Biên bản kiểm định QC)
dbInstance.quality_inspections.insertMany([
  { inspection_code: "QC-2026-001", material_code: "MAT-STEEL-D20", batch_number: "BATCH-HP-2610A", sample_size: NumberInt(10), defect_count: NumberInt(0), test_criteria: ["Độ bền kéo", "Độ giãn dài", "Thử uốn lạnh"], result: "PASSED", inspector: "Vũ Hải Đăng", inspected_date: new Date("2026-10-08") },
  { inspection_code: "QC-2026-002", material_code: "MAT-CABLE-3X120", batch_number: "BATCH-CDV-2610B", sample_size: NumberInt(5), defect_count: NumberInt(0), test_criteria: ["Điện trở ruột dẫn", "Thử điện áp cao tần 35kV"], result: "PASSED", inspector: "Lê Quốc Trọng", inspected_date: new Date("2026-10-12") }
]);

// 12. MATERIAL_REQUESTS (Phiếu yêu cầu cấp phát vật tư)
dbInstance.material_requests.insertMany([
  {
    request_code: "REQ-2026-001",
    project_id: projCaoToc,
    warehouse_branch: "HN",
    urgency: "HIGH",
    items: [{ material_code: "MAT-STEEL-D20", requested_qty: NumberInt(40), approved_qty: NumberInt(40) }],
    requested_by: "Kỹ sư Trần Anh Quân",
    requested_date: new Date("2026-10-10"),
    status: "APPROVED"
  },
  {
    request_code: "REQ-2026-002",
    project_id: projNhaMay,
    warehouse_branch: "HCM",
    urgency: "NORMAL",
    items: [{ material_code: "MAT-CABLE-3X120", requested_qty: NumberInt(800), approved_qty: NumberInt(800) }],
    requested_by: "Kỹ sư Hoàng Minh Đức",
    requested_date: new Date("2026-10-11"),
    status: "APPROVED"
  }
]);

print(`[4/4] Nạp Giao dịch Nhập/Xuất kho, Tồn kho Phân tán (Sharded), Kiểm kê & Nhật ký...`);

// 13. INVENTORY_STOCKS ⭐ (Tồn kho phân mảnh theo Chi nhánh Kho)
dbInstance.inventory_stocks.insertMany([
  // Chi nhánh Hà Nội (ZONE_HN)
  {
    warehouse_branch: "HN",
    warehouse_code: "WH-HN-01",
    material_code: "MAT-STEEL-D20",
    quantity: NumberInt(85),
    allocated_quantity: NumberInt(40),
    available_quantity: NumberInt(45),
    min_threshold: NumberInt(20),
    max_threshold: NumberInt(200),
    unit: "Tấn",
    last_updated: new Date("2026-10-15")
  },
  {
    warehouse_branch: "HN",
    warehouse_code: "WH-HN-01",
    material_code: "MAT-CEM-PCB40",
    quantity: NumberInt(12), // Cảnh báo: dưới ngưỡng min_threshold (50 bao)!
    allocated_quantity: NumberInt(0),
    available_quantity: NumberInt(12),
    min_threshold: NumberInt(50),
    max_threshold: NumberInt(500),
    unit: "Bao (50kg)",
    last_updated: new Date("2026-10-15")
  },
  // Chi nhánh TP.HCM (ZONE_HCM)
  {
    warehouse_branch: "HCM",
    warehouse_code: "WH-HCM-01",
    material_code: "MAT-CABLE-3X120",
    quantity: NumberInt(1800),
    allocated_quantity: NumberInt(800),
    available_quantity: NumberInt(1000),
    min_threshold: NumberInt(300),
    max_threshold: NumberInt(5000),
    unit: "Mét",
    last_updated: new Date("2026-10-15")
  },
  {
    warehouse_branch: "HCM",
    warehouse_code: "WH-HCM-01",
    material_code: "MAT-PAINT-EPX01",
    quantity: NumberInt(8), // Cảnh báo: dưới ngưỡng min_threshold (20 thùng)!
    allocated_quantity: NumberInt(0),
    available_quantity: NumberInt(8),
    min_threshold: NumberInt(20),
    max_threshold: NumberInt(150),
    unit: "Thùng (20L)",
    last_updated: new Date("2026-10-15")
  }
]);

// 14. GOODS_RECEIPTS ⭐ (Phiếu Nhập kho - Phân tán theo Chi nhánh)
dbInstance.goods_receipts.insertMany([
  {
    receipt_code: "GR-HN-2026-001",
    warehouse_branch: "HN",
    warehouse_code: "WH-HN-01",
    supplier_id: supHoaPhat,
    po_code: "PO-2026-HN-001",
    receipt_date: new Date("2026-10-09"),
    items: [
      { material_code: "MAT-STEEL-D20", batch_number: "BATCH-HP-2610A", quantity: NumberInt(100), unit_price: 15500000, amount: 1550000000 }
    ],
    total_amount: 1550000000,
    receiver: "Thủ kho Nguyễn Văn Hùng",
    status: "COMPLETED"
  },
  {
    receipt_code: "GR-HCM-2026-002",
    warehouse_branch: "HCM",
    warehouse_code: "WH-HCM-01",
    supplier_id: supCadivi,
    po_code: "PO-2026-HCM-002",
    receipt_date: new Date("2026-10-13"),
    items: [
      { material_code: "MAT-CABLE-3X120", batch_number: "BATCH-CDV-2610B", quantity: NumberInt(2000), unit_price: 485000, amount: 970000000 }
    ],
    total_amount: 970000000,
    receiver: "Thủ kho Lê Minh Trí",
    status: "COMPLETED"
  }
]);

// 15. GOODS_ISSUES ⭐ (Phiếu Xuất kho - Phân tán theo Chi nhánh)
dbInstance.goods_issues.insertMany([
  {
    issue_code: "GI-HN-2026-001",
    warehouse_branch: "HN",
    warehouse_code: "WH-HN-01",
    project_id: projCaoToc,
    request_code: "REQ-2026-001",
    issue_date: new Date("2026-10-11"),
    items: [
      { material_code: "MAT-STEEL-D20", batch_number: "BATCH-HP-2610A", quantity: NumberInt(15) }
    ],
    purpose: "Đổ bê tông dầm cầu cạn km45 thuộc Cao tốc Bắc Nam",
    issuer: "Thủ kho Nguyễn Văn Hùng",
    recipient: "Tổ trưởng thi công Vũ Mạnh Tuấn",
    status: "DELIVERED"
  },
  {
    issue_code: "GI-HCM-2026-002",
    warehouse_branch: "HCM",
    warehouse_code: "WH-HCM-01",
    project_id: projNhaMay,
    request_code: "REQ-2026-002",
    issue_date: new Date("2026-10-14"),
    items: [
      { material_code: "MAT-CABLE-3X120", batch_number: "BATCH-CDV-2610B", quantity: NumberInt(200) }
    ],
    purpose: "Đấu nối tuyến cáp ngầm trạm biến áp 110kV Cần Giờ",
    issuer: "Thủ kho Lê Minh Trí",
    recipient: "Chỉ huy trưởng Nguyễn Bá Lộc",
    status: "DELIVERED"
  }
]);

// 16. STOCK_TRANSFERS (Điều chuyển vật tư liên kho giữa HN và HCM)
dbInstance.stock_transfers.insertMany([
  {
    transfer_code: "TRF-2026-001",
    from_branch: "HN",
    to_branch: "HCM",
    from_warehouse: "WH-HN-01",
    to_warehouse: "WH-HCM-01",
    transfer_date: new Date("2026-10-14"),
    items: [
      { material_code: "MAT-STEEL-D20", quantity: NumberInt(10), unit: "Tấn" }
    ],
    transport_method: "Vận chuyển đường sắt container liên vận",
    status: "IN_TRANSIT"
  }
]);

// 17. MATERIAL_RETURNS (Thu hồi vật tư từ công trình)
dbInstance.material_returns.insertMany([
  {
    return_code: "RET-2026-001",
    warehouse_branch: "HN",
    warehouse_code: "WH-HN-01",
    project_id: projCaoToc,
    return_date: new Date("2026-10-13"),
    items: [
      { material_code: "MAT-STEEL-D20", quantity: NumberInt(1), condition: "Nguyên vẹn" }
    ],
    reason: "EXCESS_MATERIAL",
    accepted_by: "Thủ kho Nguyễn Văn Hùng"
  }
]);

// 18. STOCKTAKES (Kiểm kê đối soát thực tế)
dbInstance.stocktakes.insertMany([
  {
    stocktake_code: "ST-HN-2026-10",
    warehouse_branch: "HN",
    warehouse_code: "WH-HN-01",
    check_date: new Date("2026-10-15"),
    auditor: "Ban Kiểm toán Nội bộ - Đỗ Thu Hương",
    items: [
      { material_code: "MAT-STEEL-D20", system_qty: NumberInt(85), actual_qty: NumberInt(85), variance: NumberInt(0), explanation: "Khớp 100% thẻ kho" },
      { material_code: "MAT-CEM-PCB40", system_qty: NumberInt(12), actual_qty: NumberInt(12), variance: NumberInt(0), explanation: "Bao bì nguyên vẹn, không vón cục" }
    ],
    status: "BALANCED"
  }
]);

// 19. INVENTORY_VALUATIONS (Định giá tài sản tồn kho)
dbInstance.inventory_valuations.insertMany([
  {
    valuation_code: "VAL-HN-2026-10",
    period: "2026-10",
    warehouse_branch: "HN",
    total_stock_value: 1318540000,
    valuation_method: "FIFO",
    created_at: new Date("2026-10-15")
  },
  {
    valuation_code: "VAL-HCM-2026-10",
    period: "2026-10",
    warehouse_branch: "HCM",
    total_stock_value: 898600000,
    valuation_method: "FIFO",
    created_at: new Date("2026-10-15")
  }
]);

// 20. MATERIAL_AUDIT_LOGS (Nhật ký truy vết bảo mật)
dbInstance.material_audit_logs.insertMany([
  {
    log_code: "AUD-2026-0001",
    action: "RECEIVE",
    actor: "user_hung_nv",
    collection_name: "goods_receipts",
    document_id: "GR-HN-2026-001",
    details: { receipt_amount: 1550000000, material: "MAT-STEEL-D20", qty: 100 },
    timestamp: new Date("2026-10-09T08:30:00Z")
  },
  {
    log_code: "AUD-2026-0002",
    action: "ISSUE",
    actor: "user_hung_nv",
    collection_name: "goods_issues",
    document_id: "GI-HN-2026-001",
    details: { project: "PRJ-EXPRESS-01", material: "MAT-STEEL-D20", qty: 15 },
    timestamp: new Date("2026-10-11T14:15:00Z")
  },
  {
    log_code: "AUD-2026-0003",
    action: "RECEIVE",
    actor: "user_tri_lm",
    collection_name: "goods_receipts",
    document_id: "GR-HCM-2026-002",
    details: { receipt_amount: 970000000, material: "MAT-CABLE-3X120", qty: 2000 },
    timestamp: new Date("2026-10-13T10:00:00Z")
  }
]);

print(`======================================================================`);
print(`[KẾT QUẢ] ĐÃ NẠP DỮ LIỆU MẪU ĐẦY ĐỦ CHO TOÀN BỘ 20 COLLECTIONS!`);
print(`- Nhà cung cấp: ${dbInstance.suppliers.countDocuments()} bản ghi`);
print(`- Danh mục vật tư: ${dbInstance.materials.countDocuments()} bản ghi`);
print(`- Kho bãi & Vị trí: ${dbInstance.warehouses.countDocuments()} kho, ${dbInstance.storage_locations.countDocuments()} vị trí kệ`);
print(`- Tồn kho phân tán: ${dbInstance.inventory_stocks.countDocuments()} bản ghi`);
print(`- Phiếu Nhập / Xuất: ${dbInstance.goods_receipts.countDocuments()} nhập, ${dbInstance.goods_issues.countDocuments()} xuất`);
print(`- Dự án & Yêu cầu: ${dbInstance.projects_departments.countDocuments()} dự án, ${dbInstance.material_requests.countDocuments()} yêu cầu cấp`);
print(`======================================================================`);
