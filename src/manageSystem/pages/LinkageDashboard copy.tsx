import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<'summary' | 'details'>('summary');
  const [selectedTab, setSelectedTab] = useState('guanyu');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2026-03-31');
  const chartRefs = useRef<Record<string, any>>({});

  // 共享数据结构
  const STORAGE_KEY = 'steel_price_data_v1';
  const startDateRange = new Date(2026, 2, 23); // 3月23
  const endDateRange = new Date(2026, 3, 22);   // 4月22
  const dateList: string[] = [];
  let cur = new Date(startDateRange);
  while (cur <= endDateRange) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dateList.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }

  // 全范围日期（2022-2026）
  const FULL_START = new Date(2022, 0, 1);
  const FULL_END = new Date(2026, 11, 31);
  const allDates: string[] = [];
  let curDate = new Date(FULL_START);
  while (curDate <= FULL_END) {
    const y = curDate.getFullYear(), m = String(curDate.getMonth() + 1).padStart(2, '0'), d = String(curDate.getDate()).padStart(2, '0');
    allDates.push(`${y}-${m}-${d}`);
    curDate.setDate(curDate.getDate() + 1);
  }

  // 默认初始数据（3.23~3.28已知，其余留空）
  const guanKnown = {
    "2026-03-23": [2490, 2320, 2320, 2370],
    "2026-03-24": [2490, 2320, 2320, 2370],
    "2026-03-25": [2490, 2320, 2320, 2370],
    "2026-03-26": [2470, 2320, 2370, 2370],
    "2026-03-27": [2495, 2335, 2335, 2390],
    "2026-03-28": [2470, 2320, 2320, 2370]
  };
  const huiKnown = {
    "2026-03-23": [2490, 2320, 2370],
    "2026-03-24": [2490, 2320, 2370],
    "2026-03-25": [2490, 2320, 2370],
    "2026-03-26": [2470, 2320, 2370],
    "2026-03-27": [2495, 2335, 2390],
    "2026-03-28": [2470, 2320, 2370]
  };
  const chuKnown = {
    "2026-03-23": [2370, 2490, 2392],
    "2026-03-24": [2370, 2490, 2392],
    "2026-03-25": [2370, 2490, 2392],
    "2026-03-26": [2370, 2470, 2383],
    "2026-03-27": [2390, 2495, 2405],
    "2026-03-28": [2370, 2470, 2383]
  };

  // 冲子料数据
  const rawPunch = [
    "2025-06-23,2290,0,2895", "2025-06-24,2290,0,2895", "2025-06-25,2290,0,2895", "2025-06-26,2290,0,2895",
    "2025-06-27,2290,0,2895", "2025-06-28,2290,0,2895", "2025-06-29,2300,10,2905", "2025-06-30,2300,0,2905",
    "2025-07-01,2300,0,2905", "2025-07-02,2300,0,2905", "2025-07-03,2300,0,2905", "2025-07-04,2310,10,2915",
    "2025-07-05,2310,0,2915", "2025-07-06,2310,0,2915", "2025-07-07,2310,0,2915", "2025-07-08,2310,0,2915",
    "2025-07-09,2310,0,2915", "2025-07-10,2310,0,2915", "2025-07-11,2320,10,2925", "2025-07-12,2320,0,2925",
    "2025-07-13,2320,0,2925", "2025-07-14,2320,0,2925", "2025-07-15,2320,0,2925", "2025-07-16,2320,0,2925",
    "2025-07-17,2320,0,2925", "2025-07-18,2320,0,2925", "2025-07-19,2330,10,2935", "2025-07-20,2330,0,2935",
    "2025-07-21,2365,35,2970", "2025-07-22,2365,0,2970", "2025-07-23,2405,40,3010"
  ];
  const punchData = rawPunch.map(line => {
    let [date, steel, chg, tax] = line.split(',');
    return { date, steelPrice: parseInt(steel), change: parseInt(chg), taxPrice: parseInt(tax) };
  }).sort((a, b) => a.date.localeCompare(b.date));

  // 硅锰合金数据
  const rawSiMn = [
    "2026-03-03,5750,50,5750", "2026-03-04,5750,0,5750", "2026-03-05,5850,100,5850", "2026-03-06,5850,0,5850",
    "2026-03-07,5850,0,5850", "2026-03-08,5850,0,5850", "2026-03-09,5950,100,5950", "2026-03-10,5950,0,5950",
    "2026-03-11,5950,0,5950", "2026-03-12,5850,-100,5850", "2026-03-13,5850,0,5850", "2026-03-14,5850,0,5850",
    "2026-03-15,5850,0,5850", "2026-03-16,5850,0,5850", "2026-03-17,5850,0,5850", "2026-03-18,5900,50,5900",
    "2026-03-19,5900,0,5900", "2026-03-20,6050,150,6050", "2026-03-21,6050,0,6050", "2026-03-22,6050,0,6050",
    "2026-03-23,6150,100,6050", "2026-03-24,6150,100,6150", "2026-03-25,6150,0,6150", "2026-03-26,6150,0,6150",
    "2026-03-27,6150,0,6150", "2026-03-28,6150,0,6150", "2026-03-29,6150,0,6150", "2026-03-30,6150,0,6150",
    "2026-03-31,6250,100,6250"
  ];
  const siMnData = rawSiMn.map(line => {
    let [date, price, chg, tax] = line.split(',');
    return { date, mnPrice: parseInt(price), change: parseInt(chg), taxPrice: parseInt(tax) };
  }).sort((a, b) => a.date.localeCompare(b.date));

  // 硅铁数据
  const rawSiFe = [
    "2026-02-08,5300,5800,5550,0,5550", "2026-02-09,5300,5800,5550,0,5550", "2026-02-10,5300,5800,5550,0,5550",
    "2026-02-11,5300,5800,5550,0,5550", "2026-02-12,5300,5800,5550,0,5550", "2026-02-13,5300,5800,5550,0,5550",
    "2026-02-14,5300,5800,5550,0,5550", "2026-02-15,5300,5800,5550,0,5550", "2026-02-16,5300,5800,5550,0,5550",
    "2026-02-17,5300,5800,5550,0,5550", "2026-02-18,5300,5800,5550,0,5550", "2026-02-19,5300,5800,5550,0,5550",
    "2026-02-20,5300,5800,5550,0,5550", "2026-02-21,5300,5800,5550,0,5550", "2026-02-22,5300,5800,5550,0,5550",
    "2026-02-23,5300,5800,5550,0,5550", "2026-02-24,5250,5800,5525,-25,5525", "2026-02-25,5200,5800,5500,-25,5525",
    "2026-02-26,5200,5800,5500,0,5500", "2026-02-27,5200,5800,5500,0,5500", "2026-02-28,5250,5900,5575,75,5575",
    "2026-03-01,5250,5900,5575,0,5575", "2026-03-02,5300,5900,5600,25,5600", "2026-03-03,5350,5900,5625,25,5625",
    "2026-03-04,5350,5900,5625,0,5625", "2026-03-05,5400,5950,5675,50,5675", "2026-03-06,5400,5950,5675,0,5675",
    "2026-03-07,5400,5950,5675,0,5675", "2026-03-08,5400,5950,5675,0,5675", "2026-03-09,5450,5950,5700,25,5700",
    "2026-03-10,5450,5950,5700,0,5700", "2026-03-11,5450,5950,5700,0,5700", "2026-03-12,5500,6000,5750,50,5750",
    "2026-03-13,5550,6000,5775,25,5775", "2026-03-14,5550,6000,5775,0,5775"
  ];
  const siFeData = rawSiFe.map(line => {
    let p = line.split(',');
    return { date: p[0], ningxia: parseInt(p[1]), gansu: parseInt(p[2]), avgPrice: parseInt(p[3]), change: parseInt(p[4]), taxPrice: parseInt(p[5]) };
  }).sort((a, b) => a.date.localeCompare(b.date));

  // 构建默认rows
  function buildDefaultRows() {
    let guanRows: any[] = [];
    let huiRows: any[] = [];
    let chuRows: any[] = [];
    for (let date of dateList) {
      // 罐子料
      let gKnown = guanKnown[date];
      guanRows.push({
        date, bj: gKnown ? gKnown[0] : '', gz1: gKnown ? gKnown[1] : '',
        gz2: gKnown ? gKnown[2] : '', ty: gKnown ? gKnown[3] : ''
      });
      // 灰铁
      let hKnown = huiKnown[date];
      huiRows.push({
        date, bj: hKnown ? hKnown[0] : '', gz: hKnown ? hKnown[1] : '', ty: hKnown ? hKnown[2] : ''
      });
      // 除锈
      let cKnown = chuKnown[date];
      chuRows.push({
        date, ty: cKnown ? cKnown[0] : '', bj: cKnown ? cKnown[1] : '', sjz: cKnown ? cKnown[2] : ''
      });
    }
    return { guanRows, huiRows, chuRows };
  }

  // 计算罐子料衍生字段
  function computeGuanRow(row: any) {
    const bj = row.bj === '' ? 0 : row.bj;
    const gz1 = row.gz1 === '' ? 0 : row.gz1;
    const gz2 = row.gz2 === '' ? 0 : row.gz2;
    const ty = row.ty === '' ? 0 : row.ty;
    const avg = (bj + gz1 + gz2 + ty) / 4;
    const freight = avg + 200;
    const linkPrice = freight * 1.13 - 150;
    return { avg, freight, linkPrice };
  }

  // 计算灰铁 (依赖前序)
  function computeHuiRowsFull(rows: any[]) {
    let lastLink = null, lastAvg = null;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.bj !== '' && r.gz !== '' && r.ty !== '') {
        const avg = (r.bj + r.gz + r.ty) / 3;
        let change = 0, linkPrice = 0;
        if (lastLink !== null && lastAvg !== null) {
          change = avg - lastAvg;
          linkPrice = lastLink + change;
        } else {
          change = 0;
          linkPrice = 2616.33333333332;
        }
        r.avg = avg;
        r.change = change;
        r.linkPrice = linkPrice;
        lastLink = linkPrice;
        lastAvg = avg;
      } else {
        r.avg = '';
        r.change = '';
        r.linkPrice = '';
      }
    }
    return rows;
  }

  // 除锈二级
  function computeChuRowsFull(rows: any[]) {
    let lastLink = null, lastAvg = null;
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (r.ty !== '' && r.bj !== '' && r.sjz !== '') {
        const avg = (r.ty + r.bj + r.sjz) / 3;
        let change = 0, linkPrice = 0;
        if (lastLink !== null && lastAvg !== null) {
          change = avg - lastAvg;
          linkPrice = lastLink + change;
        } else {
          change = 0;
          linkPrice = 2362.33333333333;
        }
        r.avg = avg;
        r.change = change;
        r.linkPrice = linkPrice;
        lastLink = linkPrice;
        lastAvg = avg;
      } else {
        r.avg = '';
        r.change = '';
        r.linkPrice = '';
      }
    }
    return rows;
  }

  // 计算罐子料所有衍生
  function computeGuanRowsFull(rows: any[]) {
    for (let r of rows) {
      if (r.bj !== '' && r.gz1 !== '' && r.gz2 !== '' && r.ty !== '') {
        const { avg, freight, linkPrice } = computeGuanRow(r);
        r.avg = avg; r.freight = freight; r.linkPrice = linkPrice;
      } else {
        r.avg = ''; r.freight = ''; r.linkPrice = '';
      }
    }
    // 计算涨跌
    for (let i = 0; i < rows.length - 1; i++) {
      if (rows[i].linkPrice !== '' && rows[i + 1].linkPrice !== '') {
        rows[i].change = rows[i + 1].linkPrice - rows[i].linkPrice;
      } else {
        rows[i].change = '';
      }
    }
    return rows;
  }

  // 汇总所需数据：从localStorage读取，若无则构建默认并存储
  function loadData() {
    let stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const { guanRows, huiRows, chuRows } = buildDefaultRows();
      const guanFull = computeGuanRowsFull(guanRows);
      const huiFull = computeHuiRowsFull(huiRows);
      const chuFull = computeChuRowsFull(chuRows);
      const data = { guanRows: guanFull, huiRows: huiFull, chuRows: chuFull };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return data;
    }
    const parsed = JSON.parse(stored);
    // 确保衍生字段存在（旧数据可能没有）
    if (parsed.guanRows && parsed.guanRows.length > 0 && parsed.guanRows[0].avg === undefined) {
      parsed.guanRows = computeGuanRowsFull(parsed.guanRows);
      parsed.huiRows = computeHuiRowsFull(parsed.huiRows);
      parsed.chuRows = computeChuRowsFull(parsed.chuRows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  }

  // 更新汇总表数据
  const [summaryData, setSummaryData] = useState({
    gunLatest: 0, gunAvg: 0,
    huiLatest: 0, huiAvg: 0,
    chuLatest: 0, chuAvg: 0,
    gbLatest: 0, gbAvg: 0,
    gmLatest: 0, gmAvg: 0,
    gtLatest: 0, gtAvg: 0,
    lastSync: ''
  });

  // 计算汇总数据
  function updateSummary() {
    const data = loadData();
    const { guanRows, huiRows, chuRows } = data;

    // 最新有效联动价/平均价
    let gunLatest = null;
    for (let i = guanRows.length - 1; i >= 0; i--) {
      if (guanRows[i].linkPrice !== '' && guanRows[i].linkPrice !== null && !isNaN(guanRows[i].linkPrice)) {
        gunLatest = guanRows[i].linkPrice; break;
      }
    }
    let huiLatest = null;
    for (let i = huiRows.length - 1; i >= 0; i--) {
      if (huiRows[i].linkPrice !== '' && huiRows[i].linkPrice !== null && !isNaN(huiRows[i].linkPrice)) {
        huiLatest = huiRows[i].linkPrice; break;
      }
    }
    let chuLatest = null;
    for (let i = chuRows.length - 1; i >= 0; i--) {
      if (chuRows[i].avg !== '' && chuRows[i].avg !== null && !isNaN(chuRows[i].avg)) {
        chuLatest = chuRows[i].avg; break;
      }
    }
    
    // 新增的三个表格数据
    let gbLatest = null;
    for (let i = punchData.length - 1; i >= 0; i--) {
      if (punchData[i].taxPrice !== '' && punchData[i].taxPrice !== null && !isNaN(punchData[i].taxPrice)) {
        gbLatest = punchData[i].taxPrice; break;
      }
    }
    let gmLatest = null;
    for (let i = siMnData.length - 1; i >= 0; i--) {
      if (siMnData[i].taxPrice !== '' && siMnData[i].taxPrice !== null && !isNaN(siMnData[i].taxPrice)) {
        gmLatest = siMnData[i].taxPrice; break;
      }
    }
    let gtLatest = null;
    for (let i = siFeData.length - 1; i >= 0; i--) {
      if (siFeData[i].taxPrice !== '' && siFeData[i].taxPrice !== null && !isNaN(siFeData[i].taxPrice)) {
        gtLatest = siFeData[i].taxPrice; break;
      }
    }

    // 月平均联动价 (3.23~4.22 所有非空)
    function avgPrice(arr: any[], key: string) {
      if (!arr) return 0;
      let sum = 0, cnt = 0;
      for (let row of arr) {
        let v = row[key];
        if (v !== '' && v !== null && typeof v === 'number' && !isNaN(v)) {
          sum += v; cnt++;
        }
      }
      return cnt ? sum / cnt : 0;
    }
    const gunAvg = avgPrice(guanRows, 'linkPrice');
    const huiAvg = avgPrice(huiRows, 'linkPrice');
    const chuAvg = avgPrice(chuRows, 'avg');  // 除锈二级取平均价作为联动价参考
    const gbAvg = avgPrice(punchData, 'taxPrice');
    const gmAvg = avgPrice(siMnData, 'taxPrice');
    const gtAvg = avgPrice(siFeData, 'taxPrice');

    setSummaryData({
      gunLatest: gunLatest !== null ? gunLatest : 0,
      gunAvg,
      huiLatest: huiLatest !== null ? huiLatest : 0,
      huiAvg,
      chuLatest: chuLatest !== null ? chuLatest : 0,
      chuAvg,
      gbLatest: gbLatest !== null ? gbLatest : 0,
      gbAvg,
      gmLatest: gmLatest !== null ? gmLatest : 0,
      gmAvg,
      gtLatest: gtLatest !== null ? gtLatest : 0,
      gtAvg,
      lastSync: new Date().toLocaleTimeString()
    });
  }

  // 导出 Excel 功能
  function exportToExcel() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN');
    
    // 检查XLSX是否加载
    if (typeof (window as any).XLSX === 'undefined') {
      alert('Excel导出功能需要XLSX库，请确保网络连接正常');
      return;
    }
    
    const XLSX = (window as any).XLSX;
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 1. 导出汇总表
    const summaryRows = [
      ['料型', '当日价格（最新日）', '当月联动均价（3.23~4.22）'],
      ['罐子料（加工）', summaryData.gunLatest.toFixed(2), summaryData.gunAvg.toFixed(2)],
      ['灰铁废铸件（普通）', summaryData.huiLatest.toFixed(2), summaryData.huiAvg.toFixed(2)],
      ['除锈二级', summaryData.chuLatest.toFixed(2), summaryData.chuAvg.toFixed(2)],
      ['聊城钢板料（≥10mm）', summaryData.gbLatest.toFixed(2), summaryData.gbAvg.toFixed(2)],
      ['内蒙硅锰（6517）', summaryData.gmLatest.toFixed(2), summaryData.gmAvg.toFixed(2)],
      ['宁夏甘肃硅铁', summaryData.gtLatest.toFixed(2), summaryData.gtAvg.toFixed(2)],
      ['', '', ''],
      ['导出时间：', timeStr, '']
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, summaryWs, '废钢价格汇总');
    
    // 2. 导出明细数据
    const data = loadData();
    const { guanRows, huiRows, chuRows } = data;
    
    // 导出罐子料明细
    const guanRowsExcel = [
      ['日期', '北京6-8', '广州6-8', '广州重废', '太原重废', '均价', '运费', '涨跌', '含税联动价']
    ];
    for (let row of guanRows) {
      guanRowsExcel.push([
        row.date,
        row.bj || '',
        row.gz1 || '',
        row.gz2 || '',
        row.ty || '',
        row.avg ? row.avg.toFixed(2) : '',
        row.freight ? row.freight.toFixed(2) : '',
        row.change ? row.change.toFixed(2) : '',
        row.linkPrice ? row.linkPrice.toFixed(2) : ''
      ]);
    }
    const guanWs = XLSX.utils.aoa_to_sheet(guanRowsExcel);
    XLSX.utils.book_append_sheet(wb, guanWs, '罐子料明细');
    
    // 导出灰铁废铸件明细
    const huiRowsExcel = [
      ['日期', '北京重废', '广州重废', '太原重废', '均价', '涨跌', '联动价']
    ];
    for (let row of huiRows) {
      huiRowsExcel.push([
        row.date,
        row.bj || '',
        row.gz || '',
        row.ty || '',
        row.avg ? row.avg.toFixed(2) : '',
        row.change ? row.change.toFixed(2) : '',
        row.linkPrice ? row.linkPrice.toFixed(2) : ''
      ]);
    }
    const huiWs = XLSX.utils.aoa_to_sheet(huiRowsExcel);
    XLSX.utils.book_append_sheet(wb, huiWs, '灰铁废铸件明细');
    
    // 导出除锈二级明细
    const chuRowsExcel = [
      ['日期', '太原重废', '北京重废', '石家庄重废', '平均价', '涨跌', '含税价']
    ];
    for (let row of chuRows) {
      chuRowsExcel.push([
        row.date,
        row.ty || '',
        row.bj || '',
        row.sjz || '',
        row.avg ? row.avg.toFixed(2) : '',
        row.change ? row.change.toFixed(2) : '',
        row.linkPrice ? row.linkPrice.toFixed(2) : ''
      ]);
    }
    const chuWs = XLSX.utils.aoa_to_sheet(chuRowsExcel);
    XLSX.utils.book_append_sheet(wb, chuWs, '除锈二级明细');
    
    // 导出聊城钢板料明细
    const gangbanRowsExcel = [
      ['日期', '聊城钢板料（≥10mm）', '涨跌', '冲子料含税价']
    ];
    for (let row of punchData) {
      gangbanRowsExcel.push([
        row.date,
        row.steelPrice || '',
        row.change || '',
        row.taxPrice ? row.taxPrice.toFixed(2) : ''
      ]);
    }
    const gangbanWs = XLSX.utils.aoa_to_sheet(gangbanRowsExcel);
    XLSX.utils.book_append_sheet(wb, gangbanWs, '聊城钢板料明细');
    
    // 导出内蒙硅锰明细
    const guimengRowsExcel = [
      ['日期', '内蒙硅锰（6517）', '涨跌', '含税价']
    ];
    for (let row of siMnData) {
      guimengRowsExcel.push([
        row.date,
        row.mnPrice || '',
        row.change || '',
        row.taxPrice ? row.taxPrice.toFixed(2) : ''
      ]);
    }
    const guimengWs = XLSX.utils.aoa_to_sheet(guimengRowsExcel);
    XLSX.utils.book_append_sheet(wb, guimengWs, '内蒙硅锰明细');
    
    // 导出宁夏甘肃硅铁明细
    const guitieRowsExcel = [
      ['日期', '宁夏硅铁（72#）', '甘肃硅铁（75#）', '均价', '涨跌', '含税价']
    ];
    for (let row of siFeData) {
      guitieRowsExcel.push([
        row.date,
        row.ningxia || '',
        row.gansu || '',
        row.avgPrice ? row.avgPrice.toFixed(2) : '',
        row.change || '',
        row.taxPrice ? row.taxPrice.toFixed(2) : ''
      ]);
    }
    const guitieWs = XLSX.utils.aoa_to_sheet(guitieRowsExcel);
    XLSX.utils.book_append_sheet(wb, guitieWs, '宁夏甘肃硅铁明细');
    
    // 导出文件
    XLSX.writeFile(wb, `废钢价格汇总与明细_${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}.xlsx`);
  }

  // 工具函数
  function calcAverage(arr: any[], field: string) {
    let sum = 0, cnt = 0;
    arr.forEach(item => {
      let v = item[field];
      if (typeof v === 'number' && !isNaN(v)) {
        sum += v; cnt++;
      }
    });
    return cnt ? sum / cnt : null;
  }

  function getLatest(arr: any[], field: string) {
    for (let i = arr.length - 1; i >= 0; i--)
      if (typeof arr[i][field] === 'number' && !isNaN(arr[i][field]))
        return arr[i][field];
    return null;
  }

  // 渲染图表
  function renderChart(canvasId: string, dataRows: any[], field: string, label: string) {
    if (typeof (window as any).Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }
    
    const Chart = (window as any).Chart;
    const ctx = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!ctx) return;
    
    // 销毁旧图表
    if (chartRefs.current[canvasId]) {
      chartRefs.current[canvasId].destroy();
    }
    
    let valid = dataRows.filter(r => typeof r[field] === 'number' && !isNaN(r[field]));
    if (valid.length === 0) {
      chartRefs.current[canvasId] = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [] }
      });
      return;
    }
    
    let labels = valid.map(r => r.date.slice(5));
    let values = valid.map(r => r[field]);
    let avg = calcAverage(valid, field);
    let datasets = [{
      label: label,
      data: values,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      tension: 0.2,
      fill: false,
      pointRadius: 3
    }];
    
    if (avg !== null) {
      datasets.push({
        label: `均价 ${Math.round(avg)}元/吨`,
        data: Array(labels.length).fill(avg),
        borderColor: '#ef4444',
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      });
    }
    
    chartRefs.current[canvasId] = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          tooltip: { mode: 'index' },
          legend: { position: 'top' }
        },
        scales: {
          y: { title: { display: true, text: '价格 (元/吨)' } }
        }
      }
    });
  }

  // 渲染各品类数据
  function renderGuan(start: string, end: string) {
    const data = loadData();
    let filtered = data.guanRows.filter((r: any) => r.date >= start && r.date <= end);
    const tbody = document.getElementById('guanTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.bj || '—'}</td><td>${r.gz1 || '—'}</td><td>${r.gz2 || '—'}</td><td>${r.ty || '—'}</td><td class="calc-cell hidden-in-page">${r.avg !== '' ? Math.round(r.avg) : '—'}</td><td class="calc-cell hidden-in-page">${r.freight !== '' ? Math.round(r.freight) : '—'}</td><td class="calc-cell">${r.change !== '' ? (r.change > 0 ? `+${Math.round(r.change)}` : Math.round(r.change)) : '—'}</td><td class="calc-cell">${r.linkPrice !== '' ? Math.round(r.linkPrice) : '—'}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avgLink = calcAverage(filtered, 'linkPrice');
    let latest = getLatest(filtered, 'linkPrice');
    const guanAvgLink = document.getElementById('guanAvgLink');
    const guanLatestLink = document.getElementById('guanLatestLink');
    if (guanAvgLink) guanAvgLink.innerText = avgLink ? Math.round(avgLink) : '—';
    if (guanLatestLink) guanLatestLink.innerText = latest ? Math.round(latest) : '—';
    renderChart('guanChart', filtered, 'linkPrice', '罐子料含税联动价');
  }

  function renderHui(start: string, end: string) {
    const data = loadData();
    let filtered = data.huiRows.filter((r: any) => r.date >= start && r.date <= end);
    const tbody = document.getElementById('huiTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.bj || '—'}</td><td>${r.gz || '—'}</td><td>${r.ty || '—'}</td><td class="calc-cell hidden-in-page">${r.avg !== '' ? Math.round(r.avg) : '—'}</td><td class="calc-cell">${r.change !== '' ? (r.change > 0 ? `+${Math.round(r.change)}` : Math.round(r.change)) : '—'}</td><td class="calc-cell">${r.linkPrice !== '' ? Math.round(r.linkPrice) : '—'}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkPrice');
    let lat = getLatest(filtered, 'linkPrice');
    const huiAvgLink = document.getElementById('huiAvgLink');
    const huiLatestLink = document.getElementById('huiLatestLink');
    if (huiAvgLink) huiAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (huiLatestLink) huiLatestLink.innerText = lat ? Math.round(lat) : '—';
    renderChart('huiChart', filtered, 'linkPrice', '灰铁联动价');
  }

  function renderChu(start: string, end: string) {
    const data = loadData();
    let filtered = data.chuRows.filter((r: any) => r.date >= start && r.date <= end);
    const tbody = document.getElementById('chuTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.ty || '—'}</td><td>${r.bj || '—'}</td><td>${r.sjz || '—'}</td><td class="calc-cell hidden-in-page">${r.avg !== '' ? Math.round(r.avg) : '—'}</td><td class="calc-cell">${r.change !== '' ? (r.change > 0 ? `+${Math.round(r.change)}` : Math.round(r.change)) : '—'}</td><td class="calc-cell">${r.linkPrice !== '' ? Math.round(r.linkPrice) : '—'}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkPrice');
    let lat = getLatest(filtered, 'linkPrice');
    const chuAvgLink = document.getElementById('chuAvgLink');
    const chuLatestLink = document.getElementById('chuLatestLink');
    if (chuAvgLink) chuAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (chuLatestLink) chuLatestLink.innerText = lat ? Math.round(lat) : '—';
    renderChart('chuChart', filtered, 'linkPrice', '除锈二级含税价');
  }

  function renderPunch(start: string, end: string) {
    let filtered = punchData.filter(r => r.date >= start && r.date <= end);
    const tbody = document.getElementById('punchTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach(r => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.steelPrice}</td><td>${r.change > 0 ? `+${r.change}` : r.change}</td><td class="calc-cell">${r.taxPrice}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'taxPrice');
    let lat = getLatest(filtered, 'taxPrice');
    const punchAvgLink = document.getElementById('punchAvgLink');
    const punchLatestLink = document.getElementById('punchLatestLink');
    if (punchAvgLink) punchAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (punchLatestLink) punchLatestLink.innerText = lat ? Math.round(lat) : '—';
    renderChart('punchChart', filtered, 'taxPrice', '冲子料含税价');
  }

  function renderSiMn(start: string, end: string) {
    let filtered = siMnData.filter(r => r.date >= start && r.date <= end);
    const tbody = document.getElementById('siMnTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach(r => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.mnPrice}</td><td>${r.change > 0 ? `+${r.change}` : r.change}</td><td class="calc-cell">${r.taxPrice}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'taxPrice');
    let lat = getLatest(filtered, 'taxPrice');
    const siMnAvgLink = document.getElementById('siMnAvgLink');
    const siMnLatestLink = document.getElementById('siMnLatestLink');
    if (siMnAvgLink) siMnAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (siMnLatestLink) siMnLatestLink.innerText = lat ? Math.round(lat) : '—';
    renderChart('siMnChart', filtered, 'taxPrice', '硅锰合金含税价');
  }

  function renderSiFe(start: string, end: string) {
    let filtered = siFeData.filter(r => r.date >= start && r.date <= end);
    const tbody = document.getElementById('siFeTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach(r => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.ningxia}</td><td>${r.gansu}</td><td>${r.avgPrice}</td><td>${r.change > 0 ? `+${r.change}` : r.change}</td><td class="calc-cell">${r.taxPrice}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'taxPrice');
    let lat = getLatest(filtered, 'taxPrice');
    const siFeAvgLink = document.getElementById('siFeAvgLink');
    const siFeLatestLink = document.getElementById('siFeLatestLink');
    if (siFeAvgLink) siFeAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (siFeLatestLink) siFeLatestLink.innerText = lat ? Math.round(lat) : '—';
    renderChart('siFeChart', filtered, 'taxPrice', '硅铁含税价');
  }

  // 应用日期范围
  function applyDateRange() {
    if (startDate > endDate) {
      alert('开始日期不能晚于结束日期');
      return;
    }
    renderGuan(startDate, endDate);
    renderHui(startDate, endDate);
    renderChu(startDate, endDate);
    renderPunch(startDate, endDate);
    renderSiMn(startDate, endDate);
    renderSiFe(startDate, endDate);
  }

  // 设置快速日期范围
  function setQuickRange(type: string) {
    let end = new Date();
    end.setHours(0, 0, 0, 0);
    let start = new Date(end);
    switch (type) {
      case '7d': start.setDate(end.getDate() - 6); break;
      case '1m': start.setMonth(end.getMonth() - 1); break;
      case '3m': start.setMonth(end.getMonth() - 3); break;
      case '1y': start.setFullYear(end.getFullYear() - 1); break;
      case 'all': start = new Date(FULL_START); end = new Date(FULL_END); break;
      default: return;
    }
    let startStr = start.toISOString().slice(0, 10);
    let endStr = end.toISOString().slice(0, 10);
    if (startStr < "2022-01-01") startStr = "2022-01-01";
    if (endStr > "2026-12-31") endStr = "2026-12-31";
    setStartDate(startStr);
    setEndDate(endStr);
  }

  // 处理页面导航
  function handleNavigateToDetails() {
    setCurrentPage('details');
  }

  function handleNavigateToSummary() {
    setCurrentPage('summary');
  }

  // 初始化
  useEffect(() => {
    updateSummary();
    // 监听storage事件
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        updateSummary();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      // 销毁所有图表
      Object.values(chartRefs.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
    };
  }, []);

  // 日期范围变化时重新渲染
  useEffect(() => {
    if (currentPage === 'details') {
      applyDateRange();
    }
  }, [startDate, endDate, currentPage]);

  // 标签切换时重新渲染图表
  useEffect(() => {
    if (currentPage === 'details') {
      applyDateRange();
    }
  }, [selectedTab, currentPage]);

  return (
    <div>
      {/* 引入Chart.js和XLSX库 */}
      <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
      <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>
      
      {/* 全局样式 */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          font-family: system-ui, 'Segoe UI', 'Roboto', sans-serif;
        }
        body {
          background: #f0f2f5;
          margin: 0;
        }
        .container {
          max-width: 1600px;
          margin: 0 auto;
        }
        .card {
          background: white;
          border-radius: 32px;
          box-shadow: 0 12px 28px rgba(0,0,0,0.08);
          padding: 24px 28px;
          transition: all 0.2s;
        }
        h1 {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1e4663;
          margin: 0 0 8px 0;
          border-left: 6px solid #f5a623;
          padding-left: 20px;
        }
        .sub {
          color: #5a6e8a;
          margin-bottom: 28px;
          padding-left: 26px;
        }
        .toolbar {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 20px;
        }
        .export-btn {
          background: #2c6e2f;
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.9rem;
          cursor: pointer;
          font-weight: 500;
          transition: 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .export-btn:hover {
          background: #1f5a22;
          transform: translateY(-1px);
        }
        .summary-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 1rem;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .summary-table th,
        .summary-table td {
          border: 1px solid #e2e8f0;
          padding: 16px 12px;
          text-align: center;
        }
        .summary-table th {
          background: #f8fafc;
          font-weight: 600;
          color: #1e3a5f;
        }
        .summary-table td {
          font-weight: 500;
        }
        .price-value {
          font-weight: 700;
          color: #2c6e2f;
          font-size: 1.2rem;
        }
        .btn-group {
          margin-top: 32px;
          text-align: center;
        }
        .btn-detail {
          background: #1e3a5f;
          border: none;
          color: white;
          padding: 12px 28px;
          font-size: 1rem;
          font-weight: 500;
          border-radius: 40px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: 0.2s;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        .btn-detail:hover {
          background: #0f2c48;
          transform: translateY(-1px);
        }
        .update-time {
          margin-top: 24px;
          text-align: right;
          font-size: 0.75rem;
          color: #8a9bb0;
        }
        footer {
          margin-top: 40px;
          text-align: center;
          color: #7f8c9a;
          font-size: 0.75rem;
        }
        .nav-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 12px 24px;
          border-radius: 60px;
          margin-bottom: 28px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          flex-wrap: wrap;
        }
        .nav-bar h2 {
          margin: 0;
          font-size: 1.4rem;
          color: #1e4663;
        }
        .nav-links {
          display: flex;
          gap: 12px;
        }
        .nav-btn, .back-btn {
          background: #1e3a5f;
          border: none;
          color: white;
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 0.9rem;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: 0.2s;
        }
        .back-btn {
          background: #4a6f8f;
        }
        .nav-btn:hover, .back-btn:hover {
          transform: translateY(-1px);
          filter: brightness(0.92);
        }
        .date-tabs-container {
          background: white;
          border-radius: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 15px 20px;
          margin-bottom: 20px;
        }
        .date-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .date-tabs label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e4663;
        }
        .date-select {
          padding: 8px 12px;
          border: 1px solid #dee2e6;
          border-radius: 12px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          min-width: 150px;
        }
        .quick-range {
          display: flex;
          gap: 8px;
          margin-left: 12px;
        }
        .quick-btn {
          background: #e9ecef;
          border: none;
          border-radius: 20px;
          padding: 6px 14px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: 0.2s;
        }
        .quick-btn:hover {
          background: #f5a623;
          color: white;
        }
        .tabs-container {
          margin-bottom: 48px;
        }
        .tab-buttons {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        .tab-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 20px;
          padding: 10px 20px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .tab-btn:hover {
          background: #e9ecef;
          transform: translateY(-1px);
        }
        .tab-btn.active {
          background: #f5a623;
          color: white;
          border-color: #f5a623;
        }
        .tab-content {
          background: white;
          border-radius: 28px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          padding: 20px;
        }
        .tab-pane {
          display: none;
        }
        .tab-pane.active {
          display: block;
        }
        .sheet-section {
          background: transparent;
          border-radius: 28px;
          padding: 0;
          display: flex;
          flex-direction: column;
        }
        .sheet-title {
          font-size: 1.4rem;
          font-weight: 600;
          color: #1e4663;
          border-left: 6px solid #f5a623;
          padding-left: 14px;
          margin: 0 0 15px 0;
        }
        .chart-container {
          margin-bottom: 20px;
          height: 250px;
          position: relative;
        }
        canvas {
          max-height: 250px;
          width: 100%;
        }
        .table-wrapper {
          overflow-x: auto;
          border-radius: 16px;
          flex: 1;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.75rem;
          min-width: 500px;
        }
        .data-table th {
          background: #f1f5f9;
          padding: 8px 4px;
          border: 1px solid #cbd5e1;
          font-weight: 600;
          text-align: center;
        }
        .data-table td {
          border: 1px solid #cbd5e1;
          padding: 6px 3px;
          text-align: center;
          background: white;
        }
        .calc-cell {
          background-color: #fef9e6;
          font-weight: 500;
          color: #2d3e50;
        }
        .hidden-in-page {
          display: none;
        }
        .stat-row {
          margin-top: 16px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: space-between;
        }
        .avg-stat, .latest-stat {
          background: #eef2ff;
          padding: 8px 14px;
          border-radius: 24px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #1e3a5f;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .latest-stat {
          background: #e6f7e6;
        }
        .avg-stat span, .latest-stat span {
          font-weight: 700;
          color: #2c6e2f;
          font-size: 1rem;
        }
        .average-note {
          margin-top: 12px;
          background: #f8f9fc;
          padding: 8px 12px;
          border-radius: 16px;
          font-size: 0.7rem;
          color: #2c5282;
          border-left: 3px solid #f5a623;
        }
        @media (max-width: 600px) {
          .card { padding: 16px; }
          .summary-table th, .summary-table td { padding: 12px 6px; font-size: 0.85rem; }
          .toolbar { justify-content: center; }
        }
        @media (max-width: 1000px) {
          .tab-buttons { flex-direction: column; }
          .tab-btn { width: 100%; text-align: center; }
        }
      `}</style>

      {/* 汇总页面 */}
      {currentPage === 'summary' && (
        <div className="container">
          <div className="card">
            <h1>📊 废钢联动价格汇总表</h1>
            <div className="sub">百川盈孚 · 含税参考价（元/吨）</div>

            <div className="toolbar">
              <button className="export-btn" onClick={exportToExcel}>📎 导出 Excel</button>
            </div>

            <table className="summary-table" id="summaryTable">
              <thead>
                <tr><th>料型</th><th>当日价格（最新日）</th><th>当月联动均价（3.23~4.22）</th></tr>
              </thead>
              <tbody>
                <tr><td>罐子料（加工）</td><td className="price-value">{summaryData.gunLatest.toFixed(2)}</td><td>{summaryData.gunAvg.toFixed(2)}</td></tr>
                <tr><td>灰铁废铸件（普通）</td><td className="price-value">{summaryData.huiLatest.toFixed(2)}</td><td>{summaryData.huiAvg.toFixed(2)}</td></tr>
                <tr><td>除锈二级</td><td className="price-value">{summaryData.chuLatest.toFixed(2)}</td><td>{summaryData.chuAvg.toFixed(2)}</td></tr>
                <tr><td>冲子料（≥10mm）</td><td className="price-value">{summaryData.gbLatest.toFixed(2)}</td><td>{summaryData.gbAvg.toFixed(2)}</td></tr>
                <tr><td>硅锰合金（6517）</td><td className="price-value">{summaryData.gmLatest.toFixed(2)}</td><td>{summaryData.gmAvg.toFixed(2)}</td></tr>
                <tr><td>硅铁</td><td className="price-value">{summaryData.gtLatest.toFixed(2)}</td><td>{summaryData.gtAvg.toFixed(2)}</td></tr>
              </tbody>
            </table>

            <div className="btn-group">
              <button className="btn-detail" onClick={handleNavigateToDetails}>✏️ 查看/编辑明细数据</button>
            </div>
            <div className="update-time">✅ 数据同步于 {summaryData.lastSync} · 最新明细与汇总一致</div>
          </div>
          <footer>数据基于百川盈孚公式实时计算，修改明细后自动同步汇总。</footer>
        </div>
      )}

      {/* 明细页面 */}
      {currentPage === 'details' && (
        <div className="container">
          <div className="nav-bar">
            <h2>📊 废钢·合金全维看板</h2>
            <div className="nav-links">
              <button className="back-btn" onClick={handleNavigateToSummary}>← 返回汇总表</button>
            </div>
          </div>

          {/* 日期范围选项卡（支持2022-2026） */}
          <div className="date-tabs-container">
            <div className="date-tabs">
              <label>📅 开始日期：</label>
              <select 
                className="date-select" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
              >
                {allDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              <label>📅 结束日期：</label>
              <select 
                className="date-select" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
              >
                {allDates.map(date => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              <div className="quick-range">
                <button className="quick-btn" onClick={() => setQuickRange('7d')}>最近7天</button>
                <button className="quick-btn" onClick={() => setQuickRange('1m')}>最近1个月</button>
                <button className="quick-btn" onClick={() => setQuickRange('3m')}>最近3个月</button>
                <button className="quick-btn" onClick={() => setQuickRange('1y')}>最近1年</button>
                <button className="quick-btn" onClick={() => setQuickRange('all')}>全部</button>
              </div>
            </div>
          </div>

          {/* 6大品类选项卡 */}
          <div className="tabs-container">
            <div className="tab-buttons">
              <button 
                className={`tab-btn ${selectedTab === 'guanyu' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('guanyu')}
              >
                🥫 罐子料
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'huitie' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('huitie')}
              >
                ⚙️ 灰铁废铸件
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'chuxiu' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('chuxiu')}
              >
                🧹 除锈二级
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'punch' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('punch')}
              >
                🔩 冲子料
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'simn' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('simn')}
              >
                🧪 硅锰合金
              </button>
              <button 
                className={`tab-btn ${selectedTab === 'sife' ? 'active' : ''}`} 
                onClick={() => setSelectedTab('sife')}
              >
                🔥 硅铁
              </button>
            </div>
            <div className="tab-content">
              {/* 罐子料 */}
              <div id="guanyu" className={`tab-pane ${selectedTab === 'guanyu' ? 'active' : ''}`}>
                <div className="sheet-section">
                  <div className="sheet-title">🥫 罐子料（加工）</div>
                  <div className="chart-container"><canvas id="guanChart"></canvas></div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>北京6-8</th>
                          <th>广州6-8</th>
                          <th>广州重废</th>
                          <th>太原重废</th>
                          <th className="hidden-in-page">均价</th>
                          <th className="hidden-in-page">运费</th>
                          <th>涨跌</th>
                          <th>含税联动价</th>
                        </tr>
                      </thead>
                      <tbody id="guanTbody"></tbody>
                    </table>
                  </div>
                  <div className="stat-row">
                    <div className="avg-stat">📊 含税均价：<span id="guanAvgLink">--</span> 元/吨</div>
                    <div className="latest-stat">📌 最新含税价：<span id="guanLatestLink">--</span> 元/吨</div>
                  </div>
                  <div className="average-note">✅ 均价 = 四地平均；运费 = 均价+200；涨跌 = 本日均价-上日均价；含税联动价 = 运费×1.13 - 150</div>
                </div>
              </div>
              {/* 灰铁废铸件 */}
              <div id="huitie" className={`tab-pane ${selectedTab === 'huitie' ? 'active' : ''}`}>
                <div className="sheet-section">
                  <div className="sheet-title">⚙️ 灰铁废铸件（普通）</div>
                  <div className="chart-container"><canvas id="huiChart"></canvas></div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>北京重废</th>
                          <th>广州重废</th>
                          <th>太原重废</th>
                          <th className="hidden-in-page">均价</th>
                          <th>涨跌</th>
                          <th>联动价</th>
                        </tr>
                      </thead>
                      <tbody id="huiTbody"></tbody>
                    </table>
                  </div>
                  <div className="stat-row">
                    <div className="avg-stat">📊 含税均价：<span id="huiAvgLink">--</span> 元/吨</div>
                    <div className="latest-stat">📌 最新含税价：<span id="huiLatestLink">--</span> 元/吨</div>
                  </div>
                  <div className="average-note">✅ 均价 = 三地平均；涨跌 = 本日均价-上日均价；联动价首行2616.333，后续累加涨跌。</div>
                </div>
              </div>
              {/* 除锈二级 */}
              <div id="chuxiu" className={`tab-pane ${selectedTab === 'chuxiu' ? 'active' : ''}`}>
                <div className="sheet-section">
                  <div className="sheet-title">🧹 除锈二级</div>
                  <div className="chart-container"><canvas id="chuChart"></canvas></div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>太原重废</th>
                          <th>北京重废</th>
                          <th>石家庄重废</th>
                          <th className="hidden-in-page">平均价</th>
                          <th>涨跌</th>
                          <th>含税价</th>
                        </tr>
                      </thead>
                      <tbody id="chuTbody"></tbody>
                    </table>
                  </div>
                  <div className="stat-row">
                    <div className="avg-stat">📊 含税均价：<span id="chuAvgLink">--</span> 元/吨</div>
                    <div className="latest-stat">📌 最新含税价：<span id="chuLatestLink">--</span> 元/吨</div>
                  </div>
                  <div className="average-note">✅ 平均价 = 三地平均；涨跌 = 本日平均-上日平均；联动价首行2362.333，后续累加涨跌。</div>
                </div>
              </div>

              {/* 冲子料（原聊城钢板料） */}
              <div id="punch" className={`tab-pane ${selectedTab === 'punch' ? 'active' : ''}`}>
                <div className="sheet-section">
                  <div className="sheet-title">🔩 冲子料（聊城钢板料≥10mm）</div>
                  <div className="chart-container"><canvas id="punchChart"></canvas></div>
                  <div className="table-wrapper">
                    <table className="data-table" id="tablePunch">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>钢板料(≥10mm)</th>
                          <th>涨跌</th>
                          <th>冲子料含税价(元/吨)</th>
                        </tr>
                      </thead>
                      <tbody id="punchTbody"></tbody>
                    </table>
                  </div>
                  <div className="stat-row">
                    <div className="avg-stat">📊 含税均价：<span id="punchAvgLink">--</span> 元/吨</div>
                    <div className="latest-stat">📌 最新含税价：<span id="punchLatestLink">--</span> 元/吨</div>
                  </div>
                  <div className="average-note">📈 折线图展示冲子料含税价 + 平均线，日期筛选联动。</div>
                </div>
              </div>

              {/* 硅锰合金（原内蒙硅锰） */}
              <div id="simn" className={`tab-pane ${selectedTab === 'simn' ? 'active' : ''}`}>
                <div className="sheet-section">
                  <div className="sheet-title">🧪 硅锰合金（6517）</div>
                  <div className="chart-container"><canvas id="siMnChart"></canvas></div>
                  <div className="table-wrapper">
                    <table className="data-table" id="tableSiMn">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>内蒙硅锰(6517)</th>
                          <th>涨跌</th>
                          <th>含税价(元/吨)</th>
                        </tr>
                      </thead>
                      <tbody id="siMnTbody"></tbody>
                    </table>
                  </div>
                  <div className="stat-row">
                    <div className="avg-stat">📊 含税均价：<span id="siMnAvgLink">--</span> 元/吨</div>
                    <div className="latest-stat">📌 最新含税价：<span id="siMnLatestLink">--</span> 元/吨</div>
                  </div>
                  <div className="average-note">📈 折线图展示硅锰合金含税价 + 平均线，日期筛选联动。</div>
                </div>
              </div>

              {/* 硅铁（原宁夏甘肃硅铁） */}
              <div id="sife" className={`tab-pane ${selectedTab === 'sife' ? 'active' : ''}`}>
                <div className="sheet-section">
                  <div className="sheet-title">🔥 硅铁（72#/75#）</div>
                  <div className="chart-container"><canvas id="siFeChart"></canvas></div>
                  <div className="table-wrapper">
                    <table className="data-table" id="tableSiFe">
                      <thead>
                        <tr>
                          <th>日期</th>
                          <th>宁夏硅铁(72#)</th>
                          <th>甘肃硅铁(75#)</th>
                          <th>均价</th>
                          <th>涨跌</th>
                          <th>含税价(元/吨)</th>
                        </tr>
                      </thead>
                      <tbody id="siFeTbody"></tbody>
                    </table>
                  </div>
                  <div className="stat-row">
                    <div className="avg-stat">📊 含税均价：<span id="siFeAvgLink">--</span> 元/吨</div>
                    <div className="latest-stat">📌 最新含税价：<span id="siFeLatestLink">--</span> 元/吨</div>
                  </div>
                  <div className="average-note">📈 折线图展示硅铁含税价 + 平均线，日期筛选联动。</div>
                </div>
              </div>
            </div>
          </div>
          <footer>✏️ 前三个表格支持编辑联动，后三个图表展示合金/冲子料含税价走势，所有图表与日期选项卡实时联动（日期范围2022-2026）。</footer>
        </div>
      )}
    </div>
  );
};

export default SalesDashboard;