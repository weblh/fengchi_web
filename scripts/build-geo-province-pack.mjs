/**
 * 将 public/geo 下各省的 {adcode}_full.json（如 410000_full.json）合并为
 * public/geo/provinces_pack.json，供前端一次请求加载全部省内地市边界。
 *
 * 用法：node scripts/build-geo-province-pack.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const geoDir = path.join(__dirname, '..', 'public', 'geo');
const outFile = path.join(geoDir, 'provinces_pack.json');

if (!fs.existsSync(geoDir)) {
  console.error('目录不存在:', geoDir);
  process.exit(1);
}

const pack = {};
const files = fs.readdirSync(geoDir).filter((f) => /^\d{6}_full\.json$/.test(f));

for (const file of files) {
  if (file === '100000_full.json') continue;
  const adcode = file.replace('_full.json', '');
  const fullPath = path.join(geoDir, file);
  try {
    const json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    if (json?.type === 'FeatureCollection' && Array.isArray(json.features)) {
      pack[adcode] = json;
      console.log('已加入', adcode, 'features=', json.features.length);
    } else {
      console.warn('跳过（非 FeatureCollection）:', file);
    }
  } catch (e) {
    console.warn('跳过（解析失败）:', file, e.message);
  }
}

const keys = Object.keys(pack);
if (!keys.length) {
  console.error('未找到任何 *_full.json（已排除 100000）。请将 DataV 下载的省 json 放入 public/geo/');
  process.exit(1);
}

fs.writeFileSync(outFile, JSON.stringify(pack), 'utf8');
console.log('\n已生成', outFile, '共', keys.length, '个省/区');
