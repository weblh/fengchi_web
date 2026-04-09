import React from 'react';
import { Card } from 'antd';

const SteelDashboard: React.FC = () => {
  return (
    <div>
      <Card title="钢铁可视化仪表盘">
        <div className="p-8 text-center">
          <h2>钢铁数据可视化</h2>
          <p>这里将展示钢铁相关的图表和数据</p>
        </div>
      </Card>
    </div>
  );
};

export default SteelDashboard;