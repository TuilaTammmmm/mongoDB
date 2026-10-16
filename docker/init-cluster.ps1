# init-cluster.ps1
# Script PowerShell tự động kích hoạt Replica Set và kết nối các Shard vào Router mongos
# Đề tài: Hệ thống Quản lý Vật tư & Chuỗi Cung ứng Phân tán

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [1/4] Khởi tạo Replica Set cho Config Server..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
docker exec -it vattu-configsvr mongosh --port 27019 --eval 'rs.initiate({ _id: "configReplSet", configsvr: true, members: [{ _id: 0, host: "configsvr:27019" }] })'

Start-Sleep -Seconds 2

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [2/4] Khởi tạo Replica Set cho Shard 1 (Tổng kho Miền Bắc - HN)..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
docker exec -it vattu-shard1 mongosh --port 27018 --eval 'rs.initiate({ _id: "shard1ReplSet", members: [{ _id: 0, host: "shard1:27018" }] })'

Start-Sleep -Seconds 2

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [3/4] Khởi tạo Replica Set cho Shard 2 (Tổng kho Miền Nam - TP.HCM)..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
docker exec -it vattu-shard2 mongosh --port 27020 --eval 'rs.initiate({ _id: "shard2ReplSet", members: [{ _id: 0, host: "shard2:27020" }] })'

Start-Sleep -Seconds 5

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [4/4] Thêm các Shard vào Router mongos và gán Tag Zone..." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
docker exec -it vattu-mongos mongosh --port 27017 --eval 'sh.addShard("shard1ReplSet/shard1:27018"); sh.addShard("shard2ReplSet/shard2:27020"); sh.status();'

Write-Host "==========================================================" -ForegroundColor Green
Write-Host " CỤM MONGODB SHARDED CLUSTER QUẢN LÝ VẬT TƯ ĐÃ SẴN SÀNG TẠI CỔNG 27017!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
