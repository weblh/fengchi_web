import React, { useState, useEffect } from 'react';
import { Button, Input, Form, Typography, message, Modal, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import loginIcon from '../assets/login-icon.jpg';
import request from '../utils/request';
import deviceFingerprint from '../utils/deviceFingerprint';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [verificationModal, setVerificationModal] = useState({
    visible: false,
    deviceId: null as string | null
  });
  const [lockInfo, setLockInfo] = useState<{ message: string; lockedUntil: string } | null>(null);
  const [permissionModal, setPermissionModal] = useState({
    visible: false,
    deviceId: null as string | null
  });
  
  useEffect(() => {
    // 初始化设备指纹
    const initDevice = async () => {
      const id = await deviceFingerprint.init();
      setDeviceId(id);
    };
    initDevice();
  }, []);
  
  const onFinish = async (values: any) => {
    setLoading(true);
    setLockInfo(null);
    
    try {
      // 清除旧的token缓存
      localStorage.removeItem('token');
      
      const loginData = {
        email: values.email,
        password: values.password,
        deviceId: deviceId,
        timestamp: Date.now()
      };
      
      const data = await request.post('/api/auth/login', loginData);
      
      // 确保token已存储
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // 存储用户信息到本地缓存
      localStorage.setItem('currentUser', JSON.stringify(data));
      
      if (data.needVerification) {
        // 需要设备验证
        setVerificationModal({
          visible: true,
          deviceId: deviceId
        });
        await sendVerificationCode();
      } else {
        // 登录成功后跳转到仪表盘
        setTimeout(() => {
          window.location.href = '/manage-system';
        }, 100);
      }
    } catch (error: any) {
      console.error('登录错误:', error);
      console.error('错误对象结构:', JSON.stringify(error, null, 2));
      
      // 检查是否是设备无权限的情况
      if (error.message?.includes('设备无权限')) {
        console.log('检测到设备无权限，显示申请模态框');
        setPermissionModal({
          visible: true,
          deviceId: deviceId
        });
      } else if (error.response?.status === 423) {
        const data = error.response.data;
        setLockInfo({
          message: data.message,
          lockedUntil: data.lockedUntil
        });
      } else if (error.response?.status === 403) {
        // 处理用户锁定的情况
        const data = error.response.data;
        if (data.message?.includes('用户已经锁定')) {
          message.error(data.message);
        }
      } else {
        message.error(error.response?.data?.message || error.message || '登录失败，请检查用户名和密码');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const sendVerificationCode = async () => {
    try {
      await request.post('/api/auth/send-verification-code', {
        deviceId: deviceId
      });
      message.info('验证码已发送到您的邮箱/手机');
    } catch (error) {
      message.error('发送验证码失败');
    }
  };
  
  const handleVerifyDevice = async (values: any) => {
    try {
      const response = await request.post('/api/auth/verify-device', {
        deviceId: verificationModal.deviceId,
        code: values.code
      });
      
      message.success('设备验证成功');
      setVerificationModal({ visible: false, deviceId: null });
      window.location.href = '/manage-system';
    } catch (error) {
      message.error('验证码错误');
    }
  };
  
  const handleApplyPermission = async () => {
    try {
      // 获取设备信息
      const deviceName = navigator.userAgent;
      const deviceType = /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop';
      const osType = getOsType();
      const browserType = getBrowserType();
      
      // 获取登录账户（从表单中获取）
      const formValues = form.getFieldsValue();
      const loginAccount = formValues.email;
      
      // 获取token（如果已存在）
      const token = localStorage.getItem('token');
      
      await request.post('/api/auth/submit-device', {
        deviceId: permissionModal.deviceId,
        deviceName: deviceName,
        deviceType: deviceType,
        osType: osType,
        browserType: browserType,
        loginAccount: loginAccount
      }, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      message.success('设备信息已提交，请等待管理员审核');
      setPermissionModal({ visible: false, deviceId: null });
    } catch (error) {
      message.error('设备信息提交失败，请稍后重试');
    }
  };
  
  // 获取操作系统类型
  const getOsType = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Windows') > -1) return 'Windows';
    if (userAgent.indexOf('Macintosh') > -1) return 'MacOS';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) return 'iOS';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    return 'Other';
  };
  
  // 获取浏览器类型
  const getBrowserType = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('IE') > -1) return 'IE';
    return 'Other';
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
          
          {lockInfo && (
            <Alert
              message="设备已锁定"
              description={lockInfo.message}
              type="error"
              showIcon
              style={{ marginBottom: 16, color: 'white' }}
            />
          )}
          
          <Form
            form={form}
            name="login"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              label="邮箱"
              style={{ color: 'white', marginBottom: '16px' }}
              name="email"
              rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}
              className="mb-4"
            >
              <Input 
                prefix={<UserOutlined className="text-blue-400" />} 
                placeholder="请输入邮箱"
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
      
      {/* 设备验证模态框 */}
      <Modal
        title="新设备验证"
        open={verificationModal.visible}
        footer={null}
        closable={false}
        style={{ color: 'white' }}
      >
        <Alert
          message="检测到新设备登录"
          description="为了账户安全，请输入发送到您邮箱/手机的验证码"
          type="info"
          showIcon
          style={{ marginBottom: 16, color: 'white' }}
        />
        
        <Form onFinish={handleVerifyDevice}>
          <Form.Item
            name="code"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <Input 
              placeholder="验证码"
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
              block
              style={{ 
                backgroundColor: '#3B82F6',
                borderColor: '#3B82F6',
                borderRadius: '4px',
                height: '44px',
                color: 'white',
              }}
            >
              验证设备
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 设备权限申请模态框 */}
      <Modal
        title="设备权限申请"
        open={permissionModal.visible}
        footer={[
          <Button 
            key="cancel" 
            onClick={() => setPermissionModal({ visible: false, deviceId: null })}
            style={{
              backgroundColor: '#fff',
              borderColor: '#ccc',
              borderRadius: '4px',
              height: '44px' }}
          >
            取消
          </Button>,
          <Button 
            key="apply" 
            type="primary" 
            onClick={handleApplyPermission}
            style={{ 
              backgroundColor: '#3B82F6',
              borderColor: '#3B82F6',
              borderRadius: '4px',
              height: '44px',
              color: 'white',
            }}
          >
            提交申请
          </Button>
        ]}
        closable={false}
        style={{ color: 'white' }}
      >
        <Alert
          message="设备无权限"
          description="您的设备尚未获得登录权限，请提交申请等待管理员审核"
          type="warning"
          showIcon
          style={{ marginBottom: 16, color: 'white' }}
        />
      </Modal>
    </div>
  );
};

export default LoginPage;