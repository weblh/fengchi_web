import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { 
  SettingOutlined, 
  TeamOutlined, 
  DashboardOutlined, 
  ShoppingOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import request from '../utils/request';

const { Sider, Content, Header } = Layout;

const ManageSystem: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  // 获取用户路由菜单并缓存
  useEffect(() => {
    const fetchUserRoutes = async () => {
      setLoading(true);
      try {
        // 直接调用接口获取路由数据
        const response = await request.get('/api/menus/routes');
        // const response = await request.get('/api/menus/list');
        
        // 存储到本地缓存
        localStorage.setItem('userRoutes', JSON.stringify(response));
        
        // 转换路由数据为菜单配置
        const menus = convertRoutesToMenuItems(response);
        setMenuItems(menus);
      } catch (error) {
        console.error('获取用户路由失败:', error);
        message.error('获取用户路由失败');
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    // 检查本地缓存是否有路由数据
    const cachedRoutes = localStorage.getItem('userRoutes');
    if (cachedRoutes) {
      // 如果有缓存，使用缓存的数据
      try {
        const routes = JSON.parse(cachedRoutes);
        
        // 转换路由数据为菜单配置
        const menus = convertRoutesToMenuItems(routes);
        setMenuItems(menus);
      } catch (error) {
        console.error('解析缓存数据失败:', error);
        // 解析失败，重新调用接口获取
        fetchUserRoutes();
      } finally {
        setLoading(false);
      }
    } else {
      // 如果没有缓存，调用接口获取
      fetchUserRoutes();
    }
  }, []);

  // 查找选中菜单项的所有父节点键
  const findAncestorKeys = (key: string, items: any[]): string[] => {
    const ancestors: string[] = [];
    
    const findParent = (targetKey: string, currentItems: any[]): boolean => {
      for (const item of currentItems) {
        if (item.key === targetKey) {
          return true;
        }
        if (item.children && item.children.length > 0) {
          if (findParent(targetKey, item.children)) {
            ancestors.push(item.key);
            return true;
          }
        }
      }
      return false;
    };
    
    findParent(key, items);
    return ancestors;
  };

  // 根据当前路径设置选中的菜单项和展开的父节点
  useEffect(() => {
    if (menuItems.length > 0) {
      // 从路径中提取当前路由
      const path = location.pathname.replace('/manage-system/', '');
      
      // 查找匹配的菜单项
      const findSelectedKey = (items: any[]): string => {
        for (const item of items) {
          if (item.key === path) {
            return item.key;
          }
          if (item.children && item.children.length > 0) {
            const childKey = findSelectedKey(item.children);
            if (childKey) {
              return childKey;
            }
          }
        }
        return '';
      };
      
      const key = findSelectedKey(menuItems);
      if (key) {
        setSelectedKey(key);
        // 计算并设置展开的父节点键
        const ancestorKeys = findAncestorKeys(key, menuItems);
        setOpenKeys(ancestorKeys);
      } else if (menuItems.length > 0) {
        // 如果没有匹配的，默认选中第一个并导航到该路径
        const firstKey = menuItems[0].key;
        setSelectedKey(firstKey);
        // 导航到第一个菜单项对应的路径
        navigate(`/manage-system/${firstKey}`);
      }
    }
  }, [location.pathname, menuItems, navigate]);

  // 从权限编码数组生成默认菜单
  const generateDefaultMenuFromPermissions = (permissions: string[]): any[] => {
    // 这里可以根据权限编码生成默认菜单
    // 暂时返回一个简单的菜单结构
    return [
      {
        key: 'dashboard',
        icon: <DashboardOutlined />,
        label: '仪表盘',
      },
      {
        key: 'management',
        icon: <SettingOutlined />,
        label: '管理设置',
        children: [
          { key: 'role-setting', label: '角色设置' },
          { key: 'permission-setting', label: '权限设置' },
          { key: 'personnel-menu', label: '人员菜单' },
          { key: 'menu-management', label: '菜单管理' },
        ],
      },
    ];
  };

  // 将路由数据转换为菜单配置
  const convertRoutesToMenuItems = (routes: any[]): any[] => {
    
    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      return [];
    }

    const result = routes
      .filter(route => route.type !== 3) // 过滤掉 type: 3 的菜单项（操作权限）
      .map(route => {
        let menuKey = route.path ? route.path.replace('/', '') : `menu-${route.id}`;
        
        // 特殊处理角色设置的路由
        if (route.permissionCode === 'role:manage' || route.permissionName === '角色管理' || route.menuName === '角色管理') {
          menuKey = 'settings/role';
        }
        // 特殊处理菜单管理的路由
        if (route.permissionCode === 'menu:manage' || route.permissionName === '菜单管理' || route.menuName === '菜单管理') {
          menuKey = 'system/menu';
        }
        // 特殊处理权限设置的路由
        if (route.permissionCode === 'permission:manage' || route.permissionName === '权限管理' || route.menuName === '权限管理') {
          menuKey = 'system/permission';
        }
        
        const menuItem: any = {
          key: menuKey,
          icon: route.icon ? getIconByName(route.icon) : undefined,
          label: route.permissionName || route.menuName,
        };
        
        if (route.children && route.children.length > 0) {
          const childMenuItems = convertRoutesToMenuItems(route.children);
          if (childMenuItems.length > 0) {
            menuItem.children = childMenuItems;
          }
        }

        return menuItem;
      });
    
    return result;
  };

  // 根据图标名称获取图标组件
  const getIconByName = async (iconName: string) => {
    // 导入所有可能用到的图标
    const { 
      SettingOutlined, 
      UserOutlined, 
      DashboardOutlined, 
      ShoppingOutlined, 
      ShoppingCartOutlined, 
      DollarOutlined,
      TeamOutlined
    } = await import('@ant-design/icons');

    // 图标映射
    const iconMap: Record<string, React.ReactNode> = {
      SettingOutlined: <SettingOutlined />,
      UserOutlined: <UserOutlined />,
      DashboardOutlined: <DashboardOutlined />,
      ShoppingOutlined: <ShoppingOutlined />,
      ShoppingCartOutlined: <ShoppingCartOutlined />,
      DollarOutlined: <DollarOutlined />,
      TeamOutlined: <TeamOutlined />
    };

    return iconMap[iconName] || <SettingOutlined />;
  };

  const handleMenuClick = (e: any) => {
    navigate(`/manage-system/${e.key}`);
  };

  // 退出登录
  const handleLogout = async () => {
    try {
      await request.post('/api/auth/logout');
      // 清除本地缓存
      localStorage.removeItem('token');
      localStorage.removeItem('userRoutes');
      // 跳转到登录页面
      navigate('/login');
    } catch (error) {
      console.error('退出登录失败:', error);
      message.error('退出登录失败');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {menuItems.length > 0 && (
        <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
          <div className="logo p-4 text-center text-white font-bold text-xl">
            丰驰管理系统
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            items={menuItems}
            onClick={handleMenuClick}
          />
        </Sider>
      )}
      <Layout>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', color: '#fff' }}>
          {menuItems.length > 0 && (
            <Button type="text" icon={<SettingOutlined />} onClick={toggleCollapsed} style={{ color: '#fff' }} />
          )}
          <div className="flex items-center">
            <span className="mr-4">欢迎，管理员</span>
            <Button type="text" icon={<UserOutlined />} className="mr-2" style={{ color: '#fff' }} />
            <Button type="text" onClick={handleLogout} style={{ color: '#fff' }}>
              退出登录
            </Button>
          </div>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: '8px' }}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <span>加载中...</span>
            </div>
          ) : (
            <Outlet />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default ManageSystem;