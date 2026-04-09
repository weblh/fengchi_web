import React from 'react';
import { Card } from 'antd';

const PurchaseDashboard: React.FC = () => {
  return (
    <div>
      <Card title="采购可视化仪表盘">
        <div className="p-8 text-center">
          <h2>采购数据可视化</h2>
          <p>这里将展示采购相关的图表和数据</p>
        </div>
      </Card>
    </div>
  );
};

export default PurchaseDashboard;