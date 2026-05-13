import React from 'react';
import ReactECharts from 'echarts-for-react';

interface PaymentPlanData {
  company: string;
  suppliers: { name: string; amount: number; date: string }[];
  totalAmount: number;
}

interface PaymentPlanChartProps {
  companies: string[];
  suppliers: string[];
  paymentPlanData: PaymentPlanData[];
  isYearly?: boolean;
  selectedYear?: string;
  selectedMonth?: string;
  years?: string[];
  months?: string[];
  onYearChange?: (year: string) => void;
  onMonthChange?: (month: string) => void;
}

export const PaymentPlanChart: React.FC<PaymentPlanChartProps> = ({ 
  companies, 
  suppliers, 
  paymentPlanData, 
  isYearly = false,
  selectedYear,
  selectedMonth,
  years = [],
  months = [],
  onYearChange,
  onMonthChange
}) => {
  // 为折线图准备数据
  const prepareLineChartData = () => {
    if (isYearly) {
      // 年趋势折线图 - 按月份展示
      // 从数据中提取有数据的月份
      const monthsWithData = [...new Set(paymentPlanData.flatMap(company => 
        company.suppliers.map(supplier => {
          if (supplier.date) {
            const month = new Date(supplier.date).getMonth() + 1;
            return month + '月';
          }
          return '';
        })
      ))].filter(Boolean).sort();
      
      // 如果没有数据，显示所有月份
      const xAxisData = monthsWithData.length > 0 ? monthsWithData : ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      
      return {
        xAxisData,
        series: companies.map(company => ({
          name: company,
          type: 'line',
          smooth: true,
          data: xAxisData.map(month => {
            // 计算该月份的总金额
            const monthNum = parseInt(month.replace('月', ''));
            let totalAmount = 0;
            
            paymentPlanData.forEach(p => {
              if (p.company === company) {
                p.suppliers.forEach(s => {
                  if (s.date) {
                    const itemMonth = new Date(s.date).getMonth() + 1;
                    if (itemMonth === monthNum) {
                      totalAmount += s.amount;
                    }
                  }
                });
              }
            });
            
            return totalAmount;
          }),
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均值' }
            ]
          }
        }))
      };
    } else {
      // 月趋势折线图 - 按日期展示
      // 从数据中提取有数据的日期
      const daysWithData = [...new Set(paymentPlanData.flatMap(company => 
        company.suppliers.map(supplier => {
          if (supplier.date) {
            const day = new Date(supplier.date).getDate();
            return day + '日';
          }
          return '';
        })
      ))].filter(Boolean).sort((a, b) => {
        const dayA = parseInt(a.replace('日', ''));
        const dayB = parseInt(b.replace('日', ''));
        return dayA - dayB;
      });
      
      // 如果没有数据，显示1-30日
      const xAxisData = daysWithData.length > 0 ? daysWithData : Array.from({ length: 30 }, (_, i) => (i + 1) + '日');
      
      return {
        xAxisData,
        series: companies.map(company => ({
          name: company,
          type: 'line',
          smooth: true,
          data: xAxisData.map(day => {
            // 计算该日期的总金额
            const dayNum = parseInt(day.replace('日', ''));
            let totalAmount = 0;
            
            paymentPlanData.forEach(p => {
              if (p.company === company) {
                p.suppliers.forEach(s => {
                  if (s.date) {
                    const itemDay = new Date(s.date).getDate();
                    if (itemDay === dayNum) {
                      totalAmount += s.amount;
                    }
                  }
                });
              }
            });
            
            return totalAmount;
          }),
          markPoint: {
            data: [
              { type: 'max', name: '最大值' },
              { type: 'min', name: '最小值' }
            ]
          },
          markLine: {
            data: [
              { type: 'average', name: '平均值' }
            ]
          }
        }))
      };
    }
  };

  const { xAxisData, series } = prepareLineChartData();

  const option = {
    tooltip: { 
      trigger: 'axis',
      valueFormatter: (v: number) => (v || 0).toFixed(0) + '万元'
    },
    legend: { 
      top: 30, 
      type: 'scroll'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData
    },
    yAxis: {
      type: 'value',
      name: '万元'
    },
    series
  };

  // 筛选控件
  const renderFilters = () => {
    if (!isYearly) {
      return (
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', alignItems: 'center' }}>
          <div>
            <label style={{ marginRight: '8px', fontSize: '0.9rem', color: '#475569' }}>年份:</label>
            <select 
              value={selectedYear} 
              onChange={(e) => onYearChange?.(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem'
              }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}年</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ marginRight: '8px', fontSize: '0.9rem', color: '#475569' }}>月份:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => onMonthChange?.(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.9rem'
              }}
            >
              {months.map(month => (
                <option key={month} value={month}>{month}月</option>
              ))}
            </select>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-full">
      {renderFilters()}
      <ReactECharts option={option} style={{ width: '100%', height: 'calc(100% - 40px)' }} />
    </div>
  );
};