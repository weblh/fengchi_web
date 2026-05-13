import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, DatePicker, Form, Input, Modal, message, Upload, Select } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Receivable {
  id: number;
  company: string;
  supplier: string;
  receivableAmount: number;
  overdueAmount: number;
  materialType: string;
  paymentType: string;
  recordDate: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const ReceivablePage: React.FC = () => {
  const [data, setData] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Receivable | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [supplierFilter, setSupplierFilter] = useState<string>('');

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
      
      if (supplierFilter) {
        params.supplier = supplierFilter;
      }
      
      const result = await request.get('/api/receivable/list', params);
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
  }, [dateRange, companyFilter, supplierFilter]);

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
      
      if (supplierFilter) {
        params.supplier = supplierFilter;
      }
      
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      let url = '/api/receivable/export';
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
      link.download = `receivable_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: '/api/receivable/import',
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
  const openModal = (record: Receivable | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        company: record.company,
        supplier: record.supplier,
        material_type: record.materialType,
        payment_type: record.paymentType,
        receivable_amount: record.receivableAmount,
        overdue_amount: record.overdueAmount,
        record_date: dayjs(record.recordDate),
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
        record_date: values.record_date.format('YYYY-MM-DD'),
      };

      if (editingRecord) {
        submitData.id = editingRecord.id;
        await request.put('/receivable/update', submitData);
      } else {
        await request.post('/receivable/add', submitData);
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
      await request.delete(`/receivable/delete/${id}`);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
      console.error('Error deleting data:', error);
    }
  };

  const columns = [
    {
      title: '公司/品类',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '物料类型',
      dataIndex: 'materialType',
      key: 'materialType',
    },
    {
      title: '付款类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
    },
    {
      title: '应收金额（元）',
      dataIndex: 'receivableAmount',
      key: 'receivableAmount',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : '0.00'),
    },
    {
      title: '逾期金额（元）',
      dataIndex: 'overdueAmount',
      key: 'overdueAmount',
      render: (text: number) => (text !== undefined && text !== null ? text.toFixed(2) : '0.00'),
    },
    {
      title: '记录日期',
      dataIndex: 'recordDate',
      key: 'recordDate',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Receivable) => (
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
        title="应收账款管理"
        extra={
          <Space>
            <Select 
              placeholder="选择公司/品类" 
              style={{ width: 150 }} 
              value={companyFilter}
              onChange={setCompanyFilter}
            >
              <Option value="丰驰">丰驰</Option>
              <Option value="昌泽">昌泽</Option>
              <Option value="耀通">耀通</Option>
              <Option value="铁合金">铁合金</Option>
              <Option value="钢丸">钢丸</Option>
            </Select>
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
        title={editingRecord ? '编辑应收账款' : '添加应收账款'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="company"
            label="公司/品类"
            rules={[{ required: true, message: '请选择公司/品类' }]}
          >
            <Select placeholder="选择公司/品类">
              <Option value="丰驰">丰驰</Option>
              <Option value="昌泽">昌泽</Option>
              <Option value="耀通">耀通</Option>
              <Option value="铁合金">铁合金</Option>
              <Option value="钢丸">钢丸</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="supplier"
            label="供应商"
            rules={[{ required: true, message: '请输入供应商' }]}
          >
            <Input placeholder="请输入供应商" />
          </Form.Item>
          <Form.Item
            name="material_type"
            label="物料类型"
            rules={[{ required: true, message: '请选择物料类型' }]}
          >
            <Select placeholder="选择物料类型">
              <Option value="主料">主料</Option>
              <Option value="辅料">辅料</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="payment_type"
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
            name="receivable_amount"
            label="应收金额（元）"
            rules={[{ required: true, message: '请输入应收金额' }]}
          >
            <Input type="number" placeholder="请输入应收金额" />
          </Form.Item>
          <Form.Item
            name="overdue_amount"
            label="逾期金额（元）"
            rules={[{ required: true, message: '请输入逾期金额' }]}
          >
            <Input type="number" placeholder="请输入逾期金额" />
          </Form.Item>
          <Form.Item
            name="record_date"
            label="记录日期"
            rules={[{ required: true, message: '请选择记录日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReceivablePage;