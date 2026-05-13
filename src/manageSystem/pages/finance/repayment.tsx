import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, DatePicker, Form, Input, Modal, message, Upload, Select } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface PaymentPlan {
  id: number;
  month: string;
  paymentType: string;
  ratio: number;
  amount: number;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const RepaymentPage: React.FC = () => {
  const [data, setData] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PaymentPlan | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [supplierFilter, setSupplierFilter] = useState<string>('');

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await request.get('/payment-plan/list');
      setData(result || []);
    } catch (error) {
      message.error('获取数据失败');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载数据
  useEffect(() => {
    fetchData();
  }, []);

  // 导出数据
  const handleExport = async () => {
    try {
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      const url = '/api/payment-plan/export';
      
      // 创建一个新的请求，携带 token
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 获取 blob 数据并下载
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `payment_plan_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      message.error('导出失败');
      console.error('Error exporting data:', error);
    }
  };

  // 导入数据
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/payment-plan/import',
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchData();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  // 打开添加/编辑模态框
  const openModal = (record: PaymentPlan | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        month: record.month,
        paymentType: record.paymentType,
        ratio: record.ratio,
        amount: record.amount,
        year: record.year,
      });
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const submitData = {
        ...values,
      };

      if (editingRecord) {
        submitData.id = editingRecord.id;
        await request.put('/payment-plan/update', submitData);
      } else {
        await request.post('/payment-plan/add', submitData);
      }

      message.success(editingRecord ? '更新成功' : '添加成功');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
      console.error('Error submitting form:', error);
    }
  };

  // 删除数据
  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/payment-plan/delete/${id}`);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
      console.error('Error deleting data:', error);
    }
  };

  const columns = [
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: '付款类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => (text !== undefined && text !== null ? text.toLocaleString() : '0'),
    },
    {
      title: '比率',
      dataIndex: 'ratio',
      key: 'ratio',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : '0.00'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PaymentPlan) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card 
        title="累计回款管理"
        extra={
          <Space>
            {/* <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              添加
            </Button> */}
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>导入</Button>
            </Upload>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id"
          loading={loading}
        />
      </Card>

      <Modal
        title={editingRecord ? '编辑付款计划' : '添加付款计划'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="year"
            label="年份"
            rules={[{ required: true, message: '请输入年份' }]}
          >
            <Input type="number" placeholder="请输入年份" />
          </Form.Item>
          <Form.Item
            name="month"
            label="月份"
            rules={[{ required: true, message: '请输入月份' }]}
          >
            <Input placeholder="请输入月份，例如：1月" />
          </Form.Item>
          <Form.Item
            name="paymentType"
            label="付款类型"
            rules={[{ required: true, message: '请选择付款类型' }]}
          >
            <Select placeholder="选择付款类型">
              <Option value="现汇">现汇</Option>
              <Option value="银承">银承</Option>
              <Option value="美易单">美易单</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="ratio"
            label="比率"
            rules={[{ required: true, message: '请输入比率' }]}
          >
            <Input type="number" placeholder="请输入比率" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="金额"
            rules={[{ required: true, message: '请输入金额' }]}
          >
            <Input type="number" placeholder="请输入金额" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RepaymentPage;