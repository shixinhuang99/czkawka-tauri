# 设置Rust并行编译参数
$env:CARGO_BUILD_JOBS = "12"  # 调整为CPU核心数的1.5-2倍
$env:CARGO_INCREMENTAL = "1"  # 启用增量编译

# 设置其他优化环境变量
$env:CARGO_PROFILE_RELEASE_LTO = "thin"  # 使用thin LTO以加快链接速度
$env:CARGO_PROFILE_RELEASE_CODEGEN_UNITS = "1"  # 单一代码生成单元以获得最佳优化
$env:RUSTFLAGS = "-C target-cpu=native"  # 针对当前CPU优化

# 清理之前的构建
Write-Host "清理之前的构建..." -ForegroundColor Green
cd tauri
cargo clean
cd ..

# 构建UI
Write-Host "构建UI..." -ForegroundColor Green
pnpm build:ui

# 构建Tauri应用
Write-Host "使用优化设置构建Tauri应用..." -ForegroundColor Green
pnpm tauri build

Write-Host "构建完成!" -ForegroundColor Green 