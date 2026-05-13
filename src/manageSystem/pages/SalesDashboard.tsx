import React, { useState, useEffect, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import { ReceivablesBarChart } from '../../components/charts/ReceivablesBarChart';
import { Card, Table, Row, Col } from 'antd';

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

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const claimAttachmentMap: Record<string, string> = {};

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
  attachments: string;
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
  month1Amount: number;
  month2Qty: number;
  month2Ratio: number;
  month2Amount: number;
  month3Qty: number;
  month3Ratio: number;
  month3Amount: number;
  month4Qty: number;
  month4Ratio: number;
  month4Amount: number;
  month5Qty: number;
  month5Ratio: number;
  month5Amount: number;
  month6Qty: number;
  month6Ratio: number;
  month6Amount: number;
  month7Qty: number;
  month7Ratio: number;
  month7Amount: number;
  month8Qty: number;
  month8Ratio: number;
  month8Amount: number;
  month9Qty: number;
  month9Ratio: number;
  month9Amount: number;
  month10Qty: number;
  month10Ratio: number;
  month10Amount: number;
  month11Qty: number;
  month11Ratio: number;
  month11Amount: number;
  month12Qty: number;
  month12Ratio: number;
  month12Amount: number;
  totalQty: number;
  totalRatio: number;
  totalAmount: number;
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
  zhuLiaoBook: number;
}

// 主组件
const SalesDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'primary' | 'element' | 'claim' | 'chart' | 'inventory' | 'receivable' | 'order' | 'supplier'>('primary');
  const [chartType, setChartType] = useState<'monthly' | 'material'>('monthly');
  const [selectedMaterial, setSelectedMaterial] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalImage, setModalImage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeReceivableTab, setActiveReceivableTab] = useState('fengchi');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const dashboardRef = useRef<HTMLDivElement>(null);
  const orderCardsRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 数据状态管理
  const [salesPlans, setSalesPlans] = useState<SalesPlanItem[]>([]);
  const [materialPlans, setMaterialPlans] = useState<MaterialPlanItem[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [supplierMonthlyTonnages, setSupplierMonthlyTonnages] = useState<SupplierMonthlyTonnageItem[]>([]);
  const [qualityClaims, setQualityClaims] = useState<QualityClaimItem[]>([]);
  const [steelChemicalCompositions, setSteelChemicalCompositions] = useState<SteelChemicalCompositionItem[]>([]);
  const [receivableData, setReceivableData] = useState<ReceivableData>({
    companies: [],
    companySpotBookValues: [],
    companyAcceptBookValues: [],
    companySpotOverdueValues: [],
    companyAcceptOverdueValues: [],
    totalBook: 0,
    totalOverdue: 0,
    zhuLiaoBook: 0
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
      const response = await request.get<SalesPlanItem[]>('/api/sales-plan/list');
      // 检查数据结构，处理不同的返回格式
      let data = response;
      if (response && typeof response === 'object' && 'data' in response) {
        data = response.data;
      }
      console.log('获取到的年度销量计划数据:', data);
      setSalesPlans(Array.isArray(data) ? data : []);
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
      // 固定查询的供应商列表
      const suppliers = [
        'FCR',
        '山西浩之顺',
        '晋源实业',
        '山西九州',
        '山西盛源',
        '山西华成',
        '陕西交通',
        '候马力信',
        '西安庆安'
      ];
      // 构建查询参数
      const queryParams = suppliers.map(s => `supplierName=${encodeURIComponent(s)}`).join('&');
      const data = await request.get<SupplierMonthlyTonnageItem[]>(`/api/supplier-monthly-tonnage/list?${queryParams}`);
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
        totalBook: 0,
        totalOverdue: 0,
        zhuLiaoBook: 0
      };
      
      // 从原始数据计算所有金额（与FinancialDashboard保持一致）
      const receivableList = Array.isArray(data) ? data : (data.list || []);
      
      // 计算总账面应收
      receivableData.totalBook = receivableList
        .reduce((sum: number, item: any) => sum + (item.receivableAmount || 0), 0);
      
      // 计算总逾期
      receivableData.totalOverdue = receivableList
        .reduce((sum: number, item: any) => sum + (item.overdueAmount || 0), 0);
      
      // 计算主料应收：丰驰 + 昌泽 + 耀通 (现汇 + 承兑) 且 materialType 为主料
      receivableData.zhuLiaoBook = receivableList
        .filter((item: any) => ['丰驰', '昌泽', '耀通'].includes(item.company) && item.materialType === '主料')
        .reduce((sum: number, item: any) => sum + (item.receivableAmount || 0), 0);
      
      // 如果API返回了现成的公司数据，使用API数据
      if (data.companies && data.companies.length > 0) {
        receivableData.companies = data.companies;
        receivableData.companySpotBookValues = data.companySpotBookValues || [];
        receivableData.companyAcceptBookValues = data.companyAcceptBookValues || [];
        receivableData.companySpotOverdueValues = data.companySpotOverdueValues || [];
        receivableData.companyAcceptOverdueValues = data.companyAcceptOverdueValues || [];
      } else {
        // 否则从原始数据计算公司数据
        const companies = [...new Set(receivableList.map((item: any) => item.company))];
        receivableData.companies = companies;
        receivableData.companySpotBookValues = companies.map(company => 
          receivableList.filter((item: any) => item.company === company && item.paymentType === '现汇').reduce((sum: number, item: any) => sum + (item.receivableAmount || 0), 0)
        );
        receivableData.companyAcceptBookValues = companies.map(company => 
          receivableList.filter((item: any) => item.company === company && item.paymentType === '承兑').reduce((sum: number, item: any) => sum + (item.receivableAmount || 0), 0)
        );
        receivableData.companySpotOverdueValues = companies.map(company => 
          receivableList.filter((item: any) => item.company === company && item.paymentType === '现汇').reduce((sum: number, item: any) => sum + (item.overdueAmount || 0), 0)
        );
        receivableData.companyAcceptOverdueValues = companies.map(company => 
          receivableList.filter((item: any) => item.company === company && item.paymentType === '承兑').reduce((sum: number, item: any) => sum + (item.overdueAmount || 0), 0)
        );
      }
      
      console.log('最终设置的应收账款数据:', receivableData);
      setReceivableData(receivableData);
    } catch (error) {
      console.error('获取应收账款数据失败:', error);
      setReceivableData({
        companies: [],
        companySpotBookValues: [],
        companyAcceptBookValues: [],
        companySpotOverdueValues: [],
        companyAcceptOverdueValues: [],
        totalBook: 0,
        totalOverdue: 0,
        zhuLiaoBook: 0
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

  // 自动滚动逻辑
  useEffect(() => {
    const startAutoScroll = () => {
      if (!orderCardsRef.current) return;
      
      scrollIntervalRef.current = setInterval(() => {
        const container = orderCardsRef.current;
        if (!container) return;
        
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        if (scrollHeight <= clientHeight) return;
        
        container.scrollTop += 1;
        
        if (container.scrollTop >= scrollHeight - clientHeight) {
          container.scrollTop = 0;
        }
      }, 30);
    };
    
    const stopAutoScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
    
    startAutoScroll();
    
    return () => {
      stopAutoScroll();
    };
  }, []);

  // 计算年度销量计划和实际销量
  const yearTotalPlan = salesPlans.reduce((sum, plan) => sum + (plan.planQty || 0), 0);
  // 从/api/sales-plan/list接口获取实际销量
  const yearTotalActual = salesPlans.reduce((sum, plan) => sum + (plan.actualQty || 0), 0);
  const yearCompletion = yearTotalPlan > 0 ? (yearTotalActual / yearTotalPlan) * 100 : 0;

  // 获取当前月份
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthStr = `${currentMonth}月`;
  
  // 计算当前月销量计划和实际销量
  const currentPlan = salesPlans.find(plan => plan.month === currentMonthStr);
  console.log('当前月份:', currentMonthStr);
  console.log('找到的计划:', currentPlan);
  console.log('所有销量计划:', salesPlans);
  
  // 从materialPlans计算当前月总计划销量和实际销量（与图表数据一致）
  const currentMonthMaterialPlans = materialPlans.filter(plan => plan.month === currentMonthStr);
  const currentTotalPlan = currentMonthMaterialPlans.reduce((sum, plan) => sum + (plan.planQty || 0), 0);
  const currentTotalActual = currentMonthMaterialPlans.reduce((sum, plan) => sum + (plan.actualQty || 0), 0);
  const currentCompletion = currentTotalPlan > 0 ? (currentTotalActual / currentTotalPlan) * 100 : 0;

  // 计算各数据的最新更新时间
  const getLatestUpdateTime = (items: any[]) => {
    if (items.length === 0) return '';
    const itemsWithUpdateTime = items.filter(item => item && item.updateTime);
    if (itemsWithUpdateTime.length === 0) return '';
    const sorted = [...itemsWithUpdateTime].sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime());
    return sorted[0].updateTime;
  };

  const materialLatestUpdate = getLatestUpdateTime(materialPlans);
  const orderLatestUpdate = getLatestUpdateTime(orders);
  const inventoryLatestUpdate = getLatestUpdateTime(inventories || []);
  const supplierLatestUpdate = getLatestUpdateTime(supplierMonthlyTonnages);

  // 环形图配置
  // 过滤有实际销量的月份
  const monthsWithPlan = salesPlans.filter(plan => plan.actualQty > 0);
  
  const yearRingOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      enterable: true,
      confine: true,
      formatter: function(params: any) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['计划销量', '实际销量'],
      textStyle: { fontSize: 12 }
    },
    grid: { left: '6%', right: '4%', top: 40, bottom: 40, containLabel: true },
    xAxis: {
      type: 'category',
      data: monthsWithPlan.map(plan => plan.month),
      axisLabel: { fontSize: 12, interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: '销量',
      axisLabel: { 
        fontSize: 12,
        formatter: function(value: number) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value;
        }
      }
    },
    series: [
      {
        name: '计划销量',
        type: 'bar',
        data: monthsWithPlan.map(plan => plan.planQty),
        color: '#3b82f6',
        barWidth: 20,
        barCategoryGap: '30%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: function(params: any) {
            const value = params.value;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      },
      {
        name: '实际销量',
        type: 'bar',
        data: monthsWithPlan.map(plan => plan.actualQty),
        color: '#f97316',
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: function(params: any) {
            const value = params.value;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      }
    ]
  };

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const monthlyPlanTotals = months.map(month => {
    const monthPlans = materialPlans.filter(plan => plan.month === month);
    return monthPlans.reduce((sum, plan) => sum + (plan.planQty || 0), 0);
  });
  
  const monthlyActualTotals = months.map(month => {
    const monthPlans = materialPlans.filter(plan => plan.month === month);
    return monthPlans.reduce((sum, plan) => sum + (plan.actualQty || 0), 0);
  });
  
  const marRingOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      enterable: true,
      confine: true,
      formatter: function(params: any) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['计划销量', '实际销量'],
      textStyle: { fontSize: 12 }
    },
    grid: { left: '6%', right: '4%', top: 40, bottom: 20, containLabel: true },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { fontSize: 12, interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: '销量',
      axisLabel: { 
        fontSize: 12,
        formatter: function(value: number) {
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
          } else if (value >= 1000) {
            return (value / 1000).toFixed(1) + 'K';
          }
          return value;
        }
      },
      splitLine: { show: true }
    },
    series: [
      {
        name: '计划销量',
        type: 'bar',
        data: monthlyPlanTotals,
        color: '#3b82f6',
        barWidth: 20,
        barCategoryGap: '30%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: function(params: any) {
            const value = params.value;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      },
      {
        name: '实际销量',
        type: 'bar',
        data: monthlyActualTotals,
        color: '#f97316',
        barWidth: 20,
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: function(params: any) {
            const value = params.value;
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      }
    ],
    toolbox: {
      feature: {
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {}
      }
    },
    axisPointer: {
      type: 'shadow'
    },
    
  };

  // 计算每个物料的总库存并排序
  const sortedInventories = [...inventories].sort((a, b) => {
    const totalA = a.qualifiedQty + a.unqualifiedQty;
    const totalB = b.qualifiedQty + b.unqualifiedQty;
    return totalB - totalA; // 降序排序
  });
  
  // 库存图表配置 - 堆叠柱状图（百分比）
  const mainInventoryOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      enterable: true,
      confine: true,
      formatter: function(params: any) {
        const item = sortedInventories[params[0].dataIndex];
        const total = item.qualifiedQty + item.unqualifiedQty;
        let result = `${item.materialName}<br/>`;
        params.forEach((param: any) => {
          const value = param.value;
          const percent = total > 0 ? (value / total * 100).toFixed(1) : 0;
          result += `${param.marker} ${param.seriesName}: ${value.toLocaleString()} 吨 (${percent}%)<br/>`;
        });
        result += `总库存: ${total.toLocaleString()} 吨`;
        return result;
      }
    },
    legend: { 
      data: ['合格(吨)', '不合格(吨)'],
      top: 10,
      right: '10%',
      itemWidth: 14,
      itemHeight: 8,
      textStyle: {
        fontSize: 12,
        color: '#475569'
      }
    },
    grid: {
      left: '6%',
      right: '8%',
      top: 50,
      bottom: 60,
      containLabel: true
    },
    xAxis: { 
      type: 'category', 
      data: sortedInventories.map(i => i.materialName), 
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e2e8f0', width: 1 } },
      axisLabel: {
        rotate: 45,
        fontSize: 10,
        interval: 0,
        margin: 12,
        color: '#64748b'
      }
    },
    yAxis: { 
      type: 'value', 
      name: '吨',
      nameTextStyle: {
        fontSize: 12,
        color: '#64748b'
      },
      axisLabel: {
        fontSize: 10,
        color: '#64748b',
        formatter: '{value}'
      },
      splitLine: {
        lineStyle: {
          color: '#f1f5f9',
          width: 1,
          type: 'dashed'
        }
      }
    },
    series: [
      { 
        name: '合格(吨)', 
        type: 'bar', 
        stack: 'total',
        data: sortedInventories.map(i => i.qualifiedQty), 
        color: '#10b981',
        barWidth: '60%',
        barCategoryGap: '20%',
        label: {
          show: true,
          position: 'top',
          fontSize: 8,
          color: '#475569',
          formatter: function(params: any) {
            return params.value > 0 ? `${params.value.toLocaleString()}` : '';
          }
        }
      },
      { 
        name: '不合格(吨)', 
        type: 'bar', 
        stack: 'total',
        data: sortedInventories.map(i => i.unqualifiedQty), 
        color: '#f97316',
        barWidth: '60%',
        barCategoryGap: '20%',
        label: {
          show: true,
          position: 'top',
          fontSize: 8,
          color: '#475569',
          formatter: function(params: any) {
            return params.value > 0 ? `${params.value.toLocaleString()}` : '';
          }
        }
      }
    ]
  };

  // 二级图表配置
  const monthlyChartOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      enterable: true,
      confine: true,
      formatter: function(params: any) {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker} ${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return result;
      }
    },
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

  // 供应商占比折线图配置
  // 只显示有数据的月份
  const monthsWithData = [];
  if (supplierMonthlyTonnages.some(item => item.month1Qty > 0)) monthsWithData.push('1月');
  if (supplierMonthlyTonnages.some(item => item.month2Qty > 0)) monthsWithData.push('2月');
  if (supplierMonthlyTonnages.some(item => item.month3Qty > 0)) monthsWithData.push('3月');
  if (supplierMonthlyTonnages.some(item => item.month4Qty > 0)) monthsWithData.push('4月');
  if (supplierMonthlyTonnages.some(item => item.month5Qty > 0)) monthsWithData.push('5月');
  if (supplierMonthlyTonnages.some(item => item.month6Qty > 0)) monthsWithData.push('6月');
  if (supplierMonthlyTonnages.some(item => item.month7Qty > 0)) monthsWithData.push('7月');
  if (supplierMonthlyTonnages.some(item => item.month8Qty > 0)) monthsWithData.push('8月');
  if (supplierMonthlyTonnages.some(item => item.month9Qty > 0)) monthsWithData.push('9月');
  if (supplierMonthlyTonnages.some(item => item.month10Qty > 0)) monthsWithData.push('10月');
  if (supplierMonthlyTonnages.some(item => item.month11Qty > 0)) monthsWithData.push('11月');
  if (supplierMonthlyTonnages.some(item => item.month12Qty > 0)) monthsWithData.push('12月');
  
  // 如果没有数据，显示默认月份
  const displayMonths = monthsWithData.length > 0 ? monthsWithData : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const supplierChartOption = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let result = `${params[0].name}<br/>`;
        params.forEach((param: any) => {
          result += `${param.marker}${param.seriesName}: ${param.value.toLocaleString()} 吨<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: supplierMonthlyTonnages.map(item => `${item.supplierName}`),
      textStyle: { fontSize: 12 },
      orient: 'horizontal',
      top: 10
    },
    grid: { left: '6%', right: '8%', top: 60, bottom: 30, containLabel: true },
    xAxis: {
      type: 'category',
      data: displayMonths,
      axisLabel: { fontSize: 12, interval: 0 }
    },
    yAxis: {
      type: 'value',
      name: '吨位',
      axisLabel: { fontSize: 12, formatter: '{value}' }
    },
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100
      },
      {
        type: 'slider',
        orient: 'vertical',
        start: 0,
        end: 100,
        width: 20,
        right: 10,
        top: 60,
        bottom: 30
      }
    ],
    series: supplierMonthlyTonnages.map((item, index) => {
      const seriesData = [];
      if (monthsWithData.includes('1月')) seriesData.push(item.month1Qty || 0);
      if (monthsWithData.includes('2月')) seriesData.push(item.month2Qty || 0);
      if (monthsWithData.includes('3月')) seriesData.push(item.month3Qty || 0);
      if (monthsWithData.includes('4月')) seriesData.push(item.month4Qty || 0);
      if (monthsWithData.includes('5月')) seriesData.push(item.month5Qty || 0);
      if (monthsWithData.includes('6月')) seriesData.push(item.month6Qty || 0);
      if (monthsWithData.includes('7月')) seriesData.push(item.month7Qty || 0);
      if (monthsWithData.includes('8月')) seriesData.push(item.month8Qty || 0);
      if (monthsWithData.includes('9月')) seriesData.push(item.month9Qty || 0);
      if (monthsWithData.includes('10月')) seriesData.push(item.month10Qty || 0);
      if (monthsWithData.includes('11月')) seriesData.push(item.month11Qty || 0);
      if (monthsWithData.includes('12月')) seriesData.push(item.month12Qty || 0);
      
      return {
        name: `${item.supplierName}`,
        type: 'line',
        data: seriesData.length > 0 ? seriesData : Array(monthsWithData.length || 12).fill(0),
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: {
          width: 2
        },
        itemStyle: {
          color: `hsl(${index * 360 / supplierMonthlyTonnages.length}, 70%, 50%)`
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: function(params: any) {
            return params.value > 0 ? params.value.toLocaleString() : '';
          }
        }
      };
    })
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

  // 按实际销量+计划销量总和降序排序
  const sortedMaterialEntries = Array.from(materialMap.entries()).sort((a, b) => {
    const totalA = a[1].planQty + a[1].actualQty;
    const totalB = b[1].planQty + b[1].actualQty;
    return totalB - totalA;
  });
  
  // 创建排序后的Map
  const sortedMaterialMap = new Map(sortedMaterialEntries);

  console.log('当前选中的月份:', selectedMonth);
  const filteredMaterialPlans = selectedMonth 
    ? materialPlans.filter(plan => plan.month === selectedMonth)
    : materialPlans;
  
  const filteredMaterialMap = new Map<string, { planQty: number; actualQty: number }>();
  filteredMaterialPlans.forEach(plan => {
    if (!filteredMaterialMap.has(plan.materialName)) {
      filteredMaterialMap.set(plan.materialName, { planQty: 0, actualQty: 0 });
    }
    const current = filteredMaterialMap.get(plan.materialName)!;
    filteredMaterialMap.set(plan.materialName, {
      planQty: current.planQty + (plan.planQty || 0),
      actualQty: current.actualQty + (plan.actualQty || 0)
    });
  });
  
  const filteredSortedEntries = Array.from(filteredMaterialMap.entries()).sort((a, b) => {
    const totalA = a[1].planQty + a[1].actualQty;
    const totalB = b[1].planQty + b[1].actualQty;
    return totalB - totalA;
  });
  
  const filteredSortedMaterialMap = new Map(filteredSortedEntries);
  
  const materialChartOption = {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['计划销量', '实际销量'],
      textStyle: { fontSize: 14 }
    },
    grid: { left: '6%', right: '4%', top: 56, bottom: 90, containLabel: true },
    xAxis: {
      type: 'category',
      data: Array.from(filteredSortedMaterialMap.keys()),
      axisLabel: { rotate: 45, fontSize: 12, interval: 0 }
    },
    yAxis: { type: 'value', axisLabel: { fontSize: 12 } },
    series: [
      {
        name: '计划销量',
        type: 'bar',
        data: Array.from(filteredSortedMaterialMap.values()).map(item => item.planQty),
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
        data: Array.from(filteredSortedMaterialMap.values()).map(item => item.actualQty),
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
      text: '',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
        color: '#1f2937'
      }
    },
    grid: {
      left: '6%',
      right: '4%',
      top: 10,
      bottom: 10,
      containLabel: true
    },
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      enterable: true,
      confine: true,
      formatter: function(params: any) {
        const item = sortedInventories[params[0].dataIndex];
        const total = item.qualifiedQty + item.unqualifiedQty;
        let result = `${item.materialName}<br/>`;
        params.forEach((param: any) => {
          const value = param.value;
          const percent = total > 0 ? (value / total * 100).toFixed(1) : 0;
          result += `${param.marker} ${param.seriesName}: ${value.toLocaleString()} 吨 (${percent}%)<br/>`;
        });
        result += `总库存: ${total.toLocaleString()} 吨`;
        return result;
      }
    }, 
    legend: { 
      data:['合格(吨)','不合格(吨)'],
      top: 50,
      left: 'center',
      itemWidth: 16,
      itemHeight: 10,
      textStyle: {
        fontSize: 14,
        color: '#475569'
      }
    }, 
    xAxis: { 
      type: 'category', 
      data: sortedInventories.map(i=>i.materialName), 
      axisTick: { alignWithLabel: true },
      axisLine: { lineStyle: { color: '#e2e8f0', width: 1 } },
      axisLabel: {
        rotate: 45,
        fontSize: 12,
        interval: 0,
        margin: 16,
        color: '#64748b'
      } 
    }, 
    yAxis: {
      type: 'value',
      name: '吨',
      nameTextStyle: {
        fontSize: 14,
        color: '#64748b'
      },
      axisLabel: { 
        fontSize: 12, 
        color: '#64748b',
        formatter: '{value}'
      },
      splitLine: { 
        lineStyle: { 
          color: '#f1f5f9', 
          width: 1,
          type: 'dashed'
        } 
      }
    }, 
    series: [
      { 
        name:'合格(吨)', 
        type:'bar', 
        data: sortedInventories.map(i=>i.qualifiedQty), 
        color:'#10b981',
        stack: '库存',
        barWidth: '60%',
        barCategoryGap: '20%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          color: '#475569',
          formatter: function(params: any) {
            return params.value > 0 ? `${params.value.toLocaleString()}` : '';
          }
        }
      }, 
      { 
        name:'不合格(吨)', 
        type:'bar', 
        data: sortedInventories.map(i=>i.unqualifiedQty), 
        color:'#f97316',
        stack: '库存',
        barWidth: '60%',
        barCategoryGap: '20%',
        label: {
          show: true,
          position: 'top',
          fontSize: 10,
          color: '#475569',
          formatter: function(params: any) {
            return params.value > 0 ? `${params.value.toLocaleString()}` : '';
          }
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
    let mappedFile = claimAttachmentMap[fileName] || fileName;
    if (fileName.startsWith('/uploads/') || fileName.startsWith('uploads/')) {
      mappedFile = BASE_URL + fileName;
    }
    const isImage = /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(mappedFile);
    if (isImage) {
      showImagePreview(mappedFile);
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
      
      {/* 第一行：月销售 | 年度总销售进度 (1:1) */}
      <div className="dashboard-row">
        <div className="dashboard-col col-50" id="cardMarRing" onClick={() => {
          setChartType('material');
          setActiveView('chart');
        }}>
          <div className="card-item">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3><i className="fas fa-calendar-alt"></i> 年度销售趋势</h3>
                <div className="date-selector">
                  <span className="status-dot"></span> 更新时间: {materialLatestUpdate ? new Date(materialLatestUpdate).toLocaleDateString() : ''}
                  <i className="fas fa-chevron-circle-right"></i>
                </div>
              </div>
            </div>
            <div className="ring-amount-info">
              📊 年度计划销量: {monthlyPlanTotals.reduce((a, b) => a + b, 0).toLocaleString()}  |  年度实际销量: {monthlyActualTotals.reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
            <div className="ring-chart" onClick={(e) => e.stopPropagation()}>
              <ReactECharts 
              option={marRingOption} 
              style={{ width: '100%', height: '100%' }} 
              onEvents={{
                click: function(params: any) {
                  console.log('点击事件完整参数:', params);
                  console.log('params.name:', params.name);
                  console.log('params.data:', params.data);
                  console.log('params.axisValue:', params.axisValue);
                  const month = params.name || params.axisValue;
                  console.log('最终获取的月份:', month);
                  setSelectedMonth(month);
                  setChartType('material');
                  setActiveView('chart');
                }
              }}
            />
            </div>
          </div>
        </div>

        <div className="dashboard-col col-50" id="cardYearRing" onClick={() => {
          setChartType('monthly');
          setActiveView('chart');
        }}>
          <div className="card-item">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3><i className="fas fa-chart-simple"></i> 年度总销售进度</h3>
                <div className="date-selector">
                  <span className="status-dot"></span> 更新时间: {salesPlans.length > 0 ? new Date(getLatestUpdateTime(salesPlans)).toLocaleDateString() : ''}
                  <i className="fas fa-chevron-circle-right"></i>
                </div>
              </div>
            </div>
            <div className="ring-amount-info">
              📊 计划销量: {yearTotalPlan.toLocaleString()}  |  实际销量: {yearTotalActual.toLocaleString()}
            </div>
            <div className="ring-chart">
              <ReactECharts option={yearRingOption} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* 第二行：订单销售 | 库存 | 应收账款 (3:4:3) */}
      <div className="dashboard-row">
        <div className="dashboard-col col-25" onClick={() => setActiveView('order')}>
          <div className="card-item">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3><i className="fas fa-file-invoice"></i> 订单销售</h3>
                <div className="date-selector">
                  <span className="status-dot"></span> 更新时间: {orderLatestUpdate ? new Date(orderLatestUpdate).toLocaleDateString() : ''}
                  <i className="fas fa-chevron-circle-right"></i>
                </div>
              </div>
            </div>
            {/* 订单列表 - 卡片形式 */}
            <div className="order-cards" ref={orderCardsRef} onMouseEnter={() => {
              if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
              }
            }} onMouseLeave={() => {
              if (!scrollIntervalRef.current) {
                const container = orderCardsRef.current;
                if (!container) return;
                
                scrollIntervalRef.current = setInterval(() => {
                  const scrollHeight = container.scrollHeight;
                  const clientHeight = container.clientHeight;
                  
                  if (scrollHeight <= clientHeight) return;
                  
                  container.scrollTop += 1;
                  
                  if (container.scrollTop >= scrollHeight - clientHeight) {
                    container.scrollTop = 0;
                  }
                }, 30);
              }
            }}>
              {orders.map((order, idx) => {
                const receivedQty = order.receivedQty || 0;
                const remainingQty = order.remainingQty || 0;
                const totalQty = receivedQty + remainingQty;
                const completionRate = totalQty > 0 ? (receivedQty / totalQty * 100).toFixed(1) : 0;
                const progressWidth = Math.min(parseFloat(completionRate), 100);
                
                return (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-card-title">
                        <span className="customer-name">{order.customer}</span>
                        <span className="material-name">{order.material}</span>
                      </div>
                      <span className={`order-card-trend ${parseFloat(completionRate) > 100 ? 'up' : ''}`}>{completionRate}%</span>
                    </div>
                    <div className="order-card-stats">
                      <span className="order-no">订单编号: {order.contractNo}</span>
                      <span className="received-qty">回货: {receivedQty.toLocaleString()} 吨</span>
                      <span className="remaining-qty">剩余: {remainingQty.toLocaleString()} 吨</span>
                      <span className="total-qty">总计: {totalQty.toLocaleString()} 吨</span>
                    </div>
                    <div className="order-card-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progressWidth}%` }}></div>
                      </div>
                      <div className="progress-text">
                        <span>完成率: {completionRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="dashboard-col col-50" onClick={() => setActiveView('inventory')}>
          <div className="card-item">
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3><i className="fas fa-boxes"></i> 库存</h3>
                <div className="date-selector">
                  <span className="status-dot"></span> 更新时间: {inventoryLatestUpdate ? new Date(inventoryLatestUpdate).toLocaleDateString() : ''}
                  <i className="fas fa-chevron-circle-right"></i>
                </div>
              </div>
            </div>
            <div className="inventory-chart">
              <ReactECharts option={mainInventoryOption} style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        <div className="dashboard-col col-25" id="cardReceivableMain" onClick={() => setActiveView('receivable')}>
          <div className="card-item">
            <div className="card-header">
              <h3><i className="fas fa-receipt"></i> 应收账款·账面vs逾期(万元)</h3>
              <i className="fas fa-chevron-circle-right"></i>
            </div>
            <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', gap: '12px', padding: '8px' }}>
              <div className="mini-kpi">
                <div className="kpi-title">账面应收</div>
                <div className="kpi-value">¥ {toWanInt(receivableData.totalBook).toLocaleString()} 万</div>
              </div>
              <div className="mini-kpi">
                <div className="kpi-title">其中主料应收</div>
                <div className="kpi-value" style={{ color: '#3b82f6' }}>¥ {toWanInt(receivableData.zhuLiaoBook).toLocaleString()} 万</div>
              </div>
              <div className="mini-kpi">
                <div className="kpi-title">逾期</div>
                <div className="kpi-value" style={{ color: '#ef4444' }}>¥ {toWanInt(receivableData.totalOverdue).toLocaleString()} 万</div>
              </div>
            </div>
            <div className="pie-chart">
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
      </div>

      {/* 第三行：供应商占比 (整行) */}
      <div className="dashboard-row">
        <div className="dashboard-col col-50" style={{ flex: 1 }}>
          <div className="card-item" onClick={() => setActiveView('supplier')}>
            <div className="card-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <h3><i className="fas fa-chart-line"></i> 供应商占比</h3>
                <div className="date-selector">
                  <span className="status-dot"></span> 更新时间: {supplierLatestUpdate ? new Date(supplierLatestUpdate).toLocaleDateString() : ''}
                  <i className="fas fa-chevron-circle-right"></i>
                </div>
              </div>
            </div>
            <div className="supplier-chart" style={{ height: '400px' }}>
              <ReactECharts option={supplierChartOption} style={{ width: '100%', height: '400px' }} />
            </div>
          </div>
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
              <i className="fas fa-chart-simple"></i> {(() => {
                const displayMonth = selectedMonth || currentMonthStr;
                console.log('二级页面显示的月份:', displayMonth);
                return displayMonth;
              })()} 物料销量明细
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
  const renderInventoryView = () => {
    const claimColumns = [
      { title: '日期', dataIndex: 'claimDate', key: 'claimDate' },
      { title: '车间', dataIndex: 'workshop', key: 'workshop' },
      { title: '物料', dataIndex: 'material', key: 'material' },
      { title: '索赔原因', dataIndex: 'reason', key: 'reason' },
      { 
        title: '索赔金额', 
        dataIndex: 'amount', 
        key: 'amount',
        render: (amount: number) => <span style={{ color: '#ef4444', fontWeight: 600 }}>¥{amount.toLocaleString()}</span>
      },
      { 
        title: '附件', 
        key: 'attachments',
        render: (_: any, record: any) => {
          const files = record.attachments ? record.attachments.split(',') : [];
          return files.map((f: string) => {
            const name = f.trim();
            const label = /\.png$/i.test(name) ? "现场图" : "报告";
            return (
              <span 
                key={name} 
                style={{ 
                  cursor: 'pointer', 
                  color: '#2f73ff',
                  marginRight: '8px',
                  textDecoration: 'underline'
                }} 
                onClick={() => openClaimAttachment(name)}
              >
                <i className="fas fa-paperclip"></i> {label}
              </span>
            );
          });
        }
      },
    ];

    const chemColumns = [
      { title: '料型', dataIndex: 'materialName', key: 'materialName', fixed: 'left' as const },
      ...elementKeys.map(k => ({ title: `${k}%`, dataIndex: k.toLowerCase(), key: k, render: (val: string) => val || '——' })),
      { title: '保质期', dataIndex: 'shelfLife', key: 'shelfLife', render: (val: string) => val || '——' },
      { 
        title: '材料图', 
        key: 'materialImg',
        render: (_: any, record: any) => (
          record.materialImg ? (
            <i 
              className="fas fa-image" 
              style={{ cursor: 'pointer', color: '#2f73ff', fontSize: '1.1rem' }} 
              onClick={() => showImagePreview(record.materialImg)}
            ></i>
          ) : '——'
        )
      },
    ];

    return (
      <div id="inventoryFullView" className="view view-secondary active-view fullscreen-h">
        <div className="secondary-header">
          <h2><i className="fas fa-boxes"></i> 库存对比 (合格/不合格) 吨</h2>
          <button className="btn-back" onClick={() => setActiveView('primary')}>
            ← 返回主看板
          </button>
        </div>
        <div id="inventoryFullContainer" style={{ width: '100%', height: '350px' }}>
          <ReactECharts option={inventoryOption} style={{ width: '100%', height: '100%' }} />
        </div>
        
        <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
          <Col span={24}>
            <Card 
              title={<><i className="fas fa-clipboard-list" style={{ marginRight: '8px', color: '#ef4444' }}></i>质量索赔明细 <span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 400 }}>(共{qualityClaims.length}条记录)</span></>}
              size="small"
            >
              <Table 
                dataSource={qualityClaims} 
                columns={claimColumns} 
                rowKey="id" 
                size="small"
                pagination={false}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title={<><i className="fas fa-flask" style={{ marginRight: '8px', color: '#10b981' }}></i>废钢化学成分及保质期表（完整版）<span style={{ fontSize: '0.8rem', color: '#666', fontWeight: 400 }}>(共{steelChemicalCompositions.length}种料型)</span></>}
              size="small"
            >
              <Table 
                dataSource={steelChemicalCompositions} 
                columns={chemColumns} 
                rowKey="id" 
                size="small"
                pagination={{ pageSize: 10, showSizeChanger: true, showQuickJumper: true }}
                scroll={{ x: 'max-content' }}
              />
            </Card>
          </Col>
        </Row>
        
        <div className="footer-note">
          基于《废钢化学成分及保质期表》整理，展示各料型元素含量上限或范围。点击图片图标可查看示意图。
        </div>
      </div>
    );
  };

  // 渲染订单销售详情视图
  const renderOrderView = () => (
    <div id="orderDetailView" className="view view-secondary active-view">
      <div className="secondary-header">
        <h2><i className="fas fa-file-invoice"></i> 订单销售明细</h2>
        <button className="btn-back" onClick={() => setActiveView('primary')}>
          ← 返回主看板
        </button>
      </div>
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-item">
            <label>公司名称:</label>
            <select className="filter-select">
              <option value="">全部公司</option>
              {Array.from(new Set(orders.map(order => order.company))).map(company => (
                <option key={company} value={company}>{company}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>日期范围:</label>
            <input type="date" className="filter-input" />
            <span>至</span>
            <input type="date" className="filter-input" />
          </div>
        </div>
      </div>
      <div className="order-detail-table">
        <table className="element-table">
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
                      <th>完成率</th>
                      <th>进度</th>
                      <th>备注</th>
                      <th>订单状态</th>
                      <th>附件</th>
                    </tr>
          </thead>
          <tbody>
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
                <td>{(() => {
                  const totalQty = order.receivedQty + order.remainingQty;
                  return totalQty > 0 ? (order.receivedQty / totalQty * 100).toFixed(1) + '%' : '0%';
                })()}</td>
                <td>
                  <div style={{ width: '100%', minWidth: '100px' }}>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ 
                          width: `${(() => {
                            const totalQty = order.receivedQty + order.remainingQty;
                            const completionRate = totalQty > 0 ? (order.receivedQty / totalQty * 100) : 0;
                            return Math.min(completionRate, 100);
                          })()}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td>{order.remark}</td>
                <td>{order.orderStatus}</td>
                <td>
                  {(() => {
                    const files = order.attachments ? order.attachments.split(',') : [];
                    if (files.length === 0) return '-';
                    return files.map(f => {
                      const name = f.trim();
                      const label = /\.png$/i.test(name) ? "现场图" : "报告";
                      return (
                        <span 
                          key={name} 
                          className="badge-attach" 
                          onClick={() => {
                            setModalImage(`${BASE_URL}${name}`);
                            setShowModal(true);
                          }}
                        >
                          <i className="fas fa-paperclip"></i> {label}
                        </span>
                      );
                    });
                  })()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // 渲染供应商占比详情视图
  const renderSupplierView = () => (
    <div id="supplierDetailView" className="view view-secondary active-view">
      <div className="secondary-header">
        <h2><i className="fas fa-chart-line"></i> 供应商占比明细</h2>
        <button className="btn-back" onClick={() => setActiveView('primary')}>
          ← 返回主看板
        </button>
      </div>
      <div className="filter-container">
        <div className="filter-row">
          <div className="filter-item">
            <label>供应商:</label>
            <select className="filter-select">
              <option value="">全部供应商</option>
              {Array.from(new Set(supplierMonthlyTonnages.map(item => item.supplierName))).map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>物料类型:</label>
            <select className="filter-select">
              <option value="">全部类型</option>
              {Array.from(new Set(supplierMonthlyTonnages.map(item => item.materialType))).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="supplier-detail-chart" style={{ height: '100%' }}>
        <ReactECharts option={supplierChartOption} style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="supplier-detail-table">
        <table className="element-table">
          <thead>
            <tr>
              <th>供应商</th>
              <th>1月吨位</th>
              <th>1月金额</th>
              <th>2月吨位</th>
              <th>2月金额</th>
              <th>3月吨位</th>
              <th>3月金额</th>
              <th>4月吨位</th>
              <th>4月金额</th>
              <th>5月吨位</th>
              <th>5月金额</th>
              <th>6月吨位</th>
              <th>6月金额</th>
              <th>7月吨位</th>
              <th>7月金额</th>
              <th>8月吨位</th>
              <th>8月金额</th>
              <th>9月吨位</th>
              <th>9月金额</th>
              <th>10月吨位</th>
              <th>10月金额</th>
              <th>11月吨位</th>
              <th>11月金额</th>
              <th>12月吨位</th>
              <th>12月金额</th>
              <th>合计吨位</th>
              <th>合计金额</th>
            </tr>
          </thead>
          <tbody>
            {supplierMonthlyTonnages.map((item, index) => (
              <tr key={item.id}>
                <td>{item.supplierName}</td>
                <td>{item.month1Qty || 0}</td>
                <td>{(item.month1Amount || 0).toLocaleString()}</td>
                <td>{item.month2Qty || 0}</td>
                <td>{(item.month2Amount || 0).toLocaleString()}</td>
                <td>{item.month3Qty || 0}</td>
                <td>{(item.month3Amount || 0).toLocaleString()}</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>0</td>
                <td>{item.totalQty || 0}</td>
                <td>{(item.totalAmount || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
    <div id="claimDetailView" className="view view-secondary active-view ">
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
      {activeView === 'order' && renderOrderView()}
      {activeView === 'supplier' && renderSupplierView()}
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
          height: auto;
          flex: none;
          overflow-y: visible;
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
          .fullscreen-h {
            height: auto !important;
          }
        .view-secondary.active-view {
          display: flex;
        }
        .dashboard-row {
          display: flex;
          gap: 8px;
          flex-wrap: nowrap;
          margin-bottom: 16px;
          width: 100%;
        }
        .dashboard-row:first-child {
          height: 50vh;
          min-height: 40Vh;
        }
        .dashboard-row:nth-child(2) {
          height: 50vh;
          min-height: 40Vh;
        }
        .dashboard-row:nth-child(3) {
          height: auto;
        }
        .dashboard-col {
          display: flex;
          flex-direction: column;
        }
        .dashboard-col.col-25 {
          flex: 3;
          min-width: 0;
        }
        .dashboard-col.col-50 {
          flex: 4;
          min-width: 0;
        }
        .ring-chart {
          height: 100%;
          width: 100%;
        }
        #cardYearRing .ring-chart,
        #cardMarRing .ring-chart {
          max-width: none;
          margin: 0;
          width: 100%;
        }
        .inventory-chart {
          flex: 1;
          min-height: 280px;
          width: 100%;
        }
        .pie-chart {
          width: 100%;
          flex: 1;
          min-height: 0;
        }
        .order-summary {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 12px;
          border: 1px solid #e2e8f0;
        }
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .order-title {
          font-weight: 600;
          font-size: 0.9rem;
          color: #1e293b;
        }
        .order-trend {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 12px;
        }
        .order-trend.up {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .order-stats {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 0.85rem;
        }
        .order-actual {
          font-weight: 600;
          color: #10b981;
        }
        .order-target {
          color: #64748b;
        }
        .progress-container {
          margin-top: 8px;
        }
        .progress-bar {
          height: 8px;
          background: #e2e8f0;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 6px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 4px;
        }
        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: #64748b;
        }
        .order-list {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .order-list-header {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          gap: 8px;
          padding: 8px;
          background: #f1f5f9;
          border-radius: 8px 8px 0 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
        }
        .order-list-body {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #e2e8f0;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }
        .order-item {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          gap: 8px;
          padding: 8px;
          border-bottom: 1px solid #e2e8f0;
          font-size: 0.75rem;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .order-item:hover {
          background: #f8fafc;
        }
        .order-cards {
          max-height: 40vh;
          min-height: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }
        .order-card {
          background: #f8fafc;
          border-radius: 12px;
          padding: 12px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s;
        }
        .order-card:hover {
          background: #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }
        .order-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 8px;
        }
        .order-card-title {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .customer-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #1e293b;
        }
        .material-name {
          font-size: 0.8rem;
          color: #64748b;
        }
        .order-card-trend {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 12px;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }
        .order-card-trend.up {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
        }
        .order-card-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 0.8rem;
        }
        .order-card-stats span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .received-qty {
          color: #10b981;
          font-weight: 500;
        }
        .remaining-qty {
          color: #f97316;
          font-weight: 500;
        }
        .total-qty {
          color: #3b82f6;
          font-weight: 500;
        }
        .order-amount {
          color: #64748b;
          font-weight: 500;
        }
        .order-card-progress {
          margin-top: 8px;
        }
        .order-card-progress .progress-bar {
          height: 6px;
          margin-bottom: 4px;
        }
        .order-card-progress .progress-text {
          font-size: 0.75rem;
          color: #64748b;
        }
        .supplier-chart {
          height: 400px;
          min-height: 400px;
        }
        .supplier-detail-chart {
          margin-bottom: 16px;
        }
        .supplier-detail-table {
          flex: 1;
          overflow: auto;
        }
        .filter-container {
          background: #f8fafc;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid #e2e8f0;
        }
        .filter-row {
          display: flex;
          gap: 24px;
          align-items: center;
        }
        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .filter-item label {
          font-size: 0.9rem;
          font-weight: 600;
          color: #475569;
        }
        .filter-select,
        .filter-input {
          padding: 6px 12px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
          background: white;
        }
        .filter-select:focus,
        .filter-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .order-detail-table {
          flex: 1;
          overflow: auto;
        }
        .order-detail-table table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .order-detail-table th,
        .order-detail-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        .order-detail-table th {
          background: #f1f5f9;
          font-weight: 600;
          color: #475569;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .order-detail-table tr:hover {
          background: #f8fafc;
        }
        .card-item {
          flex: 1;
          background: white;
          border-radius: 28px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
          border: 1px solid #e9edf2;
          transition: all 0.2s;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          width: 100%;
          min-width: 0;
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
        .mini-kpi .kpi-title { font-size: 0.8rem; color: #64748b; margin-bottom: 4px; white-space: nowrap; }  
        .mini-kpi .kpi-value { font-size: 1.2rem; font-weight: 800; white-space: nowrap; }
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
          height: 100%;
          width: 100%;
        }
        #cardYearRing .ring-chart,
        #cardMarRing .ring-chart {
          // max-width: 280px;
          margin: 0 auto;
        }
        .ring-amount-info {
          text-align: center;
          margin-top: 10px;
          font-size: 16px;
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
          font-size: 0.85rem;
          min-width: 100%;
          table-layout: auto;
        }
        .compact-table th, .compact-table td {
          border-bottom: 1px solid #e2e8f0;
          padding: 8px 12px;
          text-align: left;
          vertical-align: top;
        }
        .compact-table th {
          background: #f1f5f9;
          font-weight: 600;
          color: #475569;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .compact-table tr:hover {
          background: #f8fafc;
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