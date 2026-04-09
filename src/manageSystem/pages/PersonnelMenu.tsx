import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Card, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, KeyOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  roleId: number;
  roleName?: string;
  status: number;
  createTime?: string;
  updateTime?: string;
}

interface UserFormData {
  username: string;
  email: string;
  phone: string;
  roleId: number;
  status: number;
}

interface Role {
  id: number;
  roleName: string;
}

const PersonnelMenu: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [assignPermissionModalVisible, setAssignPermissionModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number>(0);
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // 分页查询用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/users/page', {
        username: '',
        status: 1,
        pageNum: page,
        pageSize: pageSize
      });
      setUsers(response.records || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await request.get('/api/roles/all');
      setRoles(response || []);
    } catch (error) {
      console.error('获取角色列表失败:', error);
      message.error('获取角色列表失败');
    }
  };

  // 获取当前用户信息
  const fetchCurrentUser = async () => {
    try {
      const response = await request.get('/api/users/current');
      setCurrentUser(response);
    } catch (error) {
      console.error('获取当前用户信息失败:', error);
      message.error('获取当前用户信息失败');
    }
  };

  // 新增用户
  const handleAddUser = async (values: UserFormData) => {
    try {
      await request.post('/api/users', values);
      message.success('用户添加成功');
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('添加用户失败:', error);
      message.error('添加用户失败');
    }
  };

  // 修改用户
  const handleUpdateUser = async (values: UserFormData) => {
    if (!currentUserId) return;
    try {
      await request.put(`/api/users/${currentUserId}`, {
        ...values,
        id: currentUserId
      });
      message.success('用户更新成功');
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error('更新用户失败:', error);
      message.error('更新用户失败');
    }
  };

  // 删除用户
  const handleDeleteUser = async (id: number) => {
    try {
      await request.delete(`/api/users/${id}`);
      message.success('用户删除成功');
      fetchUsers();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    }
  };

  // 批量删除用户
  const handleBatchDelete = async (ids: number[]) => {
    try {
      await request.delete('/api/users/batch', { data: ids });
      message.success('用户批量删除成功');
      fetchUsers();
    } catch (error) {
      console.error('批量删除用户失败:', error);
      message.error('批量删除用户失败');
    }
  };

  // 给用户分配角色
  const handleAssignRole = async (userId: number, roleId: number) => {
    try {
      await request.put(`/api/users/${userId}/role`, {
        userId,
        roleId
      });
      message.success('角色分配成功');
      fetchUsers();
    } catch (error) {
      console.error('分配角色失败:', error);
      message.error('分配角色失败');
    }
  };

  // 更新用户状态
  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await request.put(`/api/users/${id}/status?status=${status}`);
      message.success('用户状态更新成功');
      fetchUsers();
    } catch (error) {
      console.error('更新用户状态失败:', error);
      message.error('更新用户状态失败');
    }
  };

  // 修改当前用户密码
  const handleChangePassword = async (values: { oldPassword: string; newPassword: string }) => {
    try {
      await request.put('/api/users/current/password', values);
      message.success('密码修改成功');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error('修改密码失败:', error);
      message.error('修改密码失败');
    }
  };

  // 重置用户密码（管理员）
  const handleResetPassword = async (userId: number) => {
    try {
      await request.put(`/api/users/${userId}/reset-password`);
      message.success('密码重置成功');
      setResetPasswordModalVisible(false);
    } catch (error) {
      console.error('重置密码失败:', error);
      message.error('重置密码失败');
    }
  };

  // 给角色分配权限
  const handleAssignPermissions = async (roleId: number, permissionIds: number[]) => {
    try {
      await request.post('/api/role-permissions/assign', {
        roleId,
        permissionIds
      });
      message.success('权限分配成功');
      setAssignPermissionModalVisible(false);
    } catch (error) {
      console.error('分配权限失败:', error);
      message.error('分配权限失败');
    }
  };

  // 获取角色的权限ID列表
  const fetchRolePermissions = async (roleId: number) => {
    try {
      const response = await request.get(`/api/role-permissions/role/${roleId}`);
      return response || [];
    } catch (error) {
      console.error('获取角色权限失败:', error);
      message.error('获取角色权限失败');
      return [];
    }
  };

  // 打开新增模态框
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentUserId(0);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (user: User) => {
    setIsEditing(true);
    setCurrentUserId(user.id);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  // 打开修改密码模态框
  const openPasswordModal = () => {
    passwordForm.resetFields();
    setPasswordModalVisible(true);
  };

  // 打开重置密码模态框
  const openResetPasswordModal = (userId: number) => {
    setCurrentUserId(userId);
    setResetPasswordModalVisible(true);
  };

  // 打开分配权限模态框
  const openAssignPermissionModal = (roleId: number) => {
    setSelectedRoleId(roleId);
    setAssignPermissionModalVisible(true);
  };

  // 处理分页
  const handlePaginationChange = (current: number, size: number) => {
    setPage(current);
    setPageSize(size);
  };

  // 初始化数据
  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchCurrentUser();
  }, [page, pageSize]);

  // 表格列配置
  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (roleId: number, record: User) => {
        // 对于 id 为 4 的用户，只显示角色名称，不允许编辑
        if (record.id === 4) {
          return record.roleName || '';
        }
        return (
          <Select
            value={roleId}
            onChange={(value) => handleAssignRole(record.id, value)}
            style={{ width: 120 }}
          >
            {roles.map(role => (
              <Option key={role.id} value={role.id}>{role.roleName}</Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: User) => {
        // 对于 id 为 4 的用户，只显示状态，不允许编辑
        if (record.id === 4) {
          return status === 1 ? '启用' : '禁用';
        }
        return (
          <Select
            value={status}
            onChange={(value) => handleUpdateStatus(record.id, value)}
            style={{ width: 100 }}
          >
            <Option value={1}>启用</Option>
            <Option value={0}>禁用</Option>
          </Select>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => {
        // 对于 id 为 4 的用户，不显示任何操作按钮
        if (record.id === 4) {
          return null;
        }
        return (
          <Space size="middle">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            >
              编辑
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => openResetPasswordModal(record.id)}
            >
              重置密码
            </Button>
            <Popconfirm
              title="确定要删除这个用户吗？"
              icon={<ExclamationCircleOutlined />}
              onConfirm={() => handleDeleteUser(record.id)}
            >
              <Button danger icon={<DeleteOutlined />}>
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 当前用户信息 */}
      {currentUser && (
        <Card title="当前用户信息">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p><strong>用户名：</strong>{currentUser.username}</p>
              <p><strong>邮箱：</strong>{currentUser.email}</p>
              <p><strong>电话：</strong>{currentUser.phone}</p>
            </div>
            {/* <Button type="primary" icon={<KeyOutlined />} onClick={openPasswordModal}>
              修改密码
            </Button> */}
          </div>
        </Card>
      )}

      {/* 用户管理 */}
      <Card
        title="用户管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            新增用户
          </Button>
        }
      >
        <Table
          dataSource={users}
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

      {/* 新增/编辑用户模态框 */}
      <Modal
        title={isEditing ? '编辑用户' : '新增用户'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isEditing ? handleUpdateUser : handleAddUser}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入正确的邮箱格式' }]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="电话"
            rules={[{ required: true, message: '请输入电话' }]}
          >
            <Input placeholder="请输入电话" />
          </Form.Item>

          <Form.Item
            name="roleId"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>{role.roleName}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择用户状态' }]}
          >
            <Select placeholder="请选择用户状态">
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

      {/* 修改密码模态框 */}
      <Modal
        title="修改密码"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="旧密码"
            rules={[{ required: true, message: '请输入旧密码' }]}
          >
            <Input.Password placeholder="请输入旧密码" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setPasswordModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认修改
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 重置密码模态框 */}
      <Modal
        title="重置密码"
        open={resetPasswordModalVisible}
        onCancel={() => setResetPasswordModalVisible(false)}
        onOk={() => handleResetPassword(currentUserId)}
      >
        <p>确定要重置该用户的密码吗？</p>
        <p className="text-gray-500">重置后密码将恢复为默认值</p>
      </Modal>

      {/* 分配权限模态框 */}
      <Modal
        title="分配权限"
        open={assignPermissionModalVisible}
        onCancel={() => setAssignPermissionModalVisible(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          onFinish={(values) => handleAssignPermissions(selectedRoleId, values.permissionIds as number[])}
        >
          <Form.Item
            name="permissionIds"
            label="选择权限"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select mode="multiple" placeholder="请选择权限">
              {/* 这里可以动态加载权限列表 */}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setAssignPermissionModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                确认分配
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PersonnelMenu;
