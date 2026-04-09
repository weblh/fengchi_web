import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const ReceivablesManagement: React.FC = () => {
  const columns = [
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '应收账款',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '到期日期',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
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
      amount: '100,000',
      dueDate: '2026-04-01',
      status: '未到期',
    },
    {
      key: '2',
      customer: '客户B',
      amount: '200,000',
      dueDate: '2026-04-15',
      status: '未到期',
    },
    {
      key: '3',
      customer: '客户C',
      amount: '150,000',
      dueDate: '2026-03-30',
      status: '已到期',
    },
  ];

  return (
    <div>
      <Card title="应收管理" extra={<Button type="primary">添加应收账款</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default ReceivablesManagement;