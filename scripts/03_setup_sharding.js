/**
 * 03_setup_sharding.js
 * Script cấu hình Phân mảnh ngang (Sharding) và Phân vùng Chi nhánh Tổng kho (Zone Sharding)
 * Hệ thống Quản trị & Điều phối Vật tư Doanh nghiệp Phân tán (Distributed Materials & WMS)
 * Chạy trên mongos router: mongosh "mongodb://localhost:27017" < 03_setup_sharding.js
 */

const dbName = "material_inventory_db";
print(`=======================================================`);
print(`[1/4] Kích hoạt Sharding cho Database: ${dbName}...`);
print(`=======================================================`);

// 1. Kích hoạt Sharding ở cấp Database
try {
  sh.enableSharding(dbName);
  print(`✔ Đã kích hoạt sharding cho database: ${dbName}`);
} catch (e) {
  print(`! Lưu ý: ${e.message}`);
}

print(`[2/4] Cấu hình Zone Tags cho các Shards (Kho Miền Bắc & Kho Miền Nam)...`);

// 2. Gán Tag Zone cho từng Node Shard
try {
  sh.addShardTag("shard1", "ZONE_HN");
  sh.addShardTag("shard2", "ZONE_HCM");
  print(`✔ Đã gán shard1 -> ZONE_HN (Kho Miền Bắc), shard2 -> ZONE_HCM (Kho Miền Nam)`);
} catch (e) {
  print(`! Lưu ý gán tag: ${e.message}`);
}

print(`[3/4] Cấu hình Shard Collections & Định nghĩa Range cho Zone Sharding...`);

/**
 * Shard Collection 1: inventory_stocks (Tồn kho vật tư theo chi nhánh)
 * Shard Key: { warehouse_branch: 1, material_code: 1 }
 */
try {
  sh.shardCollection(`${dbName}.inventory_stocks`, { warehouse_branch: 1, material_code: 1 });
  
  // Dải giá trị cho Zone HN (Shard 1)
  sh.addTagRange(
    `${dbName}.inventory_stocks`,
    { warehouse_branch: "HN", material_code: MinKey },
    { warehouse_branch: "HN", material_code: MaxKey },
    "ZONE_HN"
  );

  // Dải giá trị cho Zone HCM (Shard 2)
  sh.addTagRange(
    `${dbName}.inventory_stocks`,
    { warehouse_branch: "HCM", material_code: MinKey },
    { warehouse_branch: "HCM", material_code: MaxKey },
    "ZONE_HCM"
  );
  print(`✔ Đã cấu hình Zone Sharding thành công cho collection: inventory_stocks!`);
} catch (e) {
  print(`! Lỗi/Lưu ý inventory_stocks: ${e.message}`);
}

/**
 * Shard Collection 2: goods_receipts (Phiếu Nhập kho Vật tư)
 * Shard Key: { warehouse_branch: 1, receipt_code: 1 }
 */
try {
  sh.shardCollection(`${dbName}.goods_receipts`, { warehouse_branch: 1, receipt_code: 1 });
  
  sh.addTagRange(
    `${dbName}.goods_receipts`,
    { warehouse_branch: "HN", receipt_code: MinKey },
    { warehouse_branch: "HN", receipt_code: MaxKey },
    "ZONE_HN"
  );

  sh.addTagRange(
    `${dbName}.goods_receipts`,
    { warehouse_branch: "HCM", receipt_code: MinKey },
    { warehouse_branch: "HCM", receipt_code: MaxKey },
    "ZONE_HCM"
  );
  print(`✔ Đã cấu hình Zone Sharding thành công cho collection: goods_receipts!`);
} catch (e) {
  print(`! Lỗi/Lưu ý goods_receipts: ${e.message}`);
}

/**
 * Shard Collection 3: goods_issues (Phiếu Xuất kho Vật tư)
 * Shard Key: { warehouse_branch: 1, issue_code: 1 }
 */
try {
  sh.shardCollection(`${dbName}.goods_issues`, { warehouse_branch: 1, issue_code: 1 });
  
  sh.addTagRange(
    `${dbName}.goods_issues`,
    { warehouse_branch: "HN", issue_code: MinKey },
    { warehouse_branch: "HN", issue_code: MaxKey },
    "ZONE_HN"
  );

  sh.addTagRange(
    `${dbName}.goods_issues`,
    { warehouse_branch: "HCM", issue_code: MinKey },
    { warehouse_branch: "HCM", issue_code: MaxKey },
    "ZONE_HCM"
  );
  print(`✔ Đã cấu hình Zone Sharding thành công cho collection: goods_issues!`);
} catch (e) {
  print(`! Lỗi/Lưu ý goods_issues: ${e.message}`);
}

print(`[4/4] Kiểm tra Trạng thái Phân tán Dữ liệu...`);
print(`=======================================================`);
print(`TRẠNG THÁI PHÂN MẢNH CỦA TỒN KHO VẬT TƯ (inventory_stocks):`);
printjson(db.getSiblingDB(dbName).inventory_stocks.getShardDistribution());
print(`=======================================================`);
