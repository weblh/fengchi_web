import React from 'react';
import { Card } from 'antd';

const SteelDashboard: React.FC = () => {
  return (
    <div>
      <Card title="钢铁可视化仪表盘">
        <div className="p-8 text-center">
          <h2>销售可视化</h2>
          <p>这里将展示销售相关的图表和数据</p>
        </div>
      </Card>
    </div>
  );
};

export default SteelDashboard;