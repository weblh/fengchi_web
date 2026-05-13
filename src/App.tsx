import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FinancialDashboard } from './components/FinancialDashboard';
import LoginPage from './components/LoginPage';
import AuthGuard from './components/AuthGuard';
import ManageSystem from './manageSystem';
import LinkageDashboard from './manageSystem/pages/LinkageDashboard';
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
            <Route path="/manage-system/*" element={<ManageSystem />} />
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