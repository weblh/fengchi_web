import React from 'react';
import ReactECharts from 'echarts-for-react';

interface InterestRateChartProps {
  months: string[];
  rateData: number[];
}

export const InterestRateChart: React.FC<InterestRateChartProps> = ({ 
  months, 
  rateData 
}) => {
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { 
        type: 'cross' 
      },
      formatter: function(params: any) {
        let result = params[0].name + '<br/>';
        params.forEach(function(item: any) {
          result += item.marker + item.seriesName + ': ' + item.value + '%<br/>';
        });
        return result;
      }
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: {
        rotate: 45,
        fontSize: 8,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '%',
      nameTextStyle: { 
        fontSize: 9 
      },
      min: 0,
      max: 3
    },
    series: [{
      name: '利率',
      type: 'line',
      data: rateData,
      smooth: true,
      itemStyle: { 
        color: '#2f73ff' 
      },
      lineStyle: { 
        width: 2 
      },
      symbol: 'circle',
      symbolSize: 6,
      label: {
        show: true,
        position: 'top',
        formatter: '{c}%',
        fontSize: 8,
        color: '#0f172a'
      }
    }],
    grid: {
      top: 40,
      left: 60,
      right: 30,
      bottom: 60
    }
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};