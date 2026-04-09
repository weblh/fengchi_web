import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, DatePicker, Form, Input, Modal, message, Upload, Select } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Receivable {
  id: number;
  company: string;
  client: string;
  book_amount: number;
  overdue_amount: number;
  record_date: string;
  create_time: string;
  update_time: string;
}

const ReceivablePage: React.FC = () => {
  const [data, setData] = useState<Receivable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<Receivable | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [clientFilter, setClientFilter] = useState<string>('');

  // 获取数据
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = '/api/receivable/list';
      const params = new URLSearchParams();
      
      if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
      }
      
      if (companyFilter) {
        params.append('company', companyFilter);
      }
      
      if (clientFilter) {
        params.append('client', clientFilter);
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
  }, [dateRange, companyFilter, clientFilter]);

  // 导出数据
  const handleExport = () => {
    let url = '/api/receivable/export';
    const params = new URLSearchParams();
    
    if (dateRange) {
      params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
      params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
    }
    
    if (companyFilter) {
      params.append('company', companyFilter);
    }
    
    if (clientFilter) {
      params.append('client', clientFilter);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    window.open(url, '_blank');
  };

  // 导入数据
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/receivable/import',
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
  const openModal = (record: Receivable | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        company: record.company,
        client: record.client,
        book_amount: record.book_amount,
        overdue_amount: record.overdue_amount,
        record_date: dayjs(record.record_date),
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

      let url = editingRecord ? '/api/receivable/update' : '/api/receivable/add';
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
      const response = await fetch(`/api/receivable/delete/${id}`, {
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
      title: '公司/品类',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '客户名称',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: '账面应收金额（元）',
      dataIndex: 'book_amount',
      key: 'book_amount',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '逾期金额（元）',
      dataIndex: 'overdue_amount',
      key: 'overdue_amount',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '记录日期',
      dataIndex: 'record_date',
      key: 'record_date',
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
            <Input 
              placeholder="客户名称" 
              style={{ width: 150 }} 
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
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
            name="client"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          <Form.Item
            name="book_amount"
            label="账面应收金额（元）"
            rules={[{ required: true, message: '请输入账面应收金额' }]}
          >
            <Input type="number" placeholder="请输入账面应收金额" />
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