/**
 * 04_advanced_queries.js
 * Tập hợp các câu truy vấn phức tạp, Aggregation Pipelines nâng cao & Giao dịch phân tán ACID
 * Hệ thống Quản trị & Điều phối Vật tư Doanh nghiệp Phân tán (Distributed Materials & WMS)
 * Chạy trên mongosh: mongosh material_inventory_db < 04_advanced_queries.js
 */

const dbName = "material_inventory_db";
const dbInstance = db.getSiblingDB(dbName);

print(`======================================================================`);
print(`[TRUY VẤN 1] THỐNG KÊ TỔNG GIÁ TRỊ NHẬP KHO & KHỐI LƯỢNG THEO NHÀ CUNG CẤP`);
print(`======================================================================`);

const supplierProcurementPipeline = [
  {
    $lookup: {
      from: "suppliers",
      localField: "supplier_id",
      foreignField: "_id",
      as: "supplier_info"
    }
  },
  { $unwind: "$supplier_info" },
  { $unwind: "$items" },
  {
    $group: {
      _id: {
        supplier_code: "$supplier_info.supplier_code",
        company_name: "$supplier_info.company_name",
        branch: "$warehouse_branch"
      },
      total_receipt_value: { $sum: "$items.amount" },
      total_items_count: { $sum: 1 },
      total_quantity_received: { $sum: "$items.quantity" }
    }
  },
  { $sort: { total_receipt_value: -1 } },
  {
    $project: {
      _id: 0,
      supplier_code: "$_id.supplier_code",
      company_name: "$_id.company_name",
      branch: "$_id.branch",
      total_receipt_value: 1,
      total_items_count: 1,
      total_quantity_received: 1
    }
  }
];

printjson(dbInstance.goods_receipts.aggregate(supplierProcurementPipeline).toArray());


print(`======================================================================`);
print(`[TRUY VẤN 2] PHÂN TÍCH ĐA CHIỀU TÌNH HÌNH MUA SẮM VẬT TƯ BẰNG PIPELINE ($facet)`);
print(`======================================================================`);

const procurementAnalysisFacetPipeline = [
  {
    $facet: {
      // Phân tích 1: Thống kê chi phí đơn mua theo Chi nhánh Tổng kho
      "spending_by_branch": [
        {
          $group: {
            _id: "$warehouse_branch",
            order_count: { $sum: 1 },
            total_spend: { $sum: "$total_amount" },
            avg_order_value: { $avg: "$total_amount" }
          }
        },
        { $sort: { total_spend: -1 } }
      ],
      // Phân tích 2: Tỷ lệ theo trạng thái thực hiện đơn hàng (SLA Delivery)
      "order_status_summary": [
        {
          $group: {
            _id: "$status",
            total_orders: { $sum: 1 },
            total_value: { $sum: "$total_amount" }
          }
        }
      ]
    }
  }
];

printjson(dbInstance.purchase_orders.aggregate(procurementAnalysisFacetPipeline).toArray());


print(`======================================================================`);
print(`[TRUY VẤN 3] BÁO CÁO CẢNH BÁO AN TOÀN TỒN KHO: VẬT TƯ DƯỚI NGƯỠNG ĐỊNH MỨC TỐI THIỂU`);
print(`======================================================================`);

const lowStockAlertPipeline = [
  {
    $match: {
      $expr: { $lte: ["$quantity", "$min_threshold"] }
    }
  },
  {
    $lookup: {
      from: "materials",
      localField: "material_code",
      foreignField: "material_code",
      as: "material_info"
    }
  },
  { $unwind: { path: "$material_info", preserveNullAndEmptyArrays: true } },
  {
    $project: {
      _id: 0,
      warehouse_branch: 1,
      warehouse_code: 1,
      material_code: 1,
      material_name: "$material_info.name",
      current_quantity: "$quantity",
      min_threshold: "$min_threshold",
      deficit: { $subtract: ["$min_threshold", "$quantity"] },
      unit: "$unit",
      warning_level: {
        $cond: {
          if: { $lte: ["$quantity", { $divide: ["$min_threshold", 2] }] },
          then: "KHẨN CẤP (DƯỚI 50% NGƯỠNG)",
          else: "CẢNH BÁO THIẾU HÀNG"
        }
      }
    }
  }
];

const lowStockResults = dbInstance.inventory_stocks.aggregate(lowStockAlertPipeline).toArray();
if (lowStockResults.length === 0) {
  print("✔ Mức tồn kho tất cả vật tư tại các chi nhánh đều an toàn.");
} else {
  printjson(lowStockResults);
}


print(`======================================================================`);
print(`[TRUY VẤN 4] GIAO DỊCH PHÂN TÁN ĐA TÀI LIỆU (DISTRIBUTED ACID TRANSACTION)`);
print(`Mô phỏng: Xuất kho vật tư cho công trình, trừ tồn kho và ghi nhật ký đồng thời`);
print(`======================================================================`);

function executeIssueStockTransaction() {
  const session = dbInstance.getMongo().startSession();
  try {
    session.startTransaction({
      readConcern: { level: "snapshot" },
      writeConcern: { w: "majority" }
    });

    const sessionDb = session.getDatabase(dbName);
    const targetBranch = "HN";
    const targetMaterial = "MAT-STEEL-D20";
    const issueQty = 5;

    // 1. Kiểm tra tồn kho khả dụng
    const stockItem = sessionDb.inventory_stocks.findOne({
      warehouse_branch: targetBranch,
      material_code: targetMaterial
    });

    if (!stockItem || stockItem.available_quantity < issueQty) {
      throw new Error(`Không đủ tồn kho khả dụng để xuất! Hiện có: ${stockItem ? stockItem.available_quantity : 0}`);
    }

    // 2. Trừ số lượng trong collection inventory_stocks
    sessionDb.inventory_stocks.updateOne(
      { warehouse_branch: targetBranch, material_code: targetMaterial },
      {
        $inc: {
          quantity: -issueQty,
          available_quantity: -issueQty
        },
        $set: { last_updated: new Date() }
      }
    );

    // 3. Tạo phiếu xuất kho mới
    const newIssueCode = "GI-HN-TXN-" + Date.now();
    sessionDb.goods_issues.insertOne({
      issue_code: newIssueCode,
      warehouse_branch: targetBranch,
      warehouse_code: "WH-HN-01",
      project_id: null,
      request_code: "REQ-EMERGENCY-01",
      issue_date: new Date(),
      items: [
        { material_code: targetMaterial, quantity: NumberInt(issueQty) }
      ],
      purpose: "Cấp phát khẩn cấp phục vụ gia cố trụ móng cầu vượt",
      issuer: "Thủ kho Nguyễn Văn Hùng",
      recipient: "Đội thi công số 3",
      status: "DELIVERED"
    });

    // 4. Ghi Audit Log truy vết
    sessionDb.material_audit_logs.insertOne({
      log_code: "AUD-TXN-" + Date.now(),
      action: "ISSUE",
      actor: "user_system_txn",
      collection_name: "goods_issues",
      document_id: newIssueCode,
      details: { material: targetMaterial, qty: issueQty, branch: targetBranch },
      timestamp: new Date()
    });

    session.commitTransaction();
    print(`✔ GIAO DỊCH ACID THÀNH CÔNG: Đã xuất ${issueQty} tấn ${targetMaterial}, trừ kho và ghi audit log an toàn!`);
  } catch (err) {
    session.abortTransaction();
    print(`✖ GIAO DỊCH THẤT BẠI (ROLLBACK HOÀN TÁC TOÀN BỘ): ${err.message}`);
  } finally {
    session.endSession();
  }
}

executeIssueStockTransaction();


print(`======================================================================`);
print(`[TRUY VẤN 5] TÌM KIẾM VẬT TƯ THÔNG MINH BẰNG FULL-TEXT SEARCH`);
print(`Từ khóa tìm kiếm: 'chống rỉ Epoxy'`);
print(`======================================================================`);

const textSearchResults = dbInstance.materials.find(
  { $text: { $search: "chống rỉ Epoxy" } },
  {
    score: { $meta: "textScore" },
    material_code: 1,
    name: 1,
    unit: 1,
    standard_price: 1,
    "specifications.standard": 1
  }
).sort({ score: { $meta: "textScore" } }).toArray();

printjson(textSearchResults);
print(`======================================================================`);
