import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const AuthGuard: React.FC = () => {
  // 检查是否有 token
  const token = localStorage.getItem('token');
  const location = useLocation();
  
  // 如果没有 token，重定向到登录页面
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // 如果有 token 但试图访问登录页面，重定向到之前的页面或默认页面
  if (location.pathname === '/login') {
    // 获取之前访问的页面，如果没有则使用默认页面
    const from = location.state?.from?.pathname || '/manage-system';
    return <Navigate to={from} replace />;
  }
  
  // 如果有 token，允许访问受保护的路由
  return <Outlet />;
};

export default AuthGuard;
