import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const FundUsageManagement: React.FC = () => {
  const columns = [
    {
      title: '使用项目',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: '使用金额',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '使用日期',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small">删除</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      project: '供应商付款',
      amount: '100,000',
      date: '2026-03-20',
    },
    {
      key: '2',
      project: '设备采购',
      amount: '150,000',
      date: '2026-03-22',
    },
    {
      key: '3',
      project: '员工工资',
      amount: '80,000',
      date: '2026-03-24',
    },
  ];

  return (
    <div>
      <Card title="资金使用管理" extra={<Button type="primary">添加资金使用记录</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default FundUsageManagement;