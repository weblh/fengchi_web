import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ReceivablesBarChartProps {
  companies: string[];
  bookValues: number[];
  overdueValues: number[];
}

export const ReceivablesBarChart: React.FC<ReceivablesBarChartProps> = ({ 
  companies, 
  bookValues, 
  overdueValues 
}) => {
  const option = {
    tooltip: { 
      trigger: 'axis' 
    },
    legend: { 
      data: ['账面应收', '逾期金额'] 
    },
    xAxis: { 
      type: 'category', 
      data: companies, 
      axisLabel: { 
        fontSize: 10 
      } 
    },
    yAxis: { 
      name: '万元' 
    },
    series: [
      {
        name: '账面应收',
        type: 'bar',
        data: bookValues,
        itemStyle: { 
          color: '#2f73ff' 
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 9
        }
      },
      {
        name: '逾期金额',
        type: 'bar',
        data: overdueValues,
        itemStyle: { 
          color: '#ef4444' 
        },
        label: {
          show: true,
          position: 'top',
          fontSize: 9
        }
      }
    ]
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};