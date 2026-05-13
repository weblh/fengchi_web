import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, DatePicker, Form, Input, Modal, message, Upload, Select } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DailyPaymentPlan {
  id: number;
  company: string;
  amount: number;
  date: string;
  supplier?: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const FundUsagePage: React.FC = () => {
  const [data, setData] = useState<DailyPaymentPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<DailyPaymentPlan | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('');

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (companyFilter) {
        params.company = companyFilter;
      }
      
      const result = await request.get('/daily-payment-plan/list', params);
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
  }, [dateRange, companyFilter]);

  // 导出数据
  const handleExport = async () => {
    try {
      const params: any = {};
      
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      
      if (companyFilter) {
        params.company = companyFilter;
      }
      
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      let url = '/api/daily-payment-plan/export';
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
      link.download = `daily_payment_plan_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: '/api/daily-payment-plan/import',
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
  const openModal = (record: DailyPaymentPlan | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        company: record.company,
        supplier: record.supplier,
        amount: record.amount,
        plan_date: dayjs(record.date),
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
        plan_date: values.plan_date.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        submitData.id = editingRecord.id;
        await request.put('/daily-payment-plan/update', submitData);
      } else {
        await request.post('/daily-payment-plan/add', submitData);
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
      await request.delete(`/daily-payment-plan/delete/${id}`);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
      console.error('Error deleting data:', error);
    }
  };

  const columns = [
    {
      title: '公司名称',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '计划付款金额（万元）',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : '0.00'),
    },
    {
      title: '计划付款日期',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (text: string) => dayjs(text).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DailyPaymentPlan) => (
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
        title="资金使用管理"
        extra={
          <Space>
            <Select 
              placeholder="选择公司" 
              style={{ width: 120 }} 
              value={companyFilter}
              onChange={setCompanyFilter}
            >
              <Option value="耀通">耀通</Option>
              <Option value="丰驰">丰驰</Option>
              <Option value="昌泽">昌泽</Option>
              <Option value="现汇户">现汇户</Option>
            </Select>
            <RangePicker 
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 300 }}
              placeholder={['开始时间', '结束时间']}
            />
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
        title={editingRecord ? '编辑资金使用计划' : '添加资金使用计划'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="company"
            label="公司名称"
            rules={[{ required: true, message: '请选择公司名称' }]}
          >
            <Select placeholder="选择公司">
              <Option value="耀通">耀通</Option>
              <Option value="丰驰">丰驰</Option>
              <Option value="昌泽">昌泽</Option>
              <Option value="现汇户">现汇户</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
          >
            <Input placeholder="请输入供应商" />
          </Form.Item>
          <Form.Item
            name="amount"
            label="计划付款金额（万元）"
            rules={[{ required: true, message: '请输入计划付款金额' }]}
          >
            <Input type="number" placeholder="请输入计划付款金额" />
          </Form.Item>
          <Form.Item
            name="plan_date"
            label="计划付款日期"
            rules={[{ required: true, message: '请选择计划付款日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FundUsagePage;