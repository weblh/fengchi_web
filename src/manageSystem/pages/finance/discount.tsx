import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, Form, Input, Modal, message, Upload, Select, InputNumber } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

const { Option } = Select;

interface FinanceDiscount {
  id: number;
  period: string;
  discountAmount: number;
  discountInterest: number;
  interestRate: number;
  listingPriceType: string | null;
  listingPriceRate: number | null;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const DiscountPage: React.FC = () => {
  const [data, setData] = useState<FinanceDiscount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<FinanceDiscount | null>(null);
  const [yearFilter, setYearFilter] = useState<number>(2025);
  const [monthFilter, setMonthFilter] = useState<string>('');

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (yearFilter) {
        params.year = yearFilter.toString();
      }
      
      if (monthFilter) {
        params.period = monthFilter;
      }
      
      const result = await request.get('/api/finance-discount/list', params);
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
  }, [yearFilter, monthFilter]);

  // 导出数据
  const handleExport = async () => {
    try {
      const params: any = {};
      
      if (yearFilter) {
        params.year = yearFilter.toString();
      }
      
      if (monthFilter) {
        params.period = monthFilter;
      }
      
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      let url = '/api/finance-discount/export';
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      
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
      link.download = `finance_discount_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: '/api/finance-discount/import',
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
  const openModal = (record: FinanceDiscount | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        period: record.period,
        discount_amount: record.discountAmount,
        discount_interest: record.discountInterest,
        interest_rate: record.interestRate,
        listing_price_type: record.listingPriceType,
        listing_price_rate: record.listingPriceRate,
        year: record.year,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ year: yearFilter });
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
        await request.put('/finance-discount/update', submitData);
      } else {
        await request.post('/finance-discount/add', submitData);
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
      await request.delete(`/finance-discount/delete/${id}`);
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
      dataIndex: 'period',
      key: 'period',
    },
    {
      title: '贴现金额（元）',
      dataIndex: 'discountAmount',
      key: 'discountAmount',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : '0.00'),
    },
    {
      title: '贴现利息（元）',
      dataIndex: 'discountInterest',
      key: 'discountInterest',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : '0.00'),
    },
    {
      title: '利率（%）',
      dataIndex: 'interestRate',
      key: 'interestRate',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(4) : '0.0000'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FinanceDiscount) => (
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
        title="贴息管理"
        extra={
          <Space>
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
        title={editingRecord ? '编辑融资贴息' : '添加融资贴息'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="year"
            label="年份"
            rules={[{ required: true, message: '请选择年份' }]}
          >
            <Select placeholder="选择年份">
              <Option value={2024}>2024</Option>
              <Option value={2025}>2025</Option>
              <Option value={2026}>2026</Option>
              <Option value={2027}>2027</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="period"
            label="期间"
            rules={[{ required: true, message: '请选择期间' }]}
          >
            <Select placeholder="选择期间">
              <Option value="2025-01">2025-01</Option>
              <Option value="2025-02">2025-02</Option>
              <Option value="2025-03">2025-03</Option>
              <Option value="2025-04">2025-04</Option>
              <Option value="2025-05">2025-05</Option>
              <Option value="2025-06">2025-06</Option>
              <Option value="2025-07">2025-07</Option>
              <Option value="2025-08">2025-08</Option>
              <Option value="2025-09">2025-09</Option>
              <Option value="2025-10">2025-10</Option>
              <Option value="2025-11">2025-11</Option>
              <Option value="2025-12">2025-12</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="discount_amount"
            label="贴现金额（元）"
            rules={[{ required: true, message: '请输入贴现金额' }]}
          >
            <Input type="number" placeholder="请输入贴现金额" />
          </Form.Item>
          <Form.Item
            name="discount_interest"
            label="贴现利息（元）"
            rules={[{ required: true, message: '请输入贴现利息' }]}
          >
            <Input type="number" placeholder="请输入贴现利息" />
          </Form.Item>
          <Form.Item
            name="interest_rate"
            label="利率（%）"
            rules={[{ required: true, message: '请输入利率' }]}
          >
            <Input type="number" placeholder="请输入利率" step="0.0001" />
          </Form.Item>
          <Form.Item
            name="listing_price_type"
            label="挂牌价类型"
          >
            <Select placeholder="选择挂牌价类型">
              <Option value="银承">银承</Option>
              <Option value="美易单">美易单</Option>
              <Option value="融单">融单</Option>
              <Option value="金单">金单</Option>
              <Option value="迪链">迪链</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="listing_price_rate"
            label="挂牌价利率（%）"
          >
            <Input type="number" placeholder="请输入挂牌价利率" step="0.0001" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DiscountPage;