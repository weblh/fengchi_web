import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const SalesManagement: React.FC = () => {
  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '订单金额',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '订单日期',
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
      orderNo: 'SO20260301',
      customer: '客户A',
      amount: '100,000',
      date: '2026-03-20',
    },
    {
      key: '2',
      orderNo: 'SO20260302',
      customer: '客户B',
      amount: '150,000',
      date: '2026-03-22',
    },
    {
      key: '3',
      orderNo: 'SO20260303',
      customer: '客户C',
      amount: '80,000',
      date: '2026-03-24',
    },
  ];

  return (
    <div>
      <Card title="销售管理" extra={<Button type="primary">添加销售订单</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default SalesManagement;