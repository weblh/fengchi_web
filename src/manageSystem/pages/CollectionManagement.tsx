import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const CollectionManagement: React.FC = () => {
  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '回款金额',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '回款日期',
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
      customer: '客户A',
      amount: '50,000',
      date: '2026-03-20',
    },
    {
      key: '2',
      customer: '客户B',
      amount: '80,000',
      date: '2026-03-22',
    },
    {
      key: '3',
      customer: '客户C',
      amount: '60,000',
      date: '2026-03-24',
    },
  ];

  return (
    <div>
      <Card title="累计回款管理" extra={<Button type="primary">添加回款记录</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default CollectionManagement;