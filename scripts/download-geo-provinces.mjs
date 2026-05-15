/**
 * 从阿里云 DataV 拉取各省 {adcode}_full.json 与全国 100000_full.json 到 public/geo，
 * 并生成 provinces_pack.json，保证打包上线后二级省图无需外网。
 *
 * 需要本机可访问 https://geo.datav.aliyun.com（在能联网的环境执行一次即可）。
 *
 * 用法：node scripts/download-geo-provinces.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const geoDir = path.join(__dirname, '..', 'public', 'geo');
const DATAV = 'https://geo.datav.aliyun.com/areas_v3/bound';

/** 与 PurchaseDashboard.tsx 中 PROVINCE_GEO_ADCODE 一致（台湾可能 404，脚本会跳过） */
const PROVINCE_ADCODE_LIST = [
  '110000', '120000', '130000', '140000', '150000', '210000', '220000', '230000',
  '310000', '320000', '330000', '340000', '350000', '360000', '370000', '410000',
  '420000', '430000', '440000', '450000', '460000', '500000', '510000', '520000',
  '530000', '540000', '610000', '620000', '630000', '640000', '650000',
  '710000', '810000', '820000',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

fs.mkdirSync(geoDir, { recursive: true });

console.log('下载全国 100000_full.json …');
try {
  const national = await download(`${DATAV}/100000_full.json`);
  fs.writeFileSync(path.join(geoDir, '100000_full.json'), JSON.stringify(national), 'utf8');
  console.log('  已保存 100000_full.json');
} catch (e) {
  console.error('  全国图失败:', e.message);
}

const pack = {};
for (const adcode of PROVINCE_ADCODE_LIST) {
  const file = `${adcode}_full.json`;
  const dest = path.join(geoDir, file);
  try {
    if (fs.existsSync(dest)) {
      console.log('已存在，跳过下载', file);
    } else {
      process.stdout.write(`下载 ${file} … `);
      const json = await download(`${DATAV}/${adcode}_full.json`);
      fs.writeFileSync(dest, JSON.stringify(json), 'utf8');
      console.log('ok', json.features?.length ?? 0, 'features');
    }
    const json = JSON.parse(fs.readFileSync(dest, 'utf8'));
    if (json?.type === 'FeatureCollection' && Array.isArray(json.features)) {
      pack[adcode] = json;
    }
  } catch (e) {
    console.warn('  失败', file, e.message);
  }
  await sleep(250);
}

const keys = Object.keys(pack);
if (!keys.length) {
  console.error('未得到任何省数据，请检查网络后重试');
  process.exit(1);
}

const outPack = path.join(geoDir, 'provinces_pack.json');
fs.writeFileSync(outPack, JSON.stringify(pack), 'utf8');
console.log('\n已生成', outPack, '共', keys.length, '个省级条目（含地市边界）');
console.log('请将 public/geo 目录提交/打入构建产物后即可纯离线使用二级地图。');
