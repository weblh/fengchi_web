import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Card, Tree, Checkbox } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const { Option } = Select;

interface Permission {
  id: number;
  permissionName: string;
  permissionCode: string;
  parentId: number;
  type: number;
  sortOrder: number;
  status: number;
  createTime?: string;
  updateTime?: string;
  children?: Permission[];
}

interface PermissionFormData {
  permissionName: string;
  permissionCode: string;
  parentId: number;
  type: number;
  sortOrder: number;
  status: number;
}

const PermissionSetting: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionTree, setPermissionTree] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<number[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null);
  const [form] = Form.useForm();
  const [selectedRoleId, setSelectedRoleId] = useState<number>(0);

  // 查询权限列表（平铺）
  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/permissions/list', {
        type: 2,  // 只查询菜单
        status: 1
      });
      setPermissions(response || []);
    } catch (error) {
      console.error('获取权限列表失败:', error);
      message.error('获取权限列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 查询权限树
  const fetchPermissionTree = async () => {
    try {
      const response = await request.get('/api/permissions/tree');
      setPermissionTree(response || []);
    } catch (error) {
      console.error('获取权限树失败:', error);
      message.error('获取权限树失败');
    }
  };

  // 获取角色权限
  const fetchRolePermissions = async (roleId: number) => {
    try {
      const response = await request.get(`/api/role-permissions/role/${roleId}`);
      setRolePermissions(response || []);
    } catch (error) {
      console.error('获取角色权限失败:', error);
      message.error('获取角色权限失败');
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

  // 获取当前用户权限代码
  const fetchUserPermissions = async () => {
    try {
      const response = await request.get('/api/permissions/current/codes');
      setUserPermissions(response || []);
    } catch (error) {
      console.error('获取用户权限失败:', error);
      message.error('获取用户权限失败');
    }
  };

  // 新增权限
  const handleAddPermission = async (values: PermissionFormData) => {
    try {
      await request.post('/api/permissions', values);
      message.success('权限添加成功');
      setModalVisible(false);
      form.resetFields();
      fetchPermissions();
      fetchPermissionTree();
    } catch (error) {
      console.error('添加权限失败:', error);
      message.error('添加权限失败');
    }
  };

  // 修改权限
  const handleUpdatePermission = async (values: PermissionFormData) => {
    if (!currentPermission) return;
    try {
      await request.put(`/api/permissions/${currentPermission.id}`, {
        ...values,
        id: currentPermission.id
      });
      message.success('权限更新成功');
      setModalVisible(false);
      form.resetFields();
      fetchPermissions();
      fetchPermissionTree();
    } catch (error) {
      console.error('更新权限失败:', error);
      message.error('更新权限失败');
    }
  };

  // 删除权限
  const handleDeletePermission = async (id: number) => {
    try {
      await request.delete(`/api/permissions/${id}`);
      message.success('权限删除成功');
      fetchPermissions();
      fetchPermissionTree();
    } catch (error) {
      console.error('删除权限失败:', error);
      message.error('删除权限失败');
    }
  };

  // 更新权限状态
  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await request.put(`/api/permissions/${id}/status?status=${status}`);
      message.success('权限状态更新成功');
      fetchPermissions();
      fetchPermissionTree();
    } catch (error) {
      console.error('更新权限状态失败:', error);
      message.error('更新权限状态失败');
    }
  };

  // 打开新增模态框
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentPermission(null);
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (permission: Permission) => {
    setIsEditing(true);
    setCurrentPermission(permission);
    form.setFieldsValue(permission);
    setModalVisible(true);
  };

  // 处理角色选择
  const handleRoleChange = (roleId: number) => {
    setSelectedRoleId(roleId);
    fetchRolePermissions(roleId);
  };

  // 处理权限树勾选
  const handleTreeCheck = (checkedKeys: any) => {
    setRolePermissions(checkedKeys);
  };

  // 保存角色权限
  const handleSavePermissions = async () => {
    if (selectedRoleId === 0 || rolePermissions.length === 0) {
      return;
    }
    try {
      await request.post('/api/role-permissions/assign', {
        roleId: selectedRoleId,
        permissionIds: rolePermissions
      });
      message.success('权限分配成功');
    } catch (error) {
      console.error('权限分配失败:', error);
      message.error('权限分配失败');
    }
  };

  // 初始化数据
  useEffect(() => {
    fetchPermissions();
    fetchPermissionTree();
    fetchAllRoles();
  }, []);

  // 递归转换权限数据为树节点
  const convertToTreeNode = (item: any) => {
    const node = {
      title: item.permissionName,
      key: item.id,
    };

    if (item.children && item.children.length > 0) {
      node.children = item.children.map((child: any) => convertToTreeNode(child));
    }

    return node;
  };

  // 表格列配置
  const columns = [
    {
      title: '权限名称',
      dataIndex: 'permissionName',
      key: 'permissionName',
    },
    {
      title: '权限编码',
      dataIndex: 'permissionCode',
      key: 'permissionCode',
    },
    {
      title: '父权限ID',
      dataIndex: 'parentId',
      key: 'parentId',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: number) => {
        switch (type) {
          case 1:
            return '目录';
          case 2:
            return '菜单';
          case 3:
            return '按钮';
          default:
            return '未知';
        }
      },
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: Permission) => (
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
      render: (_: any, record: Permission) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个权限吗？"
            icon={<ExclamationCircleOutlined />}
            onConfirm={() => handleDeletePermission(record.id)}
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 权限树节点渲染
  const renderTreeNode = (data: Permission[]) => {
    return data.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <Tree.TreeNode key={item.id} title={item.permissionName} value={item.id}>
            {renderTreeNode(item.children)}
          </Tree.TreeNode>
        );
      }
      return <Tree.TreeNode key={item.id} title={item.permissionName} value={item.id} />;
    });
  };

  return (
    <div className="space-y-6">
      {/* 权限列表 */}
      <Card
        title="权限管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            新增权限
          </Button>
        }
      >
        <Table
          dataSource={permissions}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* 角色权限 */}
      <Card title="角色权限">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="mr-2">选择角色：</label>
            <Select
              placeholder="请选择角色"
              style={{ width: 200 }}
              onChange={handleRoleChange}
            >
              {allRoles.map(role => (
                <Option key={role.id} value={role.id}>{role.roleName}</Option>
              ))}
            </Select>
          </div>
          <Button 
            type="primary" 
            onClick={handleSavePermissions}
            disabled={selectedRoleId === 0 || rolePermissions.length === 0}
          >
            保存权限
          </Button>
        </div>
        <Tree
          checkable
          defaultExpandAll
          checkedKeys={rolePermissions}
          onCheck={handleTreeCheck}
          treeData={permissionTree.map(item => convertToTreeNode(item))}
        />
      </Card>

      <Modal
        title={isEditing ? '编辑权限' : '新增权限'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isEditing ? handleUpdatePermission : handleAddPermission}
        >
          <Form.Item
            name="permissionName"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>

          <Form.Item
            name="permissionCode"
            label="权限编码"
            rules={[{ required: true, message: '请输入权限编码' }]}
          >
            <Input placeholder="请输入权限编码" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="父权限ID"
            rules={[{ required: true, message: '请输入父权限ID' }]}
          >
            <Input type="number" placeholder="请输入父权限ID" />
          </Form.Item>

          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择权限类型' }]}
          >
            <Select placeholder="请选择权限类型">
              <Option value={1}>目录</Option>
              <Option value={2}>菜单</Option>
              <Option value={3}>按钮</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择权限状态' }]}
          >
            <Select placeholder="请选择权限状态">
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

export default PermissionSetting;
