import React from 'react';
import { Card } from 'antd';
import { FinancialDashboard as FinancialDashboardComponent } from '../../components/FinancialDashboard';
import { mockFinancialData } from '../../data/mockData';

const FinancialDashboard: React.FC = () => {
  return (
    <div>
      <Card title="财务可视化仪表盘">
        <FinancialDashboardComponent data={mockFinancialData} />
      </Card>
    </div>
  );
};

export default FinancialDashboard;