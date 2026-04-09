import React from 'react';
import ReactECharts from 'echarts-for-react';

interface PaymentPlanPieChartProps {
  data: { name: string; value: number }[];
}

export const PaymentPlanPieChart: React.FC<PaymentPlanPieChartProps> = ({ data }) => {
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
      radius: '65%',
      data: data,
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