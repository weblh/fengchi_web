import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, message, Modal, Form, Select, Space, Popconfirm } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import request from '../../../utils/request';

const { Search } = Input;
const { Option } = Select;

interface ApprovalProcessConfig {
  id: number;
  processCode: string;
  processName: string;
  status: number;
  type: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}

interface ConfigFormData {
  processCode: string;
  processName: string;
  status: number;
  type: string;
  remark: string;
}

const ApprovalProcessConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApprovalProcessConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentConfig, setCurrentConfig] = useState<ApprovalProcessConfig | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.keyword = searchTerm;
      if (status !== null) params.status = status;

      const response = await request.get('/api/approval-process-configs', params);
      setData(response || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnabledConfigs = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/approval-process-configs/enabled');
      setData(response || []);
    } catch (error) {
      console.error('Error fetching enabled configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (values: ConfigFormData) => {
    try {
      await request.post('/api/approval-process-configs', values);
      message.success('配置添加成功');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error adding config:', error);
    }
  };

  const handleUpdate = async (values: ConfigFormData) => {
    if (!currentConfig) return;
    try {
      await request.put(`/api/approval-process-configs/${currentConfig.id}`, values);
      message.success('配置更新成功');
      setModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/approval-process-configs/${id}`);
      message.success('配置删除成功');
      fetchData();
    } catch (error) {
      console.error('Error deleting config:', error);
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentConfig(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (config: ApprovalProcessConfig) => {
    setIsEditing(true);
    setCurrentConfig(config);
    form.setFieldsValue(config);
    setModalVisible(true);
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleReset = () => {
    setSearchTerm('');
    setStatus(null);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '流程编码(ID)',
      dataIndex: 'processCode',
      key: 'processCode',
      ellipsis: true,
    },
    {
      title: '流程名称',
      dataIndex: 'processName',
      key: 'processName',
      ellipsis: true,
    },

    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <span style={{ color: status === 1 ? '#52c41a' : '#faad14' }}>
          {status === 1 ? '启用' : '禁用'}
        </span>
      ),
    },
    {
      title: '事件类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <span>
          {type === 'finish' ? '结束' : type === 'terminate' ? '终止' : type}
        </span>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalProcessConfig) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个配置吗？"
            icon={<ExclamationCircleOutlined />}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="钉钉表单ID管理"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchData}
              loading={loading}
            >
              刷新
            </Button>
            <Button
              type="primary"
              onClick={fetchEnabledConfigs}
            >
              查看启用配置
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              新增配置
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索流程编码或名称"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            value={status}
            onChange={setStatus}
            allowClear
          >
            <Option value={1}>启用</Option>
            <Option value={0}>禁用</Option>
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />

        <Modal
          title={isEditing ? '编辑配置' : '新增配置'}
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={isEditing ? handleUpdate : handleAdd}
          >
            <Form.Item
              name="processCode"
              label="流程编码(ID)"
              rules={[{ required: true, message: '请输入流程编码' }]}
            >
              <Input placeholder="请输入流程编码" />
            </Form.Item>

            <Form.Item
              name="processName"
              label="流程名称"
              rules={[{ required: true, message: '请输入流程名称' }]}
            >
              <Input placeholder="请输入流程名称" />
            </Form.Item>



            <Form.Item
              name="status"
              label="状态"
              rules={[{ required: true, message: '请选择状态' }]}
            >
              <Select placeholder="请选择状态">
                <Option value={1}>启用</Option>
                <Option value={0}>禁用</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="type"
              label="事件类型"
              rules={[{ required: true, message: '请选择事件类型' }]}
            >
              <Select placeholder="请选择事件类型">
                <Option value="finish">结束</Option>
                <Option value="terminate">终止</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="remark"
              label="备注"
            >
              <Input.TextArea placeholder="请输入备注" rows={3} />
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {isEditing ? '更新' : '添加'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ApprovalProcessConfig;