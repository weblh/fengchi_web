import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { ReceivablesByCategory } from '../../types';

interface ReceivablesCategoryPieChartProps {
  data: ReceivablesByCategory[];
  total: number;
}

export const ReceivablesCategoryPieChart: React.FC<ReceivablesCategoryPieChartProps> = ({ data, total }) => {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '应收账款',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data.map((item, index) => ({
          value: item.amount,
          name: item.category,
          itemStyle: {
            color: index === 0 ? '#10B981' : index === 1 ? '#F59E0B' : '#3B82F6',
          },
        })),
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <div className="mb-2 text-center font-medium">合计: {total}万元</div>
      <ReactECharts option={option} style={{ width: '100%', height: '85%' }} />
    </div>
  );
};
