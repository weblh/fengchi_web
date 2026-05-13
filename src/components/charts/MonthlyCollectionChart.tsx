import React from 'react';
import ReactECharts from 'echarts-for-react';

interface MonthlyCollectionChartProps {
  months?: string[];
  paymentTypes?: string[];
  colors?: string[];
  data?: Array<{ type: string; color: string; values: number[] }>;
}

export const MonthlyCollectionChart: React.FC<MonthlyCollectionChartProps> = ({ 
  months = ['1月', '2月', '3月'],
  data = [
    { type: '现汇', color: '#3b82f6', values: [18, 24, 35.9] },
    { type: '商业承兑', color: '#f59e0b', values: [16, 0, 16.6] },
    { type: '银行承兑', color: '#10b981', values: [66, 76, 47.5] }
  ]
}) => {
  const option = {
    tooltip: { 
      trigger: 'axis'
    },
    legend: { 
      bottom: 0,
      data: data.map(item => item.type)
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: months
    },
    yAxis: {
      type: 'value',
      name: '%',
      axisLabel: {
        formatter: '{value}%'
      },
      min: 0,
      max: 100
    },
    series: data.map(item => ({
      name: item.type,
      type: 'bar',
      stack: 'percent',
      data: item.values,
      itemStyle: {
        color: item.color
      },
      label: {
        show: true,
        formatter: '{c}%'
      }
    }))
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};