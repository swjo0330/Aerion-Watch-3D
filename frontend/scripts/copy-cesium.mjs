/**
 * CesiumJS 정적 파일을 public/cesium 으로 복사 (Turbopack 환경용)
 * package.json scripts 의 predev, prebuild 에서 호출됨
 */
import { cpSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const src = join(root, "node_modules/cesium/Build/Cesium");
const dest = join(root, "public/cesium");

if (!existsSync(src)) {
  console.error("CesiumJS 소스 경로를 찾을 수 없습니다:", src);
  process.exit(1);
}

const dirs = ["Workers", "ThirdParty", "Assets", "Widgets"];
mkdirSync(dest, { recursive: true });

for (const dir of dirs) {
  const from = join(src, dir);
  const to = join(dest, dir);
  if (!existsSync(to)) {
    console.log(`복사 중: ${dir} → public/cesium/${dir}`);
    cpSync(from, to, { recursive: true });
  }
}

console.log("CesiumJS 정적 파일 준비 완료 → public/cesium/");
