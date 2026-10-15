/**
 * 04_advanced_queries.js
 * Tập hợp các câu truy vấn phức tạp và Aggregation Pipeline nâng cao
 * Hệ thống Hồ sơ Y tế Điện tử & Quản lý Bệnh viện (HIS & EHR)
 * Chạy trên mongosh: mongosh hospital_ehr_db < 04_advanced_queries.js
 */

const dbName = "hospital_ehr_db";
const dbInstance = db.getSiblingDB(dbName);

print(`======================================================================`);
print(`[TRUY VẤN 1] BÁO CÁO DỊCH TỄ HỌC: TOP MÃ BỆNH (ICD-10) PHỔ BIẾN THEO CHI NHÁNH`);
print(`======================================================================`);

const topDiseasesPipeline = [
  {
    $group: {
      _id: {
        branch: "$hospital_branch",
        icd10: "$diagnosis.primary_icd10",
        disease_name: "$diagnosis.primary_name"
      },
      total_cases: { $sum: 1 }
    }
  },
  { $sort: { total_cases: -1 } },
  {
    $project: {
      _id: 0,
      branch: "$_id.branch",
      icd10: "$_id.icd10",
      disease_name: "$_id.disease_name",
      total_cases: 1
    }
  }
];
printjson(dbInstance.encounters.aggregate(topDiseasesPipeline).toArray());


print(`======================================================================`);
print(`[TRUY VẤN 2] QUYẾT TOÁN BẢO HIỂM (BHYT) & TỔNG HỢP VIỆN PHÍ ĐA CHIỀU ($facet)`);
print(`======================================================================`);

const financialSummaryPipeline = [
  {
    $facet: {
      // Phân tích 1: Thống kê tổng số tiền viện phí & bảo hiểm chi trả
      "insurance_summary": [
        {
          $group: {
            _id: "$hospital_branch",
            total_gross: { $sum: "$total_gross_amount" },
            total_insurance_paid: { $sum: "$insurance_coverage_amount" },
            total_patient_paid: { $sum: "$patient_copay_amount" }
          }
        }
      ],
      // Phân tích 2: Phân loại tình trạng thanh toán
      "payment_status_breakdown": [
        {
          $group: {
            _id: "$payment_status",
            invoice_count: { $sum: 1 },
            amount: { $sum: "$patient_copay_amount" }
          }
        }
      ]
    }
  }
];
printjson(dbInstance.invoices.aggregate(financialSummaryPipeline).toArray());


print(`======================================================================`);
print(`[TRUY VẤN 3] BÁO CÁO CẢNH BÁO AN TOÀN: PHÁT HIỆN KÊ ĐƠN VI PHẠM DỊ ỨNG THUỐC`);
print(`======================================================================`);

const allergyCheckPipeline = [
  // 1. Nối với collection patients để lấy danh sách dị ứng
  {
    $lookup: {
      from: "patients",
      localField: "patient_id",
      foreignField: "_id",
      as: "patient_info"
    }
  },
  { $unwind: "$patient_info" },
  // 2. Bung từng mục thuốc đã kê trong đơn
  { $unwind: "$items" },
  // 3. Bung từng tác nhân dị ứng của bệnh nhân
  { $unwind: { path: "$patient_info.allergies", preserveNullAndEmptyArrays: false } },
  // 4. So sánh nếu tên hoạt chất/thuốc trùng với chất dị ứng
  {
    $match: {
      $expr: {
        $regexMatch: {
          input: "$items.drug_name",
          regex: "$patient_info.allergies.allergen",
          options: "i"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      prescription_code: 1,
      patient_name: "$patient_info.full_name",
      allergen_detected: "$patient_info.allergies.allergen",
      severity: "$patient_info.allergies.severity",
      prescribed_drug: "$items.drug_name",
      warning: { $literal: "CẢNH BÁO: Kê đơn thuốc chứa hoạt chất bệnh nhân bị dị ứng!" }
    }
  }
];
const allergyAlerts = dbInstance.prescriptions.aggregate(allergyCheckPipeline).toArray();
if (allergyAlerts.length === 0) {
  print("✔ Tuyệt đối an toàn: Không phát hiện đơn thuốc nào vi phạm tiền sử dị ứng của bệnh nhân.");
} else {
  printjson(allergyAlerts);
}


print(`======================================================================`);
print(`[TRUY VẤN 4] BÁO CÁO KHO DƯỢC: CẢNH BÁO THUỐC DƯỚI NGƯỠNG AN TOÀN THEO CHI NHÁNH`);
print(`======================================================================`);

const lowStockPipeline = [
  {
    $match: {
      $expr: { $lte: ["$stock_quantity", "$warning_threshold"] }
    }
  },
  {
    $project: {
      _id: 0,
      hospital_branch: 1,
      drug_code: 1,
      brand_name: 1,
      active_ingredient: 1,
      stock_quantity: 1,
      warning_threshold: 1,
      deficit: { $subtract: ["$warning_threshold", "$stock_quantity"] }
    }
  }
];
const lowStocks = dbInstance.pharmacy_inventory.aggregate(lowStockPipeline).toArray();
if (lowStocks.length === 0) {
  print("✔ Tất cả các mặt hàng thuốc tại các chi nhánh đều đang đạt ngưỡng tồn kho an toàn.");
} else {
  printjson(lowStocks);
}


print(`======================================================================`);
print(`[TRUY VẤN 5] TÌM KIẾM BỆNH ÁN BẰNG FULL-TEXT SEARCH (Triệu chứng đau ngực)`);
print(`======================================================================`);

const textSearchResults = dbInstance.encounters.find(
  { $text: { $search: "đau ngực" } },
  { score: { $meta: "textScore" }, encounter_code: 1, reason_for_visit: 1, "diagnosis.primary_name": 1 }
).sort({ score: { $meta: "textScore" } }).toArray();

printjson(textSearchResults);
print(`======================================================================`);
