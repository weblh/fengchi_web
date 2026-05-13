import React from 'react';
import ReactECharts from 'echarts-for-react';

interface ReceivablesBarChartProps {
  companies: string[];
  spotBookValues: number[];
  acceptBookValues: number[];
  spotOverdueValues: number[];
  acceptOverdueValues: number[];
}

export const ReceivablesBarChart: React.FC<ReceivablesBarChartProps> = ({ 
  companies, 
  spotBookValues, 
  acceptBookValues, 
  spotOverdueValues, 
  acceptOverdueValues 
}) => {
  const option = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: function(params: any) {
        let res = params[0].axisValue + '<br/>';
        let bookStack = 0, overdueStack = 0;
        params.forEach((p: any) => {
          if (p.seriesName === '现汇账面' || p.seriesName === '承兑账面') bookStack += p.value;
          if (p.seriesName === '现汇逾期' || p.seriesName === '承兑逾期') overdueStack += p.value;
          res += `${p.marker} ${p.seriesName}: ${p.value.toFixed(2)} 万元<br/>`;
        });
        res += `<strong>账面合计: ${bookStack.toFixed(2)} 万元</strong><br/>`;
        res += `<strong>逾期合计: ${overdueStack.toFixed(2)} 万元</strong>`;
        return res;
      }
    },
    legend: { 
      data: ['现汇账面', '承兑账面', '现汇逾期', '承兑逾期'] 
    },
    xAxis: { 
      type: 'category', 
      data: companies, 
      axisLabel: { 
        fontSize: 10
      }
    },
    grid: {  bottom: 10, containLabel: true },
    yAxis: { 
      name: '万元' 
    },
    series: [
      {
        name: '现汇账面',
        type: 'bar',
        stack: 'book',
        data: spotBookValues,
        itemStyle: { 
          color: '#3b82f6' 
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => p.value > 0 ? p.value.toFixed(0) : ''
        }
      },
      {
        name: '承兑账面',
        type: 'bar',
        stack: 'book',
        data: acceptBookValues,
        itemStyle: { 
          color: '#10b981' 
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => p.value > 0 ? p.value.toFixed(0) : ''
        }
      },
      {
        name: '现汇逾期',
        type: 'bar',
        stack: 'overdue',
        data: spotOverdueValues,
        itemStyle: { 
          color: '#ef4444' 
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => p.value > 0 ? p.value.toFixed(0) : ''
        }
      },
      {
        name: '承兑逾期',
        type: 'bar',
        stack: 'overdue',
        data: acceptOverdueValues,
        itemStyle: { 
          color: '#f472b6' 
        },
        label: {
          show: true,
          position: 'inside',
          formatter: (p: any) => p.value > 0 ? p.value.toFixed(0) : ''
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