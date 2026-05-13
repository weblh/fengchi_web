import React from 'react';
import ReactECharts from 'echarts-for-react';

interface InterestRateChartProps {
  months: string[];
  rateData: number[];
  discountInterestData: number[];
}

export const InterestRateChart: React.FC<InterestRateChartProps> = ({ 
  months, 
  rateData, 
  discountInterestData 
}) => {
  // 保持原始时间顺序
  const sortedMonths = months;
  const sortedRateData = rateData;
  const sortedDiscountInterestData = discountInterestData;

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: function(params: any) {
        let res = params[0].axisValue + '<br/>';
        params.forEach(function(p: any) {
          if (p.seriesName === '贴现利息') {
            res += p.marker + '贴现利息: ' + Number(p.value).toFixed(2) + ' 万元<br/>';
          } else {
            res += p.marker + '利率: ' + p.value + '%<br/>';
          }
        });
        return res;
      }
    },
    legend: {
      data: ['贴现利息', '利率'],
      bottom: 0
    },
    grid: {
      left: '3%',
      right: '8%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: sortedMonths,
      axisLabel: {
        rotate: 30,
        fontSize: 8
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '万元',
        position: 'left'
      },
      {
        type: 'value',
        name: '%',
        min: 0,
        max: 3,
        position: 'right'
      }
    ],
    series: [
      {
        name: '贴现利息',
        type: 'bar',
        yAxisIndex: 0,
        data: sortedDiscountInterestData,
        itemStyle: {
          color: '#f97316',
          borderRadius: [6, 6, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: (p: any) => p.value.toFixed(2),
          fontSize: 8
        }
      },
      {
        name: '利率',
        type: 'line',
        yAxisIndex: 1,
        data: sortedRateData,
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#2f73ff'
        },
        symbol: 'circle',
        symbolSize: 6,
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 8
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