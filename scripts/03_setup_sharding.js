/**
 * 03_setup_sharding.js
 * Script cấu hình Phân mảnh ngang (Sharding) và Phân vùng Chi nhánh viện (Zone Sharding)
 * Chạy trên mongos router: mongosh "mongodb://localhost:27017" < 03_setup_sharding.js
 */

const dbName = "hospital_ehr_db";
print(`=======================================================`);
print(`[1/4] Kích hoạt Sharding cho Database: ${dbName}...`);
print(`=======================================================`);

// 1. Kích hoạt Sharding trên cấp Database
try {
  sh.enableSharding(dbName);
  print(`✔ Đã kích hoạt sharding cho ${dbName}`);
} catch (e) {
  print(`! Lưu ý: ${e.message}`);
}

print(`[2/4] Cấu hình Zone Tags cho các Shards (HN & HCM)...`);

// 2. Gán Tag Zone cho từng Node Shard
try {
  sh.addShardTag("shard1", "ZONE_HN");
  sh.addShardTag("shard2", "ZONE_HCM");
  print(`✔ Đã gán shard1 -> ZONE_HN, shard2 -> ZONE_HCM`);
} catch (e) {
  print(`! Lưu ý gán tag: ${e.message}`);
}

print(`[3/4] Cấu hình Shard Collection & Định nghĩa Range cho Zone Sharding...`);

/**
 * Shard Collection 1: encounters (Bệnh án)
 * Shard Key: { hospital_branch: 1, patient_id: 1 }
 */
try {
  sh.shardCollection(`${dbName}.encounters`, { hospital_branch: 1, patient_id: 1 });
  
  // Định nghĩa dải giá trị cho Zone HN
  sh.addTagRange(
    `${dbName}.encounters`,
    { hospital_branch: "HN", patient_id: MinKey },
    { hospital_branch: "HN", patient_id: MaxKey },
    "ZONE_HN"
  );

  // Định nghĩa dải giá trị cho Zone HCM
  sh.addTagRange(
    `${dbName}.encounters`,
    { hospital_branch: "HCM", patient_id: MinKey },
    { hospital_branch: "HCM", patient_id: MaxKey },
    "ZONE_HCM"
  );
  print(`✔ Đã cấu hình Zone Sharding thành công cho collection encounters!`);
} catch (e) {
  print(`! Lỗi/Lưu ý encounters: ${e.message}`);
}

/**
 * Shard Collection 2: pharmacy_inventory (Kho dược theo chi nhánh)
 * Shard Key: { hospital_branch: 1, drug_code: 1 }
 */
try {
  sh.shardCollection(`${dbName}.pharmacy_inventory`, { hospital_branch: 1, drug_code: 1 });
  
  sh.addTagRange(
    `${dbName}.pharmacy_inventory`,
    { hospital_branch: "HN", drug_code: MinKey },
    { hospital_branch: "HN", drug_code: MaxKey },
    "ZONE_HN"
  );

  sh.addTagRange(
    `${dbName}.pharmacy_inventory`,
    { hospital_branch: "HCM", drug_code: MinKey },
    { hospital_branch: "HCM", drug_code: MaxKey },
    "ZONE_HCM"
  );
  print(`✔ Đã cấu hình Zone Sharding thành công cho pharmacy_inventory!`);
} catch (e) {
  print(`! Lỗi/Lưu ý pharmacy_inventory: ${e.message}`);
}

print(`[4/4] Kiểm tra Trạng thái Phân tán Dữ liệu...`);
print(`=======================================================`);
print(`TRẠNG THÁI PHÂN MẢNH CỦA BỆNH ÁN (encounters):`);
printjson(db.getSiblingDB(dbName).encounters.getShardDistribution());
print(`=======================================================`);
