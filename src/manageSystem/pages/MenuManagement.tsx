import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Popconfirm, Card, Tree } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const { Option } = Select;

interface Menu {
  id: number;
  menuName: string;
  parentId: number;
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  permissionCode: string;
  visible: number;
  status: number;
  createTime?: string;
  updateTime?: string;
  children?: Menu[];
}

interface MenuFormData {
  menuName: string;
  parentId: number;
  type: number; // 1: 目录, 2: 菜单
  path: string;
  component: string;
  icon: string;
  sortOrder: number;
  permissionCode: string;
  visible: number;
  status: number;
}

const MenuManagement: React.FC = () => {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [menuTree, setMenuTree] = useState<Menu[]>([]);
  const [userRoutes, setUserRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [form] = Form.useForm();
  const [menuType, setMenuType] = useState<number>(2); // 默认为菜单类型
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]); // 展开的节点键

  // 查询菜单列表（平铺）
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/menus/list', {
        type: 2,  // 只查询菜单
        status: 1
      });
      setMenus(response || []);
    } catch (error) {
      console.error('获取菜单列表失败:', error);
      message.error('获取菜单列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 查询菜单树
  const fetchMenuTree = async () => {
    try {
      const response = await request.get('/api/menus/tree');
      setMenuTree(response || []);
    } catch (error) {
      console.error('获取菜单树失败:', error);
      message.error('获取菜单树失败');
    }
  };

  // 获取当前用户路由菜单
  const fetchUserRoutes = async () => {
    try {
      const response = await request.get('/api/menus/tree');
      setUserRoutes(response || []);
    } catch (error) {
      console.error('获取用户路由失败:', error);
      message.error('获取用户路由失败');
    }
  };

  // 根据ID查询菜单
  const fetchMenuById = async (id: number) => {
    try {
      const response = await request.get(`/api/menus/${id}`);
      return response;
    } catch (error) {
      console.error('获取菜单详情失败:', error);
      message.error('获取菜单详情失败');
      return null;
    }
  };

  // 新增菜单
  const handleAddMenu = async (values: MenuFormData) => {
    try {
      await request.post('/api/menus', values);
      message.success('菜单添加成功');
      setModalVisible(false);
      form.resetFields();
      // 删除本地缓存的路由数据
      localStorage.removeItem('userRoutes');
      // 刷新页面
      // window.location.reload();
    } catch (error: any) {
      console.error('添加菜单失败:', error);
      // 尝试从错误响应中获取具体的错误信息
      const errorMessage = error.response?.data?.message || '添加菜单失败';
      message.error(errorMessage);
    }
  };

  // 修改菜单
  const handleUpdateMenu = async (values: MenuFormData) => {
    if (!currentMenu) return;
    try {
      await request.put(`/api/menus/${currentMenu.id}`, {
        ...values,
        id: currentMenu.id
      });
      message.success('菜单更新成功');
      setModalVisible(false);
      form.resetFields();
      // 删除本地缓存的路由数据
      localStorage.removeItem('userRoutes');
      // 刷新页面
      window.location.reload();
    } catch (error: any) {
      console.error('更新菜单失败:', error);
      const errorMessage = error.response?.data?.message || '更新菜单失败';
      message.error(errorMessage);
    }
  };

  // 删除菜单
  const handleDeleteMenu = async (id: number) => {
    try {
      await request.delete(`/api/menus/${id}`);
      message.success('菜单删除成功');
      // 删除本地缓存的路由数据
      localStorage.removeItem('userRoutes');
      // 刷新页面
      window.location.reload();
    } catch (error: any) {
      console.error('删除菜单失败:', error);
      const errorMessage = error.response?.data?.message || '删除菜单失败';
      message.error(errorMessage);
    }
  };

  // 批量删除菜单
  const handleBatchDelete = async (ids: number[]) => {
    try {
      await request.delete('/api/menus/batch', { data: ids });
      message.success('菜单批量删除成功');
      // 删除本地缓存的路由数据
      localStorage.removeItem('userRoutes');
      // 刷新页面
      window.location.reload();
    } catch (error: any) {
      console.error('批量删除菜单失败:', error);
      const errorMessage = error.response?.data?.message || '批量删除菜单失败';
      message.error(errorMessage);
    }
  };

  // 更新菜单状态
  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await request.put(`/api/menus/${id}/status?status=${status}`);
      message.success('菜单状态更新成功');
      // 删除本地缓存的路由数据
      localStorage.removeItem('userRoutes');
      // 刷新页面
      window.location.reload();
    } catch (error: any) {
      console.error('更新菜单状态失败:', error);
      const errorMessage = error.response?.data?.message || '更新菜单状态失败';
      message.error(errorMessage);
    }
  };

  // 打开新增模态框
  const openAddModal = () => {
    setIsEditing(false);
    setCurrentMenu(null);
    setMenuType(2); // 重置为默认值（菜单）
    form.resetFields();
    setModalVisible(true);
  };

  // 打开编辑模态框
  const openEditModal = (menu: Menu) => {
    setIsEditing(true);
    setCurrentMenu(menu);
    // 确保类型字段有值
    const menuTypeValue = menu.type || 2; // 默认值为菜单
    setMenuType(menuTypeValue);
    const menuData = {
      ...menu,
      type: menuTypeValue
    };
    form.setFieldsValue(menuData);
    // 计算并设置展开的节点键
    if (menu.id) {
      const ancestorIds = getAncestorIds(menu.id, menuTree);
      setExpandedKeys(ancestorIds);
    }
    setModalVisible(true);
  };

  // 将后端返回的路由转换为 React Router 配置
  const convertToRoutes = (routes: any[]) => {
    return routes.map(route => ({
      path: route.path,
      element: route.component ? `imported component: ${route.component}` : null,
      children: route.children ? convertToRoutes(route.children) : []
    }));
  };

  // 获取选中菜单的所有祖先节点ID
  const getAncestorIds = (menuId: number, menuTree: Menu[]): React.Key[] => {
    const ancestors: React.Key[] = [];
    
    const findAncestors = (id: number, tree: Menu[]): boolean => {
      for (const menu of tree) {
        if (menu.id === id) {
          return true;
        }
        if (menu.children && findAncestors(id, menu.children)) {
          ancestors.push(menu.id);
          return true;
        }
      }
      return false;
    };
    
    findAncestors(menuId, menuTree);
    return ancestors.reverse(); // 反转顺序，从根节点到父节点
  };

  // 初始化数据
  useEffect(() => {
    fetchMenus();
    fetchMenuTree();
    fetchUserRoutes();
  }, []);

  // 表格列配置
  const columns = [
    {
      title: '菜单名称',
      dataIndex: 'menuName',
      key: 'menuName',
    },
    {
      title: '路径',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: '组件',
      dataIndex: 'component',
      key: 'component',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: '排序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: '权限编码',
      dataIndex: 'permissionCode',
      key: 'permissionCode',
    },
    {
      title: '可见性',
      dataIndex: 'visible',
      key: 'visible',
      render: (visible: number) => visible === 1 ? '可见' : '不可见',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number, record: Menu) => (
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
      render: (_: any, record: Menu) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个菜单吗？"
            icon={<ExclamationCircleOutlined />}
            onConfirm={() => handleDeleteMenu(record.id)}
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
    <div className="space-y-6">
      {/* 菜单管理 */}
      <Card
        title="菜单管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
            新增菜单
          </Button>
        }
      >
        <Table
          dataSource={menus}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      </Card>

      {/* 新增/编辑菜单模态框 */}
      <Modal
        title={isEditing ? '编辑菜单' : '新增菜单'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setExpandedKeys([]); // 重置展开状态
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={isEditing ? handleUpdateMenu : handleAddMenu}
        >
          {/* 菜单类型选择 */}
          <Form.Item
            name="type"
            label="菜单类型"
            rules={[{ required: true, message: '请选择菜单类型' }]}
          >
            <Select 
              placeholder="请选择菜单类型"
              onChange={setMenuType}
            >
              <Option value={1}>目录</Option>
              <Option value={2}>菜单</Option>
            </Select>
          </Form.Item>

          {/* 父菜单ID - 仅菜单显示 */}
          {menuType === 2 && (
            <Form.Item
              name="parentId"
              label="父菜单ID"
              rules={[{ required: true, message: '请输入父菜单ID' }]}
            >
              <Input type="number" placeholder="请输入父菜单ID" />
            </Form.Item>
          )}

          {/* 目录名称/菜单名称 */}
          <Form.Item
            name="menuName"
            label={menuType === 1 ? "目录名称" : "菜单名称"}
            rules={[{ required: true, message: `请输入${menuType === 1 ? '目录' : '菜单'}名称` }]}
          >
            <Input placeholder={`请输入${menuType === 1 ? '目录' : '菜单'}名称`} />
          </Form.Item>

          {/* 路径 */}
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: '请输入路径' }]}
          >
            <Input placeholder="请输入路径" />
          </Form.Item>

          {/* 组件 - 仅菜单显示 */}
          {menuType === 2 && (
            <Form.Item
              name="component"
              label="组件"
              rules={[{ required: true, message: '请输入组件' }]}
            >
              <Input placeholder="请输入组件" />
            </Form.Item>
          )}

          <Form.Item
            name="icon"
            label="图标"
            rules={[{ required: true, message: '请输入图标' }]}
          >
            <Input placeholder="请输入图标" />
          </Form.Item>

          <Form.Item
            name="sortOrder"
            label="排序"
            rules={[{ required: true, message: '请输入排序' }]}
          >
            <Input type="number" placeholder="请输入排序" />
          </Form.Item>

          <Form.Item
            name="permissionCode"
            label="权限编码"
          >
            <Input placeholder="请输入权限编码" />
          </Form.Item>

          <Form.Item
            name="visible"
            label="可见性"
            rules={[{ required: true, message: '请选择可见性' }]}
          >
            <Select placeholder="请选择可见性">
              <Option value={1}>可见</Option>
              <Option value={0}>不可见</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择菜单状态' }]}
          >
            <Select placeholder="请选择菜单状态">
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

export default MenuManagement;
