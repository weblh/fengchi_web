import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Select, 
  Button, 
  Space, 
  Popconfirm, 
  Modal, 
  Form, 
  DatePicker, 
  InputNumber, 
  message, 
  Row, 
  Col 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ScrapPriceChange } from '../../../../types/steel';
import steelApi from '../../../../services/steel';

const { RangePicker } = DatePicker;

const PriceChanges: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScrapPriceChange[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScrapPriceChange | null>(null);
  const [editForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = async (page = 1, pageSize = 10, searchParams: any = {}) => {
    setLoading(true);
    try {
      const response = await steelApi.scrapPriceChange.list({
        page,
        size: pageSize,
        ...searchParams
      });
      setData(response.data || []);
      setPagination({
        current: response.page || 1,
        pageSize: response.size || 10,
        total: response.total || 0
      });
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = async (values: any) => {
    const params: any = {};
    if (values.company) params.company = values.company;
    if (values.material_type) params.material_type = values.material_type;
    if (values.dateRange && values.dateRange.length === 2) {
      params.start_news_date = values.dateRange[0].format('YYYY-MM-DD');
      params.end_news_date = values.dateRange[1].format('YYYY-MM-DD');
    }
    fetchData(1, pagination.pageSize, params);
  };

  const handleReset = () => {
    searchForm.resetFields();
    fetchData(1, pagination.pageSize);
  };

  const handleAdd = () => {
    setEditingRecord(null);
    editForm.resetFields();
    setEditModalVisible(true);
  };

  const handleEdit = (record: ScrapPriceChange) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      ...record,
      news_date: record.news_date ? record.news_date : null
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const saveValues = {
        ...values,
        news_date: values.news_date ? values.news_date.format('YYYY-MM-DD') : null
      };

      if (editingRecord) {
        await steelApi.scrapPriceChange.update(editingRecord.id, saveValues);
        message.success('更新成功');
      } else {
        await steelApi.scrapPriceChange.create(saveValues);
        message.success('新增成功');
      }
      setEditModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await steelApi.scrapPriceChange.delete(id);
      message.success('删除成功');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    try {
      await steelApi.scrapPriceChange.batchDelete(selectedRowKeys as number[]);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '公司', dataIndex: 'company', key: 'company', width: 150 },
    { title: '变动类型', dataIndex: 'change_type', key: 'change_type', width: 120 },
    { title: '料型', dataIndex: 'material_type', key: 'material_type', width: 150 },
    { title: '旧价格', dataIndex: 'old_price', key: 'old_price', width: 100 },
    { title: '新价格', dataIndex: 'new_price', key: 'new_price', width: 100 },
    { title: '变动金额', dataIndex: 'change_amount', key: 'change_amount', width: 100 },
    { title: '资讯日期', dataIndex: 'news_date', key: 'news_date', width: 120 },
    { title: '资讯标题', dataIndex: 'news_title', key: 'news_title', ellipsis: true },
    { title: '抓取时间', dataIndex: 'crawl_time', key: 'crawl_time', width: 180 },
    { 
      title: '操作', 
      key: 'action', 
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ScrapPriceChange) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  return (
    <Card 
      title="废钢价格变动记录" 
      extra={
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增</Button>
          {selectedRowKeys.length > 0 && (
            <Popconfirm title="确定批量删除选中的记录吗？" onConfirm={handleBatchDelete}>
              <Button danger icon={<DeleteOutlined />}>批量删除</Button>
            </Popconfirm>
          )}
        </Space>
      }
    >
      <Form form={searchForm} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="company" label="公司">
              <Input placeholder="请输入公司" allowClear />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="material_type" label="料型">
              <Input placeholder="请输入料型" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="dateRange" label="日期范围">
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          ...pagination,
          onChange: (page, pageSize) => fetchData(page, pageSize, searchForm.getFieldsValue())
        }}
        rowKey="id"
        scroll={{ x: 1500 }}
      />

      <Modal
        title={editingRecord ? '编辑价格变动' : '新增价格变动'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="company" label="公司" rules={[{ required: true, message: '请输入公司' }]}>
                <Input placeholder="请输入公司" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="change_type" label="变动类型" rules={[{ required: true, message: '请输入变动类型' }]}>
                <Input placeholder="请输入变动类型" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="material_type" label="料型" rules={[{ required: true, message: '请输入料型' }]}>
                <Input placeholder="请输入料型" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="news_date" label="资讯日期" rules={[{ required: true, message: '请选择资讯日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="old_price" label="旧价格">
                <InputNumber placeholder="请输入旧价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="new_price" label="新价格" rules={[{ required: true, message: '请输入新价格' }]}>
                <InputNumber placeholder="请输入新价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="change_amount" label="变动金额">
                <InputNumber placeholder="请输入变动金额" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="news_title" label="资讯标题">
            <Input.TextArea placeholder="请输入资讯标题" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PriceChanges;
