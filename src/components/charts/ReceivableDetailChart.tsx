import React from 'react';
import ReactECharts from 'echarts-for-react';

interface CompanyData {
  name: string;
  clients: string[];
  book: number[];
  overdue: number[];
}

interface CompanyDataType {
  [key: string]: CompanyData;
}

interface ReceivableDetailChartProps {
  tab: string;
  companyData: CompanyDataType;
  ferroClients: string[];
  ferroBooks: number[];
  ferroOverdue: number[];
  steelClients: string[];
  steelBooks: number[];
  steelOverdueList: number[];
}

export const ReceivableDetailChart: React.FC<ReceivableDetailChartProps> = ({ 
  tab, 
  companyData, 
  ferroClients, 
  ferroBooks, 
  ferroOverdue, 
  steelClients, 
  steelBooks, 
  steelOverdueList 
}) => {
  let option = {};

  if (companyData[tab]) {
    const data = companyData[tab];
    // 对客户数据按账面应收降序排序
    const sortedClientData = data.clients.map((client, index) => ({
      client,
      book: data.book[index],
      overdue: data.overdue[index]
    })).sort((a, b) => b.book - a.book);
    
    const sortedClients = sortedClientData.map(item => item.client);
    const sortedBookValues = sortedClientData.map(item => item.book);
    const sortedOverdueValues = sortedClientData.map(item => item.overdue);

    option = {
      tooltip: { 
        trigger: 'axis' 
      },
      legend: { 
        data: ['账面应收', '逾期金额'] 
      },
      xAxis: { 
        type: 'category', 
        data: sortedClients, 
        axisLabel: { 
          rotate: 20, 
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
          data: sortedBookValues,
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
          data: sortedOverdueValues,
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
  } else if (tab === 'ferro') {
    option = {
      tooltip: { 
        trigger: 'axis' 
      },
      legend: { 
        data: ['账面应收', '逾期金额'] 
      },
      xAxis: { 
        type: 'category', 
        data: ferroClients, 
        axisLabel: { 
          rotate: 20, 
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
          data: ferroBooks,
          itemStyle: { 
            color: '#2f73ff' 
          },
          label: { 
            show: true 
          }
        },
        {
          name: '逾期金额',
          type: 'bar',
          data: ferroOverdue,
          itemStyle: { 
            color: '#ef4444' 
          },
          label: { 
            show: true 
          }
        }
      ]
    };
  } else if (tab === 'steel') {
    option = {
      tooltip: { 
        trigger: 'axis' 
      },
      legend: { 
        data: ['账面应收', '逾期金额'] 
      },
      xAxis: { 
        type: 'category', 
        data: steelClients, 
        axisLabel: { 
          rotate: 20, 
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
          data: steelBooks,
          itemStyle: { 
            color: '#2f73ff' 
          },
          label: { 
            show: true 
          }
        },
        {
          name: '逾期金额',
          type: 'bar',
          data: steelOverdueList,
          itemStyle: { 
            color: '#ef4444' 
          },
          label: { 
            show: true 
          }
        }
      ]
    };
  }

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};