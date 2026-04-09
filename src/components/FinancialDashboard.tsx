import React, { useState, useEffect } from 'react';
import { FundBalancePieChart } from './charts/FundBalancePieChart';
import { ReceivablesBarChart } from './charts/ReceivablesBarChart';
import { InterestRateChart } from './charts/InterestRateChart';
import { PaymentPlanPieChart } from './charts/PaymentPlanPieChart';
import { FundsBarChart } from './charts/FundsBarChart';
import { ReceivableDetailChart } from './charts/ReceivableDetailChart';
import { PaymentPlanChart } from './charts/PaymentPlanChart';
import { DiscountPanelChart } from './charts/DiscountPanelChart';
import type { FinancialData } from '../types';

interface FinancialDashboardProps {
  data: FinancialData;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ data }) => {
  const [activeLevel, setActiveLevel] = useState<'level1' | 'level2'>('level1');
  const [activeDetailTab, setActiveDetailTab] = useState<string>('fengchi');
  const [activeDiscountTab, setActiveDiscountTab] = useState<string>('interest');
  const [activeLevel2Card, setActiveLevel2Card] = useState<string>('funds');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const dashboardRef = React.useRef<HTMLDivElement>(null);

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

  // 基础数据
  const dailyFundsRaw = { units: ['耀通', '昌泽', '丰驰'], 现汇: [822189.45, 549463.22, 312689.32], 银承: [17456717.01, 5038268.44, 15537677.01], 美易单: [0, 0, 83283.6] };
  const companyTotal = dailyFundsRaw.units.map((_, idx) => dailyFundsRaw.现汇[idx] + dailyFundsRaw.银承[idx] + dailyFundsRaw.美易单[idx]);
  const sortedIndices = [...Array(dailyFundsRaw.units.length).keys()].sort((a,b) => companyTotal[b] - companyTotal[a]);
  const sortedFunds = { units: sortedIndices.map(i => dailyFundsRaw.units[i]), 现汇: sortedIndices.map(i => dailyFundsRaw.现汇[i]), 银承: sortedIndices.map(i => dailyFundsRaw.银承[i]), 美易单: sortedIndices.map(i => dailyFundsRaw.美易单[i]) };
  
  const companyData = {
    fengchi: {
      name: '丰驰',
      clients: ['精密', '圣德曼', '洪洞', '翼城', '重工'],
      book: [5976988.68, 10912567.54, 12830866.13, 320978.01, 1963551.08],
      overdue: [4853611.75, 4605914.36, 5395887.70, 320978.01, 1291777.50]
    },
    changze: {
      name: '昌泽',
      clients: ['精密', '圣德曼', '洪洞', '翼城', '重工'],
      book: [480791.13, 4689962.08, 1552166.71, 0, 0],
      overdue: [384632.90, 2117877.34, 1241733.37, 0, 0]
    },
    yaotong: {
      name: '耀通',
      clients: ['精密', '圣德曼', '洪洞', '翼城', '重工'],
      book: [1371342.99, 12921720.00, 2817905.40, 0, 0],
      overdue: [753346.39, 5667214.59, 1521343.46, 0, 0]
    }
  };
  
  const ferroRaw = [{ client: '精密', book: 371318.5, overdue: 371318.5-169365.3 },{ client: '圣德曼', book: 695580.4, overdue: 0 },{ client: '洪洞', book: 1783018.6, overdue: 1783018.6-955025.9 },{ client: '翼城', book: 195671.7, overdue: 195671.7 },{ client: '重工', book: 593630, overdue: 593630 }];
  const ferroSorted = [...ferroRaw].sort((a,b) => b.book - a.book);
  const ferroClients = ferroSorted.map(v => v.client);
  const ferroBooks = ferroSorted.map(v => v.book);
  const ferroOverdue = ferroSorted.map(v => v.overdue);
  const totalFerroBook = ferroBooks.reduce((a,b)=>a+b,0);
  const totalFerroOverdue = ferroOverdue.reduce((a,b)=>a+b,0);
  
  const steelRaw = [{ client: '精密', book: 835127.3-139511.4, overdue: 0 },{ client: '圣德曼', book: 3850575.5, overdue: 0 },{ client: '洪洞', book: 6214313.1, overdue: 0 },{ client: '轻合金', book: 140244, overdue: 0 },{ client: '翼城', book: 257182.3, overdue: 103537.8 },{ client: '广东翔泰', book: 58170, overdue: 0 },{ client: '重工', book: 288528.8, overdue: 8160.6 }];
  const steelSorted = [...steelRaw].sort((a,b) => b.book - a.book);
  const steelClients = steelSorted.map(v => v.client);
  const steelBooks = steelSorted.map(v => v.book);
  const steelOverdueList = steelSorted.map(v => v.overdue);
  const totalSteelBook = steelBooks.reduce((a,b)=>a+b,0);
  const totalSteelOverdue = steelOverdueList.reduce((a,b)=>a+b,0);
  
  const paymentPlanRaw = [
    { company: "耀通", suppliers: [{ name: "信阳华鑫汇", amount: 100 }, { name: "天津利都", amount: 200 }, { name: "信阳申淮", amount: 100 }, { name: "大城隆越", amount: 100 }, { name: "湖北翰联", amount: 50 }] },
    { company: "丰驰", suppliers: [{ name: "信阳华鑫汇", amount: 100 }, { name: "天津利都", amount: 100 }, { name: "信阳申淮", amount: 100 }, { name: "陕西聚运", amount: 200 }, { name: "陕西锦邦", amount: 100 }, { name: "大城隆越", amount: 100 }, { name: "湖北翰联", amount: 100 }] },
    { company: "昌泽", suppliers: [{ name: "信阳华鑫汇", amount: 50 }, { name: "虎溪铜盐厂", amount: 50 }] },
    { company: "现汇户", suppliers: [{ name: "个人", amount: 100 }] }
  ];
  const paymentPlanWithTotals = paymentPlanRaw.map(cd => ({ ...cd, totalAmount: cd.suppliers.reduce((s,sup)=>s+sup.amount,0) })).sort((a,b)=>a.totalAmount - b.totalAmount);
  const allSuppliers = [...new Set(paymentPlanRaw.flatMap(d => d.suppliers.map(s => s.name)))];
  
  const rawDiscountInterest = [438332.31, 142905.95, 498239.06, 458246.22, 532686.61, 492628.54, 529290.14, 424633.61, 630215.43, 626037.21, 539236.62, 1020669.75];
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const discountInterestWan = rawDiscountInterest.map(v => Math.round(v / 10000));
  
  const febListingData = [
    { name: '银承', value: 1.30 },
    { name: '美易单', value: 2.80 },
    { name: '融单', value: 3.86 },
    { name: '金单', value: 7.20 },
    { name: '迪链', value: 2.98 }
  ];
  
  const rateData = [2.16, 1.23, 1.97, 1.59, 1.38, 1.45, 1.67, 1.36, 1.32, 1.32, 1.25, 2.24];
  
  // 辅助函数
  const todayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
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
  const totalFunds = toWanInt(totalCash + totalBank + totalMeiyi);
  
  // 计算应收账款总计
  const companyBookValues = [32004951.44, 6907769.92, 17110968.39];
  const companyOverdueValues = [16468169.32, 3744243.62, 7941904.44];
  const totalBook = companyBookValues.reduce((sum, val) => sum + val, 0) + totalFerroBook + totalSteelBook;
  const totalOverdue = companyOverdueValues.reduce((sum, val) => sum + val, 0) + totalFerroOverdue + totalSteelOverdue;
  
  // 计算付款计划总计
  const totalPlanAmount = paymentPlanWithTotals.reduce((sum, item) => sum + item.totalAmount, 0);
  
  // 切换到二级看板
  const switchToLevel = (card: string) => {
    setActiveLevel2Card(card);
    setActiveLevel('level2');
  };
  
  // 切换回一级看板
  const switchToLevel1 = () => {
    setActiveLevel('level1');
  };
  
  return (
    <div ref={dashboardRef} className={isFullscreen ? 'fullscreen' : ''}>
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
                <h3><i className="fas fa-chart-simple"></i> 💰 每日资金余额 <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2f73ff' }}>¥ {totalFunds.toLocaleString()} 万</span></h3>
                <div className="date-selector"><span className="status-dot"></span> 日期: {todayStr()}</div>
              </div>
              <div className="pie-chart">
                <FundBalancePieChart 
                  cashBalance={toWanInt(totalCash)} 
                  bankBalance={toWanInt(totalBank)} 
                  otherBalance={toWanInt(totalMeiyi)} 
                />
              </div>
            </div>
            
            {/* 应收账款柱状图 */}
            <div className="pie-card" style={{ gridColumn: 'span 2' }} onClick={() => switchToLevel('receivable')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={{ margin: '0' }}>📊 应收账款·账面vs逾期(万元)</h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div className="mini-kpi">
                    <div className="kpi-title" style={{ fontSize: '0.7rem' }}>账面应收</div>
                    <div className="kpi-value" style={{ fontSize: '1rem' }}>¥ {toWanInt(totalBook).toLocaleString()} 万</div>
                  </div>
                  <div className="mini-kpi">
                    <div className="kpi-title" style={{ fontSize: '0.7rem' }}>逾期</div>
                    <div className="kpi-value" style={{ fontSize: '1rem', color: '#ef4444' }}>¥ {toWanInt(totalOverdue).toLocaleString()} 万</div>
                  </div>
                  <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
                </div>
              </div>
              <div className="pie-chart">
                <ReceivablesBarChart 
                  companies={['丰驰', '昌泽', '耀通']} 
                  bookValues={companyBookValues.map(v => toWanInt(v))} 
                  overdueValues={companyOverdueValues.map(v => toWanInt(v))} 
                />
              </div>
            </div>
            
            {/* 利率分析折线图 */}
            <div className="pie-card" onClick={() => switchToLevel('finance')}>
              <h3><i className="fas fa-chart-line"></i> 📈 利率分析 (1-12月)</h3>
              <div className="pie-chart">
                <InterestRateChart 
                  months={months} 
                  rateData={rateData} 
                />
              </div>
            </div>
            
            {/* 付款计划饼图 */}
            <div className="pie-card" onClick={() => switchToLevel('plan')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3><i className="fas fa-calendar-day"></i> 📅 每日付款计划 <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#2f73ff' }}>¥ {totalPlanAmount.toLocaleString()} 万</span></h3>
                <div className="date-selector"><span className="status-dot"></span> 日期: {todayStr()}</div>
              </div>
              <div className="pie-chart">
                <PaymentPlanPieChart 
                  data={paymentPlanWithTotals.map(d => ({ name: d.company, value: d.totalAmount }))} 
                />
              </div>
            </div>
            
            {/* 月度回款结构折线图 */}
            <div className="pie-card">
              <h3><i className="fas fa-hand-holding-dollar"></i> 💵 月度回款结构 (比率%)</h3>
              <div className="pie-chart">
                {/* 这里可以添加月度回款结构折线图组件 */}
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
                <i className={isFullscreen ? "fas fa-compress" : "fas fa-expand"}></i> {isFullscreen ? '退出全屏' : '全屏'}
              </button>
              <div className="back-link" onClick={switchToLevel1}>
                <i className="fas fa-arrow-left"></i> 返回一级
              </div>
            </div>
          </div>
          <div className="charts-grid">
            {/* 资金余额卡片 */}
            {activeLevel2Card === 'funds' && (
              <div className="chart-card">
                <div className="chart-header-kpis">
                  <div className="kpi-title"><i className="fas fa-coins"></i> 每日资金余额 (万元)</div>
                  <div className="date-selector"><span className="status-dot"></span> 日期: {todayStr()}</div>
                </div>
                <div className="chart-container">
                  <FundsBarChart 
                    units={sortedFunds.units} 
                    xianhui={sortedFunds.现汇.map(v => toWanInt(v))} 
                    yincheng={sortedFunds.银承.map(v => toWanInt(v))} 
                    meiyi={sortedFunds.美易单.map(v => toWanInt(v))} 
                  />
                </div>
              </div>
            )}
            
            {/* 应收账款明细卡片 */}
            {activeLevel2Card === 'receivable' && (
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div className="kpi-title" style={{ margin: '0' }}><i className="fas fa-receipt"></i> 应收账款明细</div>
                  <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
                </div>
                <div className="tab-header-mini">
                  <button 
                    className={`mini-tab-btn ${activeDetailTab === 'fengchi' ? 'active' : ''}`} 
                    onClick={() => setActiveDetailTab('fengchi')}
                  >
                    丰驰
                  </button>
                  <button 
                    className={`mini-tab-btn ${activeDetailTab === 'changze' ? 'active' : ''}`} 
                    onClick={() => setActiveDetailTab('changze')}
                  >
                    昌泽
                  </button>
                  <button 
                    className={`mini-tab-btn ${activeDetailTab === 'yaotong' ? 'active' : ''}`} 
                    onClick={() => setActiveDetailTab('yaotong')}
                  >
                    耀通
                  </button>
                  <button 
                    className={`mini-tab-btn ${activeDetailTab === 'ferro' ? 'active' : ''}`} 
                    onClick={() => setActiveDetailTab('ferro')}
                  >
                    铁合金
                  </button>
                  <button 
                    className={`mini-tab-btn ${activeDetailTab === 'steel' ? 'active' : ''}`} 
                    onClick={() => setActiveDetailTab('steel')}
                  >
                    钢丸
                  </button>
                </div>
                <div className="detail-chart-container">
                  <ReceivableDetailChart 
                    tab={activeDetailTab} 
                    companyData={companyData} 
                    ferroClients={ferroClients} 
                    ferroBooks={ferroBooks.map(v => toWanInt(v))} 
                    ferroOverdue={ferroOverdue.map(v => toWanInt(v))} 
                    steelClients={steelClients} 
                    steelBooks={steelBooks.map(v => toWanInt(v))} 
                    steelOverdueList={steelOverdueList.map(v => toWanInt(v))} 
                  />
                </div>
                <div className="kpi-mini-row">
                  <div className="kpi-mini-item">
                    <span className="kpi-mini-label">账面应收总额</span>
                    <div className="kpi-mini-value">
                      {activeDetailTab === 'fengchi' && `¥ ${toWanInt(companyData.fengchi.book.reduce((a,b)=>a+b,0)).toLocaleString()} 万`}
                      {activeDetailTab === 'changze' && `¥ ${toWanInt(companyData.changze.book.reduce((a,b)=>a+b,0)).toLocaleString()} 万`}
                      {activeDetailTab === 'yaotong' && `¥ ${toWanInt(companyData.yaotong.book.reduce((a,b)=>a+b,0)).toLocaleString()} 万`}
                      {activeDetailTab === 'ferro' && `¥ ${toWanInt(totalFerroBook).toLocaleString()} 万`}
                      {activeDetailTab === 'steel' && `¥ ${toWanInt(totalSteelBook).toLocaleString()} 万`}
                    </div>
                  </div>
                  <div className="kpi-mini-item">
                    <span className="kpi-mini-label">逾期总额</span>
                    <div className="kpi-mini-value">
                      {activeDetailTab === 'fengchi' && `¥ ${toWanInt(companyData.fengchi.overdue.reduce((a,b)=>a+b,0)).toLocaleString()} 万`}
                      {activeDetailTab === 'changze' && `¥ ${toWanInt(companyData.changze.overdue.reduce((a,b)=>a+b,0)).toLocaleString()} 万`}
                      {activeDetailTab === 'yaotong' && `¥ ${toWanInt(companyData.yaotong.overdue.reduce((a,b)=>a+b,0)).toLocaleString()} 万`}
                      {activeDetailTab === 'ferro' && `¥ ${toWanInt(totalFerroOverdue).toLocaleString()} 万`}
                      {activeDetailTab === 'steel' && `¥ ${toWanInt(totalSteelOverdue).toLocaleString()} 万`}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 每日付款计划 */}
            {activeLevel2Card === 'plan' && (
              <div className="chart-card">
                <div className="chart-header-kpis">
                  <div className="mini-kpi">
                    <div className="kpi-title"><i className="fas fa-calendar-week"></i> 每日付款计划总额</div>
                    <div className="kpi-value">¥ <span>{totalPlanAmount.toLocaleString()}</span> <span style={{ fontSize: '0.8rem' }}>万</span></div>
                  </div>
                  <div className="date-selector"><span className="status-dot"></span> 日期: {todayStr()}</div>
                </div>
                <div className="chart-container">
                  <PaymentPlanChart 
                    companies={paymentPlanWithTotals.map(d => d.company)} 
                    suppliers={allSuppliers} 
                    paymentPlanData={paymentPlanWithTotals} 
                  />
                </div>
              </div>
            )}
            
            {/* 贴现/利息/挂牌价 三标签页 */}
            {activeLevel2Card === 'finance' && (
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '0.95rem', margin: '0' }}></h3>
                </div>
                <div className="triple-tab-container">
                  <div className="triple-tabs">
                    <button 
                      className={`triple-tab ${activeDiscountTab === 'interest' ? 'active' : ''}`} 
                      onClick={() => setActiveDiscountTab('interest')}
                    >
                      📉 贴现利息 (月度)
                    </button>
                    <button 
                      className={`triple-tab ${activeDiscountTab === 'price' ? 'active' : ''}`} 
                      onClick={() => setActiveDiscountTab('price')}
                    >
                      🏷️ 2月挂牌价结构
                    </button>
                  </div>
                  <div className="triple-chart-panel">
                    <DiscountPanelChart 
                      activeTab={activeDiscountTab} 
                      months={months} 
                      discountInterestWan={discountInterestWan} 
                      febListingData={febListingData} 
                    />
                  </div>
                </div>
                <div className="click-hint" style={{ marginTop: '6px' }}><i className="fas fa-chart-simple"></i> 数据源：月度综合贴现金额/利息 | 挂牌价基于2月市场参考</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <style jsx>{`
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
        .mini-kpi .kpi-title { font-size: 0.8rem; color: #64748b; margin-bottom: 4px; }
        .mini-kpi .kpi-value { font-size: 1.4rem; font-weight: 800; }
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

