import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const PurchaseManagement: React.FC = () => {
  const columns = [
    {
      title: '采购订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '供应商名称',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '采购金额',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '采购日期',
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
      orderNo: 'PO20260301',
      supplier: '供应商A',
      amount: '80,000',
      date: '2026-03-20',
    },
    {
      key: '2',
      orderNo: 'PO20260302',
      supplier: '供应商B',
      amount: '120,000',
      date: '2026-03-22',
    },
    {
      key: '3',
      orderNo: 'PO20260303',
      supplier: '供应商C',
      amount: '60,000',
      date: '2026-03-24',
    },
  ];

  return (
    <div>
      <Card title="采购管理" extra={<Button type="primary">添加采购订单</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default PurchaseManagement;