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
import type { SteelMarketPrice } from '../../../../types/steel';
import steelApi from '../../../../services/steel';

const { RangePicker } = DatePicker;

const MarketPrices: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SteelMarketPrice[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SteelMarketPrice | null>(null);
  const [editForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = async (page = 1, pageSize = 10, searchParams: any = {}) => {
    setLoading(true);
    try {
      const response = await steelApi.steelMarketPrice.list({
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
    if (values.category) params.category = values.category;
    if (values.area) params.area = values.area;
    if (values.product_name) params.product_name = values.product_name;
    if (values.dateRange && values.dateRange.length === 2) {
      params.start_price_date = values.dateRange[0].format('YYYY-MM-DD');
      params.end_price_date = values.dateRange[1].format('YYYY-MM-DD');
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

  const handleEdit = (record: SteelMarketPrice) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      ...record,
      price_date: record.price_date ? record.price_date : null,
      crawl_date: record.crawl_date ? record.crawl_date : null
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const saveValues = {
        ...values,
        price_date: values.price_date ? values.price_date.format('YYYY-MM-DD') : null,
        crawl_date: values.crawl_date ? values.crawl_date.format('YYYY-MM-DD') : null
      };

      if (editingRecord) {
        await steelApi.steelMarketPrice.update(editingRecord.id, saveValues);
        message.success('更新成功');
      } else {
        await steelApi.steelMarketPrice.create(saveValues);
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
      await steelApi.steelMarketPrice.delete(id);
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
      await steelApi.steelMarketPrice.batchDelete(selectedRowKeys as number[]);
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
    { title: '品类', dataIndex: 'category', key: 'category', width: 120 },
    { title: '地区', dataIndex: 'area', key: 'area', width: 120 },
    { title: '品名', dataIndex: 'product_name', key: 'product_name', width: 150 },
    { title: '规格', dataIndex: 'specification', key: 'specification', width: 150 },
    { title: '材质', dataIndex: 'material', key: 'material', width: 100 },
    { title: '报价类型', dataIndex: 'quote_type', key: 'quote_type', width: 100 },
    { title: '价格', dataIndex: 'price', key: 'price', width: 100 },
    { title: '均价', dataIndex: 'avg_price', key: 'avg_price', width: 100 },
    { title: '涨跌', dataIndex: 'price_change', key: 'price_change', width: 100 },
    { title: '单位', dataIndex: 'unit', key: 'unit', width: 80 },
    { title: '价格日期', dataIndex: 'price_date', key: 'price_date', width: 120 },
    { title: '抓取日期', dataIndex: 'crawl_date', key: 'crawl_date', width: 120 },
    { title: '抓取时间', dataIndex: 'crawl_time', key: 'crawl_time', width: 180 },
    { 
      title: '操作', 
      key: 'action', 
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: SteelMarketPrice) => (
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
      title="钢铁行情价格" 
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
          <Col span={5}>
            <Form.Item name="category" label="品类">
              <Input placeholder="请输入品类" allowClear />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="area" label="地区">
              <Input placeholder="请输入地区" allowClear />
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item name="product_name" label="品名">
              <Input placeholder="请输入品名" allowClear />
            </Form.Item>
          </Col>
          <Col span={5}>
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
        scroll={{ x: 2000 }}
      />

      <Modal
        title={editingRecord ? '编辑行情价格' : '新增行情价格'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        width={700}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="category" label="品类" rules={[{ required: true, message: '请输入品类' }]}>
                <Input placeholder="请输入品类" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="area" label="地区" rules={[{ required: true, message: '请输入地区' }]}>
                <Input placeholder="请输入地区" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="product_name" label="品名" rules={[{ required: true, message: '请输入品名' }]}>
                <Input placeholder="请输入品名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="specification" label="规格" rules={[{ required: true, message: '请输入规格' }]}>
                <Input placeholder="请输入规格" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="material" label="材质">
                <Input placeholder="请输入材质" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="quote_type" label="报价类型">
                <Input placeholder="请输入报价类型" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item name="price" label="价格">
                <InputNumber placeholder="请输入价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="avg_price" label="均价">
                <InputNumber placeholder="请输入均价" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="price_change" label="涨跌">
                <Input placeholder="请输入涨跌" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="unit" label="单位">
                <Input placeholder="请输入单位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price_date" label="价格日期" rules={[{ required: true, message: '请选择价格日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="crawl_date" label="抓取日期" rules={[{ required: true, message: '请选择抓取日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default MarketPrices;
