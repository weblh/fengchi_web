import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, Form, Input, Modal, message, Upload, Select, InputNumber } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Option } = Select;

interface FinanceDiscount {
  id: number;
  month: string;
  discount_amount: number;
  discount_interest: number;
  interest_rate: number;
  listing_price_type: string | null;
  listing_price_rate: number | null;
  year: number;
  create_time: string;
  update_time: string;
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
      let url = '/api/finance-discount/list';
      const params = new URLSearchParams();
      
      if (yearFilter) {
        params.append('year', yearFilter.toString());
      }
      
      if (monthFilter) {
        params.append('month', monthFilter);
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
  }, [yearFilter, monthFilter]);

  // 导出数据
  const handleExport = () => {
    let url = '/api/finance-discount/export';
    const params = new URLSearchParams();
    
    if (yearFilter) {
      params.append('year', yearFilter.toString());
    }
    
    if (monthFilter) {
      params.append('month', monthFilter);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    window.open(url, '_blank');
  };

  // 导入数据
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/finance-discount/import',
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
  const openModal = (record: FinanceDiscount | null = null) => {
    setEditingRecord(record);
    if (record) {
      form.setFieldsValue({
        month: record.month,
        discount_amount: record.discount_amount,
        discount_interest: record.discount_interest,
        interest_rate: record.interest_rate,
        listing_price_type: record.listing_price_type,
        listing_price_rate: record.listing_price_rate,
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

      let url = editingRecord ? '/api/finance-discount/update' : '/api/finance-discount/add';
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
      const response = await fetch(`/api/finance-discount/delete/${id}`, {
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
      title: '贴现金额（元）',
      dataIndex: 'discount_amount',
      key: 'discount_amount',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '贴现利息（元）',
      dataIndex: 'discount_interest',
      key: 'discount_interest',
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '利率（%）',
      dataIndex: 'interest_rate',
      key: 'interest_rate',
      render: (text: number) => text.toFixed(4),
    },
    {
      title: '挂牌价类型',
      dataIndex: 'listing_price_type',
      key: 'listing_price_type',
      render: (text: string | null) => text || '-',
    },
    {
      title: '挂牌价利率（%）',
      dataIndex: 'listing_price_rate',
      key: 'listing_price_rate',
      render: (text: number | null) => text ? text.toFixed(4) : '-',
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
        title="融资贴息与挂牌价管理"
        extra={
          <Space>
            <Select 
              placeholder="选择年份" 
              style={{ width: 120 }} 
              value={yearFilter}
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