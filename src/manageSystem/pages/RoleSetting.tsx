import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const { Option } = Select;

interface Role {
  id: number;
  roleName: string;
  roleCode: string;
  description: string;
  status: number;
  createTime?: string;
  updateTime?: string;
}

interface RoleFormData {
  roleName: string;
  roleCode: string;
  description: string;
  status: number;
}

const RoleSetting: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [form] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 分页查询角色
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/roles/page', {
        roleName: '',
        status: 1,
        pageNum: page,
        pageSize: pageSize
      });
      setRoles(response.records || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 查询所有角色（下拉框用）
  const fetchAllRoles = async () => {
    try {
      const response = await request.get('/api/roles/all');
      setAllRoles(response || []);
    } catch (error) {
      console.error('获取所有角色失败:', error);
      message.error('获取所有角色失败');
    }
  };

  // 新增角色
  const handleAddRole = async (values: RoleFormData) => {
    try {
      await request.post('/api/roles', values);
      message.success('角色添加成功');
      setModalVisible(false);
      form.resetFields();
      fetchRoles();
      fetchAllRoles();
    } catch (error) {
      console.error('添加角色失败:', error);
      message.error('添加角色失败');
    }
  };

  // 修改角色
  const handleUpdateRole = async (values: RoleFormData) => {
    if (!currentRole) return;
    try {
      await request.put(`/api/roles/${currentRole.id}`, {
        ...values,
        id: currentRole.id
      });
      message.success('角色更新成功');
      setModalVisible(false);
      form.resetFields();
      fetchRoles();
      fetchAllRoles();
    } catch (error) {
      console.error('更新角色失败:', error);
      message.error('更新角色失败');
    }
  };

  // 删除角色
  const handleDeleteRole = async (id: number) => {
    try {
      await request.delete(`/api/roles/${id}`);
      message.success('角色删除成功');
      fetchRoles();
      fetchAllRoles();
    } catch (error) {
      console.error('删除角色失败:', error);
      message.error('删除角色失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async (ids: number[]) => {
    try {
      await request.delete('/api/roles/batch', ids);
      message.success('角色批量删除成功');
      fetchRoles();
      fetchAllRoles();
    } catch (error) {
      console.error('批量删除角色失败:', error);
      message.error('批量删除角色失败');
    }
  };

  // 更新角色状态
  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await request.put(`/api/roles/${id}/status?status=${status}`);
      message.success('角色状态更新成功');
      fetchRoles();
      fetchAllRoles();
    } catch (error) {
      console.error('更新角色状态失败:', error);
      message.error('更新角色状态失败');
    }
  };

  // 打开新增模态框
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (role: Role) => {
    setIsEditing(true);
    setCurrentRole(role);
    form.setFieldsValue(role);
    setModalVisible(true);
  };

  // 处理分页
  const handlePaginationChange = (current: number, size: number) => {
    setPage(current);
    setPageSize(size);
  };

  // 初始化数据
  useEffect(() => {
    fetchRoles();
    fetchAllRoles();
  }, [page, pageSize]);

  // 表格列配置
  const columns = [
    {
      title: '角色名称',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '角色编码',
      dataIndex: 'roleCode',
      key: 'roleCode',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: Role) => (
        <Select
          value={status}
          onChange={(value) => handleUpdateStatus(record.id, value)}
          style={{ width: 100 }}
        >
          <Option value={1}>启用</Option>
          <Option value={0}>禁用</Option>
        </Select>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个角色吗？"
            icon={<ExclamationCircleOutlined />}
            onConfirm={() => handleDeleteRole(record.id)}
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
    <div>
      <Card
        title="角色管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            新增角色
          </Button>
        }
      >
        <Table
          dataSource={roles}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: total,
            onChange: handlePaginationChange,
          }}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑角色' : '新增角色'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isEditing ? handleUpdateRole : handleAddRole}
        >
          <Form.Item
            name="roleName"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>

          <Form.Item
            name="roleCode"
            label="角色编码"
            rules={[{ required: true, message: '请输入角色编码' }]}
          >
            <Input placeholder="请输入角色编码" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea placeholder="请输入角色描述" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择角色状态' }]}
          >
            <Select placeholder="请选择角色状态">
              <Option value={1}>启用</Option>
              <Option value={0}>禁用</Option>
            </Select>
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
    </div>
  );
};

export default RoleSetting;
