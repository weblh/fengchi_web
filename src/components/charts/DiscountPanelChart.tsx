import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DiscountPanelChartProps {
  activeTab: string;
  months: string[];
  discountInterestWan: number[];
  febListingData: { name: string; value: number }[];
}

export const DiscountPanelChart: React.FC<DiscountPanelChartProps> = ({ 
  activeTab, 
  months, 
  discountInterestWan, 
  febListingData 
}) => {
  let option = {};

  if (activeTab === 'interest') {
    // 对贴现利息数据按降序排序
    const sortedInterestData = months.map((month, index) => ({
      month,
      value: discountInterestWan[index]
    })).sort((a, b) => b.value - a.value);
    
    const sortedMonths = sortedInterestData.map(item => item.month);
    const sortedValues = sortedInterestData.map(item => item.value);

    option = {
      tooltip: { 
        trigger: 'axis', 
        formatter: '{b}<br/>贴现利息: {c} 万元' 
      },
      xAxis: { 
        type: 'category', 
        data: sortedMonths, 
        axisLabel: { 
          rotate: 30, 
          fontSize: 10 
        } 
      },
      yAxis: { 
        type: 'value', 
        name: '万元', 
        nameTextStyle: { 
          fontSize: 10 
        } 
      },
      series: [{
        name: '月度贴现利息',
        type: 'bar',
        data: sortedValues,
        itemStyle: {
          color: '#f97316',
          borderRadius: [6, 6, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 9,
          color: '#000',
          fontWeight: 'bold'
        }
      }],
      grid: { 
        top: 40, 
        left: 50, 
        right: 20, 
        bottom: 40 
      }
    };
  } else if (activeTab === 'price') {
    option = {
      tooltip: { 
        trigger: 'item', 
        formatter: '{b}: {c}% ({d}%)' 
      },
      legend: { 
        orient: 'vertical', 
        left: 'left', 
        textStyle: { 
          fontSize: 9 
        }, 
        itemWidth: 10 
      },
      series: [{
        type: 'pie',
        radius: '55%',
        center: ['50%', '50%'],
        data: febListingData,
        label: {
          show: true,
          formatter: '{b}\n{c}%',
          fontSize: 9
        },
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        }
      }]
    };
  }

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};