import React from 'react';
import ReactECharts from 'echarts-for-react';

interface DiscountPanelChartProps {
  activeTab: string;
  months: string[];
  discountInterestWan: number[];
  febListingData: { name: string; value: number }[];
  rateData: number[];
  listingDataByMonth?: { month: string; data: { name: string; value: number }[] }[];
}

export const DiscountPanelChart: React.FC<DiscountPanelChartProps> = ({ 
  activeTab, 
  months, 
  discountInterestWan, 
  febListingData, 
  rateData, 
  listingDataByMonth 
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
    // 检查是否有按月份组织的挂牌价数据
    if (listingDataByMonth && listingDataByMonth.length > 0) {
      // 使用折线图显示多个月份的数据
      const priceTypes = listingDataByMonth[0].data.map(item => item.name);
      const months = listingDataByMonth.map(item => item.month);
      const colors = ['#5470C6', '#52c41a', '#faad14', '#f5222d', '#73C0DE'];
      
      // 为每种类型准备数据
      const series = priceTypes.map((type, index) => {
        const data = listingDataByMonth.map(monthItem => {
          const typeData = monthItem.data.find(item => item.name === type);
          return typeData ? typeData.value : 0;
        });
        
        return {
          name: type,
          type: 'line',
          data: data,
          smooth: true,
          lineStyle: {
            width: 2,
            color: colors[index % colors.length]
          },
          symbol: 'circle',
          symbolSize: 6,
          label: {
            show: true,
            position: 'top',
            formatter: '{c}%',
            fontSize: 10
          }
        };
      });

      option = {
        tooltip: { 
          trigger: 'axis', 
          formatter: function(params: any) {
            let res = params[0].axisValue + '<br/>';
            params.forEach(function(p: any) {
              res += p.marker + p.seriesName + ': ' + p.value + '%<br/>';
            });
            return res;
          }
        },
        legend: { 
          data: series.map(s => s.name),
          top: 0,
          textStyle: { 
            fontSize: 10 
          }, 
          itemWidth: 10
        },
        grid: {
          left: '3%',
          right: '8%',
          top: '20%',
          bottom: '12%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: months,
          axisLabel: {
            rotate: 30,
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '利率(%)',
          min: 0,
          max: 8,
          axisLabel: {
            formatter: '{value}%',
            fontSize: 10
          }
        },
        series: series
      };
    } else {
      // 没有按月份组织的数据，使用原来的散点图显示方式
      const scatterData = febListingData.map((item, index) => ({
        name: item.name,
        value: [1, item.value] // x轴固定为1（代表2月），y轴为利率值
      }));

      option = {
        tooltip: { 
          trigger: 'item', 
          formatter: '{b}: {c}%' 
        },
        legend: { 
          data: febListingData.map(item => item.name),
          top: 0,
          textStyle: { 
            fontSize: 10 
          }, 
          itemWidth: 10
        },
        grid: {
          left: '10%',
          right: '10%',
          top: '20%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: ['2月'],
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          name: '利率(%)',
          min: 0,
          max: 8,
          axisLabel: {
            formatter: '{value}%',
            fontSize: 10
          }
        },
        series: febListingData.map((item, index) => {
          // 为不同类型设置不同颜色
          const colors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96'];
          return {
            name: item.name,
            type: 'scatter',
            data: [[1, item.value]],
            symbolSize: 12,
            itemStyle: {
              color: colors[index % colors.length]
            },
            label: {
              show: true,
              position: 'top',
              formatter: '{c}%',
              fontSize: 10
            }
          };
        })
      };
    }
  } else if (activeTab === 'rate') {
    // 使用从父组件传递的真实接口数据
    const rateTypes = ['银承', '美易单', '融单', '金单', '迪链', '商承'];
    const rateColors = ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#eb2f96', '#fa541c'];
    
    // 准备数据 - rateData 是从 /api/listing-price-monthly/list 接口获取的一维数组
    // 为每个利率类型创建一个数据集，使用相同的 rateData 作为基础
    const rateDatasets = rateTypes.map((_, index) => {
      // 为每个类型生成数据，使用 rateData 作为基础，如果数据不足则使用默认值
      return months.map((_, monthIndex) => {
        return rateData[monthIndex] || 0;
      });
    });

    option = {
      tooltip: {
        trigger: 'axis',
        formatter: function(params: any) {
          let res = params[0].axisValue + '<br/>';
          params.forEach(function(p: any) {
            res += p.marker + p.seriesName + ': ' + p.value + '%<br/>';
          });
          return res;
        }
      },
      legend: {
        data: rateTypes,
        top: 0,
        textStyle: {
          fontSize: 10
        },
        itemWidth: 10
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '12%',
        top: '20%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLabel: {
          rotate: 30,
          fontSize: 8
        }
      },
      yAxis: {
        type: 'value',
        name: '利率(%)',
        min: 0,
        max: 4,
        axisLabel: {
          formatter: '{value}%',
          fontSize: 10
        }
      },
      series: rateTypes.map((type, index) => ({
        name: type,
        type: 'line',
        data: rateDatasets[index],
        smooth: true,
        lineStyle: {
          width: 2,
          color: rateColors[index]
        },
        symbol: 'circle',
        symbolSize: 4,
        label: {
          show: false
        }
      }))
    };
  }

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};