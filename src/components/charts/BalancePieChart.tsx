import React from 'react';
import ReactECharts from 'echarts-for-react';

interface BalancePieChartProps {
  cashBalance: number;
  bankBalance: number;
  otherBalance: number;
}

export const BalancePieChart: React.FC<BalancePieChartProps> = ({
  cashBalance,
  bankBalance,
  otherBalance,
}) => {
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
        name: '资金余额',
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
        data: [
          { value: cashBalance, name: '现金', itemStyle: { color: '#10B981' } },
          { value: bankBalance, name: '卡丰', itemStyle: { color: '#F59E0B' } },
          { value: otherBalance, name: '其他', itemStyle: { color: '#3B82F6' } },
        ],
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};
