import React from 'react';
import ReactECharts from 'echarts-for-react';
import type { CollectionDetail } from '../../types';

interface CollectionPieChartProps {
  data: CollectionDetail[];
}

export const CollectionPieChart: React.FC<CollectionPieChartProps> = ({ data }) => {
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
        name: '累计回款',
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
        data: data.map(item => ({
          value: item.amount,
          name: item.type,
          itemStyle: {
            color: item.type === '商业承兑' ? '#10B981' : 
                  item.type === '现金' ? '#F59E0B' : '#3B82F6',
          },
        })),
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
