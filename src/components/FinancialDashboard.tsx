import React, { useState, useEffect } from 'react';
import { FundBalancePieChart } from './charts/FundBalancePieChart';
import { ReceivablesBarChart } from './charts/ReceivablesBarChart';
import { InterestRateChart } from './charts/InterestRateChart';
import { PaymentPlanPieChart } from './charts/PaymentPlanPieChart';
import { FundsBarChart } from './charts/FundsBarChart';
import { ReceivableDetailChart } from './charts/ReceivableDetailChart';
import { PaymentPlanChart } from './charts/PaymentPlanChart';
import { DiscountPanelChart } from './charts/DiscountPanelChart';
import { MonthlyCollectionChart } from './charts/MonthlyCollectionChart';
import { CollectionTypePieChart } from './charts/CollectionTypePieChart';
import { TodayPlanBarChart } from './charts/TodayPlanBarChart';
import request from '../utils/request';

export const FinancialDashboard: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2'>('level1');
  const [activeDetailTab, setActiveDetailTab] = useState<string>('');
  const [activeDiscountTab, setActiveDiscountTab] = useState<string>('price');
  const [activeLevel2Card, setActiveLevel2Card] = useState<string>('funds');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('4');
  const dashboardRef = React.useRef<HTMLDivElement>(null);

  // 状态变量存储API数据
  const [receivableData, setReceivableData] = useState<any[]>([]);
  const [fundBalanceData, setFundBalanceData] = useState<any[]>([]);
  const [paymentPlanData, setPaymentPlanData] = useState<any[]>([]);
  const [financeDiscountData, setFinanceDiscountData] = useState<any[]>([]);
  const [dailyPaymentPlanData, setDailyPaymentPlanData] = useState<any[]>([]);
  const [listingPriceData, setListingPriceData] = useState<any[]>([]);
  const [lastRecordDate, setLastRecordDate] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [fundUpdateTime, setFundUpdateTime] = useState<string>('');
  const [dailyPlanUpdateTime, setDailyPlanUpdateTime] = useState<string>('');

  // 加载状态
  const [loading, setLoading] = useState<boolean>(true);

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

  // 获取API数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. 应收账款·账面vs逾期
        const receivableResult = await request.get('/api/receivable/list');
        // 检查数据结构，处理不同的返回格式
        let receivableData = receivableResult;
        if (receivableResult && typeof receivableResult === 'object' && 'data' in receivableResult) {
          receivableData = receivableResult.data;
        }
        // 确保数据是数组
        if (!Array.isArray(receivableData) && receivableData.list) {
          receivableData = receivableData.list;
        }
        setReceivableData(Array.isArray(receivableData) ? receivableData : []);

        // 2. 每日资金余额
        const fundBalanceResult = await request.get('/fund-balance/list');
        setFundBalanceData(fundBalanceResult);
        // 设置最后更新时间
        if (fundBalanceResult && fundBalanceResult.length > 0) {
          const lastItem = fundBalanceResult[fundBalanceResult.length - 1];
          if (lastItem.recordDate) {
            setLastRecordDate(lastItem.recordDate);
          }
          if (lastItem.updateTime) {
            setFundUpdateTime(lastItem.updateTime);
          }
        }

        // 3. 累计回款
        const paymentPlanResult = await request.get('/payment-plan/list');
        setPaymentPlanData(paymentPlanResult);
        // 设置最后更新时间
        if (paymentPlanResult && paymentPlanResult.length > 0) {
          const lastItem = paymentPlanResult[paymentPlanResult.length - 1];
          if (lastItem.updateTime) {
            setLastUpdateTime(lastItem.updateTime);
          }
        }

        // 4. 利率分析
        const financeDiscountResult = await request.get('/finance-discount/list');
        setFinanceDiscountData(financeDiscountResult);

        // 5. 每日付款计划
        const dailyPaymentPlanResult = await request.get('/daily-payment-plan/list');
        setDailyPaymentPlanData(dailyPaymentPlanResult);
        // 设置最后更新时间
        if (dailyPaymentPlanResult && dailyPaymentPlanResult.length > 0) {
          const lastItem = dailyPaymentPlanResult[dailyPaymentPlanResult.length - 1];
          if (lastItem.updateTime) {
            setDailyPlanUpdateTime(lastItem.updateTime);
          }
        }

        // 6. 挂牌价格
        const listingPriceResult = await request.get('/listing-price/list');
        setListingPriceData(listingPriceResult);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 处理API数据
  // 1. 每日资金余额数据处理
  const dailyFundsRaw = {
    units: fundBalanceData.map(item => item.company),
    现汇: fundBalanceData.map(item => item.cash || 0),
    银承: fundBalanceData.map(item => item.bankAcceptance || 0),
    美易单: fundBalanceData.map(item => item.meiyidan || 0),
    融单: fundBalanceData.map(item => item.rongdan || 0),
    金单: fundBalanceData.map(item => item.jindan || 0),
    迪链: fundBalanceData.map(item => item.dilian || 0)
  };
  
  const companyTotal = dailyFundsRaw.units.map((_, idx) => 
    dailyFundsRaw.现汇[idx] + 
    dailyFundsRaw.银承[idx] + 
    dailyFundsRaw.美易单[idx] + 
    dailyFundsRaw.融单[idx] + 
    dailyFundsRaw.金单[idx] + 
    dailyFundsRaw.迪链[idx]
  );
  const sortedIndices = [...Array(dailyFundsRaw.units.length).keys()].sort((a,b) => companyTotal[b] - companyTotal[a]);
  const sortedFunds = { 
    units: sortedIndices.map(i => dailyFundsRaw.units[i]), 
    现汇: sortedIndices.map(i => dailyFundsRaw.现汇[i]), 
    银承: sortedIndices.map(i => dailyFundsRaw.银承[i]), 
    美易单: sortedIndices.map(i => dailyFundsRaw.美易单[i]),
    融单: sortedIndices.map(i => dailyFundsRaw.融单[i]),
    金单: sortedIndices.map(i => dailyFundsRaw.金单[i]),
    迪链: sortedIndices.map(i => dailyFundsRaw.迪链[i])
  };
  
  // 2. 应收账款数据处理
  // 动态获取所有公司和物料类型
  const allCompanies = [...new Set(receivableData.map(item => item.company))];
  const allMaterialTypes = [...new Set(receivableData.map(item => item.materialType))];
  
  // 为每个公司和物料类型的组合创建数据源
  const companyData: any = {};
  
  allCompanies.forEach(company => {
    allMaterialTypes.forEach(materialType => {
      const tabKey = `${company}${materialType}`;
      const filteredData = receivableData.filter(item => item.company === company && item.materialType === materialType);
      
      if (filteredData.length > 0) {
        // 按供应商分组
        const suppliers = [...new Set(filteredData.map(item => item.supplier))];
        
        // 为每个供应商计算现汇和承兑金额
        const spotBook = suppliers.map(supplier => {
          const supplierData = filteredData.find(item => item.supplier === supplier && item.paymentType === '现汇');
          return supplierData ? supplierData.receivableAmount || 0 : 0;
        });
        
        const acceptBook = suppliers.map(supplier => {
          const supplierData = filteredData.find(item => item.supplier === supplier && item.paymentType === '承兑');
          return supplierData ? supplierData.receivableAmount || 0 : 0;
        });
        
        const spotOverdue = suppliers.map(supplier => {
          const supplierData = filteredData.find(item => item.supplier === supplier && item.paymentType === '现汇');
          return supplierData ? supplierData.overdueAmount || 0 : 0;
        });
        
        const acceptOverdue = suppliers.map(supplier => {
          const supplierData = filteredData.find(item => item.supplier === supplier && item.paymentType === '承兑');
          return supplierData ? supplierData.overdueAmount || 0 : 0;
        });
        
        companyData[tabKey] = {
          name: `${company}${materialType}`,
          clients: suppliers,
          spotBook,
          acceptBook,
          spotOverdue,
          acceptOverdue
        };
      }
    });
  });
  
  // 设置默认选中的选项卡
  const tabKeys = Object.keys(companyData);
  if (tabKeys.length > 0 && !activeDetailTab) {
    setActiveDetailTab(tabKeys[0]);
  }
  
  // 铁合金和钢丸数据处理
  const ferroRaw = receivableData.filter(item => item.materialType === '铁合金').map(item => ({
    client: item.supplier,
    spotBook: item.paymentType === '现汇' ? (item.receivableAmount || 0) : 0,
    acceptBook: item.paymentType === '承兑' ? (item.receivableAmount || 0) : 0,
    spotOverdue: item.paymentType === '现汇' ? (item.overdueAmount || 0) : 0,
    acceptOverdue: item.paymentType === '承兑' ? (item.overdueAmount || 0) : 0,
    totalBook: item.receivableAmount || 0,
    totalOverdue: item.overdueAmount || 0
  }));
  
  const ferroSorted = [...ferroRaw].sort((a,b) => b.totalBook - a.totalBook);
  const ferroClients = ferroSorted.map(v => v.client);
  const ferroSpotBook = ferroSorted.map(v => v.spotBook);
  const ferroAcceptBook = ferroSorted.map(v => v.acceptBook);
  const ferroSpotOverdue = ferroSorted.map(v => v.spotOverdue);
  const ferroAcceptOverdue = ferroSorted.map(v => v.acceptOverdue);
  const ferroBooks = ferroSorted.map(v => v.totalBook);
  const ferroOverdue = ferroSorted.map(v => v.totalOverdue);
  const totalFerroBook = ferroSorted.reduce((a,b)=>a+b.totalBook,0);
  const totalFerroOverdue = ferroSorted.reduce((a,b)=>a+b.totalOverdue,0);
  
  const steelRaw = receivableData.filter(item => item.materialType === '钢丸').map(item => ({
    client: item.supplier,
    spotBook: item.paymentType === '现汇' ? (item.receivableAmount || 0) : 0,
    acceptBook: item.paymentType === '承兑' ? (item.receivableAmount || 0) : 0,
    spotOverdue: item.paymentType === '现汇' ? (item.overdueAmount || 0) : 0,
    acceptOverdue: item.paymentType === '承兑' ? (item.overdueAmount || 0) : 0,
    totalBook: item.receivableAmount || 0,
    totalOverdue: item.overdueAmount || 0
  }));
  
  const steelSorted = [...steelRaw].sort((a,b) => b.totalBook - a.totalBook);
  const steelClients = steelSorted.map(v => v.client);
  const steelSpotBook = steelSorted.map(v => v.spotBook);
  const steelAcceptBook = steelSorted.map(v => v.acceptBook);
  const steelSpotOverdue = steelSorted.map(v => v.spotOverdue);
  const steelAcceptOverdue = steelSorted.map(v => v.acceptOverdue);
  const steelBooks = steelSorted.map(v => v.totalBook);
  const steelOverdueList = steelSorted.map(v => v.totalOverdue);
  const totalSteelBook = steelSorted.reduce((a,b)=>a+b.totalBook,0);
  const totalSteelOverdue = steelSorted.reduce((a,b)=>a+b.totalOverdue,0);
  
  // 3. 付款计划数据处理
  const paymentPlanRaw = dailyPaymentPlanData.reduce((acc, item) => {
    const existingCompany = acc.find(company => company.company === item.company);
    if (existingCompany) {
      existingCompany.suppliers.push({ name: item.supplier || '供应商', amount: item.amount || 0, date: item.date });
    } else {
      acc.push({ company: item.company, suppliers: [{ name: item.supplier || '供应商', amount: item.amount || 0, date: item.date }] });
    }
    return acc;
  }, [] as { company: string; suppliers: { name: string; amount: number; date: string }[] }[]);
  
  const paymentPlanWithTotals = paymentPlanRaw.map(cd => ({ ...cd, totalAmount: cd.suppliers.reduce((s,sup)=>s+sup.amount,0) })).sort((a,b)=>b.totalAmount - a.totalAmount);
  const allSuppliers = [...new Set(paymentPlanRaw.flatMap(d => d.suppliers.map(s => s.name)))];
  
  // 4. 利率分析数据处理
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  const rawDiscountInterest = financeDiscountData.map(item => item.discountInterest || 0);
  const discountInterestWan = rawDiscountInterest.map(v => Math.round(v / 10000));
  
  // 5. 挂牌价格数据处理
  // 按月份和类型组织数据
  const listingMonthsWithData = [...new Set(listingPriceData.map(item => item.month))].sort();
  const priceTypes = [...new Set(listingPriceData.map(item => item.priceType))];
  
  // 构建按月份和类型组织的数据结构
  const listingDataByMonth = listingMonthsWithData.map(month => {
    const monthData = priceTypes.map(type => {
      const item = listingPriceData.find(i => i.month === month && i.priceType === type);
      return { name: type, value: item ? item.priceRate || 0 : 0 };
    });
    return { month, data: monthData };
  });
  
  // 为了保持兼容性，仍然保留 febListingData
  const febListingData = listingPriceData.map(item => ({ name: item.priceType, value: item.priceRate || 0 }));
  
  const rateData = financeDiscountData.map(item => item.interestRate || 0);
  
  // 6. 月度回款结构数据处理
  // 按月份和付款类型组织数据
  const paymentTypes = [...new Set(paymentPlanData.map(item => item.paymentType))];
  
  // 获取有数据的月份，按顺序排序
  const monthsWithData = [...new Set(paymentPlanData.map(item => item.month))].sort((a, b) => {
    // 提取月份数字进行排序
    const monthA = parseInt(a.replace('月', ''));
    const monthB = parseInt(b.replace('月', ''));
    return monthA - monthB;
  });
  
  // 生成颜色数组
  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#64748b', '#f97316'];
  
  const monthlyCollectionData = {
    paymentTypes,
    colors,
    monthsWithData,
    data: paymentTypes.map((type, index) => {
      return {
        type,
        color: colors[index % colors.length],
        values: monthsWithData.map(month => {
          const item = paymentPlanData.find(i => i.month === month && i.paymentType === type);
          return item ? item.ratio || 0 : 0;
        })
      };
    })
  };
  
  // 计算当年各汇款类型的总回款数据（用于饼状图）
  // 根据回款结构接口中每个月的amount字段合计进行计算占比
  const totalAmount = paymentPlanData.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  const collectionTypeData = paymentTypes.map((type, index) => {
    // 计算该类型的总金额
    const typeTotalAmount = paymentPlanData
      .filter(item => item.paymentType === type)
      .reduce((sum, item) => sum + (item.amount || 0), 0);
    
    // 计算占比（百分比）
    const percentage = totalAmount > 0 ? (typeTotalAmount / totalAmount * 100).toFixed(1) : 0;
    
    return {
      type,
      value: parseFloat(percentage),
      color: colors[index % colors.length],
      amount: typeTotalAmount
    };
  }).filter(item => item.value > 0);
  
  // 辅助函数
  const todayStr = () => {
    if (lastRecordDate) {
      return lastRecordDate;
    }
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const updateTimeStr = () => {
    if (lastUpdateTime) {
      // 格式化为 YYYY-MM-DD HH:mm:ss
      return lastUpdateTime.replace('T', ' ').substring(0, 19);
    }
    return todayStr();
  };

  const fundUpdateTimeStr = () => {
    if (fundUpdateTime) {
      // 格式化为 YYYY-MM-DD HH:mm:ss
      return fundUpdateTime.replace('T', ' ').substring(0, 19);
    }
    return todayStr();
  };

  const dailyPlanUpdateTimeStr = () => {
    if (dailyPlanUpdateTime) {
      // 格式化为 YYYY-MM-DD HH:mm:ss
      return dailyPlanUpdateTime.replace('T', ' ').substring(0, 19);
    }
    return todayStr();
  };
  
  const monthWeekStr = () => {
    const d = new Date();
    const m = d.getMonth() + 1;
    const week = Math.ceil(d.getDate() / 7);
    return `${m}月 第${week}周`;
  };
  
  const toWanInt = (yuan: number) => Math.round(yuan / 10000);
  
  // 计算资金余额总计
  const totalCash = sortedFunds.现汇.reduce((a,b)=>a+b,0);
  const totalBank = sortedFunds.银承.reduce((a,b)=>a+b,0);
  const totalMeiyi = sortedFunds.美易单.reduce((a,b)=>a+b,0);
  const totalRongdan = sortedFunds.融单.reduce((a,b)=>a+b,0);
  const totalJindan = sortedFunds.金单.reduce((a,b)=>a+b,0);
  const totalDilian = sortedFunds.迪链.reduce((a,b)=>a+b,0);
  const totalFunds = toWanInt(totalCash + totalBank + totalMeiyi + totalRongdan + totalJindan + totalDilian);
  
  // 计算应收账款总计（现汇和承兑拆分）
  // 获取所有公司名称
  const companies = [...new Set(receivableData.map(item => item.company))];
  
  const companySpotBookValues = companies.map(company => 
    receivableData.filter(item => item.company === company && item.paymentType === '现汇').reduce((sum, item) => sum + (item.receivableAmount || 0), 0)
  );
  
  const companyAcceptBookValues = companies.map(company => 
    receivableData.filter(item => item.company === company && item.paymentType === '承兑').reduce((sum, item) => sum + (item.receivableAmount || 0), 0)
  );
  
  const companySpotOverdueValues = companies.map(company => 
    receivableData.filter(item => item.company === company && item.paymentType === '现汇').reduce((sum, item) => sum + (item.overdueAmount || 0), 0)
  );
  
  const companyAcceptOverdueValues = companies.map(company => 
    receivableData.filter(item => item.company === company && item.paymentType === '承兑').reduce((sum, item) => sum + (item.overdueAmount || 0), 0)
  );
  
  const companyBookValues = companySpotBookValues.map((spot, index) => spot + companyAcceptBookValues[index]);
  const companyOverdueValues = companySpotOverdueValues.map((spot, index) => spot + companyAcceptOverdueValues[index]);
  
  // 计算总账面应收和总逾期，不重复计算铁合金和钢丸数据
  // 直接从所有数据中计算，确保包含所有公司
  const totalBook = receivableData.reduce((sum, item) => sum + (item.receivableAmount || 0), 0);
  const totalOverdue = receivableData.reduce((sum, item) => sum + (item.overdueAmount || 0), 0);

  // 主料应收：丰驰 + 昌泽 + 耀通 (现汇 + 承兑) 且 materialType 为主料
  const totalZhuLiaoBook = receivableData
    .filter(item => ['丰驰', '昌泽', '耀通'].includes(item.company) && item.materialType === '主料')
    .reduce((sum, item) => sum + (item.receivableAmount || 0), 0);
  
  // 计算付款计划总计
  const totalPlanAmount = paymentPlanWithTotals.reduce((sum, item) => sum + item.totalAmount, 0);
  
  // 获取当天日期
  const today = new Date().toISOString().split('T')[0];
  
  // 获取当天的资金使用需求数据
  const todayPlanData = dailyPaymentPlanData
    .filter(item => item.date === today)
    .sort((a, b) => a.company.localeCompare(b.company) || (a.supplier || '').localeCompare(b.supplier || ''));
  
  // 计算当日付款计划合计
  const todayPlanTotalAmount = todayPlanData.reduce((sum, item) => sum + item.amount, 0);
  
  // 切换到二级看板
  const switchToLevel = (card: string) => {
    setActiveLevel2Card(card);
    if (card === 'finance') {
      setActiveDiscountTab('price');
    }
    setActiveLevel('level2');
  };
  
  // 切换回一级看板
  const switchToLevel1 = () => {
    setActiveLevel('level1');
  };
  
  return (
    <div ref={dashboardRef} className={isFullscreen ? 'fullscreen' : ''}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ fontSize: '1.2rem', color: '#2f73ff' }}>加载数据中...</div>
        </div>
      ) : (
        <>
          {/* 一级看板 */}
          {activeLevel === 'level1' && (
            <div className="page">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
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
          <div className="pie-grid">
            {/* 资金饼图 */}
            <div className="pie-card" onClick={() => switchToLevel('funds')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>💰 每日资金余额 <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2f73ff' }}>¥ {totalFunds.toLocaleString()} 万</span></h3>
                <div className="date-selector"><span className="status-dot"></span> 更新时间: {fundUpdateTimeStr()}</div>
              </div>
              <div className="pie-chart">
                <FundBalancePieChart 
                  cashBalance={toWanInt(totalCash)} 
                  bankBalance={toWanInt(totalBank)} 
                  otherBalance={toWanInt(totalMeiyi)} 
                  rongdanBalance={toWanInt(totalRongdan)}
                  jindanBalance={toWanInt(totalJindan)}
                  dilianBalance={toWanInt(totalDilian)}
                />
              </div>
            </div>
            
            {/* 应收账款柱状图 */}
            <div className="pie-card" style={{ gridColumn: 'span 2' }} onClick={() => switchToLevel('receivable')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: '0' }}>📊 应收账款·账面vs逾期(万元)</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="mini-kpi">
                    <div className="kpi-title">账面应收</div>
                    <div className="kpi-value">¥ {toWanInt(totalBook).toLocaleString()} 万</div>
                  </div>
                  <div className="mini-kpi">
                    <div className="kpi-title">其中主料应收</div>
                    <div className="kpi-value" style={{ color: '#3b82f6' }}>¥ {toWanInt(totalZhuLiaoBook).toLocaleString()} 万</div>
                  </div>
                  <div className="mini-kpi">
                    <div className="kpi-title">逾期</div>
                    <div className="kpi-value" style={{ color: '#ef4444' }}>¥ {toWanInt(totalOverdue).toLocaleString()} 万</div>
                  </div>
                  <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
                </div>
              </div>
              <div className="pie-chart">
                <ReceivablesBarChart 
                  companies={companies} 
                  spotBookValues={companySpotBookValues.map(v => toWanInt(v))} 
                  acceptBookValues={companyAcceptBookValues.map(v => toWanInt(v))} 
                  spotOverdueValues={companySpotOverdueValues.map(v => toWanInt(v))} 
                  acceptOverdueValues={companyAcceptOverdueValues.map(v => toWanInt(v))} 
                />
              </div>
            </div>
            
            {/* 利率分析折线图 */}
            <div className="pie-card" onClick={() => switchToLevel('finance')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>📈 利率分析 (1-12月)</h3>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2f73ff' }}>贴现金额合计: ¥ {discountInterestWan.reduce((sum, value) => sum + value, 0).toLocaleString()} 万</span>
              </div>
              <div className="pie-chart">
                <InterestRateChart 
                  months={months} 
                  rateData={rateData} 
                  discountInterestData={discountInterestWan} 
                />
              </div>
            </div>
            
            {/* 每日付款计划饼状图 */}
            <div className="pie-card" onClick={() => switchToLevel('plan')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>📅 每日付款计划</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f97316' }}>合计: ¥ {totalPlanAmount.toFixed(2)} 万</span>
                  <div className="date-selector"><span className="status-dot"></span> 更新时间: {dailyPlanUpdateTimeStr()}</div>
                </div>
              </div>
              <div className="pie-chart">
                <PaymentPlanPieChart 
                  data={paymentPlanWithTotals.map(d => ({ name: d.company, value: d.totalAmount }))} 
                />
              </div>
            </div>
            
            {/* 月度回款结构饼状图 */}
            <div className="pie-card" onClick={() => switchToLevel('collection')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>💵 累计回款结构 (比率%)</h3>
                <div className="date-selector"><span className="status-dot"></span> 更新时间: {updateTimeStr()}</div>
              </div>
              <div className="pie-chart">
                <CollectionTypePieChart 
                  data={collectionTypeData} 
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 二级看板 */}
      {activeLevel === 'level2' && (
        <div className="page">
          <div className="page-header">
            <h1>财务智眸 | 深度分析</h1>
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
              <div className="back-link" onClick={switchToLevel1}>
                返回一级
              </div>
            </div>
          </div>
          <div className="charts-grid">
            {/* 资金余额卡片 */}
            {activeLevel2Card === 'funds' && (
              <div className="chart-card">
                <div className="chart-header-kpis">
                  <div className="kpi-title">每日资金余额 (万元)</div>
                  <div className="date-selector"><span className="status-dot"></span> 更新时间: {fundUpdateTimeStr()}</div>
                </div>
                <div className="chart-container">
                  <FundsBarChart 
                    units={sortedFunds.units} 
                    xianhui={sortedFunds.现汇.map(v => toWanInt(v))} 
                    yincheng={sortedFunds.银承.map(v => toWanInt(v))} 
                    meiyi={sortedFunds.美易单.map(v => toWanInt(v))} 
                    rongdan={sortedFunds.融单.map(v => toWanInt(v))}
                    jindan={sortedFunds.金单.map(v => toWanInt(v))}
                    dilian={sortedFunds.迪链.map(v => toWanInt(v))}
                  />
                </div>
              </div>
            )}
            
            {/* 应收账款明细卡片 */}
            {activeLevel2Card === 'receivable' && (
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div className="kpi-title" style={{ margin: '0' }}>应收账款明细</div>
                  <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
                </div>
                <div className="tab-header-mini">
                  {Object.keys(companyData).map(tabKey => (
                    <button
                      key={tabKey}
                      className={`mini-tab-btn ${activeDetailTab === tabKey ? 'active' : ''}`}
                      onClick={() => setActiveDetailTab(tabKey)}
                    >
                      {companyData[tabKey].name}
                    </button>
                  ))}
                </div>
                <div className="detail-chart-container">
                  <ReceivableDetailChart 
                    tab={activeDetailTab} 
                    companyData={companyData} 
                    ferroClients={[]} 
                    ferroBooks={[]} 
                    ferroOverdue={[]} 
                    ferroSpotBook={[]}
                    ferroAcceptBook={[]}
                    ferroSpotOverdue={[]}
                    ferroAcceptOverdue={[]}
                    steelClients={[]}
                    steelBooks={[]}
                    steelOverdueList={[]}
                    steelSpotBook={[]}
                    steelAcceptBook={[]}
                    steelSpotOverdue={[]}
                    steelAcceptOverdue={[]}
                  />
                </div>
                <div className="kpi-mini-row">
                  <div className="kpi-mini-item">
                    <span className="kpi-mini-label">账面应收总额</span>
                    <div className="kpi-mini-value">
                      {activeDetailTab && companyData[activeDetailTab] && `¥ ${toWanInt((companyData[activeDetailTab].spotBook.reduce((a,b)=>a+b,0) + companyData[activeDetailTab].acceptBook.reduce((a,b)=>a+b,0))).toLocaleString()} 万`}
                    </div>
                  </div>
                  <div className="kpi-mini-item">
                    <span className="kpi-mini-label">逾期总额</span>
                    <div className="kpi-mini-value">
                      {activeDetailTab && companyData[activeDetailTab] && `¥ ${toWanInt((companyData[activeDetailTab].spotOverdue.reduce((a,b)=>a+b,0) + companyData[activeDetailTab].acceptOverdue.reduce((a,b)=>a+b,0))).toLocaleString()} 万`}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 趋势图 */}
            {activeLevel2Card === 'plan' && (
              <div className="chart-card">
                <div className="chart-header-kpis">
                  <div className="mini-kpi">
                    <div className="kpi-title"><i className="fas fa-chart-line"></i> 趋势图</div>
                    <div className="kpi-value">¥ <span>{totalPlanAmount.toLocaleString()}</span> <span style={{ fontSize: '0.8rem' }}>万</span></div>
                  </div>
                  <div className="date-selector" id="planDateBadge"><span className="status-dot"></span> 更新时间: {dailyPlanUpdateTimeStr()}</div>
                </div>
                <div className="chart-container" style={{ height: '55vh', minHeight: '300px' }}>
                  <PaymentPlanChart 
                    companies={paymentPlanWithTotals.map(d => d.company)} 
                    suppliers={allSuppliers} 
                    paymentPlanData={paymentPlanWithTotals} 
                    isYearly={false} // 二级看板显示月趋势
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    years={['2024', '2025', '2026', '2027']}
                    months={Array.from({ length: 12 }, (_, i) => (i + 1).toString())}
                    onYearChange={setSelectedYear}
                    onMonthChange={setSelectedMonth}
                  />
                </div>
                <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h4 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: '600' }}>当天资金使用需求</h4>
                  <div style={{ height: '250px' }}>
                    {todayPlanData.length > 0 ? (
                      <TodayPlanBarChart data={todayPlanData} />
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                        当天暂无资金使用需求
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '12px', textAlign: 'right', fontWeight: '600', color: '#2f73ff' }}>
                    当日合计: {todayPlanData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)} 万元
                  </div>
                </div>
              </div>
            )}
            
            {/* 月度回款结构 */}
            {activeLevel2Card === 'collection' && (
              <div className="chart-card">
                <div className="chart-header-kpis">
                  <div className="mini-kpi">
                    <div className="kpi-title"><i className="fas fa-chart-line"></i> 月度回款结构</div>
                  </div>
                  <div className="date-selector"><span className="status-dot"></span> 更新时间: {updateTimeStr()}</div>
                </div>
                <div className="chart-container">
                  <MonthlyCollectionChart 
                    months={monthlyCollectionData.monthsWithData} 
                    data={monthlyCollectionData.data} 
                  />
                </div>
              </div>
            )}
            
            {/* 挂牌价\利率分析 二标签页 */}
            {activeLevel2Card === 'finance' && (
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '0.95rem', margin: '0' }}></h3>
                </div>
                <div className="triple-tab-container">
                  <div className="triple-tabs">
                    <button 
                      className={`triple-tab ${activeDiscountTab === 'price' ? 'active' : ''}`} 
                      onClick={() => setActiveDiscountTab('price')}
                    >
                      🏷️ 挂牌价
                    </button>
                  </div>
                  <div className="triple-chart-panel">
                    <DiscountPanelChart 
                      activeTab="price" 
                      months={months} 
                      discountInterestWan={discountInterestWan} 
                      febListingData={febListingData} 
                      rateData={rateData} 
                      listingDataByMonth={listingDataByMonth}
                    />
                  </div>
                </div>
                <div className="click-hint" style={{ marginTop: '6px' }}>数据源：月度综合贴现金额/利息 | 挂牌价基于2月市场参考</div>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
      
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            overflow: hidden;
        }
        .fullscreen {
            background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            overflow: hidden;
        }
        .fullscreen .page {
            height: 100vh;
            background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
        }
        .page {
            max-width: 100%;
            margin: 0;
            padding: 12px 16px;
            transition: all 0.3s ease;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .page.hidden { display: none; }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
            margin-bottom: 12px;
            gap: 16px;
        }
        h1 {
            font-size: 1.4rem;
            font-weight: 800;
            background: linear-gradient(135deg, #0f172a, #334155);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .back-link {
            background: rgba(47, 115, 255, 0.1);
            border: 1px solid rgba(47, 115, 255, 0.3);
            border-radius: 32px;
            padding: 6px 16px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #2f73ff;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .back-link:hover {
            background: #2f73ff;
            color: white;
            border-color: #2f73ff;
            box-shadow: 0 4px 10px rgba(47,115,255,0.2);
        }
        .pie-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            grid-template-rows: repeat(2, 1fr);
            gap: 12px;
            flex: 1;
            min-height: 0;
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
        /* 一级面板图表高度基于视口，确保两行铺满且不滚动 */
        #pagePie .pie-chart { height: 32vh; }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr; /* 1x1 布局 */
            grid-template-rows: 1fr;
            gap: 0;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            align-content: stretch;
        }
        .chart-card {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(8px);
            border-radius: 20px;
            padding: 16px 24px; /* 适当增加内边距 */
            border: 1px solid rgba(255, 255, 255, 0.7);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100%; /* 充满父容器 */
        }
        /* 二级面板图表高度充满屏幕 */
        .chart-container { width: 100%; height: 75vh; min-height: 0; flex: 1; }
        .chart-header-kpis {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            flex-shrink: 0;
        }
        .mini-kpi .kpi-title { font-size: 0.8rem; color: #64748b; margin-bottom: 4px; white-space: nowrap; }  
        .mini-kpi .kpi-value { font-size: 1.4rem; font-weight: 800; white-space: nowrap; }
        .tab-header-mini {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            flex-shrink: 0;
        }
        #pageChart .chart-card h3 i,
        #pageChart .chart-card .kpi-title i {
            font-size: 1.1rem;
            margin-right: 8px;
            color: #64748b;
        }
        .mini-tab-btn {
            padding: 4px 16px;
            border-radius: 24px;
            font-size: 0.8rem;
            font-weight: 600;
            background: #f1f5f9;
            border: none;
            cursor: pointer;
            transition: 0.2s;
            color: #475569;
        }
        .mini-tab-btn.active {
            background: linear-gradient(135deg, #2f73ff, #4e8cff);
            color: white;
            box-shadow: 0 2px 6px rgba(47,115,255,0.2);
        }
        .detail-chart-container { width: 100%; height: 70vh; min-height: 0; flex: 1; }
        .kpi-mini-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 12px;
            background: #f8fafc;
            border-radius: 16px;
            padding: 10px 16px;
            flex-shrink: 0;
        }
        .kpi-mini-item { flex: 1; text-align: center; }
        .kpi-mini-label { font-size: 0.75rem; color: #64748b; }
        .kpi-mini-value { font-weight: 800; font-size: 1.1rem; color: #0f172a; }
        .click-hint { font-size: 0.7rem; color: #94a3b8; text-align: right; margin-top: 10px; }
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
        .triple-tab-container { display: flex; flex-direction: column; flex: 1; min-height: 0; }
        .triple-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 8px;
            flex-shrink: 0;
        }
        .triple-tab {
            background: transparent;
            border: none;
            padding: 8px 20px;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 28px;
            cursor: pointer;
            color: #475569;
            transition: all 0.2s;
        }
        .triple-tab.active {
            background: #2f73ff;
            color: white;
            box-shadow: 0 2px 8px rgba(47,115,255,0.3);
        }
        .triple-chart-panel { width: 100%; height: 70vh; }
        .panel-chart { width: 100%; height: 100%; min-height: 0; }
        @media (max-width: 1024px) {
            .pie-grid, .charts-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

