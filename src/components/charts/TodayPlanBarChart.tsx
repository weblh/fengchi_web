import React from 'react';
import ReactECharts from 'echarts-for-react';

interface TodayPlanData {
  company: string;
  supplier?: string;
  amount: number;
}

interface TodayPlanBarChartProps {
  data: TodayPlanData[];
}

export const TodayPlanBarChart: React.FC<TodayPlanBarChartProps> = ({ data }) => {
  // 按公司分组汇总金额
  const companyData = data.reduce((acc, item) => {
    const existing = acc.find(d => d.company === item.company);
    if (existing) {
      existing.amount += item.amount;
    } else {
      acc.push({ company: item.company, amount: item.amount });
    }
    return acc;
  }, [] as { company: string; amount: number }[]);

  // 按金额降序排序
  const sortedData = companyData.sort((a, b) => b.amount - a.amount);

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: function(params: any) {
        const data = params[0];
        return `${data.name}<br/>金额: ${data.value} 万元`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      name: '万元',
      nameTextStyle: {
        fontSize: 10
      }
    },
    yAxis: {
      type: 'category',
      data: sortedData.map(d => d.company),
      nameTextStyle: {
        fontSize: 10
      }
    },
    series: [{
      type: 'bar',
      data: sortedData.map(d => d.amount),
      itemStyle: {
        color: '#2f73ff',
        borderRadius: [0, 4, 4, 0]
      },
      label: {
        show: true,
        position: 'right',
        formatter: '{c} 万',
        fontSize: 10
      }
    }]
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};