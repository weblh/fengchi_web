import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { ReceivablesBarChart } from '../../components/charts/ReceivablesBarChart';

import request from '../../utils/request';

// 辅助函数
function toWanFixed(yuan) { return (yuan / 10000).toFixed(2); }
function toWanInt(yuan) { return Math.round(yuan / 10000); }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function monthWeekStr() {
  const d = new Date();
  return `${d.getMonth()+1}月 第${Math.ceil(d.getDate()/7)}周`;
}

const elementKeys = ["C", "Si", "Mn", "P", "S", "Cu", "Cr", "Ni", "Mo", "Ti", "Al", "V", "B", "Sn"];

const claimAttachmentMap = {
  "claim1.png": "./claim-files/claim1.png",
  "claim1.docx": "./claim-files/claim1.docx",
  "claim2.png": "./claim-files/claim2.png",
  "claim2.docx": "./claim-files/claim2.docx",
  "claim3.png": "./claim-files/claim3.png",
  "claim3.docx": "./claim-files/claim3.docx",
  "claim4.png": "./claim-files/claim4.png",
  "claim4.docx": "./claim-files/claim4.docx",
  "claim5.png": "./claim-files/claim5.png",
  "claim5.docx": "./claim-files/claim5.docx",
  "1-除锈废钢-除锈二级.png": "./chem-files/img10_chuxiuerji.png",
  "2-低锰压块-低锰压块.png": "./chem-files/img7_dimengyakuai.png",
  "3-中锰边丝-中锰边丝.png": "./chem-files/img9_zhongmangbiansi.png",
  "4-中锰散料-中锰散料.png": "./chem-files/img6_zhongmangsanliao.png",
  "5-高锰压块-高锰压块.png": "./chem-files/img8_gaomengyakuai.png",
  "6-含铜废钢（球铁用）-含铜废钢.png": "./chem-files/img3_hantongfeigang.png",
  "7-罐子料-罐子料.png": "./chem-files/img4_guanziliao.png",
  "8-废铸件-含镍废钢.png": "./chem-files/img1_feizhujian.png",
  "9-含镍废钢（合金用）-废铸件.jpg": "./chem-files/img2_hanniefeigang.png"
};

// 数据接口定义
interface SalesPlanItem {
  id: number;
  month: string;
  planQty: number;
  actualQty: number;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface MaterialPlanItem {
  id: number;
  materialName: string;
  planQty: number;
  actualQty: number;
  month: string;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface InventoryItem {
  id: number;
  materialName: string;
  qualifiedQty: number;
  unqualifiedQty: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface Order {
  id: number;
  contractNo: string;
  company: string;
  customer: string;
  material: string;
  signDate: string;
  termDays: number;
  contractQty: number;
  unitPrice: number;
  payType: string;
  executePeriod: string;
  receivedQty: number;
  remainingQty: number;
  remark: string;
  orderStatus: string;
  orderAmount: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface SupplierMonthlyTonnageItem {
  id: number;
  supplierName: string;
  materialType: string;
  month1Qty: number;
  month1Ratio: number;
  month2Qty: number;
  month2Ratio: number;
  month3Qty: number;
  month3Ratio: number;
  totalQty: number;
  totalRatio: number;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface QualityClaimItem {
  id: number;
  claimDate: string;
  workshop: string;
  material: string;
  reason: string;
  amount: number;
  attachments: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface SteelChemicalCompositionItem {
  id: number;
  materialName: string;
  c: string;
  si: string;
  mn: string;
  p: string;
  s: string;
  cu: string;
  cr: string;
  ni: string;
  mo: string;
  ti: string;
  al: string;
  v: string;
  b: string;
  sn: string;
  shelfLife: string;
  materialImg: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface ReceivableData {
  companies: string[];
  companySpotBookValues: number[];
  companyAcceptBookValues: number[];
  companySpotOverdueValues: number[];
  companyAcceptOverdueValues: number[];
  totalBook: number;
  totalOverdue: number;
}

// 主组件
const SalesDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'primary' | 'element' | 'claim' | 'chart' | 'inventory' | 'receivable'>('primary');
  const [chartType, setChartType] = useState<'monthly' | 'material'>('monthly');
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeReceivableTab, setActiveReceivableTab] = useState('fengchi');
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // 数据状态管理
  const [salesPlans, setSalesPlans] = useState<SalesPlanItem[]>([]);
  const [materialPlans, setMaterialPlans] = useState<MaterialPlanItem[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplierMonthlyTonnages, setSupplierMonthlyTonnages] = useState<SupplierMonthlyTonnageItem[]>([]);
  const [qualityClaims, setQualityClaims] = useState<QualityClaimItem[]>([]);
  const [steelChemicalCompositions, setSteelChemicalCompositions] = useState<SteelChemicalCompositionItem[]>([]);
  const [receivableData, setReceivableData] = useState<ReceivableData>({
    companies: ['丰驰', '昌泽', '耀通'],
    companySpotBookValues: [0, 0, 0],
    companyAcceptBookValues: [0, 0, 0],
    companySpotOverdueValues: [0, 0, 0],
    companyAcceptOverdueValues: [0, 0, 0],
    totalBook: 0,
    totalOverdue: 0
  });
  const [loading, setLoading] = useState<boolean>(false);
  
  const totalClaim = qualityClaims.reduce((sum, claim) => sum + claim.amount, 0);

  // 切换全屏
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (dashboardRef.current) {
        if (dashboardRef.current.requestFullscreen) {
          dashboardRef.current.requestFullscreen();
        } else if (dashboardRef.current.webkitRequestFullscreen) {
          dashboardRef.current.webkitRequestFullscreen();
        } else if (dashboardRef.current.msRequestFullscreen) {
          dashboardRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 数据获取函数
  const fetchSalesPlans = async () => {
    try {
      setLoading(true);
      const data = await request.get<SalesPlanItem[]>('/api/sales-plan/list');
      console.log('获取到的年度销量计划数据:', data);
      setSalesPlans(data);
    } catch (error) {
      console.error('获取年度销量计划列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialPlans = async () => {
    try {
      setLoading(true);
      const data = await request.get<MaterialPlanItem[]>('/api/material-plan/list');
      setMaterialPlans(data);
    } catch (error) {
      console.error('获取物料计划列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const data = await request.get<InventoryItem[]>('/api/inventory/list');
      setInventories(data);
    } catch (error) {
      console.error('获取库存列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await request.get<Order[]>('/api/orders/list');
      setOrders(data);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierMonthlyTonnages = async () => {
    try {
      setLoading(true);
      const data = await request.get<SupplierMonthlyTonnageItem[]>('/api/supplier-monthly-tonnage/list');
      setSupplierMonthlyTonnages(data);
    } catch (error) {
      console.error('获取供应商月度吨位列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQualityClaims = async () => {
    try {
      setLoading(true);
      const data = await request.get<QualityClaimItem[]>('/api/quality-claim/list');
      setQualityClaims(data);
    } catch (error) {
      console.error('获取质量索赔列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSteelChemicalCompositions = async () => {
    try {
      setLoading(true);
      const data = await request.get<SteelChemicalCompositionItem[]>('/api/steel-chemical-composition/list');
      setSteelChemicalCompositions(data);
    } catch (error) {
      console.error('获取废钢化学成分列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivableData = async () => {
    try {
      setLoading(true);
      // 从API获取应收账款数据
      const response = await request.get<any>('/api/receivable/list');
      console.log('获取到的应收账款数据:', response);
      
      // 检查数据结构，处理不同的返回格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
        console.log('使用嵌套的data字段:', data);
      }
      
      // 检查数据结构
      console.log('数据结构检查:', {
        hasCompanies: 'companies' in data,
        hasSpotBookValues: 'companySpotBookValues' in data,
        hasAcceptBookValues: 'companyAcceptBookValues' in data,
        hasSpotOverdueValues: 'companySpotOverdueValues' in data,
        hasAcceptOverdueValues: 'companyAcceptOverdueValues' in data,
        hasTotalBook: 'totalBook' in data,
        hasTotalOverdue: 'totalOverdue' in data
      });
      
      // 确保数据结构完整
      let receivableData = {
        companies: data.companies || [],
        companySpotBookValues: data.companySpotBookValues || [],
        companyAcceptBookValues: data.companyAcceptBookValues || [],
        companySpotOverdueValues: data.companySpotOverdueValues || [],
        companyAcceptOverdueValues: data.companyAcceptOverdueValues || [],
        totalBook: data.totalBook || 0,
        totalOverdue: data.totalOverdue || 0
      };
      
      // 如果数据为空，使用默认数据
      if (receivableData.companies.length === 0) {
        console.log('使用默认应收账款数据');
        receivableData = {
          companies: ['丰驰', '昌泽', '耀通'],
          companySpotBookValues: [1734006.43 + 184850.00, 6997432.91 + 1345528.68, 720138.72],
          companyAcceptBookValues: [4242982.25 + 480791.13, 3915134.63 + 3344433.40, 12110727.41 + 1552166.71],
          companySpotOverdueValues: [1734006.43 + 0, 2911375.36 + 630416.864, 720138.72],
          companyAcceptOverdueValues: [3119605.32 + 384632.904, 1694539.00 + 1487460.480, 4675748.976 + 1241733.368],
          totalBook: (1734006.43 + 184850.00 + 4242982.25 + 480791.13) + (6997432.91 + 1345528.68 + 3915134.63 + 3344433.40) + (720138.72 + 12110727.41 + 1552166.71),
          totalOverdue: (1734006.43 + 0 + 3119605.32 + 384632.904) + (2911375.36 + 630416.864 + 1694539.00 + 1487460.480) + (720138.72 + 4675748.976 + 1241733.368)
        };
      }
      
      console.log('最终设置的应收账款数据:', receivableData);
      setReceivableData(receivableData);
    } catch (error) {
      console.error('获取应收账款数据失败:', error);
      // 如果API调用失败，使用默认数据
      console.log('使用默认应收账款数据');
      setReceivableData({
        companies: ['丰驰', '昌泽', '耀通'],
        companySpotBookValues: [1734006.43 + 184850.00, 6997432.91 + 1345528.68, 720138.72],
        companyAcceptBookValues: [4242982.25 + 480791.13, 3915134.63 + 3344433.40, 12110727.41 + 1552166.71],
        companySpotOverdueValues: [1734006.43 + 0, 2911375.36 + 630416.864, 720138.72],
        companyAcceptOverdueValues: [3119605.32 + 384632.904, 1694539.00 + 1487460.480, 4675748.976 + 1241733.368],
        totalBook: (1734006.43 + 184850.00 + 4242982.25 + 480791.13) + (6997432.91 + 1345528.68 + 3915134.63 + 3344433.40) + (720138.72 + 12110727.41 + 1552166.71),
        totalOverdue: (1734006.43 + 0 + 3119605.32 + 384632.904) + (2911375.36 + 630416.864 + 1694539.00 + 1487460.480) + (720138.72 + 4675748.976 + 1241733.368)
      });
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时获取数据
  useEffect(() => {
    fetchSalesPlans();
    fetchMaterialPlans();
    fetchInventories();
    fetchOrders();
    fetchSupplierMonthlyTonnages();
    fetchQualityClaims();
    fetchSteelChemicalCompositions();
    fetchReceivableData();
  }, []);

  // 计算年度销量计划和实际销量
  const yearTotalPlan = salesPlans.reduce((sum, plan) => sum + plan.planQty, 0);
  const yearTotalActual = salesPlans.reduce((sum, plan) => sum + plan.actualQty, 0);
  const yearCompletion = yearTotalPlan > 0 ? (yearTotalActual / yearTotalPlan) * 100 : 0;

  // 计算3月销量计划和实际销量
  const marPlan = salesPlans.find(plan => plan.month === '3月');
  const marTotalPlan = marPlan ? marPlan.planQty : 0;
  const marTotalActual = marPlan ? marPlan.actualQty : 0;
  const marCompletion = marTotalPlan > 0 ? (marTotalActual / marTotalPlan) * 100 : 0;

  // 环形图配置
  const yearRingOption = {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}: ${params.value.toFixed(1)}%<br/>计划销量: ${yearTotalPlan.toLocaleString()}<br/>实际销量: ${yearTotalActual.toLocaleString()}`;
      }
    },
    series: [{
      type: 'pie',
      radius: ['65%', '85%'],
      silent: false,
      label: {
        show: true,
        position: 'center',
        formatter: `${yearCompletion.toFixed(1)}%`,
        fontSize: 20,
        fontWeight: 'bold'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: yearCompletion, name: '完成', itemStyle: { color: '#3b82f6' } },
        { value: 100 - yearCompletion, name: '未完成', itemStyle: { color: '#e2e8f0' } }
      ]
    }]
  };

  const marRingOption = {
    tooltip: {
      trigger: 'item',
      formatter: function(params: any) {
        return `${params.name}: ${params.value.toFixed(1)}%<br/>计划销量: ${marTotalPlan.toLocaleString()}<br/>实际销量: ${marTotalActual.toLocaleString()}`;
      }
    },
    series: [{
      type: 'pie',
      radius: ['65%', '85%'],
      silent: false,
      label: {
        show: true,
        position: 'center',
        formatter: `${marCompletion.toFixed(1)}%`,
        fontSize: 20,
        fontWeight: 'bold'
      },
      labelLine: {
        show: false
      },
      data: [
        { value: marCompletion, name: '完成', itemStyle: { color: '#3b82f6' } },
        { value: 100 - marCompletion, name: '未完成', itemStyle: { color: '#e2e8f0' } }
      ]
    }]
  };

  // 库存图表配置
  const mainInventoryOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['合格(吨)', '不合格(吨)'] },
    xAxis: { 
      type: 'category', 
      data: inventories.map(i => i.materialName), 
      axisLabel: { rotate: 35, fontSize: 8, interval: 0 }
    },
    yAxis: { type: 'value', name: '吨' },
    series: [
      { 
        name: '合格', 
        type: 'bar', 
        data: inventories.map(i => i.qualifiedQty), 
        color: '#10b981',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: '{c}'
        }
      },
      { 
        name: '不合格', 
        type: 'bar', 
        data: inventories.map(i => i.unqualifiedQty), 
        color: '#f97316',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: '{c}'
        }
      }
    ]
  };

  // 二级图表配置
  const monthlyChartOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['计划销量', '实际销量'],
      textStyle: { fontSize: 14 }
    },
    grid: { left: '6%', right: '4%', top: 56, bottom: 52, containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLabel: { fontSize: 13, interval: 0 }
    },
    yAxis: { type: 'value', axisLabel: { fontSize: 13 } },
    series: [
      {
        name: '计划销量',
        type: 'bar',
        data: Array.from({ length: 12 }, (_, i) => {
          const monthNum = i + 1;
          const month = monthNum.toString();
          const plan = salesPlans.find(p => p.month === `${month}月`);
          return plan ? plan.planQty : 0;
        }),
        color: '#3b82f6',
        barWidth: 22,
        barCategoryGap: '30%',
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          formatter: '{c}'
        }
      },
      {
        name: '实际销量',
        type: 'bar',
        data: Array.from({ length: 12 }, (_, i) => {
          const monthNum = i + 1;
          const month = monthNum.toString();
          const plan = salesPlans.find(p => p.month === `${month}月`);
          return plan ? plan.actualQty : 0;
        }),
        color: '#f97316',
        barWidth: 22,
        label: {
          show: true,
          position: 'top',
          fontSize: 12,
          formatter: '{c}'
        }
      }
    ]
  };

  // 按物料名称分组物料计划数据
  const materialMap = new Map<string, { planQty: number; actualQty: number }>();
  materialPlans.forEach(plan => {
    if (!materialMap.has(plan.materialName)) {
      materialMap.set(plan.materialName, { planQty: 0, actualQty: 0 });
    }
    const current = materialMap.get(plan.materialName)!;
    materialMap.set(plan.materialName, {
      planQty: current.planQty + plan.planQty,
      actualQty: current.actualQty + plan.actualQty
    });
  });

  const materialChartOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['计划销量', '实际销量'],
      textStyle: { fontSize: 14 }
    },
    grid: { left: '6%', right: '4%', top: 56, bottom: 90, containLabel: true },
    xAxis: {
      type: 'category',
      data: Array.from(materialMap.keys()),
      axisLabel: { rotate: 45, fontSize: 12, interval: 0 }
    },
    yAxis: { type: 'value', axisLabel: { fontSize: 12 } },
    series: [
      {
        name: '计划销量',
        type: 'bar',
        data: Array.from(materialMap.values()).map(item => item.planQty),
        color: '#3b82f6',
        barWidth: 16,
        barCategoryGap: '30%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: '{c}'
        }
      },
      {
        name: '实际销量',
        type: 'bar',
        data: Array.from(materialMap.values()).map(item => item.actualQty),
        color: '#ef4444',
        barWidth: 16,
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: '{c}'
        }
      }
    ]
  };

  // 料型成分饼图配置
  const getHarvestPieOption = (materialIndex: number) => {
    const item = steelChemicalCompositions[materialIndex];
    if (!item) return {};
    
    const pieData = elementKeys.map(k => {
      const raw = item[k.toLowerCase() as keyof SteelChemicalCompositionItem];
      const value = parseElementUpperBound(raw as string);
      return { name: k, value: value ?? 0, raw: raw || '——' };
    }).filter(d => d.value > 0);

    return {
      legend: {
        type: 'scroll',
        bottom: 0,
        textStyle: { fontSize: 9 },
        formatter: (name: string) => {
          const d = pieData.find(x => x.name === name);
          return d ? `${name}:${d.raw}` : name;
        }
      },
      tooltip: {
        trigger: 'item',
        formatter: ({ name: elName, data, percent }: any) =>
          `${item.materialName}<br/>${elName}: ${data.raw}<br/>占比: ${percent}%`
      },
      series: [{
        type: 'pie',
        radius: ['30%', '64%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        label: {
          show: true,
          formatter: '{b} {d}%',
          fontSize: 8
        },
        labelLine: { show: true, length: 8, length2: 6 },
        data: pieData
      }]
    };
  };

  // 应收账款详情图表配置
  const getReceivableDetailOption = (tab: string) => {
    // 由于我们已经使用了ReceivablesBarChart组件，这里可以简化处理
    return {};
  };

  // 库存图表配置（更新）
  const inventoryOption = {
    title: {
      text: '库存对比 (合格/不合格) 吨',
      left: '2%',
      top: 4,
      textStyle: {
        fontSize: 30,
        fontWeight: 700,
        color: '#0f172a'
      }
    },
    grid: {
      left: '4%',
      right: '3%',
      top: 92,
      bottom: 70,
      containLabel: true
    },
    tooltip: { 
      trigger: 'axis',
      formatter: function(params: any) {
        const item = inventories[params[0].dataIndex];
        let result = `${item.materialName}<br/>`;
        params.forEach((param: any) => {
          const value = param.value;
          const total = item.qualifiedQty + item.unqualifiedQty;
          const percent = total > 0 ? (value / total * 100).toFixed(1) : 0;
          result += `${param.seriesName}: ${value.toLocaleString()} 吨 (${percent}%)<br/>`;
        });
        result += `总库存: ${(item.qualifiedQty + item.unqualifiedQty).toLocaleString()} 吨`;
        return result;
      }
    }, 
    legend: { 
      data:['合格(吨)','不合格(吨)'],
      top: 30,
      left: 'center',
      itemWidth: 22,
      itemHeight: 14,
      textStyle: {
        fontSize: 22,
        color: '#1f2937'
      }
    }, 
    xAxis: { 
      type: 'category', 
      data: inventories.map(i=>i.materialName), 
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#94a3b8', width: 1.5 } },
      axisLabel: {
        rotate: 28,
        fontSize: 14,
        interval: 0,
        margin: 12,
        color: '#374151'
      } 
    }, 
    yAxis: {
      type: 'value',
      name: '',
      axisLabel: { fontSize: 18, color: '#4b5563' },
      splitLine: { lineStyle: { color: '#e5e7eb', width: 1.4 } }
    }, 
    series: [
      { 
        name:'合格(吨)', 
        type:'bar', 
        data: inventories.map(i=>i.qualifiedQty), 
        color:'#10b981',
        stack: '库存',
        barWidth: '74%',
        barCategoryGap: '4%',
        clip: true,
        label: {
          show: true,
          position: 'inside',
          overflow: 'truncate',
          formatter: function(params: any) {
            return params.value > 0 ? `${params.value.toLocaleString()}吨` : '';
          },
          fontSize: 12,
          color: '#fff'
        }
      }, 
      { 
        name:'不合格(吨)', 
        type:'bar', 
        data: inventories.map(i=>i.unqualifiedQty), 
        color:'#f97316',
        stack: '库存',
        barWidth: '74%',
        barCategoryGap: '4%',
        clip: true,
        label: {
          show: true,
          position: 'inside',
          overflow: 'truncate',
          formatter: function(params: any) {
            const item = inventories[params.dataIndex];
            if (item.unqualifiedQty > 0) {
              const total = item.qualifiedQty + item.unqualifiedQty;
              const percent = total > 0 ? (item.unqualifiedQty / total * 100).toFixed(1) : 0;
              return `${percent}%\n(${params.value.toLocaleString()}吨)`;
            } else {
              return '';
            }
          },
          fontSize: 12,
          color: '#fff'
        }
      }
    ] 
  };

  // 辅助函数
  function parseElementUpperBound(raw: string) {
    if (!raw || raw.includes('——')) return null;
    const numericMatches = raw.match(/\d+(\.\d+)?/g);
    if (!numericMatches || !numericMatches.length) return null;
    const nums = numericMatches.map(Number).filter(n => !Number.isNaN(n));
    if (!nums.length) return null;
    return Math.max(...nums);
  }

  function showImagePreview(fileName: string) {
    setModalImage(fileName);
    setShowModal(true);
  }

  function openClaimAttachment(fileName: string) {
    const mappedFile = claimAttachmentMap[fileName] || fileName;
    const isImage = /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(mappedFile);
    if (isImage) {
      showImagePreview(fileName);
      return;
    }
    window.open(mappedFile, '_blank');
  }

  // 渲染主视图
  const renderPrimaryView = () => (
    <div className="view view-primary">
      <div style={{ display: 'flex', justifyContent: 'flex-end'}}>
        <button 
          onClick={toggleFullscreen}
          style={{
            background: 'rgba(47, 115, 255, 0.1)',
            border: '1px solid rgba(47, 115, 255, 0.3)',
            borderRadius: '32px',
            padding: '6px 16px',
            fontSize: '0.8rem',
            fontWeight: '600',
            color: '#2f73ff',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#2f73ff';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.borderColor = '#2f73ff';
            e.currentTarget.style.boxShadow = '0 4px 10px rgba(47,115,255,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(47, 115, 255, 0.1)';
            e.currentTarget.style.color = '#2f73ff';
            e.currentTarget.style.borderColor = 'rgba(47, 115, 255, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <i className={isFullscreen ? "fas fa-compress" : "fas fa-expand"}></i> {isFullscreen ? '退出全屏' : '全屏'}
        </button>
      </div>
      <div className="dashboard-row">
        <div className="card-item" id="cardYearRing" onClick={() => {
          setChartType('monthly');
          setActiveView('chart');
        }}>
          <div className="card-header">
            <h3><i className="fas fa-chart-simple"></i> 年度总销量进度</h3>
            <i className="fas fa-chevron-circle-right"></i>
          </div>
          <div className="ring-chart">
            <ReactECharts option={yearRingOption} style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="ring-amount-info">
            📊 计划销量: {yearTotalPlan.toLocaleString()}  |  实际销量: {yearTotalActual.toLocaleString()}
          </div>
        </div>

        <div className="card-item" id="cardMarRing" onClick={() => {
          setChartType('material');
          setActiveView('chart');
        }}>
          <div className="card-header">
            <h3><i className="fas fa-calendar-alt"></i> 3月计划完成进度</h3>
            <i className="fas fa-chevron-circle-right"></i>
          </div>
          <div className="ring-chart">
            <ReactECharts option={marRingOption} style={{ width: '100%', height: '100%' }} />
          </div>
          <div className="ring-amount-info">
            📊 计划销量: {marTotalPlan.toLocaleString()}  |  实际销量: {marTotalActual.toLocaleString()}
          </div>
        </div>

        <div className="pie-card" style={{ gridColumn: 'span 2' }} id="cardReceivableMain" onClick={() => setActiveView('receivable')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ margin: '0' }}>📊 应收账款·账面vs逾期(万元)</h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="mini-kpi">
                <div className="kpi-title" style={{ fontSize: '0.7rem' }}>账面应收</div>
                <div className="kpi-value" style={{ fontSize: '1rem' }}>¥ {toWanInt(receivableData.totalBook).toLocaleString()} 万</div>
              </div>
              <div className="mini-kpi">
                <div className="kpi-title" style={{ fontSize: '0.7rem' }}>逾期</div>
                <div className="kpi-value" style={{ fontSize: '1rem', color: '#ef4444' }}>¥ {toWanInt(receivableData.totalOverdue).toLocaleString()} 万</div>
              </div>
              <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
            </div>
          </div>
          <div className="pie-chart">
            {console.log('传递给ReceivablesBarChart的数据:', {
              companies: receivableData.companies || [],
              spotBookValues: (receivableData.companySpotBookValues || []).map(v => toWanInt(v)),
              acceptBookValues: (receivableData.companyAcceptBookValues || []).map(v => toWanInt(v)),
              spotOverdueValues: (receivableData.companySpotOverdueValues || []).map(v => toWanInt(v)),
              acceptOverdueValues: (receivableData.companyAcceptOverdueValues || []).map(v => toWanInt(v))
            })}
            <ReceivablesBarChart 
              companies={receivableData.companies || []} 
              spotBookValues={(receivableData.companySpotBookValues || []).map(v => toWanInt(v))} 
              acceptBookValues={(receivableData.companyAcceptBookValues || []).map(v => toWanInt(v))} 
              spotOverdueValues={(receivableData.companySpotOverdueValues || []).map(v => toWanInt(v))} 
              acceptOverdueValues={(receivableData.companyAcceptOverdueValues || []).map(v => toWanInt(v))} 
            />
          </div>
        </div>


      </div>

      <div className="bottom-grid">
        <div className="inventory-panel" onClick={() => setActiveView('inventory')}>
          <h4><i className="fas fa-boxes"></i> 库存对比 (合格/不合格) 吨</h4>
          <div id="inventoryChart" className="inventory-chart">
            <ReactECharts option={mainInventoryOption} style={{ width: '100%', height: '100%' }} />
          </div>
        </div>

        <div className="order-panel">
          <div className="table-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div className="table-title"><i className="fas fa-file-invoice"></i> 订单明细</div>
              <div className="mini-metric-card" id="claimAmountCard" onClick={() => setActiveView('claim')}>
                <div className="mini-metric-title"><i className="fas fa-file-invoice-dollar"></i> 质量索赔总金额</div>
                <div className="mini-metric-value" id="totalClaimAmount">¥{totalClaim.toLocaleString()}</div>
              </div>
            </div>
            <table className="element-table" id="orderTable">
              <thead>
                <tr>
                  <th>合同编号</th>
                  <th>公司</th>
                  <th>客户</th>
                  <th>物料名称</th>
                  <th>签订时间</th>
                  <th>期限天数</th>
                  <th>合同数量</th>
                  <th>单价</th>
                  <th>付款方式</th>
                  <th>执行时段</th>
                  <th>回货吨数</th>
                  <th>剩余吨数</th>
                  <th>备注</th>
                  <th>订单状态</th>
                  <th>订单金额</th>
                </tr>
              </thead>
              <tbody id="orderTbody">
                {orders.map((order, idx) => (
                  <tr key={order.id}>
                    <td>{order.contractNo}</td>
                    <td>{order.company}</td>
                    <td>{order.customer}</td>
                    <td>{order.material}</td>
                    <td>{order.signDate}</td>
                    <td>{order.termDays}</td>
                    <td>{order.contractQty}</td>
                    <td>{order.unitPrice}</td>
                    <td>{order.payType}</td>
                    <td>{order.executePeriod}</td>
                    <td>{order.receivedQty}</td>
                    <td>{order.remainingQty}</td>
                    <td>{order.remark}</td>
                    <td>{order.orderStatus}</td>
                    <td>{order.orderAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="supplier-summary-panel">
        <div className="supplier-summary-head"><i className="fas fa-table"></i> 供应商月度吨位占比</div>
        <div className="supplier-summary-wrap">
          <table className="supplier-summary-table">
            <thead>
              <tr>
                <th rowSpan={2}>供应商</th>
                <th rowSpan={2}>类型</th>
                <th colSpan={2}>1月</th>
                <th colSpan={2}>2月</th>
                <th colSpan={2}>3月</th>
                <th colSpan={2}>合计</th>
              </tr>
              <tr>
                <th>吨位</th><th>占比</th>
                <th>吨位</th><th>占比</th>
                <th>吨位</th><th>占比</th>
                <th>吨位</th><th>占比</th>
              </tr>
            </thead>
            <tbody>
              {supplierMonthlyTonnages.map((item, index) => (
                <tr key={item.id}>
                  <td>{item.supplierName}</td>
                  <td>{item.materialType}</td>
                  <td>{item.month1Qty.toLocaleString()}</td>
                  <td>{item.month1Ratio.toFixed(2)}%</td>
                  <td>{item.month2Qty.toLocaleString()}</td>
                  <td>{item.month2Ratio.toFixed(2)}%</td>
                  <td>{item.month3Qty.toLocaleString()}</td>
                  <td>{item.month3Ratio.toFixed(2)}%</td>
                  <td>{item.totalQty.toLocaleString()}</td>
                  <td>{item.totalRatio.toFixed(2)}%</td>
                </tr>
              ))}
              {supplierMonthlyTonnages.length > 0 && (
                <tr>
                  <td><b>合计</b></td>
                  <td></td>
                  <td><b>{supplierMonthlyTonnages.reduce((sum, item) => sum + item.month1Qty, 0).toLocaleString()}</b></td>
                  <td><b>100.00%</b></td>
                  <td><b>{supplierMonthlyTonnages.reduce((sum, item) => sum + item.month2Qty, 0).toLocaleString()}</b></td>
                  <td><b>100.00%</b></td>
                  <td><b>{supplierMonthlyTonnages.reduce((sum, item) => sum + item.month3Qty, 0).toLocaleString()}</b></td>
                  <td><b>100.00%</b></td>
                  <td><b>{supplierMonthlyTonnages.reduce((sum, item) => sum + item.totalQty, 0).toLocaleString()}</b></td>
                  <td><b>100.00%</b></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // 渲染元素详情视图
  const renderElementView = () => (
    <div id="elementDetailView" className="view view-secondary active-view">
      <div className="secondary-header">
        <h2><i className="fas fa-table"></i> 废钢化学成分表</h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(47, 115, 255, 0.1)',
              border: '1px solid rgba(47, 115, 255, 0.3)',
              borderRadius: '32px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#2f73ff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2f73ff';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#2f73ff';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(47,115,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(47, 115, 255, 0.1)';
              e.currentTarget.style.color = '#2f73ff';
              e.currentTarget.style.borderColor = 'rgba(47, 115, 255, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
          <button className="btn-back" onClick={() => setActiveView('primary')}>
            ← 返回主看板
          </button>
        </div>
      </div>
      <div className="element-table-container">
        <table className="element-table" id="chemFullTable">
          <thead id="chemTableHead">
            <tr>
              <th>料型</th>
              {elementKeys.map(k => (
                <th key={k}>{k}%</th>
              ))}
              <th>材料图</th>
            </tr>
          </thead>
          <tbody id="chemTableBody">
            {chemElementsFull.map((chem, idx) => (
              <tr key={idx}>
                <td style={{ fontWeight: 500 }}>{chem.name}</td>
                {elementKeys.map(k => (
                  <td key={k}>{chem.elements[k] || '——'}</td>
                ))}
                <td>
                  <i 
                    className="fas fa-image" 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => showImagePreview(chem.img)}
                  ></i>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="footer-note">
        基于《废钢化学成分及保质期表》整理，展示各料型元素含量上限或范围。点击图片图标可查看示意图。
      </div>
    </div>
  );

  // 渲染索赔详情视图


  // 渲染图表详情视图
  const renderChartView = () => (
    <div id="chartSecondaryView" className="view view-secondary active-view">
      <div className="secondary-header">
        <h2 id="secondaryTitle">
          {chartType === 'monthly' ? (
            <>
              <i className="fas fa-chart-line"></i> 2026年各月计划 vs 实际销量
            </>
          ) : (
            <>
              <i className="fas fa-chart-simple"></i> 各料型3月计划 vs 实际销量
            </>
          )}
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(47, 115, 255, 0.1)',
              border: '1px solid rgba(47, 115, 255, 0.3)',
              borderRadius: '32px',
              padding: '6px 16px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: '#2f73ff',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#2f73ff';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = '#2f73ff';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(47,115,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(47, 115, 255, 0.1)';
              e.currentTarget.style.color = '#2f73ff';
              e.currentTarget.style.borderColor = 'rgba(47, 115, 255, 0.3)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </button>
          <button className="btn-back" onClick={() => setActiveView('primary')}>
            ← 返回主看板
          </button>
        </div>
      </div>
      <div id="secondaryChartContainer" style={{ width: '100%', height: '85%' }}>
        <ReactECharts 
          option={chartType === 'monthly' ? monthlyChartOption : materialChartOption} 
          style={{ width: '100%', height: '100%' }} 
        />
      </div>
      <div className="footer-note">
        点击返回主看板
      </div>
    </div>
  );

  // 渲染库存详情视图
  const renderInventoryView = () => (
    <div id="inventoryFullView" className="view view-secondary active-view">
      <div className="secondary-header">
        <h2><i className="fas fa-boxes"></i> 库存对比 (合格/不合格) 吨</h2>
        <button className="btn-back" onClick={() => setActiveView('primary')}>
          ← 返回主看板
        </button>
      </div>
      <div id="inventoryFullContainer" style={{ width: '100%', height: '92%' }}>
        <ReactECharts option={inventoryOption} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );

  // 渲染应收账款详情视图
  const renderReceivableView = () => {
    return (
      <div id="receivableDetailView" className="view view-secondary active-view">
        <div className="secondary-header">
          <h2><i className="fas fa-receipt"></i> 应收账款明细 (堆积柱状图·现汇/承兑拆分)</h2>
          <button className="btn-back" onClick={() => setActiveView('primary')}>
            ← 返回主看板
          </button>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
          <div className="kpi-title" style={{margin:0}}><i className="fas fa-receipt"></i> 应收账款明细 (堆积柱状图·现汇/承兑拆分)</div>
          <div className="date-selector" id="receivableDateBadge"><span className="status-dot"></span> {monthWeekStr()}</div>
        </div>
        <div className="detail-chart-container">
          <ReceivablesBarChart 
            companies={receivableData.companies || []} 
            spotBookValues={(receivableData.companySpotBookValues || []).map(v => toWanInt(v))} 
            acceptBookValues={(receivableData.companyAcceptBookValues || []).map(v => toWanInt(v))} 
            spotOverdueValues={(receivableData.companySpotOverdueValues || []).map(v => toWanInt(v))} 
            acceptOverdueValues={(receivableData.companyAcceptOverdueValues || []).map(v => toWanInt(v))} 
          />
        </div>
        <div className="kpi-mini-row">
          <div className="kpi-mini-item"><span className="kpi-mini-label">账面应收总额</span><div id="detailBookTotal" className="kpi-mini-value">¥{toWanFixed(receivableData.totalBook)}万</div></div>
          <div className="kpi-mini-item"><span className="kpi-mini-label">逾期总额</span><div id="detailOverdueTotal" className="kpi-mini-value">¥{toWanFixed(receivableData.totalOverdue)}万</div></div>
        </div>
      </div>
    );
  };



  // 更新索赔详情视图，添加废钢化学成分及保质期表
  const renderClaimView = () => (
    <div id="claimDetailView" className="view view-secondary active-view">
      <div className="secondary-header">
        <h2><i className="fas fa-file-invoice-dollar"></i> 质量索赔 & 废钢化学成分标准库</h2>
        <button className="btn-back" onClick={() => setActiveView('primary')}>
          ← 返回主看板
        </button>
      </div>
      <div className="claim-split-layout">
        <div className="claim-table-section">
          <div className="section-title"><i className="fas fa-clipboard-list"></i> 质量索赔明细</div>
          <div className="scrollable-table">
            <table className="compact-table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>车间</th>
                  <th>物料</th>
                  <th>索赔原因</th>
                  <th>索赔金额</th>
                  <th className="attach-col">附件</th>
                </tr>
              </thead>
              <tbody id="claimFullTbody">
                {qualityClaims.map((c, idx) => {
                  const files = c.attachments ? c.attachments.split(',') : [];
                  const attachHtml = files.map(f => {
                    const name = f.trim();
                    const label = /\.png$/i.test(name) ? "现场图" : "报告";
                    return (
                      <span 
                        key={name} 
                        className="badge-attach" 
                        onClick={() => openClaimAttachment(name)}
                      >
                        <i className="fas fa-paperclip"></i> {label}
                      </span>
                    );
                  });
                  return (
                    <tr key={c.id}>
                      <td>{c.claimDate}</td>
                      <td>{c.workshop}</td>
                      <td>{c.material}</td>
                      <td>{c.reason}</td>
                      <td>¥{c.amount.toLocaleString()}</td>
                      <td className="attach-col">
                        <div className="attach-list">{attachHtml}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="chem-table-section">
          <div className="section-title"><i className="fas fa-flask"></i> 废钢化学成分及保质期表（完整版）</div>
          <div className="scrollable-table">
            <table className="compact-table chem-wide-table" id="xlsxChemTable">
              <thead>
                <tr>
                  <th>料型</th>
                  {elementKeys.map(k => (
                    <th key={k}>{k}%</th>
                  ))}
                  <th>保质期</th>
                  <th className="material-col">材料图</th>
                </tr>
              </thead>
              <tbody>
                {steelChemicalCompositions.map((chem, idx) => (
                  <tr key={chem.id}>
                    <td style={{ fontWeight: 600 }}>{chem.materialName}</td>
                    <td>{chem.c || '——'}</td>
                    <td>{chem.si || '——'}</td>
                    <td>{chem.mn || '——'}</td>
                    <td>{chem.p || '——'}</td>
                    <td>{chem.s || '——'}</td>
                    <td>{chem.cu || '——'}</td>
                    <td>{chem.cr || '——'}</td>
                    <td>{chem.ni || '——'}</td>
                    <td>{chem.mo || '——'}</td>
                    <td>{chem.ti || '——'}</td>
                    <td>{chem.al || '——'}</td>
                    <td>{chem.v || '——'}</td>
                    <td>{chem.b || '——'}</td>
                    <td>{chem.sn || '——'}</td>
                    <td>{chem.shelfLife || '1年'}</td>
                    <td className="material-col">
                      <span className="material-icon-wrap">
                        <i 
                          className="fas fa-image chem-img-icon" 
                          style={{ cursor: 'pointer', fontSize: '1.1rem', color: '#3b82f6' }}
                          onClick={() => showImagePreview(chem.materialImg)}
                        ></i>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="footer-note">数据源自《废钢化学成分及保质期表》Sheet1，点击材料图查看示意图。</div>
        </div>
      </div>
    </div>
  );

  // 渲染图片预览模态框
  const renderImageModal = () => (
    showModal && (
      <div id="imageModal" className="modal">
        <div className="modal-content">
          <span className="close" onClick={() => setShowModal(false)}>&times;</span>
          <div id="imagePreviewBody">
            <img 
              src={claimAttachmentMap[modalImage] || modalImage} 
              style={{ maxWidth: '100%', maxHeight: '60vh' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Crect%20fill%3D%22%23ddd%22%20width%3D%22100%22%20height%3D%22100%22%2F%3E%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3E%E6%97%A0%E5%9B%BE%E7%89%87%3C%2Ftext%3E%3C%2Fsvg%3E';
              }}
            />
          </div>
        </div>
      </div>
    )
  );

  return (
    <div ref={dashboardRef} className={isFullscreen ? 'fullscreen' : 'app-wrapper'}>
      {activeView === 'primary' && renderPrimaryView()}
      {activeView === 'element' && renderElementView()}
      {activeView === 'claim' && renderClaimView()}
      {activeView === 'chart' && renderChartView()}
      {activeView === 'inventory' && renderInventoryView()}
      {activeView === 'receivable' && renderReceivableView()}
      {renderImageModal()}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: #f0f4fa;
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          color: #0f172a;
        }
        .app-wrapper {
          height: 100vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          padding: 16px 20px 20px 20px;
          gap: 16px;
          background: #f0f4fa;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .fullscreen {
          background: #f0f4fa;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          padding: 16px 20px 20px 20px;
          gap: 16px;
        }
        .fullscreen .view {
          height: 100%;
        }
        .fullscreen .view-secondary {
          height: 100%;
        }
        .view {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
          overflow: visible;
        }
        .view-primary {
          display: flex;
          flex-direction: column;
          height: 100%;
          flex: 1;
        }
        .view-secondary {
          display: none;
          flex-direction: column;
          height: 100%;
          background: #ffffff;
          border-radius: 32px;
          padding: 20px 24px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.05);
        }
        .view-secondary.active-view {
          display: flex;
        }
        .dashboard-row {
          display: flex;
          gap: 20px;
          flex-wrap: nowrap;
          margin-bottom: 4px;
          flex: 0 0 39%;
          min-height: 300px;
        }
        .card-item {
          flex: 1;
          background: white;
          border-radius: 28px;
          padding: 12px 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border: 1px solid #e9edf2;
          transition: all 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }
        .card-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 22px rgba(0,0,0,0.08);
          border-color: #3b82f6;
        }
        .pie-card {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 12px 16px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
          transition: all 0.25s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .pie-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 20px -12px rgba(0, 0, 0, 0.15);
        }
        .pie-card h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #1e293b;
          display: flex;
          align-items: center;
          gap: 8px;
          border-left: 4px solid #2f73ff;
          padding-left: 10px;
          flex-shrink: 0;
        }
        .pie-chart { width: 100%; flex: 1; min-height: 0; }
        .mini-kpi .kpi-title { font-size: 0.8rem; color: #64748b; margin-bottom: 4px; }
        .mini-kpi .kpi-value { font-size: 1.4rem; font-weight: 800; }
        .date-selector {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            background: #f1f5f9;
            padding: 6px 16px;
            border-radius: 24px;
            color: #475569;
        }
        .status-dot {
            width: 10px;
            height: 10px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
            animation: pulse-green 2s infinite;
        }
        @keyframes pulse-green {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .metric-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: #5b6e8c;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
        }
        .metric-value {
          font-size: 2.4rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.2;
          text-align: center;
          margin-bottom: 8px;
        }
        .metric-card {
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .metric-unit {
          font-size: 0.8rem;
          font-weight: 400;
          color: #6c86a3;
          margin-left: 5px;
        }
        .metric-text-only {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1e40af;
          letter-spacing: 1px;
          margin-top: 8px;
          text-align: center;
        }
        .harvest-pie-cards {
          width: 100%;
          height: 260px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          overflow: hidden;
        }
        .harvest-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          max-height: 68px;
          overflow: hidden;
        }
        .harvest-tab {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #475569;
          border-radius: 999px;
          padding: 3px 8px;
          font-size: 10px;
          line-height: 1.1;
          cursor: pointer;
          user-select: none;
        }
        .harvest-tab.active {
          background: #dbeafe;
          border-color: #3b82f6;
          color: #1d4ed8;
          font-weight: 600;
        }
        .harvest-pie-panel {
          flex: 1;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #f8fafc;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 0;
        }
        .harvest-pie-name {
          font-size: 11px;
          color: #334155;
          line-height: 1.3;
          text-align: center;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }
        .harvest-pie-canvas {
          width: 100%;
          height: 165px;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
          pointer-events: none;
        }
        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
        }
        #cardYearRing,
        #cardMarRing {
          align-items: center;
          justify-content: center;
        }
        #cardYearRing .card-header,
        #cardMarRing .card-header {
          width: 100%;
          justify-content: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .ring-chart {
          height: 190px;
          width: 100%;
          pointer-events: none;
        }
        #cardYearRing .ring-chart,
        #cardMarRing .ring-chart {
          max-width: 280px;
          margin: 0 auto;
        }
        .ring-amount-info {
          text-align: center;
          margin-top: 10px;
          font-size: 13px;
          font-weight: 600;
          color: #6c86a3;
        }
        .click-hint {
          display: none;
        }
        .bottom-grid {
          display: flex;
          gap: 16px;
          flex: 0 0 61%;
          min-height: 0;
        }
        .inventory-panel {
          flex: 1;
          background: white;
          border-radius: 28px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          border: 1px solid #eef2ff;
        }
        .inventory-panel h4 {
          font-size: 0.95rem;
          margin-bottom: 12px;
        }
        .inventory-chart {
          flex: 1;
          min-height: 280px;
          width: 100%;
        }
        .order-panel {
          flex: 1;
          background: white;
          border-radius: 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          border: 1px solid #eef2ff;
          overflow: hidden;
        }
        .table-box {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: auto;
        }
        .table-title {
          font-weight: 600;
          font-size: 0.9rem;
          margin-bottom: 8px;
          background: #f1f5f9;
          padding: 5px 16px;
          border-radius: 20px;
          display: inline-block;
          width: fit-content;
        }
        .compact-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
          min-width: 100%;
          table-layout: fixed;
        }
        .compact-table th, .compact-table td {
          border-bottom: 1px solid #eef2ff;
          padding: 6px 5px;
          text-align: left;
          vertical-align: top;
        }
        .compact-table th {
          background: #f8fafc;
          font-weight: 600;
          position: sticky;
          top: 0;
        }
        .secondary-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-bottom: 2px solid #eef2ff;
          padding-bottom: 8px;
        }
        .secondary-header h2 {
          font-size: 1.4rem;
          font-weight: 700;
        }
        .btn-back {
          background: #f1f5f9;
          border: none;
          padding: 6px 18px;
          border-radius: 40px;
          font-weight: 500;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-back:hover {
          background: #e2e8f0;
        }
        .element-table-container {
          overflow: hidden;
          flex: 1;
          min-height: 0;
        }
        .element-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
          min-width: 0;
          table-layout: fixed;
        }
        .element-table th, .element-table td {
          border: 1px solid #e2e8f0;
          padding: 10px 7px;
          text-align: center;
          white-space: normal;
          word-break: break-word;
        }
        .element-table th {
          background: #f1f5f9;
          position: sticky;
          top: 0;
        }
        .badge-attach {
          background: #eef2ff;
          border-radius: 20px;
          padding: 3px 8px;
          font-size: 9px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          margin: 2px;
        }
        .footer-note {
          font-size: 9px;
          text-align: center;
          color: #8ba0bc;
          margin-top: 8px;
        }
        #claimDetailView {
          padding: 20px 24px 14px;
          gap: 12px;
        }
        #claimDetailView .table-box {
          flex: 1 1 auto;
          min-height: 0;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          background: #ffffff;
          padding: 2px 0;
        }
        #claimDetailView .compact-table {
          font-size: 14px;
          min-width: 100%;
          table-layout: auto;
        }
        #claimDetailView .compact-table th,
        #claimDetailView .compact-table td {
          padding: 12px 10px;
          line-height: 1.5;
          white-space: nowrap;
        }
        #claimDetailView .compact-table th {
          font-size: 14px;
        }
        #claimDetailView .badge-attach {
          font-size: 12px;
          padding: 6px 12px;
          margin: 4px 6px 4px 0;
          border-radius: 999px;
        }
        #claimDetailView .footer-note {
          font-size: 11px;
          margin-top: 2px;
        }
        .order-panel .table-box {
          overflow: hidden;
        }
        #orderTable {
          width: 100%;
          height: 100%;
          font-size: 13px;
          table-layout: fixed;
          min-width: 0;
        }
        #orderTable th,
        #orderTable td {
          padding: 11px 8px;
          line-height: 1.45;
          white-space: normal;
          word-break: break-word;
        }
        #elementDetailView {
          overflow: hidden;
        }
        #elementDetailView .element-table-container {
          overflow: hidden;
        }
        #elementDetailView .footer-note {
          margin-top: 4px;
          font-size: 10px;
        }
        .modal {
          display: none;
          position: fixed;
          z-index: 1000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.85);
          backdrop-filter: blur(3px);
        }
        .modal-content {
          margin: 8% auto;
          padding: 20px;
          background: white;
          border-radius: 28px;
          width: 85%;
          max-width: 750px;
          max-height: 80vh;
          overflow-y: auto;
        }
        .close {
          float: right;
          font-size: 28px;
          font-weight: bold;
          cursor: pointer;
          color: #94a3b8;
        }
        ::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        @media (max-width: 1000px) {
          .dashboard-row { gap: 12px; }
          .card-header h3 { font-size: 0.75rem; }
          .ring-chart { height: 110px; }
        }

        /* 应收账款相关样式 */
        .receivable-main-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .receivable-main-head h3 {
          margin: 0;
          font-size: 1rem;
          color: #333;
        }

        .receivable-main-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .receivable-main-item {
          text-align: center;
        }

        .receivable-main-value {
          font-size: 1.2rem;
          font-weight: bold;
          color: #3b82f6;
        }

        .receivable-main-label {
          font-size: 0.8rem;
          color: #666;
          margin-top: 4px;
        }

        .receivable-chart {
          height: 180px;
        }

        /* 供应商摘要表格样式 */
        .supplier-summary-panel {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          padding: 15px;
          margin-top: 20px;
        }

        .supplier-summary-head {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .supplier-summary-wrap {
          overflow-x: auto;
        }

        .supplier-summary-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .supplier-summary-table th,
        .supplier-summary-table td {
          padding: 8px;
          text-align: right;
          border-bottom: 1px solid #e5e7eb;
        }

        .supplier-summary-table th:first-child,
        .supplier-summary-table td:first-child {
          text-align: left;
        }

        .supplier-summary-table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #333;
        }

        /* 应收账款详情视图样式 */
        .kpi-mini-row {
          display: flex;
          gap: 20px;
          margin-top: 10px;
        }

        .kpi-mini-item {
          flex: 1;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          text-align: center;
        }

        .kpi-mini-label {
          font-size: 0.8rem;
          color: #64748b;
          display: block;
          margin-bottom: 4px;
        }

        .kpi-mini-value {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1e293b;
        }

        .tab-header-mini {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .mini-tab-btn {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          background: #f8fafc;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .mini-tab-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
        }

        .mini-tab-btn:hover:not(.active) {
          background: #e2e8f0;
        }

        .detail-chart-container {
          height: 400px;
          margin-top: 10px;
        }

        /* 索赔和化学成分表布局 */
        .claim-split-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          height: 85%;
        }

        .claim-table-section,
        .chem-table-section {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: #fff;
          padding: 15px;
          display: flex;
          flex-direction: column;
        }

        .section-title {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #333;
        }

        .scrollable-table {
          flex: 1;
          overflow: auto;
          margin-bottom: 10px;
        }

        .attach-col {
          width: 120px;
        }

        .attach-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .chem-wide-table {
          min-width: 800px;
        }

        .material-col {
          width: 80px;
          text-align: center;
        }

        .material-icon-wrap {
          display: inline-block;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .material-icon-wrap:hover {
          background: #f0f9ff;
        }

        .chem-img-icon {
          font-size: 1.1rem;
          color: #3b82f6;
          cursor: pointer;
        }

        /* 库存详情视图样式 */
        #inventoryFullContainer {
          width: 100%;
          height: 92%;
        }

        /* 应收账款详情视图样式 */
        #receivableDetailView {
          padding: 20px;
        }

        #receivableDateBadge {
          font-size: 0.9rem;
          color: #64748b;
        }

        #detailBookTotal,
        #detailOverdueTotal {
          font-size: 1.2rem;
          font-weight: 600;
          color: #3b82f6;
        }

        /* 销售管理页面视图样式 */
        .sales-page-content {
          flex: 1;
          overflow: auto;
        }

        .card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .card-content p {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          color: #64748b;
        }

        .card-content ul li {
          font-size: 0.85rem;
          color: #334155;
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .claim-split-layout {
            grid-template-columns: 1fr;
            height: auto;
          }

          .claim-table-section,
          .chem-table-section {
            height: 400px;
          }

          .kpi-mini-row {
            flex-direction: column;
            gap: 10px;
          }

          .tab-header-mini {
            flex-direction: column;
            gap: 4px;
          }

          .mini-tab-btn {
            width: 100%;
            text-align: left;
          }
        }
      `
}</style>
    </div>
    
  );
};

export default SalesDashboard;