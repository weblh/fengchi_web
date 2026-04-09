import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const DiscountManagement: React.FC = () => {
  const columns = [
    {
      title: '票据编号',
      dataIndex: 'invoiceNo',
      key: 'invoiceNo',
    },
    {
      title: '票据金额',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '贴现率',
      dataIndex: 'discountRate',
      key: 'discountRate',
    },
    {
      title: '贴现日期',
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
      invoiceNo: 'DP20260301',
      amount: '200,000',
      discountRate: '3.5%',
      date: '2026-03-15',
    },
    {
      key: '2',
      invoiceNo: 'DP20260302',
      amount: '150,000',
      discountRate: '3.2%',
      date: '2026-03-18',
    },
    {
      key: '3',
      invoiceNo: 'DP20260303',
      amount: '300,000',
      discountRate: '3.0%',
      date: '2026-03-20',
    },
  ];

  return (
    <div>
      <Card title="贴现管理" extra={<Button type="primary">添加贴现记录</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default DiscountManagement;