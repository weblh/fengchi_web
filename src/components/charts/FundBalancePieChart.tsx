import React from 'react';
import ReactECharts from 'echarts-for-react';

interface FundBalancePieChartProps {
  cashBalance: number;
  bankBalance: number;
  otherBalance: number;
}

export const FundBalancePieChart: React.FC<FundBalancePieChartProps> = ({ 
  cashBalance, 
  bankBalance, 
  otherBalance 
}) => {
  const fundPieData = [
    { name: '现汇', value: cashBalance },
    { name: '银承', value: bankBalance },
    { name: '美易单', value: otherBalance }
  ].filter(d => d.value > 0);

  const option = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c}万元 ({d}%)' 
    },
    legend: { 
      bottom: 0 
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: fundPieData,
      label: {
        show: true,
        formatter: '{b}\n{c}万\n{d}%'
      }
    }]
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};