import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Space,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';

import purchaseApi from '../../../services/purchase';
import type {
  ProcurementOrder,
  CreateProcurementOrderRequest,
  UpdateProcurementOrderRequest,
} from '../../../types/purchase';

interface CurrentUser {
  token: string;
  type: string;
  username: string;
  role: string;
  userId: number;
  email: string;
  phone: string;
  expiresIn: number;
}

const { Option } = Select;
const { RangePicker } = DatePicker;

const PurchaseManagement: React.FC = () => {
  const [data, setData] = useState<ProcurementOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcurementOrder | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    orderNo: '',
    supplierName: '',
    materialName: '',
    orderStatus: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const statusOptions = [
    { value: '进行中', label: '进行中' },
    { value: '已关闭', label: '已关闭' },
    { value: '已完成', label: '已完成' },
  ];

  const deliveryMethodOptions = [
    { value: '自提', label: '自提' },
    { value: '送到', label: '送到' },
  ];

  const settlementMethodOptions = [
    { value: '未税反向', label: '未税反向' },
    { value: '含税公', label: '含税公' },
    { value: '含税现汇', label: '含税现汇' },
  ];

  const supplierNatureOptions = [
    { value: '个人', label: '个人' },
    { value: '公司', label: '公司' },
  ];

  useEffect(() => {
    fetchData();
    loadCurrentUserFromCache();
  }, []);

  const loadCurrentUserFromCache = () => {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('从缓存获取用户信息失败:', error);
    }
  };

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const params: any = {
        page: page,
        size: pageSize,
      };
      
      if (searchParams.orderNo) {
        params.orderNo = searchParams.orderNo;
      }
      if (searchParams.supplierName) {
        params.supplierName = searchParams.supplierName;
      }
      if (searchParams.materialName) {
        params.materialName = searchParams.materialName;
      }
      if (searchParams.orderStatus) {
        params.orderStatus = searchParams.orderStatus;
      }

      const result = await purchaseApi.procurementOrder.search(params);
      console.log('采购订单列表数据:', result);
      if (result.list && result.total) {
        setData(result.list);
        setPagination({
          current: result.page || page,
          pageSize: result.size || pageSize,
          total: result.total,
        });
      } else {
        setData(result.list || result.data || result);
      }
    } catch (error) {
      console.error('获取采购订单失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setPagination(prev => ({ ...prev, current: 1 }));
    await fetchData(1, pagination.pageSize);
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(prev => ({ ...prev, current: page, pageSize: pageSize }));
    fetchData(page, pageSize);
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setVisible(true);
  };

  const handleEdit = (record: ProcurementOrder) => {
    setEditingItem(record);
    form.resetFields();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        orderDate: record.orderDate ? dayjs(record.orderDate) : null,
        requiredDeliveryDate: record.requiredDeliveryDate ? dayjs(record.requiredDeliveryDate) : null,
      });
    }, 0);
    setVisible(true);
  };



  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该采购订单吗？',
      onOk: async () => {
        try {
          await purchaseApi.procurementOrder.delete(id);
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleClose = async (id: number) => {
    Modal.confirm({
      title: '确认关闭',
      content: '确定要关闭该采购订单吗？',
      onOk: async () => {
        try {
          await purchaseApi.procurementOrder.close(id);
          message.success('关闭成功');
          fetchData();
        } catch (error) {
          message.error('关闭失败');
        }
      },
    });
  };

  const handleComplete = async (id: number) => {
    Modal.confirm({
      title: '确认完成',
      content: '确定要标记该订单为已完成吗？',
      onOk: async () => {
        try {
          await purchaseApi.procurementOrder.complete(id);
          message.success('完成成功');
          fetchData();
        } catch (error) {
          message.error('完成失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        createdBy: currentUser?.username || '',
        createdById: currentUser?.userId || 0,
      };
      if (editingItem) {
        await purchaseApi.procurementOrder.update(editingItem.id, submitData as UpdateProcurementOrderRequest);
        message.success('更新成功');
      } else {
        await purchaseApi.procurementOrder.create(submitData as CreateProcurementOrderRequest);
        message.success('创建成功');
      }
      setVisible(false);
      fetchData();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 120,
    },
    {
      title: '订货日期',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
    },
    {
      title: '订货人',
      dataIndex: 'orderer',
      key: 'orderer',
      width: 80,
    },
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 120,
    },
    {
      title: '性质',
      dataIndex: 'supplierNature',
      key: 'supplierNature',
      width: 80,
      render: (text: string) => (
        <span>{text === '个人' ? '个人' : text === '公司' ? '公司' : text}</span>
      ),
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 120,
    },
    {
      title: '交付方式',
      dataIndex: 'deliveryMethod',
      key: 'deliveryMethod',
      width: 100,
      render: (text: string) => (
        <span>{text === '自提' ? '自提' : text === '送到' ? '送到' : text}</span>
      ),
    },
    {
      title: '订货量(吨)',
      dataIndex: 'orderQty',
      key: 'orderQty',
      width: 100,
      render: (text: number) => (text != null ? text.toFixed(3) : '-'),
    },
    {
      title: '结算单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 110,
      render: (text: number) => (text != null ? text.toFixed(2) : '-'),
    },
    {
      title: '订货金额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      width: 110,
      render: (text: number) => (text != null ? text.toFixed(2) : '-'),
    },
    {
      title: '已交付吨位',
      dataIndex: 'deliveredQty',
      key: 'deliveredQty',
      width: 120,
      render: (text: number) => (text != null ? text.toFixed(3) : '-'),
    },
    {
      title: '剩余吨位',
      dataIndex: 'remainingQty',
      key: 'remainingQty',
      width: 100,
      render: (text: number) => (text != null ? text.toFixed(3) : '-'),
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
      width: 100,
      render: (text: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          text === '进行中' ? 'bg-yellow-100 text-yellow-800' :
          text === '已完成' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {text}
        </span>
      ),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record: ProcurementOrder) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.orderStatus === '进行中' && (
            <>
              <Button
                size="small"
                
                onClick={() => handleComplete(record.id)}
              >
                完成
              </Button>
              <Button
                size="small"
                
                onClick={() => handleClose(record.id)}
              >
                关闭
              </Button>
            </>
          )}
          <Button
            danger
            size="small"
            
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
        title="采购订单管理"
        extra={<Button type="primary" onClick={handleAdd}>
          添加采购订单
        </Button>}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={5}>
            <Input
              placeholder="订单编号"
              value={searchParams.orderNo}
              onChange={(e) => setSearchParams({ ...searchParams, orderNo: e.target.value })}
            />
          </Col>
          <Col span={5}>
            <Input
              placeholder="供应商名称"
              value={searchParams.supplierName}
              onChange={(e) => setSearchParams({ ...searchParams, supplierName: e.target.value })}
            />
          </Col>
          <Col span={5}>
            <Input
              placeholder="物料名称"
              value={searchParams.materialName}
              onChange={(e) => setSearchParams({ ...searchParams, materialName: e.target.value })}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="订单状态"
              value={searchParams.orderStatus || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, orderStatus: value })}
            >
              {statusOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Button type="primary" onClick={handleSearch}>
              搜索
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={data.map((item) => ({ ...item, key: item.id }))}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: handlePageChange,
          }}
          scroll={{ x: 2000 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑采购订单' : '添加采购订单'}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={800}
      >
        <Form 
          form={form} 
          layout="vertical" 
          initialValues={editingItem ? {
            ...editingItem,
            orderDate: editingItem.orderDate ? dayjs(editingItem.orderDate) : null,
            requiredDeliveryDate: editingItem.requiredDeliveryDate ? dayjs(editingItem.requiredDeliveryDate) : null,
          } : {}} 
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderNo"
                label="订单编号"
                rules={[
                  { required: true, message: '请输入订单编号' },
                  { pattern: /^[A-Za-z0-9_-]+$/, message: '订单编号只能包含字母、数字、下划线和连字符' },
                ]}
              >
                <Input placeholder="请输入订单编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderDate"
                label="订货日期"
                rules={[{ required: true, message: '请选择订货日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="requiredDeliveryDate" label="要求交付日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="orderer" 
                label="订货人"
                rules={[{ pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '订货人只能包含中文和字母' }]}
              >
                <Input placeholder="请输入订货人" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="supplierCode" 
                label="供应商编号"
                rules={[{ pattern: /^[A-Za-z0-9_-]+$/, message: '供应商编号只能包含字母、数字、下划线和连字符' }]}
              >
                <Input placeholder="请输入供应商编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="supplierName" 
                label="供应商名称"
                rules={[{ pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '供应商名称只能包含中文、字母和数字' }]}
              >
                <Input placeholder="请输入供应商名称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="supplierNature" label="供应商性质">
                <Select placeholder="请选择供应商性质">
                  {supplierNatureOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="materialCode" 
                label="物料编码"
                rules={[{ pattern: /^[A-Za-z0-9_-]+$/, message: '物料编码只能包含字母、数字、下划线和连字符' }]}
              >
                <Input placeholder="请输入物料编码" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="materialName" 
                label="物料名称"
                rules={[{ pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '物料名称只能包含中文、字母和数字' }]}
              >
                <Input placeholder="请输入物料名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="deliveryMethod" label="交付方式">
                <Select placeholder="请选择交付方式">
                  {deliveryMethodOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="settlementMethod" label="结算方式">
                <Select placeholder="请选择结算方式">
                  {settlementMethodOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderQty"
                label="订货量(吨)"
                rules={[
                  { required: true, message: '请输入订货量' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const numValue = parseFloat(String(value));
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject(new Error('订货量必须大于0'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入订货量" step={0.001} min={0.001} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="结算单价(元/吨)"
                rules={[
                  { required: true, message: '请输入结算单价' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const numValue = parseFloat(String(value));
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject(new Error('结算单价必须大于0'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入结算单价" step={0.01} min={0.01} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="orderAmount"
                label="订货金额(元)"
                rules={[
                  { required: true, message: '请输入订货金额' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const numValue = parseFloat(String(value));
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject(new Error('订货金额必须大于0'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入订货金额" step={0.01} min={0.01} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="createdBy" 
                label="创建人"
                initialValue={currentUser?.username || ''}
              >
                <Input 
                  placeholder="请输入创建人" 
                  disabled 
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setVisible(false)}>取消</Button>
                <Button type="primary" htmlType="submit">提交</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};


export default PurchaseManagement;