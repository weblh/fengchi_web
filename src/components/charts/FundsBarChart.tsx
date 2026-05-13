import React from 'react';
import ReactECharts from 'echarts-for-react';

interface FundsBarChartProps {
  units: string[];
  xianhui: number[];
  yincheng: number[];
  meiyi: number[];
  rongdan?: number[];
  jindan?: number[];
  dilian?: number[];
}

export const FundsBarChart: React.FC<FundsBarChartProps> = ({ 
  units, 
  xianhui, 
  yincheng, 
  meiyi,
  rongdan = [],
  jindan = [],
  dilian = []
}) => {
  const option = {
    color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'],
    tooltip: { 
      trigger: 'axis' 
    },
    legend: { 
      bottom: 0 
    },
    xAxis: { 
      type: 'category', 
      data: units 
    },
    yAxis: { 
      type: 'value', 
      name: '万元' 
    },
    series: [
      {
        name: '现汇',
        type: 'bar',
        data: xianhui,
        label: { 
          show: true 
        }
      },
      {
        name: '银承',
        type: 'bar',
        data: yincheng,
        label: { 
          show: true 
        }
      },
      {
        name: '美易单',
        type: 'bar',
        data: meiyi,
        label: { 
          show: true 
        }
      },
      {
        name: '融单',
        type: 'bar',
        data: rongdan,
        label: { 
          show: true 
        }
      },
      {
        name: '金单',
        type: 'bar',
        data: jindan,
        label: { 
          show: true 
        }
      },
      {
        name: '迪链',
        type: 'bar',
        data: dilian,
        label: { 
          show: true 
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