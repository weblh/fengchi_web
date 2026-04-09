import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { SupplierFundingPlan } from '../../types';

interface SupplierFundingChartProps {
  data: SupplierFundingPlan[];
}

export const SupplierFundingChart: React.FC<SupplierFundingChartProps> = ({ data }) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      data: ['现金', '银行', '其他'],
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map(item => item.supplier),
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '现金',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: data.map(item => item.plan.cash),
        itemStyle: { color: '#10B981' },
      },
      {
        name: '银行',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: data.map(item => item.plan.bank),
        itemStyle: { color: '#F59E0B' },
      },
      {
        name: '其他',
        type: 'bar',
        stack: 'total',
        emphasis: {
          focus: 'series',
        },
        data: data.map(item => item.plan.other),
        itemStyle: { color: '#3B82F6' },
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
