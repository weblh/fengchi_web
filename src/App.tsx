import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinancialDashboard } from './components/FinancialDashboard';
import LoginPage from './components/LoginPage';
import AuthGuard from './components/AuthGuard';
import ManageSystem from './manageSystem';
import RoleSetting from './manageSystem/pages/RoleSetting';
import PermissionSetting from './manageSystem/pages/PermissionSetting';
import PersonnelMenu from './manageSystem/pages/PersonnelMenu';
import SystemSetting from './manageSystem/pages/SystemSetting';
import MenuManagement from './manageSystem/pages/MenuManagement';
import FinancialDashboardPage from './manageSystem/pages/FinancialDashboard';
import SalesDashboard from './manageSystem/pages/SalesDashboard';
import PurchaseDashboard from './manageSystem/pages/PurchaseDashboard';
import LinkageDashboard from './manageSystem/pages/LinkageDashboard';
import SteelDashboard from './manageSystem/pages/SteelDashboard';
import ReceivablesManagement from './manageSystem/pages/ReceivablesManagement';
import BalanceManagement from './manageSystem/pages/BalanceManagement';
import CollectionManagement from './manageSystem/pages/CollectionManagement';
import DiscountManagement from './manageSystem/pages/DiscountManagement';
import FundUsageManagement from './manageSystem/pages/FundUsageManagement';
import SalesManagement from './manageSystem/pages/SalesManagement';
import PurchaseManagement from './manageSystem/pages/PurchaseManagement';
import LinkageManagement from './manageSystem/pages/LinkageManagement';
import { mockFinancialData } from './data/mockData';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthGuard />}>
            <Route path="/dashboard" element={<FinancialDashboard data={mockFinancialData} />} />
            <Route path="/manage-system/*" element={<ManageSystem />}>
              <Route path="settings/role" element={<RoleSetting />} />
              <Route path="system/permission" element={<PermissionSetting />} />
              <Route path="system/menu" element={<MenuManagement />} />
              <Route path="system/user" element={<PersonnelMenu />} />
              <Route path="system" element={<SystemSetting />} />
              <Route path="financial-dashboard" element={<FinancialDashboardPage />} />
              <Route path="sales-dashboard" element={<SalesDashboard />} />
              <Route path="purchase-dashboard" element={<PurchaseDashboard />} />
              <Route path="steel-dashboard" element={<SteelDashboard />} />
              <Route path="linked-dashboard" element={<LinkageDashboard />} />
              <Route path="sales/linkage" element={<LinkageManagement />} />
              <Route path="receivables-management" element={<ReceivablesManagement />} />
              <Route path="balance-management" element={<BalanceManagement />} />
              <Route path="collection-management" element={<CollectionManagement />} />
              <Route path="discount-management" element={<DiscountManagement />} />
              <Route path="fund-usage-management" element={<FundUsageManagement />} />
            </Route>
          </Route>
          {/* 单独的联动价格仪表盘路由，不需要权限验证 */}
          <Route path="/linked-dashboard" element={<LinkageDashboard />} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;