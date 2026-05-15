import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RoleSetting from './pages/RoleSetting';
import PermissionSetting from './pages/PermissionSetting';
import PersonnelMenu from './pages/PersonnelMenu';
import MenuManagement from './pages/MenuManagement';
import LinkageDashboard from './pages/LinkageDashboard';
import LinkageManagement from './pages/LinkageManagement';
import SystemSetting from './pages/SystemSetting';
import FinancialDashboardPage from './pages/FinancialDashboard';
import SalesDashboard from './pages/SalesDashboard';
import PurchaseDashboard from './pages/purchase/PurchaseDashboard';
import SteelDashboard from './pages/SteelDashboard';
import ReceivablesManagement from './pages/ReceivablesManagement';
import BalanceManagement from './pages/BalanceManagement';
import CollectionManagement from './pages/CollectionManagement';
import DiscountManagement from './pages/DiscountManagement';
import FundUsageManagement from './pages/FundUsageManagement';
import SalesManagement from './pages/SalesManagement';
import PurchaseManagement from './pages/purchase/order';
import PurchaseOrderDetail from './pages/purchase/delivery-detail';
import VehicleDemandPage from './pages/purchase/vehicle-demand';
import PaymentApplicationPage from './pages/purchase/payment-application';
import SupplierInfoPage from './pages/purchase/supplier';
import BalancePage from './pages/finance/balance';
import ReceivablePage from './pages/finance/receivable';
import RepaymentPage from './pages/finance/repayment';
import DiscountPage from './pages/finance/discount';
import FundUsagePage from './pages/finance/fund-usage';
import DailyPaymentPlanPage from './pages/finance/daily-payment-plan';
import DeviceManagement from './pages/system/DeviceManagement';
import LoginLockLog from './pages/system/LoginLockLog';
import LoginFailureRecord from './pages/system/LoginFailureRecord';
import SysDict from './pages/system/SysDict';
import SalesPlan from './pages/sales/SalesPlan';
import MaterialPlan from './pages/sales/MaterialPlan';
import Inventory from './pages/sales/Inventory';
import Orders from './pages/sales/Orders';
import SupplierMonthlyTonnage from './pages/sales/SupplierMonthlyTonnage';
import QualityClaim from './pages/sales/QualityClaim';
import SteelChemicalComposition from './pages/sales/SteelChemicalComposition';
import ReceiptWeighing from './pages/sales/ReceiptWeighing';
import ApprovalInstance from './pages/dingding/ApprovalInstance';
import ApprovalFormData from './pages/dingding/ApprovalFormData';
import ApprovalProcessConfig from './pages/dingding/ApprovalProcessConfig';
import AIChat from '../fengchi-ai/pages/Chat';

const ManageSystemRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="role-setting" element={<RoleSetting />} />
      <Route path="permission-setting" element={<PermissionSetting />} />
      <Route path="personnel-menu" element={<PersonnelMenu />} />
      <Route path="menu-management" element={<MenuManagement />} />
      <Route path="linked-dashboard" element={<LinkageDashboard />} />
      <Route path="sales/linkage" element={<LinkageManagement />} />
      <Route path="settings/role" element={<RoleSetting />} />
      <Route path="system/permission" element={<PermissionSetting />} />
      <Route path="system/menu" element={<MenuManagement />} />
      <Route path="system/user" element={<PersonnelMenu />} />
      <Route path="system/device" element={<DeviceManagement />} />
      <Route path="system/lock-log" element={<LoginLockLog />} />
      <Route path="system/failure-record" element={<LoginFailureRecord />} />
      <Route path="system/sys_dict" element={<SysDict />} />
      <Route path="system" element={<SystemSetting />} />
      <Route path="financial-dashboard" element={<FinancialDashboardPage />} />
      <Route path="sales-dashboard" element={<SalesDashboard />} />
      <Route path="purchase-dashboard" element={<PurchaseDashboard />} />
      <Route path="steel-dashboard" element={<SteelDashboard />} />
      <Route path="receivables-management" element={<ReceivablesManagement />} />
      <Route path="balance-management" element={<BalanceManagement />} />
      <Route path="collection-management" element={<CollectionManagement />} />
      <Route path="discount-management" element={<DiscountManagement />} />
      <Route path="fund-usage-management" element={<FundUsageManagement />} />
      <Route path="sales-management" element={<SalesManagement />} />
      <Route path="purchase/order" element={<PurchaseManagement />} />
      <Route path="purchase/supplier" element={<SupplierInfoPage />} />
      <Route path="purchase/delivery-detail" element={<PurchaseOrderDetail />} />
      <Route path="purchase/vehicle-demand" element={<VehicleDemandPage />} />
      <Route path="purchase/payment-application" element={<PaymentApplicationPage />} />
      {/* 财务相关路由 */}
      <Route path="finance/balance" element={<BalancePage />} />
      <Route path="finance/receivable" element={<ReceivablePage />} />
      <Route path="finance/repayment" element={<RepaymentPage />} />
      <Route path="finance/discount" element={<DiscountPage />} />
      <Route path="finance/fund-usage" element={<FundUsagePage />} />
      <Route path="finance/daily_payment_plan" element={<DailyPaymentPlanPage />} />
      {/* 销售管理相关路由 */}
      <Route path="sales/plan" element={<SalesPlan />} />
      <Route path="sales/material-plan" element={<MaterialPlan />} />
      <Route path="sales/inventory" element={<Inventory />} />
      <Route path="sales/orders" element={<Orders />} />
      <Route path="sales/supplier-monthly-tonnage" element={<SupplierMonthlyTonnage />} />
      <Route path="sales/quality-claim" element={<QualityClaim />} />
      <Route path="sales/steel-chemical-composition" element={<SteelChemicalComposition />} />
      <Route path="sales/receipt_weighing" element={<ReceiptWeighing />} />
      {/* 钉钉审批管理相关路由 */}
      <Route path="dingding/approval-instance" element={<ApprovalInstance />} />
      <Route path="dingding/approval-form-data" element={<ApprovalFormData />} />
      <Route path="dingding/approval-process-config" element={<ApprovalProcessConfig />} />
      {/* AI 智能助手相关路由 */}
      <Route path="fengchi-ai/chat" element={<AIChat />} />
      {/* 其他路由可以在这里添加 */}
    </Routes>
  );
};

export default ManageSystemRoutes;
