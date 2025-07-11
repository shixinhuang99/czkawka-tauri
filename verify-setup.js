// 验证开发环境设置
import { execSync } from 'node:child_process';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 验证 czkawka-tauri 开发环境...\n');

const checks = [
  {
    name: '检查 Rust 工具链',
    cmd: 'rustc --version',
    expected: /rustc \d+\.\d+\.\d+/,
  },
  {
    name: '检查 Cargo',
    cmd: 'cargo --version',
    expected: /cargo \d+\.\d+\.\d+/,
  },
  {
    name: '检查 Node.js',
    cmd: 'node --version',
    expected: /v\d+\.\d+\.\d+/,
  },
  {
    name: '检查 pnpm',
    cmd: 'pnpm --version',
    expected: /\d+\.\d+\.\d+/,
  },
  {
    name: '检查 Tauri CLI',
    cmd: 'pnpm tauri --version',
    expected: /tauri-cli \d+\.\d+\.\d+/,
  },
  {
    name: '检查 TypeScript',
    cmd: 'pnpm typecheck:ui',
    expected: null,
  },
  {
    name: '检查代码质量',
    cmd: 'pnpm check',
    expected: null,
  },
];

let passed = 0;
let failed = 0;

for (const check of checks) {
  try {
    console.log(`⏳ ${check.name}...`);
    const result = execSync(check.cmd, {
      cwd: __dirname,
      encoding: 'utf8',
      stdio: 'pipe',
    });

    if (check.expected && !check.expected.test(result)) {
      console.log(`❌ ${check.name} - 输出不符合预期`);
      console.log(`   输出: ${result.trim()}`);
      failed++;
    } else {
      console.log(`✅ ${check.name} - 通过`);
      passed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name} - 失败`);
    console.log(`   错误: ${error.message}`);
    failed++;
  }
}

console.log('\n📊 验证结果:');
console.log(`✅ 通过: ${passed}`);
console.log(`❌ 失败: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 所有检查都通过！开发环境已就绪。');
  console.log('\n🚀 可以开始使用以下命令：');
  console.log('   pnpm run:tauri    # 启动 Tauri 开发服务器');
  console.log('   pnpm run:browser  # 启动浏览器开发服务器');
  console.log('   pnpm build:ui     # 构建前端');
  console.log('   cargo build       # 构建后端');
} else {
  console.log('\n⚠️  有些检查失败，请解决相关问题。');
}

console.log('\n📋 新增图像格式支持:');
console.log('   • JXL (JPEG XL) - 现代无损/有损图像格式');
console.log('   • AVIF - 基于 AV1 的高效图像格式');
console.log('   这些格式现在会被正确识别为图像文件。');
