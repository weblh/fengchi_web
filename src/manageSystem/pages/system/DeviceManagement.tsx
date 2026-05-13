import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Tag
} from 'antd';
import { LockOutlined, UnlockOutlined, DeleteOutlined, MobileOutlined, DesktopOutlined, TabletOutlined } from '@ant-design/icons';
import request from '../../../utils/request';

const { Option } = Select;

interface Device {
  id: number;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  osType: string;
  browserType: string | null;
  isLocked: boolean;
  lockedTime: string | null;
  lockReason: string | null;
  lastLoginTime: string;
  lastLoginIp: string;
  loginCount: number;
  status: boolean;
  userStatus: number; // 用户状态，1为正常（解锁），0为锁定
  createTime: string | null;
  updateTime: string | null;
  auditStatus: string;
  userId: number;
  username: string;
  email: string;
}

const DeviceManagement: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form] = Form.useForm();

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/device/list');
      setDevices(response.data || response || []);
    } catch (error) {
      message.error('获取设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const checkDeviceStatus = async (deviceId: string) => {
    try {
      const response = await request.post('/api/device/check', { deviceId });
      message.info(`设备状态: ${response.isLocked ? '已锁定' : '正常'}`);
      fetchDevices();
    } catch (error) {
      message.error('检查设备状态失败');
    }
  };

  const handleUnlockDevice = async (device: Device) => {
    try {
      await request.post('/api/device/unlock', {
        userId: device.id,
        deviceId: device.deviceId
      });
      message.success('设备已解锁');
      fetchDevices();
    } catch (error) {
      message.error('解锁设备失败');
    }
  };

  const handleRemoveDevice = async (device: Device) => {
    try {
      await request.delete(`/api/device/delete?userId=${device.userId}&deviceId=${device.deviceId}`);
      message.success('设备已移除');
      fetchDevices();
    } catch (error) {
      message.error('移除设备失败');
    }
  };

  const handleAuditDevice = async (device: Device, auditStatus: string) => {
    try {
      await request.post('/api/auth/audit-device', {
        userId: device.userId,
        deviceId: device.deviceId,
        auditStatus: auditStatus
      });
      message.success(`设备审核${auditStatus === 'APPROVED' ? '通过' : '拒绝'}成功`);
      fetchDevices();
    } catch (error) {
      message.error('设备审核失败');
    }
  };

  const handleUserStatus = async (device: Device, status: number) => {
    try {
      await request.put(`/api/users/${device.userId}/status?status=${status}`);
      message.success(`用户${status === 1 ? '解锁' : '锁定'}成功`);
      fetchDevices();
    } catch (error) {
      message.error(`用户${status === 1 ? '解锁' : '锁定'}失败`);
    }
  };

  const handleSaveDevice = async (values: any) => {
    try {
      await request.put('/api/device/update', {
        deviceId: editingDevice?.deviceId,
        ...values
      });
      message.success('设备信息已更新');
      setModalVisible(false);
      fetchDevices();
    } catch (error) {
      message.error('更新设备信息失败');
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'MOBILE':
        return <MobileOutlined />;
      case 'TABLET':
        return <TabletOutlined />;
      default:
        return <DesktopOutlined />;
    }
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      width: 200
    },
    {
      title: '设备ID',
      dataIndex: 'deviceId',
      key: 'deviceId',
      ellipsis: true,
      width: 200
    },
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      key: 'deviceName',
      width: 120
    },
    {
      title: '设备类型',
      dataIndex: 'deviceType',
      key: 'deviceType',
      width: 100,
      render: (text: string) => {
        const typeMap: { [key: string]: { text: string; color: string } } = {
          'PC': { text: '电脑', color: 'blue' },
          'MOBILE': { text: '手机', color: 'green' },
          'TABLET': { text: '平板', color: 'orange' }
        };
        const config = typeMap[text] || { text, color: 'default' };
        return <Tag color={config.color} icon={getDeviceIcon(text)}>{config.text}</Tag>;
      }
    },
    {
      title: '操作系统',
      dataIndex: 'osType',
      key: 'osType',
      width: 100
    },
    {
      title: '浏览器',
      dataIndex: 'browserType',
      key: 'browserType',
      width: 100
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      key: 'lastLoginTime',
      width: 180
    },
    {
      title: '最后登录IP',
      dataIndex: 'lastLoginIp',
      key: 'lastLoginIp',
      width: 130
    },
    {
      title: '登录次数',
      dataIndex: 'loginCount',
      key: 'loginCount',
      width: 80
    },
    {
      title: '状态',
      dataIndex: 'isLocked',
      key: 'isLocked',
      width: 80,
      render: (isLocked: boolean) => (
        <Tag color={isLocked ? 'red' : 'success'}>
          {isLocked ? '已锁定' : '正常'}
        </Tag>
      )
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      key: 'auditStatus',
      width: 100,
      render: (auditStatus: string) => {
        const statusMap: { [key: string]: { text: string; color: string } } = {
          'PENDING': { text: '待审核', color: 'orange' },
          'APPROVED': { text: '已通过', color: 'success' },
          'REJECTED': { text: '已拒绝', color: 'red' }
        };
        const config = statusMap[auditStatus] || { text: auditStatus, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '用户状态',
      dataIndex: 'userStatus',
      key: 'userStatus',
      width: 100,
      render: (userStatus: number) => (
        <Tag color={userStatus === 1 ? 'success' : 'red'}>
          {userStatus === 1 ? '正常' : '已锁定'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 400,
      render: (_: any, record: Device) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {record.isLocked ? (
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              size="small"
              onClick={() => handleUnlockDevice(record)}
            >
              解锁
            </Button>
          ) : null}
          {record.auditStatus === 'PENDING' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleAuditDevice(record, 'APPROVED')}
            >
              审核通过
            </Button>
          )}
          {record.userStatus === 1 ? (
            <Button
              type="primary"
              danger
              size="small"
              onClick={() => handleUserStatus(record, 0)}
            >
              锁定用户
            </Button>
          ) : (
            <Button
              type="primary"
              size="small"
              onClick={() => handleUserStatus(record, 1)}
            >
              解锁用户
            </Button>
          )}
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleRemoveDevice(record)}
          >
            移除
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <Card
        title="设备管理"
        extra={
          <Button type="primary" onClick={() => fetchDevices()}>
            刷新列表
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={devices.map(device => ({
            ...device,
            key: device.deviceId
          }))}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Modal
        title="编辑设备信息"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSaveDevice}
          layout="vertical"
        >
          <Form.Item
            name="deviceName"
            label="设备名称"
            rules={[{ required: true, message: '请输入设备名称' }]}
          >
            <Input placeholder="请输入设备名称" />
          </Form.Item>

          <Form.Item
            name="deviceType"
            label="设备类型"
            rules={[{ required: true, message: '请选择设备类型' }]}
          >
            <Select placeholder="请选择设备类型">
              <Option value="PC">电脑</Option>
              <Option value="MOBILE">手机</Option>
              <Option value="TABLET">平板</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="osType"
            label="操作系统"
            rules={[{ required: true, message: '请输入操作系统' }]}
          >
            <Input placeholder="请输入操作系统" />
          </Form.Item>

          <Form.Item
            name="browserType"
            label="浏览器"
            rules={[{ required: true, message: '请输入浏览器' }]}
          >
            <Input placeholder="请输入浏览器" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
              保存
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DeviceManagement;