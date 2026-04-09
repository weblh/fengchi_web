import React, { useState } from 'react';
import { Button, Input, Form, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import loginIcon from '../assets/login-icon.jpg';
import request from '../utils/request';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const data = await request.post('/api/auth/login', values);
      // 登录成功后跳转到仪表盘
      window.location.href = '/manage-system';
    } catch (error) {
      console.error('登录错误:', error);
      message.error('登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden relative bg-gradient-to-br from-gray-900 to-blue-900" style={{ 
      backgroundColor: '#00081b',
      color: 'white',
       }}>
      {/* 左侧背景图片 */}
      <div className="w-2/3 flex items-center justify-center p-8 relative">
        <div className="relative w-full h-full max-w-3xl">
          {/* 科技感工业设备图片 */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-2xl">
              {/* 使用提供的素材图片 */}
              <div className="w-full h-auto aspect-video bg-blue-900 rounded-lg overflow-hidden" style={{height:'100vh',display:'flex',alignItems:'center'}}>
                <img 
                  src={loginIcon} 
                  alt="工业设备3D模型" 
                  className="w-3/5 h-auto object-contain mx-auto my-8"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="w-1/3 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm rounded-lg p-8 shadow-2xl ">
          <div className="mb-8">
            <Title level={3} className="text-white mb-2"  style={{ color: 'white' }}>丰驰信息化平台</Title>
            <Text className="text-blue-300" style={{ color: 'white' }}>高效、易操作、安全可靠的智慧管理平台</Text>
          </div>
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="用户名"
              style={{ color: 'white', marginBottom: '16px' }}
              name="username"
              rules={[{ message: '请输入用户名' }]}
              className="mb-4"
            >
              <Input 
                prefix={<UserOutlined className="text-blue-400" />} 
                placeholder="请输入用户名"
                size="large"
                style={{ 
                  color: 'white',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#1F2937',
                  height: '44px'
                }}
              />
            </Form.Item>

            <Form.Item
              label="密码"
              style={{ color: 'white', marginBottom: '24px' }}
              name="password"
              rules={[{ message: '请输入密码' }]}
              className="mb-6"
            >
              <Input.Password 
                prefix={<LockOutlined className="text-blue-400" />} 
                placeholder="请输入密码"
                size="large"
                style={{ 
                  color: 'white',
                  borderRadius: '4px',
                  border: '1px solid #374151',
                  backgroundColor: '#1F2937',
                  height: '44px'
                }}
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full h-11 text-base font-medium"
                loading={loading}
                style={{ 
                  backgroundColor: '#3B82F6',
                  borderColor: '#3B82F6',
                  borderRadius: '4px',
                  height: '44px',
                  color: 'white',
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;