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
import type { ScrapPriceAdjustment } from '../../../../types/steel';
import steelApi from '../../../../services/steel';

const { Option } = Select;
const { RangePicker } = DatePicker;

const PriceAdjustments: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ScrapPriceAdjustment[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchForm] = Form.useForm();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ScrapPriceAdjustment | null>(null);
  const [editForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = async (page = 1, pageSize = 10, searchParams: any = {}) => {
    setLoading(true);
    try {
      const response = await steelApi.scrapPriceAdjustment.list({
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
    if (values.material_keyword) params.material_keyword = values.material_keyword;
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

  const handleEdit = (record: ScrapPriceAdjustment) => {
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
        await steelApi.scrapPriceAdjustment.update(editingRecord.id, saveValues);
        message.success('更新成功');
      } else {
        await steelApi.scrapPriceAdjustment.create(saveValues);
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
      await steelApi.scrapPriceAdjustment.delete(id);
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
      await steelApi.scrapPriceAdjustment.batchDelete(selectedRowKeys as number[]);
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
    { title: '料型关键词', dataIndex: 'material_keyword', key: 'material_keyword', width: 150 },
    { title: '调价类型', dataIndex: 'adjustment_type', key: 'adjustment_type', width: 100 },
    { title: '调价金额', dataIndex: 'adjustment_amount', key: 'adjustment_amount', width: 100 },
    { title: '匹配料型', dataIndex: 'matched_material', key: 'matched_material', width: 150 },
    { title: '快照价格', dataIndex: 'snapshot_price', key: 'snapshot_price', width: 100 },
    { title: '推断价格', dataIndex: 'inferred_price', key: 'inferred_price', width: 100 },
    { title: '资讯日期', dataIndex: 'news_date', key: 'news_date', width: 120 },
    { title: '资讯标题', dataIndex: 'news_title', key: 'news_title', ellipsis: true },
    { title: '抓取时间', dataIndex: 'crawl_time', key: 'crawl_time', width: 180 },
    { 
      title: '操作', 
      key: 'action', 
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ScrapPriceAdjustment) => (
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
      title="废钢调价公告" 
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
            <Form.Item name="material_keyword" label="料型关键词">
              <Input placeholder="请输入料型关键词" allowClear />
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
        scroll={{ x: 1700 }}
      />

      <Modal
        title={editingRecord ? '编辑调价公告' : '新增调价公告'}
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
              <Form.Item name="material_keyword" label="料型关键词" rules={[{ required: true, message: '请输入料型关键词' }]}>
                <Input placeholder="请输入料型关键词" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="adjustment_type" label="调价类型" rules={[{ required: true, message: '请输入调价类型' }]}>
                <Select placeholder="请选择调价类型">
                  <Option value="上调">上调</Option>
                  <Option value="下调">下调</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="adjustment_amount" label="调价金额" rules={[{ required: true, message: '请输入调价金额' }]}>
                <InputNumber placeholder="请输入调价金额" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="snapshot_price" label="快照价格">
                <InputNumber placeholder="请输入快照价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="inferred_price" label="推断价格">
                <InputNumber placeholder="请输入推断价格" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="matched_material" label="匹配料型">
            <Input placeholder="请输入匹配料型" />
          </Form.Item>
          <Form.Item name="news_date" label="资讯日期" rules={[{ required: true, message: '请选择资讯日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="news_title" label="资讯标题">
            <Input.TextArea placeholder="请输入资讯标题" rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default PriceAdjustments;
