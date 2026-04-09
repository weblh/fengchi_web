import React from 'react';
import { Card, Table, Space, Button } from 'antd';

const BalanceManagement: React.FC = () => {
  const columns = [
    {
      title: '账户名称',
      dataIndex: 'account',
      key: 'account',
    },
    {
      title: '余额',
      dataIndex: 'balance',
      key: 'balance',
    },
    {
      title: '最后更新时间',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
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
      account: '现金账户',
      balance: '500,000',
      lastUpdated: '2026-03-24',
    },
    {
      key: '2',
      account: '银行账户',
      balance: '1,500,000',
      lastUpdated: '2026-03-24',
    },
    {
      key: '3',
      account: '其他账户',
      balance: '300,000',
      lastUpdated: '2026-03-24',
    },
  ];

  return (
    <div>
      <Card title="余额管理" extra={<Button type="primary">添加账户</Button>}>
        <Table columns={columns} dataSource={data} />
      </Card>
    </div>
  );
};

export default BalanceManagement;