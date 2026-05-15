import React from 'react';
import ReactECharts from 'echarts-for-react';

interface CollectionTypePieChartProps {
  data: { type: string; value: number; color: string }[];
}

export const CollectionTypePieChart: React.FC<CollectionTypePieChartProps> = ({ data }) => {
  const pieData = data.map(item => ({
    name: item.type,
    value: item.value,
    itemStyle: {
      color: item.color
    }
  })).filter(d => d.value > 0);

  const option = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c}%'
    },
    legend: { 
      bottom: 0 
    },
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: pieData,
      label: {
        show: true,
        formatter: '{b}\n{c}%'
      }
    }]
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};