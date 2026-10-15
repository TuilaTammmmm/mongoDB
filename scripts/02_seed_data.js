/**
 * 02_seed_data.js
 * Script tạo dữ liệu mẫu thực tế, phong phú cho TOÀN BỘ 20 COLLECTIONS
 * Hệ thống Quản lý Bệnh viện & Hồ sơ Y tế Điện tử (Full Enterprise HIS & EHR)
 * Chạy trên mongosh: mongosh hospital_ehr_db < 02_seed_data.js
 */

const dbName = "hospital_ehr_db";
const dbInstance = db.getSiblingDB(dbName);

print(`======================================================================`);
print(`[1/4] Làm sạch toàn bộ dữ liệu cũ trong 20 Collections...`);
print(`======================================================================`);

const allCollections = [
  "patients", "appointments", "vaccinations", "patient_feedbacks",
  "departments", "doctors", "medical_equipment",
  "encounters", "lab_tests", "surgical_operations", "patient_vitals_telemetry",
  "inpatient_admissions", "blood_bank", "hospital_transfers",
  "pharmacy_inventory", "prescriptions", "medication_suppliers",
  "invoices", "insurance_claims", "medical_audit_logs"
];

allCollections.forEach(col => dbInstance.getCollection(col).deleteMany({}));

print(`[2/4] Tạo Nhà cung cấp, Khoa phòng, Bác sĩ & Thiết bị y tế...`);

// 1. MEDICATION_SUPPLIERS (Nhà cung cấp Dược)
const sup1Id = new ObjectId();
const sup2Id = new ObjectId();
dbInstance.medication_suppliers.insertMany([
  { _id: sup1Id, supplier_code: "SUP-SANOFI", company_name: "Tập đoàn Dược phẩm Sanofi Việt Nam", tax_id: "0300628120", contact_phone: "02838298526", address: "Quận 1, TP.HCM", rating_score: 4.9, contract_valid_until: new Date("2028-12-31") },
  { _id: sup2Id, supplier_code: "SUP-TW1", company_name: "Công ty Cổ phần Dược phẩm Trung ương 1 (CPC1)", tax_id: "0100108920", contact_phone: "02438452331", address: "Đống Đa, Hà Nội", rating_score: 4.8, contract_valid_until: new Date("2027-10-30") }
]);

// 2. DEPARTMENTS (Khoa phòng)
const deptHN_TimMach = new ObjectId();
const deptHN_TieuHoa = new ObjectId();
const deptHN_HoiSuc = new ObjectId();
const deptHCM_TimMach = new ObjectId();
const deptHCM_Nhi = new ObjectId();

dbInstance.departments.insertMany([
  { _id: deptHN_TimMach, dept_code: "KTM-HN", name: "Khoa Tim Mạch", hospital_branch: "HN", location: { building: "Nhà A", floor: 3 }, total_beds: NumberInt(40), available_beds: NumberInt(6) },
  { _id: deptHN_TieuHoa, dept_code: "KTH-HN", name: "Khoa Tiêu Hóa", hospital_branch: "HN", location: { building: "Nhà A", floor: 4 }, total_beds: NumberInt(35), available_beds: NumberInt(12) },
  { _id: deptHN_HoiSuc, dept_code: "KICU-HN", name: "Khoa Hồi Sức Tích Cực (ICU)", hospital_branch: "HN", location: { building: "Nhà B", floor: 2 }, total_beds: NumberInt(20), available_beds: NumberInt(3) },
  { _id: deptHCM_TimMach, dept_code: "KTM-HCM", name: "Khoa Tim Mạch", hospital_branch: "HCM", location: { building: "Khu 1", floor: 5 }, total_beds: NumberInt(50), available_beds: NumberInt(10) },
  { _id: deptHCM_Nhi, dept_code: "KNHI-HCM", name: "Khoa Nhi", hospital_branch: "HCM", location: { building: "Khu 2", floor: 2 }, total_beds: NumberInt(60), available_beds: NumberInt(20) }
]);

// 3. DOCTORS (Bác sĩ)
const bsTuan = new ObjectId();
const bsLong = new ObjectId();
const bsKhang = new ObjectId();
const bsDung = new ObjectId();

dbInstance.doctors.insertMany([
  { _id: bsTuan, staff_code: "BS-HN-001", full_name: "PGS.TS. Trần Quốc Tuấn", title: "Bác sĩ CKII", department_id: deptHN_TimMach, hospital_branch: "HN", specialties: ["Can thiệp tim mạch"], is_active: true },
  { _id: bsLong, staff_code: "BS-HN-002", full_name: "ThS.BS. Lê Hoàng Long", title: "Bác sĩ CKI", department_id: deptHN_TieuHoa, hospital_branch: "HN", specialties: ["Nội soi tiêu hóa"], is_active: true },
  { _id: bsKhang, staff_code: "BS-HCM-001", full_name: "GS.TS. Vũ Đình Khang", title: "Bác sĩ CKII", department_id: deptHCM_TimMach, hospital_branch: "HCM", specialties: ["Phẫu thuật tim mạch"], is_active: true },
  { _id: bsDung, staff_code: "BS-HCM-002", full_name: "ThS.BS. Đặng Thùy Dung", title: "Bác sĩ CKI", department_id: deptHCM_Nhi, hospital_branch: "HCM", specialties: ["Hô hấp nhi"], is_active: true }
]);

// 4. MEDICAL_EQUIPMENT (Trang thiết bị y tế)
dbInstance.medical_equipment.insertMany([
  { serial_number: "EQ-MRI-HN-01", device_name: "Hệ thống Cộng hưởng từ MRI 3.0 Tesla", manufacturer: "Siemens Healthineers", department_id: deptHN_TimMach, hospital_branch: "HN", status: "OPERATIONAL", last_maintenance_date: new Date("2026-08-01"), next_maintenance_date: new Date("2026-11-01") },
  { serial_number: "EQ-VENT-HN-03", device_name: "Máy thở chức năng cao Hamilton-C6", manufacturer: "Hamilton Medical", department_id: deptHN_HoiSuc, hospital_branch: "HN", status: "OPERATIONAL", last_maintenance_date: new Date("2026-09-15"), next_maintenance_date: new Date("2026-12-15") },
  { serial_number: "EQ-DSA-HCM-02", device_name: "Hệ thống Chụp mạch số hóa xóa nền DSA", manufacturer: "Philips Medical", department_id: deptHCM_TimMach, hospital_branch: "HCM", status: "OPERATIONAL", last_maintenance_date: new Date("2026-07-20"), next_maintenance_date: new Date("2026-10-20") }
]);

print(`[3/4] Tạo Kho Dược, Ngân hàng Máu, Bệnh nhân & Tiêm chủng...`);

// 5. PHARMACY_INVENTORY (Kho Dược chi nhánh)
const medAmlor = new ObjectId();
const medNexium = new ObjectId();
const medAspirin = new ObjectId();

dbInstance.pharmacy_inventory.insertMany([
  { _id: medAmlor, drug_code: "DRUG-AML-05", brand_name: "Amlor 5mg", active_ingredient: "Amlodipine", unit: "Viên", hospital_branch: "HN", price_per_unit: 6500, stock_quantity: NumberInt(5000), warning_threshold: NumberInt(500) },
  { _id: medNexium, drug_code: "DRUG-NEX-40", brand_name: "Nexium 40mg", active_ingredient: "Esomeprazole", unit: "Viên", hospital_branch: "HN", price_per_unit: 23000, stock_quantity: NumberInt(2500), warning_threshold: NumberInt(300) },
  { _id: medAspirin, drug_code: "DRUG-ASP-81", brand_name: "Aspirin 81mg", active_ingredient: "Acid Acetylsalicylic", unit: "Viên", hospital_branch: "HCM", price_per_unit: 2000, stock_quantity: NumberInt(8000), warning_threshold: NumberInt(1000) }
]);

// 6. BLOOD_BANK (Ngân hàng Máu)
dbInstance.blood_bank.insertMany([
  { unit_bag_code: "BB-HN-O-001", blood_group: "O+", component_type: "PACKED_RBC", volume_ml: NumberInt(350), collected_date: new Date("2026-10-01"), expiry_date: new Date("2026-11-12"), hospital_branch: "HN", status: "AVAILABLE" },
  { unit_bag_code: "BB-HN-AB-002", blood_group: "AB+", component_type: "FRESH_FROZEN_PLASMA", volume_ml: NumberInt(250), collected_date: new Date("2026-09-20"), expiry_date: new Date("2027-09-20"), hospital_branch: "HN", status: "RESERVED" },
  { unit_bag_code: "BB-HCM-O-003", blood_group: "O+", component_type: "PACKED_RBC", volume_ml: NumberInt(350), collected_date: new Date("2026-10-05"), expiry_date: new Date("2026-11-16"), hospital_branch: "HCM", status: "AVAILABLE" }
]);

// 7. PATIENTS (Bệnh nhân)
const bnHung = new ObjectId();
const bnLan = new ObjectId();
const bnTri = new ObjectId();

dbInstance.patients.insertMany([
  {
    _id: bnHung,
    patient_code: "BN-2026-000101",
    national_id: "001202001111",
    full_name: "Nguyễn Văn Hùng",
    dob: new Date("1968-05-14"),
    gender: "MALE",
    phone: "0912345001",
    registered_branch: "HN",
    blood_type: "O+",
    allergies: [{ allergen: "Penicillin", type: "DRUG", severity: "HIGH", reaction: "Khó thở sốc phản vệ" }]
  },
  {
    _id: bnLan,
    patient_code: "BN-2026-000102",
    national_id: "001202002222",
    full_name: "Trần Thị Lan",
    dob: new Date("1982-11-20"),
    gender: "FEMALE",
    phone: "0912345002",
    registered_branch: "HN",
    blood_type: "A+",
    allergies: []
  },
  {
    _id: bnTri,
    patient_code: "BN-2026-000201",
    national_id: "079202004444",
    full_name: "Võ Minh Trí",
    dob: new Date("1955-03-10"),
    gender: "MALE",
    phone: "0909123001",
    registered_branch: "HCM",
    blood_type: "AB+",
    allergies: [{ allergen: "Aspirin", type: "DRUG", severity: "HIGH", reaction: "Xuất huyết tiêu hóa" }]
  }
]);

// 8. VACCINATIONS (Tiêm chủng)
dbInstance.vaccinations.insertMany([
  { vaccination_code: "VAC-2026-01", patient_id: bnLan, vaccine_name: "Cúm Mùa Vaxigrip Tetra", dose_number: NumberInt(1), batch_number: "LOT-VAX-2026", administered_date: new Date("2026-09-10"), hospital_branch: "HN", adverse_reaction: null }
]);

// 9. APPOINTMENTS (Đặt lịch khám)
dbInstance.appointments.insertMany([
  { appointment_code: "APT-20261015-01", patient_id: bnHung, doctor_id: bsTuan, department_id: deptHN_TimMach, scheduled_date: new Date("2026-10-15T09:00:00Z"), hospital_branch: "HN", status: "CONFIRMED" }
]);

print(`[4/4] Tạo Bệnh án, Phẫu thuật, Giám sát ICU, Đơn thuốc, Viện phí, BHYT & Chuyển viện...`);

// 10. ENCOUNTERS (Bệnh án Đa hình - Khám bệnh)
const encHungId = new ObjectId();
const encTriId = new ObjectId();

dbInstance.encounters.insertMany([
  {
    _id: encHungId,
    encounter_code: "ENC-20261010-001",
    patient_id: bnHung,
    doctor_id: bsTuan,
    department_id: deptHN_TimMach,
    hospital_branch: "HN",
    encounter_type: "OUTPATIENT",
    admission_time: new Date("2026-10-10T08:00:00Z"),
    discharge_time: new Date("2026-10-10T10:30:00Z"),
    reason_for_visit: "Đau thắt ngực khi gắng sức, hồi hộp",
    vital_signs: { blood_pressure: "145/90", heart_rate: 88, temperature: 36.8, spO2: 98 },
    specialized_examination: { specialty: "CARDIOLOGY", ecg_report: "Nhịp xoang nhanh, thiếu máu cơ tim", nyha_stage: "Class II" },
    diagnosis: { primary_icd10: "I20.9", primary_name: "Cơn đau thắt ngực không đặc hiệu" },
    status: "COMPLETED"
  },
  {
    _id: encTriId,
    encounter_code: "ENC-20261011-001",
    patient_id: bnTri,
    doctor_id: bsKhang,
    department_id: deptHCM_TimMach,
    hospital_branch: "HCM",
    encounter_type: "INPATIENT",
    admission_time: new Date("2026-10-11T07:30:00Z"),
    discharge_time: null,
    reason_for_visit: "Khó thở kịch phát về đêm, phù hai chi dưới",
    vital_signs: { blood_pressure: "160/100", heart_rate: 104, temperature: 36.9, spO2: 93 },
    specialized_examination: { specialty: "CARDIOLOGY", echocardiogram: "EF = 38%, suy tim sung huyết", nyha_stage: "Class III" },
    diagnosis: { primary_icd10: "I50.9", primary_name: "Suy tim sung huyết mất bù cấp" },
    status: "IN_PROGRESS"
  }
]);

// 11. LAB_TESTS (Xét nghiệm)
dbInstance.lab_tests.insertMany([
  { test_code: "LAB-20261010-001", encounter_id: encHungId, patient_id: bnHung, hospital_branch: "HN", test_category: "SINH_HOA_TIM_MACH", parameters: [{ name: "Troponin T hs", value: 0.038, unit: "ng/mL", flag: "CRITICAL" }], status: "VERIFIED" }
]);

// 12. SURGICAL_OPERATIONS (Ca phẫu thuật)
dbInstance.surgical_operations.insertMany([
  { surgery_code: "SURG-20261011-01", encounter_id: encTriId, patient_id: bnTri, hospital_branch: "HCM", lead_surgeon_id: bsKhang, operating_room: "Phòng mổ Tim mạch OR-3", procedure_name: "Đặt Stent động mạch vành qua da (PCI)", anesthesia_type: "LOCAL", start_time: new Date("2026-10-11T13:00:00Z"), end_time: new Date("2026-10-11T14:30:00Z"), status: "COMPLETED" }
]);

// 13. PATIENT_VITALS_TELEMETRY (Giám sát ICU Thời gian thực)
dbInstance.patient_vitals_telemetry.insertMany([
  { patient_id: bnTri, hospital_branch: "HCM", bed_number: "G-ICU-02", recorded_at: new Date("2026-10-11T08:00:00Z"), heart_rate_bpm: 102, spO2_percent: 94, mean_arterial_pressure: 110, respiratory_rate: 22, is_alert_triggered: true },
  { patient_id: bnTri, hospital_branch: "HCM", bed_number: "G-ICU-02", recorded_at: new Date("2026-10-11T08:05:00Z"), heart_rate_bpm: 98, spO2_percent: 96, mean_arterial_pressure: 105, respiratory_rate: 20, is_alert_triggered: false }
]);

// 14. INPATIENT_ADMISSIONS (Điều trị Nội trú)
dbInstance.inpatient_admissions.insertMany([
  { admission_code: "ADM-20261011-001", patient_id: bnTri, department_id: deptHCM_TimMach, hospital_branch: "HCM", room_number: "P. Hồi Sức 502", bed_number: "G-03", admission_date: new Date("2026-10-11T08:30:00Z"), status: "CURRENTLY_ADMITTED" }
]);

// 15. PRESCRIPTIONS (Đơn thuốc)
dbInstance.prescriptions.insertMany([
  { prescription_code: "RX-20261010-001", encounter_id: encHungId, patient_id: bnHung, hospital_branch: "HN", items: [{ drug_id: medAmlor, drug_name: "Amlor 5mg", quantity: NumberInt(30), unit_price: 6500, subtotal: 195000 }], total_amount: 195000, dispensing_status: "DISPENSED" }
]);

// 16. INVOICES (Hóa đơn viện phí)
const invHungId = new ObjectId();
dbInstance.invoices.insertMany([
  { _id: invHungId, invoice_code: "INV-20261010-001", encounter_id: encHungId, patient_id: bnHung, hospital_branch: "HN", total_gross_amount: 755000, insurance_coverage_amount: 604000, patient_copay_amount: 151000, payment_status: "PAID" }
]);

// 17. INSURANCE_CLAIMS (Giám định BHYT)
dbInstance.insurance_claims.insertMany([
  { claim_code: "CLAIM-20261010-01", invoice_id: invHungId, patient_id: bnHung, hospital_branch: "HN", claimed_amount: 604000, approved_amount: 604000, rejection_reason: null, submission_date: new Date("2026-10-10T12:00:00Z"), status: "APPROVED" }
]);

// 18. HOSPITAL_TRANSFERS (Chuyển viện Cấp cứu 115)
dbInstance.hospital_transfers.insertMany([
  { transfer_code: "TRANS-20261011-01", patient_id: bnTri, source_branch: "HCM", target_hospital: "Bệnh viện Chợ Rẫy", ambulance_plate: "51B-115.89", transfer_reason: "Hỗ trợ tim phổi nhân tạo chuyên sâu (ECMO)", transfer_time: new Date("2026-10-11T16:00:00Z"), status: "DELIVERED" }
]);

// 19. PATIENT_FEEDBACKS (Đánh giá Hài lòng)
dbInstance.patient_feedbacks.insertMany([
  { patient_id: bnHung, hospital_branch: "HN", rating_score: NumberInt(5), category: "DOCTOR_ATTITUDE", comment: "Bác sĩ Tuấn giải thích bệnh tình rất chu đáo và tận tình.", created_at: new Date("2026-10-10T11:00:00Z") }
]);

// 20. MEDICAL_AUDIT_LOGS (Nhật ký Truy vết Bảo mật)
dbInstance.medical_audit_logs.insertMany([
  { timestamp: new Date("2026-10-10T08:05:00Z"), action: "READ_RECORD", staff_id: bsTuan, patient_id: bnHung, encounter_id: encHungId },
  { timestamp: new Date("2026-10-10T10:15:00Z"), action: "PRESCRIBE_DRUG", staff_id: bsTuan, patient_id: bnHung, encounter_id: encHungId }
]);

print(`======================================================================`);
print(`✔ NẠP DỮ LIỆU THÀNH CÔNG CHO TẤT CẢ 20 COLLECTIONS!`);
allCollections.forEach(col => {
  print(`  - ${col.padEnd(26)}: ${dbInstance.getCollection(col).countDocuments()} bản ghi`);
});
print(`======================================================================`);
