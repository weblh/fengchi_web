import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, Form, Input, Modal, message, Upload, Select } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

const { Option } = Select;

interface ListingPrice {
  id: number;
  priceType: string;
  priceRate: number;
  year: number;
  month: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const DailyPaymentPlanPage: React.FC = () => {
  const [data, setData] = useState<ListingPrice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<ListingPrice | null>(null);
  const [yearFilter, setYearFilter] = useState<number | undefined>(undefined);
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
        params.month = monthFilter;
      }
      
      const result = await request.get('/api/listing-price/list', params);
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
        params.month = monthFilter;
      }
      
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      let url = '/api/listing-price/export';
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
      link.download = `listing_price_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: '/api/listing-price/import',
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
  const openModal = (record: ListingPrice | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        price_type: record.priceType,
        price_rate: record.priceRate,
        year: record.year,
        month: record.month,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ year: yearFilter || 2026, month: monthFilter });
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
        await request.put('/api/listing-price/update', submitData);
      } else {
        await request.post('/api/listing-price/add', submitData);
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
      await request.delete(`/api/listing-price/delete/${id}`);
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
      title: '挂牌价类型',
      dataIndex: 'priceType',
      key: 'priceType',
    },
    {
      title: '挂牌价利率（%）',
      dataIndex: 'priceRate',
      key: 'priceRate',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(4) : '0.0000'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ListingPrice) => (
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
        title="挂牌价格管理"
        extra={
          <Space>
            <Select 
              placeholder="选择年份" 
              style={{ width: 120 }} 
              value={yearFilter || undefined}
              onChange={setYearFilter}
            >
              <Option value={2024}>2024</Option>
              <Option value={2025}>2025</Option>
              <Option value={2026}>2026</Option>
              <Option value={2027}>2027</Option>
            </Select>
            <Select 
              placeholder="选择月份" 
              style={{ width: 120 }} 
              value={monthFilter}
              onChange={setMonthFilter}
            >
              <Option value="1月">1月</Option>
              <Option value="2月">2月</Option>
              <Option value="3月">3月</Option>
              <Option value="4月">4月</Option>
              <Option value="5月">5月</Option>
              <Option value="6月">6月</Option>
              <Option value="7月">7月</Option>
              <Option value="8月">8月</Option>
              <Option value="9月">9月</Option>
              <Option value="10月">10月</Option>
              <Option value="11月">11月</Option>
              <Option value="12月">12月</Option>
            </Select>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              添加
            </Button>
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
        title={editingRecord ? '编辑挂牌价格' : '添加挂牌价格'}
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
            name="month"
            label="月份"
            rules={[{ required: true, message: '请选择月份' }]}
          >
            <Select placeholder="选择月份">
              <Option value="1月">1月</Option>
              <Option value="2月">2月</Option>
              <Option value="3月">3月</Option>
              <Option value="4月">4月</Option>
              <Option value="5月">5月</Option>
              <Option value="6月">6月</Option>
              <Option value="7月">7月</Option>
              <Option value="8月">8月</Option>
              <Option value="9月">9月</Option>
              <Option value="10月">10月</Option>
              <Option value="11月">11月</Option>
              <Option value="12月">12月</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="price_type"
            label="挂牌价类型"
            rules={[{ required: true, message: '请选择挂牌价类型' }]}
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
            name="price_rate"
            label="挂牌价利率（%）"
            rules={[{ required: true, message: '请输入挂牌价利率' }]}
          >
            <Input type="number" placeholder="请输入挂牌价利率" step="0.0001" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DailyPaymentPlanPage;