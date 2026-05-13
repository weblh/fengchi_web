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
import type { ScrapSteelPrice } from '../../../../types/steel';
import steelApi from '../../../../services/steel';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ScrapPrices: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScrapSteelPrice[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScrapSteelPrice | null>(null);
  const [editForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 获取数据
  const fetchData = async (page = 1, pageSize = 10, searchParams: any = {}) => {
    setLoading(true);
    try {
      const response = await steelApi.scrapSteelPrice.list({
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

  // 搜索
  const handleSearch = async (values: any) => {
    const params: any = {};
    if (values.company) params.company = values.company;
    if (values.material_type) params.material_type = values.material_type;
    if (values.dateRange && values.dateRange.length === 2) {
      params.start_date = values.dateRange[0].format('YYYY-MM-DD');
      params.end_date = values.dateRange[1].format('YYYY-MM-DD');
    }
    fetchData(1, pagination.pageSize, params);
  };

  // 重置搜索
  const handleReset = () => {
    searchForm.resetFields();
    fetchData(1, pagination.pageSize);
  };

  // 新增
  const handleAdd = () => {
    setEditingRecord(null);
    editForm.resetFields();
    setEditModalVisible(true);
  };

  // 编辑
  const handleEdit = (record: ScrapSteelPrice) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      ...record,
      price_date: record.price_date ? record.price_date : null
    });
    setEditModalVisible(true);
  };

  // 保存
  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      const saveValues = {
        ...values,
        price_date: values.price_date ? values.price_date.format('YYYY-MM-DD') : null
      };

      if (editingRecord) {
        await steelApi.scrapSteelPrice.update(editingRecord.id, saveValues);
        message.success('更新成功');
      } else {
        await steelApi.scrapSteelPrice.create(saveValues);
        message.success('新增成功');
      }
      setEditModalVisible(false);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('保存失败:', error);
      message.error('保存失败');
    }
  };

  // 删除
  const handleDelete = async (id: number) => {
    try {
      await steelApi.scrapSteelPrice.delete(id);
      message.success('删除成功');
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    try {
      await steelApi.scrapSteelPrice.batchDelete(selectedRowKeys as number[]);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchData(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败');
    }
  };

  // 表格列定义
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: '公司名称', dataIndex: 'company', key: 'company', width: 150 },
    { title: '料型', dataIndex: 'material_type', key: 'material_type', width: 150 },
    { title: '价格(元/吨)', dataIndex: 'price', key: 'price', width: 120 },
    { title: '价格日期', dataIndex: 'price_date', key: 'price_date', width: 120 },
    { title: '来源链接', dataIndex: 'source_url', key: 'source_url', ellipsis: true },
    { title: '资讯标题', dataIndex: 'news_title', key: 'news_title', ellipsis: true },
    { title: '创建时间', dataIndex: 'created_at', key: 'created_at', width: 180 },
    { title: '更新时间', dataIndex: 'updated_at', key: 'updated_at', width: 180 },
    { 
      title: '操作', 
      key: 'action', 
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ScrapSteelPrice) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除吗？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  // 表格行选择
  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  return (
    <Card 
      title="废钢价格" 
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
      {/* 搜索表单 */}
      <Form form={searchForm} layout="inline" onFinish={handleSearch} style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="company" label="公司名称">
              <Input placeholder="请输入公司名称" allowClear />
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

      {/* 数据表格 */}
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
        scroll={{ x: 1400 }}
      />

      {/* 编辑/新增弹窗 */}
      <Modal
        title={editingRecord ? '编辑废钢价格' : '新增废钢价格'}
        open={editModalVisible}
        onOk={handleSave}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={editForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="company" label="公司名称" rules={[{ required: true, message: '请输入公司名称' }]}>
                <Input placeholder="请输入公司名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="material_type" label="料型" rules={[{ required: true, message: '请输入料型' }]}>
                <Input placeholder="请输入料型" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="价格(元/吨)">
                <InputNumber placeholder="请输入价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="price_date" label="价格日期" rules={[{ required: true, message: '请选择价格日期' }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="source_url" label="来源链接">
            <Input placeholder="请输入来源链接" />
          </Form.Item>
          <Form.Item name="news_title" label="资讯标题">
            <Input.TextArea placeholder="请输入资讯标题" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ScrapPrices;
