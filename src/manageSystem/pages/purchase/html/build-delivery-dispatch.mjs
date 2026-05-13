import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsvPath = path.join(__dirname, 'delivery-source.tsv');
const outPath = path.join(__dirname, 'purchase-order-delivery-dispatch.js');

const raw = fs.readFileSync(tsvPath, 'utf8');
const rows = [];
for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t) continue;
    const p = t.split('\t').map(s => s.trim());
    if (p.length < 4) continue;
    const [m, sup, d, q] = p;
    if (sup === '供应商') continue;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    rows.push({ materialName: m, supplier: sup, orderDate: d, orderQty: Number(q) || 0 });
}

const json = JSON.stringify(rows);
const out = `(function(g){g.deliveryDispatchSource=${json};})(typeof window!=='undefined'?window:this);\n`;
fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath, 'rows:', rows.length);
