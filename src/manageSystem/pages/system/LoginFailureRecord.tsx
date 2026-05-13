import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  message
} from 'antd';
import request from '../../../utils/request';

interface LoginFailureRecord {
  id: number;
  userId: number;
  deviceId: string;
  failureTime: string;
  ipAddress: string;
}

const LoginFailureRecord: React.FC = () => {
  const [records, setRecords] = useState<LoginFailureRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取登录失败记录列表
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/login-failure-record/list');
      setRecords(response.data || []);
    } catch (error) {
      message.error('获取登录失败记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const columns = [
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId'
    },
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      ellipsis: true
    },
    {
      title: '失败时间',
      dataIndex: 'failureTime',
      key: 'failureTime'
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress'
    }
  ];

  return (
    <div>
      <Card title="登录失败记录">
        <Table
          columns={columns}
          dataSource={records.map(record => ({
            ...record,
            key: record.id
          }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default LoginFailureRecord;