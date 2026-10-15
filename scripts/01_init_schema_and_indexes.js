/**
 * 01_init_schema_and_indexes.js
 * Script khởi tạo Schema Base với JSON Schema Validation & Chỉ mục (Indexes)
 * Hệ thống Quản lý Bệnh viện & Hồ sơ Y tế Điện tử Toàn diện (Full Enterprise HIS & EHR)
 * Bao gồm đầy đủ 20 COLLECTIONS chuẩn bệnh viện đa khoa quốc tế
 * Chạy trên mongosh: mongosh hospital_ehr_db < 01_init_schema_and_indexes.js
 */

const dbName = "hospital_ehr_db";
const dbInstance = db.getSiblingDB(dbName);

print(`======================================================================`);
print(`[1/3] Đang khởi tạo Database & Cấu hình JSON Schema cho 20 Collections...`);
print(`======================================================================`);

// Helper tạo collection kèm Validator
function createValidatedCollection(colName, validatorSchema) {
  const existing = dbInstance.getCollectionNames();
  if (existing.includes(colName)) {
    print(`- Cập nhật validator cho collection: ${colName}`);
    dbInstance.runCommand({
      collMod: colName,
      validator: { $jsonSchema: validatorSchema },
      validationLevel: "moderate"
    });
  } else {
    print(`- Tạo mới collection: ${colName}`);
    dbInstance.createCollection(colName, {
      validator: { $jsonSchema: validatorSchema },
      validationLevel: "moderate"
    });
  }
}

// -------------------------------------------------------------
// NHÓM 1: QUẢN TRỊ BỆNH NHÂN & ĐÓN TIẾP (4 Collections)
// -------------------------------------------------------------

// 1. PATIENTS (Hồ sơ Bệnh nhân)
createValidatedCollection("patients", {
  bsonType: "object",
  required: ["patient_code", "national_id", "full_name", "dob", "gender", "registered_branch"],
  properties: {
    patient_code: { bsonType: "string" },
    national_id: { bsonType: "string", pattern: "^[0-9]{12}$" },
    full_name: { bsonType: "string" },
    dob: { bsonType: "date" },
    gender: { enum: ["MALE", "FEMALE", "OTHER"] },
    phone: { bsonType: "string" },
    registered_branch: { enum: ["HN", "HCM", "DN"] },
    blood_type: { enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    allergies: { bsonType: "array" }
  }
});

// 2. APPOINTMENTS (Đặt lịch khám trực tuyến)
createValidatedCollection("appointments", {
  bsonType: "object",
  required: ["appointment_code", "patient_id", "scheduled_date", "hospital_branch", "status"],
  properties: {
    appointment_code: { bsonType: "string" },
    patient_id: { bsonType: "objectId" },
    doctor_id: { bsonType: ["objectId", "null"] },
    department_id: { bsonType: "objectId" },
    scheduled_date: { bsonType: "date" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    status: { enum: ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"] }
  }
});

// 3. VACCINATIONS (Quản lý Tiêm chủng & Vaccine)
createValidatedCollection("vaccinations", {
  bsonType: "object",
  required: ["vaccination_code", "patient_id", "vaccine_name", "administered_date", "hospital_branch"],
  properties: {
    vaccination_code: { bsonType: "string" },
    patient_id: { bsonType: "objectId" },
    vaccine_name: { bsonType: "string" },
    dose_number: { bsonType: "int" },
    batch_number: { bsonType: "string" },
    administered_date: { bsonType: "date" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    adverse_reaction: { bsonType: ["string", "null"] }
  }
});

// 4. PATIENT_FEEDBACKS (Khảo sát Hài lòng & Ý kiến phản hồi)
createValidatedCollection("patient_feedbacks", {
  bsonType: "object",
  required: ["patient_id", "hospital_branch", "rating_score", "created_at"],
  properties: {
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    rating_score: { bsonType: "int", minimum: 1, maximum: 5 },
    category: { enum: ["DOCTOR_ATTITUDE", "WAIT_TIME", "FACILITIES", "CLEANLINESS", "GENERAL"] },
    comment: { bsonType: "string" },
    created_at: { bsonType: "date" }
  }
});

// -------------------------------------------------------------
// NHÓM 2: NHÂN SỰ & CƠ SỞ VẬT CHẤT (3 Collections)
// -------------------------------------------------------------

// 5. DEPARTMENTS (Khoa phòng)
createValidatedCollection("departments", {
  bsonType: "object",
  required: ["dept_code", "name", "hospital_branch"],
  properties: {
    dept_code: { bsonType: "string" },
    name: { bsonType: "string" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    total_beds: { bsonType: "int" },
    available_beds: { bsonType: "int" }
  }
});

// 6. DOCTORS (Bác sĩ & Nhân sự y tế)
createValidatedCollection("doctors", {
  bsonType: "object",
  required: ["staff_code", "full_name", "department_id", "hospital_branch"],
  properties: {
    staff_code: { bsonType: "string" },
    full_name: { bsonType: "string" },
    title: { bsonType: "string" },
    department_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    specialties: { bsonType: "array" },
    is_active: { bsonType: "bool" }
  }
});

// 7. MEDICAL_EQUIPMENT (Trang thiết bị & Máy móc Y tế)
createValidatedCollection("medical_equipment", {
  bsonType: "object",
  required: ["serial_number", "device_name", "department_id", "hospital_branch", "status"],
  properties: {
    serial_number: { bsonType: "string" },
    device_name: { bsonType: "string" },
    manufacturer: { bsonType: "string" },
    department_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    status: { enum: ["OPERATIONAL", "UNDER_MAINTENANCE", "DECOMMISSIONED", "MALFUNCTIONING"] },
    last_maintenance_date: { bsonType: "date" },
    next_maintenance_date: { bsonType: "date" }
  }
});

// -------------------------------------------------------------
// NHÓM 3: KHÁM CHỮA BỆNH & LÂM SÀNG (4 Collections)
// -------------------------------------------------------------

// 8. ENCOUNTERS (Bệnh án Khám bệnh - Core Polymorphic Sharded Collection)
createValidatedCollection("encounters", {
  bsonType: "object",
  required: ["encounter_code", "patient_id", "hospital_branch", "admission_time", "status"],
  properties: {
    encounter_code: { bsonType: "string" },
    patient_id: { bsonType: "objectId" },
    doctor_id: { bsonType: "objectId" },
    department_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    encounter_type: { enum: ["OUTPATIENT", "INPATIENT", "EMERGENCY"] },
    admission_time: { bsonType: "date" },
    discharge_time: { bsonType: ["date", "null"] },
    reason_for_visit: { bsonType: "string" },
    vital_signs: { bsonType: "object" },
    specialized_examination: { bsonType: "object" },
    diagnosis: { bsonType: "object" },
    status: { enum: ["IN_PROGRESS", "COMPLETED", "TRANSFERRED", "CANCELLED"] }
  }
});

// 9. LAB_TESTS (Xét nghiệm Cận lâm sàng & LIS)
createValidatedCollection("lab_tests", {
  bsonType: "object",
  required: ["test_code", "encounter_id", "patient_id", "hospital_branch", "status"],
  properties: {
    test_code: { bsonType: "string" },
    encounter_id: { bsonType: "objectId" },
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    test_category: { bsonType: "string" },
    parameters: { bsonType: "array" },
    status: { enum: ["ORDERED", "IN_PROCESS", "VERIFIED", "CANCELLED"] }
  }
});

// 10. SURGICAL_OPERATIONS (Phẫu thuật & Ca mổ / Phòng mổ)
createValidatedCollection("surgical_operations", {
  bsonType: "object",
  required: ["surgery_code", "encounter_id", "patient_id", "hospital_branch", "lead_surgeon_id", "status"],
  properties: {
    surgery_code: { bsonType: "string" },
    encounter_id: { bsonType: "objectId" },
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    lead_surgeon_id: { bsonType: "objectId" },
    operating_room: { bsonType: "string" },
    procedure_name: { bsonType: "string" },
    anesthesia_type: { enum: ["GENERAL", "SPINAL", "LOCAL", "EPIDURAL"] },
    start_time: { bsonType: "date" },
    end_time: { bsonType: ["date", "null"] },
    status: { enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "POST_OP_RECOVERY", "CANCELLED"] }
  }
});

// 11. PATIENT_VITALS_TELEMETRY (Giám sát Sinh hiệu ICU Thời gian thực)
createValidatedCollection("patient_vitals_telemetry", {
  bsonType: "object",
  required: ["patient_id", "hospital_branch", "recorded_at"],
  properties: {
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    bed_number: { bsonType: "string" },
    recorded_at: { bsonType: "date" },
    heart_rate_bpm: { bsonType: "number" },
    spO2_percent: { bsonType: "number" },
    mean_arterial_pressure: { bsonType: "number" },
    respiratory_rate: { bsonType: "number" },
    is_alert_triggered: { bsonType: "bool" }
  }
});

// -------------------------------------------------------------
// NHÓM 4: ĐIỀU TRỊ NỘI TRÚ & CẤP CỨU (3 Collections)
// -------------------------------------------------------------

// 12. INPATIENT_ADMISSIONS (Điều trị Nội trú & Buồng bệnh)
createValidatedCollection("inpatient_admissions", {
  bsonType: "object",
  required: ["admission_code", "patient_id", "department_id", "hospital_branch", "room_number", "bed_number", "admission_date", "status"],
  properties: {
    admission_code: { bsonType: "string" },
    patient_id: { bsonType: "objectId" },
    department_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    room_number: { bsonType: "string" },
    bed_number: { bsonType: "string" },
    admission_date: { bsonType: "date" },
    discharge_date: { bsonType: ["date", "null"] },
    status: { enum: ["CURRENTLY_ADMITTED", "DISCHARGED", "TRANSFERRED"] }
  }
});

// 13. BLOOD_BANK (Ngân hàng Máu & Tiếp nhận truyền máu)
createValidatedCollection("blood_bank", {
  bsonType: "object",
  required: ["unit_bag_code", "blood_group", "volume_ml", "hospital_branch", "status", "expiry_date"],
  properties: {
    unit_bag_code: { bsonType: "string" },
    blood_group: { enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] },
    component_type: { enum: ["WHOLE_BLOOD", "PACKED_RBC", "PLATELETS", "FRESH_FROZEN_PLASMA"] },
    volume_ml: { bsonType: "int" },
    collected_date: { bsonType: "date" },
    expiry_date: { bsonType: "date" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    status: { enum: ["AVAILABLE", "RESERVED", "TRANSFUSED", "DISCARDED"] }
  }
});

// 14. HOSPITAL_TRANSFERS (Chuyển viện & Cấp cứu 115)
createValidatedCollection("hospital_transfers", {
  bsonType: "object",
  required: ["transfer_code", "patient_id", "source_branch", "target_hospital", "transfer_time", "status"],
  properties: {
    transfer_code: { bsonType: "string" },
    patient_id: { bsonType: "objectId" },
    source_branch: { enum: ["HN", "HCM", "DN"] },
    target_hospital: { bsonType: "string" },
    ambulance_plate: { bsonType: "string" },
    transfer_reason: { bsonType: "string" },
    transfer_time: { bsonType: "date" },
    status: { enum: ["EN_ROUTE", "DELIVERED", "CANCELLED"] }
  }
});

// -------------------------------------------------------------
// NHÓM 5: DƯỢC PHẨM & VẬT TƯ (3 Collections)
// -------------------------------------------------------------

// 15. PHARMACY_INVENTORY (Kho Dược & Tồn kho theo chi nhánh - Sharded Collection)
createValidatedCollection("pharmacy_inventory", {
  bsonType: "object",
  required: ["drug_code", "brand_name", "hospital_branch", "price_per_unit", "stock_quantity"],
  properties: {
    drug_code: { bsonType: "string" },
    brand_name: { bsonType: "string" },
    active_ingredient: { bsonType: "string" },
    unit: { bsonType: "string" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    price_per_unit: { bsonType: "number" },
    stock_quantity: { bsonType: "int" },
    warning_threshold: { bsonType: "int" }
  }
});

// 16. PRESCRIPTIONS (Đơn thuốc & Cấp phát quầy dược)
createValidatedCollection("prescriptions", {
  bsonType: "object",
  required: ["prescription_code", "encounter_id", "patient_id", "hospital_branch", "total_amount"],
  properties: {
    prescription_code: { bsonType: "string" },
    encounter_id: { bsonType: "objectId" },
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    items: { bsonType: "array" },
    total_amount: { bsonType: "number" },
    dispensing_status: { enum: ["PENDING", "DISPENSED", "CANCELLED"] }
  }
});

// 17. MEDICATION_SUPPLIERS (Nhà cung cấp Dược & Hợp đồng Dược phẩm)
createValidatedCollection("medication_suppliers", {
  bsonType: "object",
  required: ["supplier_code", "company_name", "tax_id", "contact_phone"],
  properties: {
    supplier_code: { bsonType: "string" },
    company_name: { bsonType: "string" },
    tax_id: { bsonType: "string" },
    contact_phone: { bsonType: "string" },
    address: { bsonType: "string" },
    rating_score: { bsonType: "number" },
    contract_valid_until: { bsonType: "date" }
  }
});

// -------------------------------------------------------------
// NHÓM 6: TÀI CHÍNH, BẢO HIỂM & BẢO MẬT (3 Collections)
// -------------------------------------------------------------

// 18. INVOICES (Hóa đơn Viện phí & Quyết toán)
createValidatedCollection("invoices", {
  bsonType: "object",
  required: ["invoice_code", "encounter_id", "patient_id", "hospital_branch", "total_gross_amount", "payment_status"],
  properties: {
    invoice_code: { bsonType: "string" },
    encounter_id: { bsonType: "objectId" },
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    total_gross_amount: { bsonType: "number" },
    insurance_coverage_amount: { bsonType: "number" },
    patient_copay_amount: { bsonType: "number" },
    payment_status: { enum: ["UNPAID", "PAID", "REFUNDED"] }
  }
});

// 19. INSURANCE_CLAIMS (Hồ sơ Giám định & Đề nghị BHYT Chi trả)
createValidatedCollection("insurance_claims", {
  bsonType: "object",
  required: ["claim_code", "invoice_id", "patient_id", "hospital_branch", "claimed_amount", "status"],
  properties: {
    claim_code: { bsonType: "string" },
    invoice_id: { bsonType: "objectId" },
    patient_id: { bsonType: "objectId" },
    hospital_branch: { enum: ["HN", "HCM", "DN"] },
    claimed_amount: { bsonType: "number" },
    approved_amount: { bsonType: "number" },
    rejection_reason: { bsonType: ["string", "null"] },
    submission_date: { bsonType: "date" },
    status: { enum: ["SUBMITTED", "APPROVED", "REJECTED", "APPEALED"] }
  }
});

// 20. MEDICAL_AUDIT_LOGS (Nhật ký Truy vết Bảo mật Hồ sơ - Chuẩn HIPAA)
createValidatedCollection("medical_audit_logs", {
  bsonType: "object",
  required: ["timestamp", "action", "staff_id"],
  properties: {
    timestamp: { bsonType: "date" },
    action: { enum: ["READ_RECORD", "UPDATE_DIAGNOSIS", "PRESCRIBE_DRUG", "DISPENSE_DRUG", "EXPORT_REPORT", "DELETE_ENTRY"] },
    staff_id: { bsonType: "objectId" },
    patient_id: { bsonType: ["objectId", "null"] },
    encounter_id: { bsonType: ["objectId", "null"] }
  }
});

print(`======================================================================`);
print(`[2/3] Đang khởi tạo Indexes tối ưu hiệu năng cho cả 20 Collections...`);
print(`======================================================================`);

// Nhóm 1: Bệnh nhân
dbInstance.patients.createIndex({ patient_code: 1 }, { unique: true });
dbInstance.patients.createIndex({ national_id: 1 }, { unique: true });
dbInstance.patients.createIndex({ registered_branch: 1, created_at: -1 });

dbInstance.appointments.createIndex({ appointment_code: 1 }, { unique: true });
dbInstance.appointments.createIndex({ doctor_id: 1, scheduled_date: 1 });
dbInstance.appointments.createIndex({ patient_id: 1, scheduled_date: 1 });

dbInstance.vaccinations.createIndex({ vaccination_code: 1 }, { unique: true });
dbInstance.vaccinations.createIndex({ patient_id: 1, vaccine_name: 1 });

dbInstance.patient_feedbacks.createIndex({ hospital_branch: 1, rating_score: 1 });

// Nhóm 2: Khoa phòng & Thiết bị
dbInstance.departments.createIndex({ dept_code: 1 }, { unique: true });
dbInstance.departments.createIndex({ hospital_branch: 1 });

dbInstance.doctors.createIndex({ staff_code: 1 }, { unique: true });
dbInstance.doctors.createIndex({ department_id: 1, hospital_branch: 1 });

dbInstance.medical_equipment.createIndex({ serial_number: 1 }, { unique: true });
dbInstance.medical_equipment.createIndex({ department_id: 1, status: 1 });

// Nhóm 3: Khám lâm sàng
dbInstance.encounters.createIndex({ encounter_code: 1 }, { unique: true });
dbInstance.encounters.createIndex({ hospital_branch: 1, patient_id: 1 }); // Shard Key
dbInstance.encounters.createIndex({ reason_for_visit: "text", "diagnosis.primary_name": "text" });

dbInstance.lab_tests.createIndex({ test_code: 1 }, { unique: true });
dbInstance.lab_tests.createIndex({ hospital_branch: 1, encounter_id: 1 });

dbInstance.surgical_operations.createIndex({ surgery_code: 1 }, { unique: true });
dbInstance.surgical_operations.createIndex({ lead_surgeon_id: 1, start_time: -1 });

dbInstance.patient_vitals_telemetry.createIndex({ patient_id: 1, recorded_at: -1 });

// Nhóm 4: Nội trú & Cấp cứu
dbInstance.inpatient_admissions.createIndex({ admission_code: 1 }, { unique: true });
dbInstance.inpatient_admissions.createIndex({ hospital_branch: 1, status: 1 });

dbInstance.blood_bank.createIndex({ unit_bag_code: 1 }, { unique: true });
dbInstance.blood_bank.createIndex({ blood_group: 1, hospital_branch: 1, status: 1 });

dbInstance.hospital_transfers.createIndex({ transfer_code: 1 }, { unique: true });

// Nhóm 5: Dược phẩm
dbInstance.pharmacy_inventory.createIndex({ hospital_branch: 1, drug_code: 1 }, { unique: true });
dbInstance.pharmacy_inventory.createIndex({ stock_quantity: 1 });

dbInstance.prescriptions.createIndex({ prescription_code: 1 }, { unique: true });
dbInstance.prescriptions.createIndex({ hospital_branch: 1, created_at: -1 });

dbInstance.medication_suppliers.createIndex({ supplier_code: 1 }, { unique: true });

// Nhóm 6: Tài chính & Audit
dbInstance.invoices.createIndex({ invoice_code: 1 }, { unique: true });
dbInstance.invoices.createIndex({ hospital_branch: 1, paid_at: -1 });

dbInstance.insurance_claims.createIndex({ claim_code: 1 }, { unique: true });
dbInstance.insurance_claims.createIndex({ invoice_id: 1 });

dbInstance.medical_audit_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // TTL Index
dbInstance.medical_audit_logs.createIndex({ patient_id: 1, timestamp: -1 });

print(`======================================================================`);
print(`[3/3] HOÀN TẤT KHỞI TẠO ĐẦY ĐỦ 20 COLLECTIONS & CHỈ MỤC CHO HỆ THỐNG!`);
print(`======================================================================`);
