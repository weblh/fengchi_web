import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  message
} from 'antd';
import { UnlockOutlined } from '@ant-design/icons';
import request from '../../../utils/request';

interface LoginLockLog {
  id: number;
  userId: number;
  deviceId: string;
  lockType: string;
  lockDuration: number;
  unlockTime: string;
  reason: string;
  operatorId: number;
  createTime: string;
}

const LoginLockLog: React.FC = () => {
  const [logs, setLogs] = useState<LoginLockLog[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取锁定日志列表
  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/login-lock-log/list');
      setLogs(response.data || []);
    } catch (error) {
      message.error('获取锁定日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // 手动解锁
  const handleUnlock = async (log: LoginLockLog) => {
    try {
      await request.post('/api/login-lock-log/unlock', {
        id: log.id
      });
      message.success('设备已解锁');
      fetchLogs();
    } catch (error) {
      message.error('解锁失败');
    }
  };

  const columns = [
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      ellipsis: true
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId'
    },
    {
      title: '锁定类型',
      dataIndex: 'lockType',
      key: 'lockType',
      render: (text: string) => {
        const typeMap: { [key: string]: string } = {
          'TEMP': '临时锁定',
          'PERM': '永久锁定'
        };
        return typeMap[text] || text;
      }
    },
    {
      title: '锁定时长（分钟）',
      dataIndex: 'lockDuration',
      key: 'lockDuration'
    },
    {
      title: '解锁时间',
      dataIndex: 'unlockTime',
      key: 'unlockTime'
    },
    {
      title: '锁定原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    },
    {
      title: '操作人',
      dataIndex: 'operatorId',
      key: 'operatorId'
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: LoginLockLog) => (
        <Button
          type="primary"
          icon={<UnlockOutlined />}
          size="small"
          onClick={() => handleUnlock(record)}
        >
          手动解锁
        </Button>
      )
    }
  ];

  return (
    <div>
      <Card title="登录锁定日志">
        <Table
          columns={columns}
          dataSource={logs.map(log => ({
            ...log,
            key: log.id
          }))}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default LoginLockLog;