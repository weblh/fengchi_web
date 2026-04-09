import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleSetting from './pages/RoleSetting';
import PermissionSetting from './pages/PermissionSetting';
import PersonnelMenu from './pages/PersonnelMenu';
import MenuManagement from './pages/MenuManagement';
import LinkageDashboard from './pages/LinkageDashboard';
import LinkageManagement from './pages/LinkageManagement';

const ManageSystemRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="role-setting" element={<RoleSetting />} />
      <Route path="permission-setting" element={<PermissionSetting />} />
      <Route path="personnel-menu" element={<PersonnelMenu />} />
      <Route path="menu-management" element={<MenuManagement />} />
      <Route path="linked-dashboard" element={<LinkageDashboard />} />
      <Route path="sales/linkage" element={<LinkageManagement />} />
      {/* 其他路由可以在这里添加 */}
    </Routes>
  );
};

export default ManageSystemRoutes;
