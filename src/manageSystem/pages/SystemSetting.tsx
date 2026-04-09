import React from 'react';
import { Card, Form, Input, Button, Select } from 'antd';

const SystemSetting: React.FC = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
  };

  return (
    <div>
      <Card title="系统设置">
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            name="systemName"
            label="系统名称"
            rules={[{ required: true, message: '请输入系统名称' }]}
          >
            <Input placeholder="请输入系统名称" />
          </Form.Item>

          <Form.Item
            name="systemVersion"
            label="系统版本"
            rules={[{ required: true, message: '请输入系统版本' }]}
          >
            <Input placeholder="请输入系统版本" />
          </Form.Item>

          <Form.Item
            name="language"
            label="系统语言"
            rules={[{ required: true, message: '请选择系统语言' }]}
          >
            <Select placeholder="请选择系统语言">
              <Select.Option value="zh-CN">简体中文</Select.Option>
              <Select.Option value="en-US">English</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">保存设置</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSetting;