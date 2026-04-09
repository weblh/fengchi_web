import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, DatePicker, Form, Input, Modal, message, Upload, Select } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface PaymentPlan {
  id: number;
  company: string;
  supplier: string;
  amount: number;
  plan_date: string;
  create_time: string;
  update_time: string;
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
      let url = '/api/payment-plan/list';
      const params = new URLSearchParams();
      
      if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
      }
      
      if (companyFilter) {
        params.append('company', companyFilter);
      }
      
      if (supplierFilter) {
        params.append('supplier', supplierFilter);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      const result = await response.json();
      setData(result.data || []);
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
  }, [dateRange, companyFilter, supplierFilter]);

  // 导出数据
  const handleExport = () => {
    let url = '/api/payment-plan/export';
    const params = new URLSearchParams();
    
    if (dateRange) {
      params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
      params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
    }
    
    if (companyFilter) {
      params.append('company', companyFilter);
    }
    
    if (supplierFilter) {
      params.append('supplier', supplierFilter);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    window.open(url, '_blank');
  };

  // 导入数据
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/payment-plan/import',
    headers: {
      'Content-Type': 'multipart/form-data',
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
        company: record.company,
        supplier: record.supplier,
        amount: record.amount,
        plan_date: dayjs(record.plan_date),
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

      let url = editingRecord ? '/api/payment-plan/update' : '/api/payment-plan/add';
      const method = editingRecord ? 'PUT' : 'POST';

      if (editingRecord) {
        submitData.id = editingRecord.id;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      if (result.success) {
        message.success(editingRecord ? '更新成功' : '添加成功');
        setModalVisible(false);
        fetchData();
      } else {
        message.error(result.message || '操作失败');
      }
    } catch (error) {
      message.error('操作失败');
      console.error('Error submitting form:', error);
    }
  };

  // 删除数据
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/payment-plan/delete/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        message.success('删除成功');
        fetchData();
      } else {
        message.error(result.message || '删除失败');
      }
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
      title: '供应商名称',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '计划付款金额（万元）',
      dataIndex: 'amount',
      key: 'amount',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '计划付款日期',
      dataIndex: 'plan_date',
      key: 'plan_date',
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
        title="付款计划管理"
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
            <Input 
              placeholder="供应商名称" 
              style={{ width: 150 }} 
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            />
            <RangePicker 
              onChange={(dates) => setDateRange(dates)}
              style={{ width: 300 }}
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
        title={editingRecord ? '编辑付款计划' : '添加付款计划'}
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
            label="供应商名称"
            rules={[{ required: true, message: '请输入供应商名称' }]}
          >
            <Input placeholder="请输入供应商名称" />
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

export default RepaymentPage;