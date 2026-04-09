import React from 'react';
import ReactECharts from 'echarts-for-react';

interface PaymentPlanData {
  company: string;
  suppliers: { name: string; amount: number }[];
  totalAmount: number;
}

interface PaymentPlanChartProps {
  companies: string[];
  suppliers: string[];
  paymentPlanData: PaymentPlanData[];
}

export const PaymentPlanChart: React.FC<PaymentPlanChartProps> = ({ 
  companies, 
  suppliers, 
  paymentPlanData 
}) => {
  const paymentPlanSeries = suppliers.map(supName => ({
    name: supName,
    type: 'bar',
    stack: 'total',
    barWidth: '60%',
    data: companies.map(comp => {
      const cd = paymentPlanData.find(d => d.company === comp);
      const sup = cd?.suppliers.find(s => s.name === supName);
      return sup ? sup.amount : 0;
    }),
    label: {
      show: true,
      position: 'inside',
      fontSize: 9,
      formatter: function(params: any) {
        return params.value > 0 ? params.value : '';
      }
    }
  }));

  const option = {
    tooltip: { 
      trigger: 'axis' 
    },
    legend: { 
      top: 8, 
      type: 'scroll' 
    },
    xAxis: { 
      type: 'value', 
      name: '万元' 
    },
    yAxis: { 
      type: 'category', 
      data: companies 
    },
    series: paymentPlanSeries
  };

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};