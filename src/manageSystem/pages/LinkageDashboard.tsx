import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import request from '../../utils/request';
import * as XLSX from 'xlsx';
import {
  Card,
  Button,
  Table,
  Tabs,
  Typography,
  Layout,
  Row,
  Col,
  Space
} from 'antd';
import './LinkageDashboard.css';

const LinkageDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<'summary' | 'details'>('summary');
  const [selectedTab, setSelectedTab] = useState('jar_material');
  // 计算默认开始时间和结束时间
  const getDefaultStartDate = () => {
    const date = new Date();
    const currentDay = date.getDate();
    if (currentDay >= 23) {
      date.setDate(23);
    } else {
      date.setMonth(date.getMonth() - 1);
      date.setDate(23);
    }
    return date.toISOString().slice(0, 10);
  };
  
  const getDefaultEndDate = () => {
    const date = new Date();
    const currentDay = date.getDate();
    if (currentDay >= 23) {
      date.setMonth(date.getMonth() + 1);
      date.setDate(22);
    } else {
      date.setDate(22);
    }
    return date.toISOString().slice(0, 10);
  };
  
  // 生成日期列表（从2022年1月1日到今天）
  const dateList: string[] = [];
  const start = new Date(2022, 0, 1); // 2022年1月1日
  const end = new Date(); // 今天
  end.setDate(end.getDate() + 31); // 增加一个月的缓冲，确保能包含未来的日期
  let cur = new Date(start);
  while (cur <= end) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    dateList.push(`${y}-${m}-${d}`);
    cur.setDate(cur.getDate() + 1);
  }
  
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getDefaultEndDate());
  const [materialDicts, setMaterialDicts] = useState<any[]>([]);
  const [priceCombinations, setPriceCombinations] = useState<any[]>([]);
  
  // 计算当前月份的日期范围
  const getCurrentMonthRange = () => {
    const date = new Date();
    const currentDay = date.getDate();
    let startDate, endDate;
    
    if (currentDay >= 23) {
      startDate = new Date(date.getFullYear(), date.getMonth(), 23);
      endDate = new Date(date.getFullYear(), date.getMonth() + 1, 22);
    } else {
      startDate = new Date(date.getFullYear(), date.getMonth() - 1, 23);
      endDate = new Date(date.getFullYear(), date.getMonth(), 22);
    }
    
    const formatDate = (d: Date) => {
      return `${d.getMonth() + 1}.${d.getDate()}`;
    };
    
    return `${formatDate(startDate)}~${formatDate(endDate)}`;
  };
  
  const currentMonthRange = getCurrentMonthRange();

  // 辅助函数：根据日期获取记录，如果当天没有则获取上一天的
  function getRecordByDate(records: any[]) {
    if (records.length === 0) return null;
    
    // 按日期降序排序
    const sortedRecords = [...records].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 查找当天的记录
    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      
      if (recordDate.getTime() === today.getTime()) {
        return record;
      }
    }
    
    // 如果没有当天的记录，返回最新的记录（上一天或更早）
    return sortedRecords[0];
  }

  // 获取选中的品类信息
  function getSelectedCategory() {
    return materialDicts.find(dict => dict.categoryCode === selectedTab || dict.code === selectedTab) || {};
  }

  // 获取表头配置
  function getTableHeaders() {
    const headers = [
      { key: 'date', label: '日期' },
      { key: 'priceChange', label: '涨跌' },
      { key: 'linkedPrice', label: '含税联动价' }
    ];

    // 根据选中的品类添加特定字段
    switch (selectedTab) {
      case 'jar_material':
        return [
          { key: 'date', label: '日期' },
          { key: 'beijing68mm', label: '北京6-8' },
          { key: 'guangzhou68mm', label: '广州6-8' },
          { key: 'guangzhouHeavy', label: '广州重废' },
          { key: 'taiyuanHeavy', label: '太原重废' },
          { key: 'avgPrice', label: '均价', className: 'hidden-in-page' },
          { key: 'priceChange', label: '涨跌' },
          { key: 'linkedPrice', label: '含税联动价' }
        ];
      case 'gray_iron_cast':
        return [
          { key: 'date', label: '日期' },
          { key: 'beijingHeavy', label: '北京重废' },
          { key: 'guangzhouHeavy', label: '广州重废' },
          { key: 'taiyuanHeavy', label: '太原重废' },
          { key: 'avgPrice', label: '均价', className: 'hidden-in-page' },
          { key: 'priceChange', label: '涨跌' },
          { key: 'linkedPrice', label: '含税联动价' }
        ];
      case 'rust_removal_2':
        return [
          { key: 'date', label: '日期' },
          { key: 'taiyuanHeavy', label: '太原重废' },
          { key: 'beijingHeavy', label: '北京重废' },
          { key: 'shijiazhuangHeavy', label: '石家庄重废' },
          { key: 'avgPrice', label: '均价', className: 'hidden-in-page' },
          { key: 'priceChange', label: '涨跌' },
          { key: 'linkedPrice', label: '含税联动价' }
        ];
      case 'punching_scrap':
        return [
          { key: 'date', label: '日期' },
          { key: 'liaochengSteelplate', label: '聊城钢板料' },
          { key: 'avgPrice', label: '均价', className: 'hidden-in-page' },
          { key: 'priceChange', label: '涨跌' },
          { key: 'linkedPrice', label: '含税联动价' }
        ];
      case 'silicon_manganese':
        return [
          { key: 'date', label: '日期' },
          { key: 'innerMongoliaSimn', label: '内蒙硅锰' },
          { key: 'avgPrice', label: '均价', className: 'hidden-in-page' },
          { key: 'priceChange', label: '涨跌' },
          { key: 'linkedPrice', label: '含税联动价' }
        ];
      case 'ferrosilicon':
        return [
          { key: 'date', label: '日期' },
          { key: 'ningxiaSife', label: '宁夏硅铁' },
          { key: 'gansuSife', label: '甘肃硅铁' },
          { key: 'avgPrice', label: '均价', className: 'hidden-in-page' },
          { key: 'priceChange', label: '涨跌' },
          { key: 'linkedPrice', label: '含税联动价' }
        ];
      default:
        return headers;
    }
  }

  // 渲染表格数据
  function renderTableData() {
    const headers = getTableHeaders();
    const filteredData = priceCombinations.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });

    return filteredData.map((item, index) => (
      <tr key={index}>
        {headers.map(header => (
          <th key={header.key} className={header.className}>
            {item[header.key] || '—'}
          </th>
        ))}
      </tr>
    ));
  }

  // 计算含税联动价格的均价（四舍五入，0.5也要进1）
  function calculateAverageLinkedPrice() {
    const filteredData = priceCombinations.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });

    // 过滤出linkedPrice不为空的行
    const validData = filteredData.filter(item => item.linkedPrice !== undefined && item.linkedPrice !== null && item.linkedPrice !== '');

    if (validData.length === 0) return 0;

    const total = validData.reduce((sum, item) => sum + (item.linkedPrice || 0), 0);
    const average = total / validData.length;
    // 使用Math.round进行四舍五入，0.5会进1
    return Math.round(average);
  }

  // 获取最新的含税联动价格
  function getLatestLinkedPrice() {
    const filteredData = priceCombinations.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });

    // 过滤出linkedPrice不为空的行
    const validData = filteredData.filter(item => item.linkedPrice !== undefined && item.linkedPrice !== null && item.linkedPrice !== '');

    if (validData.length === 0) return 0;

    // 按日期降序排序，获取最新的记录
    const sortedData = [...validData].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sortedData[0].linkedPrice || 0;
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
  async function updateSummary() {
    try {
      // 格式化日期为 YYYY-MM-DD 格式（使用本地时间）
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };
      
      // 计算日期范围：如果当前日期 >= 23号，开始日期为本月23号，结束日期为下月22号；否则开始日期为上月23号，结束日期为本月22号
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      let startDate, endDate;
      
      if (currentDay >= 23) {
        // 如果今天 >= 23号，开始日期为本月23号，结束日期为下月22号
        startDate = formatDate(new Date(currentYear, currentMonth, 23));
        endDate = formatDate(new Date(currentYear, currentMonth + 1, 22));
      } else {
        // 如果今天 < 23号，开始日期为上月23号，结束日期为本月22号
        startDate = formatDate(new Date(currentYear, currentMonth - 1, 23));
        endDate = formatDate(new Date(currentYear, currentMonth, 22));
      }
      
      console.log('计算日期范围:', { startDate, endDate });
      
      // 从API获取数据（传入日期范围）
      const response = await request.get('/api/material-prices/list', {
        startDate,
        endDate,
        pageNum: 1,
        pageSize: 1000, // 获取足够多的数据
      });

      // 使用接口返回的records字段
      const allRecords = response || [];
      
      console.log('API返回数据统计:', {
        totalRecords: allRecords.length,
        sampleRecord: allRecords.length > 0 ? allRecords[0] : null
      });
      
      // 初始化价格变量
      let gunLatest = 0;
      let gunAvg = 0;
      let huiLatest = 0;
      let huiAvg = 0;
      let chuLatest = 0;
      let chuAvg = 0;
      let gbLatest = 0;
      let gbAvg = 0;
      let gmLatest = 0;
      let gmAvg = 0;
      let gtLatest = 0;
      let gtAvg = 0;
      
      // 按物料编码分类处理
      const materialCodes = {
        jar_material: '罐子料',
        gray_iron_cast: '灰铁废铸件',
        rust_removal_2: '除锈二级',
        punching_scrap: '冲子料',
        ferrosilicon: '硅铁',
        silicon_manganese: '内蒙硅锰'
      };
      
      // 处理每个物料
      for (const [code, name] of Object.entries(materialCodes)) {
        const materialRecords = allRecords.filter(record => record.materialCode === code);
        
        // 获取最新记录（当日价格）
        const latestRecord = getRecordByDate(materialRecords);
        
        // 计算linkedPrice的平均值（当月联动均价）
        const validLinkedPrices = materialRecords
          .filter(record => record.linkedPrice !== undefined && record.linkedPrice !== null && record.linkedPrice !== '')
          .map(record => record.linkedPrice || 0);
          
        const linkedPriceAvg = validLinkedPrices.length > 0 
          ? Math.round(validLinkedPrices.reduce((sum, price) => sum + price, 0) / validLinkedPrices.length)
          : 0;
        
        if (latestRecord !== null && latestRecord !== undefined) {
          switch (code) {
            case 'jar_material':
              gunLatest = latestRecord.linkedPrice || 0;
              gunAvg = linkedPriceAvg;
              break;
            case 'gray_iron_cast':
              huiLatest = latestRecord.linkedPrice || 0;
              huiAvg = linkedPriceAvg;
              break;
            case 'rust_removal_2':
              chuLatest = latestRecord.linkedPrice || 0;
              chuAvg = linkedPriceAvg;
              break;
            case 'punching_scrap':
              gbLatest = latestRecord.linkedPrice || 0;
              gbAvg = linkedPriceAvg;
              break;
            case 'ferrosilicon':
              gtLatest = latestRecord.linkedPrice || 0;
              gtAvg = linkedPriceAvg;
              break;
            case 'silicon_manganese':
              gmLatest = latestRecord.linkedPrice || 0;
              gmAvg = linkedPriceAvg;
              break;
          }
        }
      }
      
      console.log('计算后的数据:', {
        gunLatest, gunAvg,
        huiLatest, huiAvg,
        chuLatest, chuAvg,
        gbLatest, gbAvg,
        gmLatest, gmAvg,
        gtLatest, gtAvg
      });

      setSummaryData({
        gunLatest,
        gunAvg,
        huiLatest,
        huiAvg,
        chuLatest,
        chuAvg,
        gbLatest,
        gbAvg,
        gmLatest,
        gmAvg,
        gtLatest,
        gtAvg,
        lastSync: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('Error fetching summary data:', error);
      // 如果API调用失败，使用默认数据
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
      for (let i = (punchData || []).length - 1; i >= 0; i--) {
        if (punchData && punchData[i].taxPrice !== '' && punchData[i].taxPrice !== null && !isNaN(punchData[i].taxPrice)) {
          gbLatest = punchData[i].taxPrice; break;
        }
      }
      let gmLatest = null;
      for (let i = (siMnData || []).length - 1; i >= 0; i--) {
        if (siMnData && siMnData[i].taxPrice !== '' && siMnData[i].taxPrice !== null && !isNaN(siMnData[i].taxPrice)) {
          gmLatest = siMnData[i].taxPrice; break;
        }
      }
      let gtLatest = null;
      for (let i = (siFeData || []).length - 1; i >= 0; i--) {
        if (siFeData && siFeData[i].taxPrice !== '' && siFeData[i].taxPrice !== null && !isNaN(siFeData[i].taxPrice)) {
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
      const gbAvg = avgPrice(punchData || [], 'taxPrice');
      const gmAvg = avgPrice(siMnData || [], 'taxPrice');
      const gtAvg = avgPrice(siFeData || [], 'taxPrice');

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
  }

  // 导出 Excel 功能
  function exportToExcel() {
    const now = new Date();
    const timeStr = now.toLocaleString('zh-CN');
    
    // 创建工作簿
    const wb = XLSX.utils.book_new();
    
    // 1. 导出汇总表
    const summaryRows = [
      ['料型', '当日价格（最新日）', `当月联动均价（${currentMonthRange}）`],
      ['罐子料（加工）', Math.round(summaryData.gunLatest), summaryData.gunAvg],
      ['灰铁废铸件（普通）', Math.round(summaryData.huiLatest), summaryData.huiAvg],
      ['除锈二级', Math.round(summaryData.chuLatest), summaryData.chuAvg],
      ['聊城钢板料（≥10mm）', Math.round(summaryData.gbLatest), summaryData.gbAvg],
      ['内蒙硅锰（6517）', Math.round(summaryData.gmLatest), summaryData.gmAvg],
      ['宁夏甘肃硅铁', Math.round(summaryData.gtLatest), summaryData.gtAvg],
      ['', '', ''],
      ['导出时间：', timeStr, '']
    ];
    const summaryWs = XLSX.utils.aoa_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(wb, summaryWs, '废钢价格汇总');
    
    // 2. 导出明细数据（使用priceCombinations数据）
    const guanRows = [];
    const huiRows = [];
    const chuRows = [];
    
    // 初始化缺失的变量
    const punchData = [];
    const siMnData = [];
    const siFeData = [];
    
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
    for (let row of (punchData || [])) {
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
    for (let row of (siMnData || [])) {
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
    for (let row of (siFeData || [])) {
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
  // 生成图表配置
  function getChartOption(category: any) {
    // 过滤数据
    const filteredData = priceCombinations.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });
    
    if (filteredData.length === 0) {
      return {
        title: {
          text: '',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        legend: {
          data: [category.categoryName || category.name || '含税联动价', '均价线'],
          top: 30
        },
        xAxis: {
          type: 'category',
          data: []
        },
        yAxis: {
          type: 'value',
          name: '含税联动价 (元/吨)'
        },
        series: [
          {
            name: category.categoryName || category.name || '含税联动价',
            type: 'line',
            data: []
          },
        ]
      };
    }
    
    // 按日期排序
    const sortedData = [...filteredData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    let labels = sortedData.map(r => r.date.slice(5)); // 只显示月-日
    let linkedPrices = sortedData.map(r => r.linkedPrice || 0);
    
    // 计算均价（用于显示均价线）
    const validData = sortedData.filter(item => item.linkedPrice !== undefined && item.linkedPrice !== null && item.linkedPrice !== '');
    const linkedPriceAvg = validData.length > 0 ? validData.reduce((sum, item) => sum + (item.linkedPrice || 0), 0) / validData.length : 0;
    
    // 计算 Y 轴范围
    let yMin = 0;
    let yMax = 0;
    if (validData.length > 0) {
      const prices = validData.map(item => item.linkedPrice || 0);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      // 计算合适的 Y 轴范围，使数据波动更加明显
      const range = maxPrice - minPrice;
      const padding = range * 0.2; // 20% 的 padding
      // 调整到整百的数值
      yMin = Math.floor((minPrice - padding) / 100) * 100;
      yMax = Math.ceil((maxPrice + padding) / 100) * 100;
      // 确保最小值不会太小，至少为均价的 80%
      const avgBasedMin = Math.floor((linkedPriceAvg * 0.8) / 100) * 100;
      yMin = Math.max(yMin, avgBasedMin);
      // 确保最大值不会太大，至少为均价的 120%
      const avgBasedMax = Math.ceil((linkedPriceAvg * 1.2) / 100) * 100;
      yMax = Math.max(yMax, avgBasedMax);
    }
    
    // 配置选项
    return {
      title: {
        text: "",
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
          label: {
            backgroundColor: '#6a7985'
          }
        }
      },
      legend: {
        data: [category.categoryName || category.name || '含税联动价', '均价线'],
        top: 30
      },
      toolbox: {
        show: true,
        feature: {
          dataZoom: {
            yAxisIndex: 0
          },
          dataView: { readOnly: false },
          magicType: { type: ['line', 'bar'] },
          restore: {},
          saveAsImage: {}
        }
      },
      dataZoom: [
        {
          type: 'slider',
          yAxisIndex: 0,
          start: 0,
          end: 40,
          height: 20,
          bottom: 0
        }
      ],
      grid: {
        left: '3%',
        right: '4%',
        bottom: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: {
          rotate: 45,
          fontSize: 12
        }
      },
      yAxis: {
        type: 'value',
        name: '含税联动价 (元/吨)',
        min: yMin,
        max: yMax,
        interval: 100,
        axisLabel: {
          formatter: '{value}'
        }
      },
      series: [
        {
            name: category.categoryName || category.name || '含税联动价',
            type: 'line',
            data: linkedPrices,
            smooth: true,
            symbol: 'circle',
            symbolSize: 10,
            itemStyle: {
              color: '#1890ff'
            },
            lineStyle: {
              width: 4,
              color: '#1890ff'
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [{
                  offset: 0, color: 'rgba(24, 144, 255, 0.7)'
                }, {
                  offset: 1, color: 'rgba(24, 144, 255, 0.2)'
                }]
              }
            },
            label: {
              show: true,
              position: 'top',
              formatter: function(params: any) {
                return Math.round(params.value);
              },
              fontSize: 12,
              fontWeight: 'bold',
              color: '#000000'
            },
            markPoint: {
              data: [
                { type: 'max', name: '最大值', itemStyle: { color: '#ff4d4f' } },
                { type: 'min', name: '最小值', itemStyle: { color: '#52c41a' } }
              ],
              symbolSize: 60,
              label: {
                fontSize: 14,
                fontWeight: 'bold'
              }
            }
          },
        {
            name: '均价线',
            type: 'line',
            data: new Array(linkedPrices.length).fill(linkedPriceAvg),
            symbol: 'none',
            itemStyle: {
              color: '#52c41a'
            },
            lineStyle: {
              type: 'dashed',
              width: 2,
              color: '#52c41a'
            },
            markLine: {
              data: [
                {
                  type: 'average',
                  name: '均价',
                  label: {
                    position: 'end',
                    formatter: `${Math.round(linkedPriceAvg)}元/吨`
                  }
                }
              ]
            }
          }
      ]
    };
  }

  // 渲染各品类数据
  function renderGuan(start: string, end: string) {
    // 过滤日期范围
    let filtered = priceCombinations.filter(r => 
      r.date >= start && r.date <= end
    );
    
    const tbody = document.getElementById('guanTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.beijing68mm || '—'}</td><td>${r.guangzhou68mm || '—'}</td><td>${r.guangzhouHeavy || '—'}</td><td>${r.taiyuanHeavy || '—'}</td><td class="calc-cell hidden-in-page">${r.avgPrice !== '' ? Math.round(r.avgPrice) : '—'}</td><td class="calc-cell hidden-in-page">${r.freight || '—'}</td><td class="calc-cell">${r.priceChange !== '' ? (r.priceChange > 0 ? `+${Math.round(r.priceChange)}` : Math.round(r.priceChange)) : '—'}</td><td class="calc-cell">${r.linkedPrice !== '' ? Math.round(r.linkedPrice) : '—'}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avgLink = calcAverage(filtered, 'linkedPrice');
    let latest = getLatest(filtered, 'linkedPrice');
    const guanAvgLink = document.getElementById('guanAvgLink');
    const guanLatestLink = document.getElementById('guanLatestLink');
    if (guanAvgLink) guanAvgLink.innerText = avgLink ? Math.round(avgLink) : '—';
    if (guanLatestLink) guanLatestLink.innerText = latest ? Math.round(latest) : '—';
  }

  function renderHui(start: string, end: string) {
    // 过滤日期范围
    let filtered = priceCombinations.filter(r => 
      r.date >= start && r.date <= end
    );
    
    const tbody = document.getElementById('huiTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.beijingHeavy || '—'}</td><td>${r.guangzhouHeavy || '—'}</td><td>${r.taiyuanHeavy || '—'}</td><td class="calc-cell hidden-in-page">${r.avgPrice !== '' ? Math.round(r.avgPrice) : '—'}</td><td class="calc-cell">${r.priceChange !== '' ? (r.priceChange > 0 ? `+${Math.round(r.priceChange)}` : Math.round(r.priceChange)) : '—'}</td><td class="calc-cell">${r.linkedPrice !== '' ? Math.round(r.linkedPrice) : '—'}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkedPrice');
    let lat = getLatest(filtered, 'linkedPrice');
    const huiAvgLink = document.getElementById('huiAvgLink');
    const huiLatestLink = document.getElementById('huiLatestLink');
    if (huiAvgLink) huiAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (huiLatestLink) huiLatestLink.innerText = lat ? Math.round(lat) : '—';
  }

  function renderChu(start: string, end: string) {
    // 过滤日期范围
    let filtered = priceCombinations.filter(r => 
      r.date >= start && r.date <= end
    );
    
    const tbody = document.getElementById('chuTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.taiyuanHeavy || '—'}</td><td>${r.beijingHeavy || '—'}</td><td>${r.shijiazhuangHeavy || '—'}</td><td class="calc-cell hidden-in-page">${r.avgPrice !== '' ? Math.round(r.avgPrice) : '—'}</td><td class="calc-cell">${r.priceChange !== '' ? (r.priceChange > 0 ? `+${Math.round(r.priceChange)}` : Math.round(r.priceChange)) : '—'}</td><td class="calc-cell">${r.linkedPrice !== '' ? Math.round(r.linkedPrice) : '—'}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkedPrice');
    let lat = getLatest(filtered, 'linkedPrice');
    const chuAvgLink = document.getElementById('chuAvgLink');
    const chuLatestLink = document.getElementById('chuLatestLink');
    if (chuAvgLink) chuAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (chuLatestLink) chuLatestLink.innerText = lat ? Math.round(lat) : '—';
  }

  function renderPunch(start: string, end: string) {
    // 过滤日期范围
    let filtered = priceCombinations.filter(r => 
      r.date >= start && r.date <= end
    );
    
    const tbody = document.getElementById('punchTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.liaochengSteelplate || '—'}</td><td>${r.priceChange > 0 ? `+${Math.round(r.priceChange)}` : Math.round(r.priceChange)}</td><td class="calc-cell">${r.linkedPrice}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkedPrice');
    let lat = getLatest(filtered, 'linkedPrice');
    const punchAvgLink = document.getElementById('punchAvgLink');
    const punchLatestLink = document.getElementById('punchLatestLink');
    if (punchAvgLink) punchAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (punchLatestLink) punchLatestLink.innerText = lat ? Math.round(lat) : '—';
  }

  function renderSiMn(start: string, end: string) {
    // 过滤日期范围
    let filtered = priceCombinations.filter(r => 
      r.date >= start && r.date <= end
    );
    
    const tbody = document.getElementById('siMnTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.innerMongoliaSimn || '—'}</td><td>${r.priceChange > 0 ? `+${Math.round(r.priceChange)}` : Math.round(r.priceChange)}</td><td class="calc-cell">${r.linkedPrice}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkedPrice');
    let lat = getLatest(filtered, 'linkedPrice');
    const siMnAvgLink = document.getElementById('siMnAvgLink');
    const siMnLatestLink = document.getElementById('siMnLatestLink');
    if (siMnAvgLink) siMnAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (siMnLatestLink) siMnLatestLink.innerText = lat ? Math.round(lat) : '—';
  }

  function renderSiFe(start: string, end: string) {
    // 过滤日期范围
    let filtered = priceCombinations.filter(r => 
      r.date >= start && r.date <= end
    );
    
    const tbody = document.getElementById('siFeTbody');
    if (tbody) {
      tbody.innerHTML = '';
      filtered.forEach((r: any) => {
        let tr = document.createElement('tr');
        tr.innerHTML = `<td>${r.date}</td><td>${r.ningxiaSife || '—'}</td><td>${r.gansuSife || '—'}</td><td>${r.avgPrice}</td><td>${r.priceChange > 0 ? `+${Math.round(r.priceChange)}` : Math.round(r.priceChange)}</td><td class="calc-cell">${r.linkedPrice}</td>`;
        tbody.appendChild(tr);
      });
    }
    let avg = calcAverage(filtered, 'linkedPrice');
    let lat = getLatest(filtered, 'linkedPrice');
    const siFeAvgLink = document.getElementById('siFeAvgLink');
    const siFeLatestLink = document.getElementById('siFeLatestLink');
    if (siFeAvgLink) siFeAvgLink.innerText = avg ? Math.round(avg) : '—';
    if (siFeLatestLink) siFeLatestLink.innerText = lat ? Math.round(lat) : '—';
  }

  // 应用日期范围
  function applyDateRange() {
    if (startDate > endDate) {
      alert('开始日期不能晚于结束日期');
      return;
    }
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
    // 添加请求锁，防止重复请求
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await updateSummary();
        await fetchMaterialDicts();
      }
    };
    init();
    return () => {
      isMounted = false;
    };
  }, []);
  
  // 获取物料字典数据
  async function fetchMaterialDicts() {
    try {
      const response = await request.get('/api/material-dicts/tree');
      let dictData = Array.isArray(response) ? response : [];
      
      // 按照指定顺序排序：罐子料、冲子料、除锈二级、灰铁废铸件、硅铁、内蒙硅锰
      const sortOrder = [
        'jar_material',      // 罐子料
        'punching_scrap',    // 冲子料
        'rust_removal_2',    // 除锈二级
        'gray_iron_cast',    // 灰铁废铸件
        'ferrosilicon',      // 硅铁
        'silicon_manganese'  // 内蒙硅锰
      ];
      
      dictData.sort((a, b) => {
        const aIndex = sortOrder.indexOf(a.categoryCode || a.code);
        const bIndex = sortOrder.indexOf(b.categoryCode || b.code);
        return aIndex - bIndex;
      });
      
      setMaterialDicts(dictData);
      // 默认选中第一个选项卡
      if (dictData.length > 0) {
        setSelectedTab(dictData[0].categoryCode || dictData[0].code || 'guanyu');
      }
    } catch (error) {
      console.error('Error fetching material dicts:', error);
    }
  }
  
  // 获取价格组合数据
  async function fetchPriceCombinations() {
    try {
      const response = await request.get('/api/price-combination/list', {
        startDate,
        endDate,
        categoryCode: selectedTab
      });
      setPriceCombinations(response || []);
    } catch (error) {
      console.error('Error fetching price combinations:', error);
    }
  }

  // 日期范围变化时重新渲染
  useEffect(() => {
    if (currentPage === 'details') {
      fetchPriceCombinations();
      applyDateRange();
    }
  }, [startDate, endDate, currentPage, selectedTab]);

  // 标签切换时重新渲染图表
  useEffect(() => {
    if (currentPage === 'details') {
      applyDateRange();
    }
  }, [selectedTab, currentPage]);

  return (
    <div>
      {/* 引入XLSX库 */}
      <script src="https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js"></script>

      {/* 汇总页面 */}
      {currentPage === 'summary' && (
        <div className="container">
          <div className="card">
            <h1>📊 联动价格汇总表</h1>
            <div className="sub">
              含税参考价（元/吨）
              <br />
              当月联动均价（{currentMonthRange}）
              <br />
              当日价格（最新日）
            </div>
            <div className="toolbar">
              <button className="export-btn" onClick={exportToExcel}>📎 导出 Excel</button>
            </div>

            <table className="summary-table" id="summaryTable">
              <thead>
                <tr><th>料型</th><th>当日价格</th><th>当月联动均价</th></tr>
              </thead>
              <tbody>
                <tr><td>罐子料</td><td className="price-value">{summaryData.gunLatest.toFixed(2)}</td><td>{summaryData.gunAvg.toFixed(2)}</td></tr>
                <tr><td>灰铁废铸件</td><td className="price-value">{summaryData.huiLatest.toFixed(2)}</td><td>{summaryData.huiAvg.toFixed(2)}</td></tr>
                <tr><td>除锈二级</td><td className="price-value">{summaryData.chuLatest.toFixed(2)}</td><td>{summaryData.chuAvg.toFixed(2)}</td></tr>
                <tr><td>冲子料</td><td className="price-value">{summaryData.gbLatest.toFixed(2)}</td><td>{summaryData.gbAvg.toFixed(2)}</td></tr>
                <tr><td>硅锰合金</td><td className="price-value">{summaryData.gmLatest.toFixed(2)}</td><td>{summaryData.gmAvg.toFixed(2)}</td></tr>
                <tr><td>硅铁</td><td className="price-value">{summaryData.gtLatest.toFixed(2)}</td><td>{summaryData.gtAvg.toFixed(2)}</td></tr>
              </tbody>
            </table>

            <div className="btn-group">
              <button className="btn-detail" onClick={handleNavigateToDetails}>✏️ 查看/编辑明细数据</button>
            </div>
          </div>
        </div>
      )}

      {/* 明细页面 */}
      {currentPage === 'details' && (
        <div className="container">
          {/* 导航栏 */}
          <Card className="mb-4">
            <div className="d-flex justify-content-start">
              <Button type="primary" onClick={handleNavigateToSummary}>← 返回汇总表</Button>
            </div>
          </Card>

          {/* 日期范围选项卡 */}
          <Card className="mb-4">
            <div className="date-tabs">
              <Space size="middle">
                <span>📅 开始日期：</span>
                <select 
                  className="date-select" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                >
                  {dateList.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </Space>
              <Space size="middle">
                <span>📅 结束日期：</span>
                <select 
                  className="date-select" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                >
                  {dateList.map(date => (
                    <option key={date} value={date}>{date}</option>
                  ))}
                </select>
              </Space>
            </div>
          </Card>

          {/* 6大品类选项卡 */}
          <Card className="mb-4">
            <Tabs 
              activeKey={selectedTab} 
              onChange={setSelectedTab}
              type="card"
              className="w-100"
              items={materialDicts.length > 0 ? materialDicts.map((dict, index) => {
                const tabKey = dict.categoryCode || dict.code || index.toString();
                return {
                  key: tabKey,
                  label: (
                    <span>
                      {dict.icon || ''} {dict.categoryName || dict.name}
                    </span>
                  ),
                  children: (
                    <div className="sheet-section">
                      <div className="sheet-title">{dict.icon || ''} {dict.categoryName || dict.name}</div>
                      <Card className="mb-4">
                        <div style={{ height: '400px', width: '100%' }}>
                          {priceCombinations.length > 0 ? (
                            <ReactECharts 
                              option={getChartOption(dict)} 
                              style={{ width: '100%', height: '100%' }} 
                            />
                          ) : (
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              加载中...
                            </div>
                          )}
                        </div>
                      </Card>
                      <Card className="mb-4">
                        <div className="stat-row">
                          <Space size="large">
                            <div className="avg-stat">📊 含税均价：<span>{calculateAverageLinkedPrice()}</span> 元/吨</div>
                            <div className="latest-stat">📌 最新含税价：<span>{getLatestLinkedPrice()}</span> 元/吨</div>
                          </Space>
                        </div>
                      </Card>
                      <Card className="mb-4">
                        <div className="table-wrapper">
                          <table className="data-table">
                            <thead>
                              <tr>
                                {getTableHeaders().map(header => (
                                  <th key={header.key} className={header.className}>
                                    {header.label}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {renderTableData()}
                            </tbody>
                          </table>
                        </div>
                      </Card>
                    </div>
                  )
                };
              }) : [{
                key: 'loading',
                label: '加载中',
                children: (
                  <div className="loading-container">
                    <p>加载中...</p>
                  </div>
                )
              }]}
            />
          </Card>
        </div>
      )}
    </div>
  );
};

export default LinkageDashboard;