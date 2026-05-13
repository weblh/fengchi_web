import React from 'react';
import ReactECharts from 'echarts-for-react';

interface CompanyData {
  name: string;
  clients: string[];
  spotBook: number[];
  acceptBook: number[];
  spotOverdue: number[];
  acceptOverdue: number[];
  book?: number[];
  overdue?: number[];
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
  ferroSpotBook?: number[];
  ferroAcceptBook?: number[];
  ferroSpotOverdue?: number[];
  ferroAcceptOverdue?: number[];
  steelClients: string[];
  steelBooks: number[];
  steelOverdueList: number[];
  steelSpotBook?: number[];
  steelAcceptBook?: number[];
  steelSpotOverdue?: number[];
  steelAcceptOverdue?: number[];
}

export const ReceivableDetailChart: React.FC<ReceivableDetailChartProps> = ({ 
  tab, 
  companyData, 
  ferroClients, 
  ferroBooks, 
  ferroOverdue, 
  ferroSpotBook = [],
  ferroAcceptBook = [],
  ferroSpotOverdue = [],
  ferroAcceptOverdue = [],
  steelClients, 
  steelBooks, 
  steelOverdueList,
  steelSpotBook = [],
  steelAcceptBook = [],
  steelSpotOverdue = [],
  steelAcceptOverdue = []
}) => {
  let option = {};

  if (companyData[tab]) {
    const data = companyData[tab];
    
    // 检查是否有按现汇和承兑拆分的数据
    if (data.spotBook && data.acceptBook && data.spotOverdue && data.acceptOverdue) {
      // 对客户数据按总账面应收降序排序
      const sortedClientData = data.clients.map((client, index) => ({
        client,
        spotBook: data.spotBook[index] || 0,
        acceptBook: data.acceptBook[index] || 0,
        spotOverdue: data.spotOverdue[index] || 0,
        acceptOverdue: data.acceptOverdue[index] || 0,
        totalBook: (data.spotBook[index] || 0) + (data.acceptBook[index] || 0)
      })).sort((a, b) => b.totalBook - a.totalBook);
      
      const sortedClients = sortedClientData.map(item => item.client);
      const sortedSpotBook = sortedClientData.map(item => item.spotBook);
      const sortedAcceptBook = sortedClientData.map(item => item.acceptBook);
      const sortedSpotOverdue = sortedClientData.map(item => item.spotOverdue);
      const sortedAcceptOverdue = sortedClientData.map(item => item.acceptOverdue);

      option = {
        tooltip: { 
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: { 
          data: ['现汇账面', '承兑账面', '现汇逾期', '承兑逾期'] 
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
            name: '现汇账面',
            type: 'bar',
            stack: 'book',
            data: sortedSpotBook,
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
            data: sortedAcceptBook,
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
            data: sortedSpotOverdue,
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
            data: sortedAcceptOverdue,
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
    } else if (data.book && data.overdue) {
      // 兼容旧数据结构
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
    }
  } else if (tab === 'ferro') {
    if (ferroSpotBook.length > 0 && ferroAcceptBook.length > 0 && ferroSpotOverdue.length > 0 && ferroAcceptOverdue.length > 0) {
      option = {
        tooltip: { 
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: { 
          data: ['现汇账面', '承兑账面', '现汇逾期', '承兑逾期'] 
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
            name: '现汇账面',
            type: 'bar',
            stack: 'book',
            data: ferroSpotBook,
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
            data: ferroAcceptBook,
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
            data: ferroSpotOverdue,
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
            data: ferroAcceptOverdue,
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
    } else {
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
    }
  } else if (tab === 'steel') {
    if (steelSpotBook.length > 0 && steelAcceptBook.length > 0 && steelSpotOverdue.length > 0 && steelAcceptOverdue.length > 0) {
      option = {
        tooltip: { 
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: { 
          data: ['现汇账面', '承兑账面', '现汇逾期', '承兑逾期'] 
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
            name: '现汇账面',
            type: 'bar',
            stack: 'book',
            data: steelSpotBook,
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
            data: steelAcceptBook,
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
            data: steelSpotOverdue,
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
            data: steelAcceptOverdue,
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
    } else {
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
  }

  return (
    <div className="w-full h-full">
      <ReactECharts option={option} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};