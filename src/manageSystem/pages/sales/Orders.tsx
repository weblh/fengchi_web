import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload, Modal, Form, Input, Select, DatePicker, InputNumber, Row, Col, Divider } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface Order {
  id: number;
  contractNo: string;
  company: string;
  customer: string;
  material: string;
  signDate: string;
  termDays: number;
  contractQty: number;
  unitPrice: number;
  payType: string;
  executePeriod: string;
  receivedQty: number;
  remainingQty: number;
  remark: string;
  orderStatus: string;
  orderAmount: number;
  deleted: number;
  createTime: string;
  updateTime: string;
  division: string;
  category: string;
}

interface OrderDetail {
  id: number;
  orderId: number;
  orderNo: string;
  materialCode: string;
  materialName: string;
  specification: string;
  plannedQty: number;
  actualQty: number;
  unitPrice: number;
  amount: number;
  plannedDeliveryDate: string;
  actualDeliveryDate: string;
  sourceTable: string;
  sourceId: number;
  sourceNo: string;
  sortOrder: number;
  remark: string;
  createTime: string;
  updateTime: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [detailOrderDetails, setDetailOrderDetails] = useState<OrderDetail[]>([]);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [isSyncModalVisible, setIsSyncModalVisible] = useState<boolean>(false);
  const [weighingData, setWeighingData] = useState<any[]>([]);
  const [weighingLoading, setWeighingLoading] = useState<boolean>(false);
  const [selectedWeighingRows, setSelectedWeighingRows] = useState<any[]>([]);
  const [syncMaterial, setSyncMaterial] = useState<string>('');
  const [syncSupplier, setSyncSupplier] = useState<string>('');
  const [syncSourceFile, setSyncSourceFile] = useState<string>('');
  const [syncDateRange, setSyncDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const handleAddOrder = () => {
    addForm.resetFields();
    setIsAddModalVisible(true);
  };

  const handleEditOrder = async (order: Order) => {
    setEditingOrder(order);
    await fetchOrderDetails(order.id);
    setIsEditModalVisible(true);
  };

  useEffect(() => {
    if (isEditModalVisible && editingOrder) {
      editForm.setFieldsValue({
        ...editingOrder,
        signDate: editingOrder.signDate ? dayjs(editingOrder.signDate) : null,
      });
    }
  }, [isEditModalVisible, editingOrder, editForm]);

  const fetchOrderDetails = async (orderId: number) => {
    try {
      setDetailLoading(true);
      const response = await request.get<{ detailList: OrderDetail[] }>(`/order-detail/order/${orderId}`);
      setOrderDetails(response.detailList || []);
    } catch (error) {
      console.error('获取订单明细失败:', error);
      message.error('获取订单明细失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    try {
      await request.delete(`/order-detail/${detailId}`);
      message.success('删除明细成功');
      if (editingOrder) {
        await fetchOrderDetails(editingOrder.id);
      }
    } catch (error) {
      console.error('删除明细失败:', error);
      message.error('删除明细失败');
    }
  };

  const handleOpenSyncModal = () => {
    if (!editingOrder) return;
    setSyncMaterial(editingOrder.material || '');
    setWeighingData([]);
    setIsSyncModalVisible(true);
  };

  const fetchWeighingData = async () => {
    try {
      setWeighingLoading(true);
      const params: any = {};
      if (syncMaterial) {
        params.material = syncMaterial;
      }
      if (syncSupplier) {
        params.supplier = syncSupplier;
      }
      if (syncSourceFile) {
        params.sourceFile = syncSourceFile;
      }
      if (syncDateRange) {
        params.startDate = syncDateRange[0].format('YYYY-MM-DD');
        params.endDate = syncDateRange[1].format('YYYY-MM-DD');
      }
      const data = await request.get<any[]>('/api/order-detail/receipt-weighing', params);
      setWeighingData(data || []);
    } catch (error) {
      console.error('获取大宗数据失败:', error);
      message.error('获取大宗数据失败');
    } finally {
      setWeighingLoading(false);
    }
  };

  const handleSearchWeighing = () => {
    fetchWeighingData();
  };

  const handleSyncDetails = async () => {
    if (selectedWeighingRows.length === 0) {
      message.warning('请选择要同步的大宗数据');
      return;
    }
    if (!editingOrder) return;

    try {
      const selectedIds = selectedWeighingRows.map(row => row.id);
      await request.post(`/api/order-detail/sync-selected?orderId=${editingOrder.id}`, selectedIds);
      message.success('同步明细成功');
      setIsSyncModalVisible(false);
      setSelectedWeighingRows([]);
      if (editingOrder) {
        await fetchOrderDetails(editingOrder.id);
      }
    } catch (error) {
      console.error('同步明细失败:', error);
      message.error('同步明细失败');
    }
  };

  const weighingColumns = [
  { title: 'ID', dataIndex: 'id', key: 'id' },
  { title: '单据编号', dataIndex: 'documentNo', key: 'documentNo' },
  { title: '来源文件', dataIndex: 'sourceFile', key: 'sourceFile' },
  { title: '单据类型', dataIndex: 'documentType', key: 'documentType' },
  { title: '地磅位置', dataIndex: 'weighbridgeLocation', key: 'weighbridgeLocation' },
  { title: '车牌号', dataIndex: 'vehicleNo', key: 'vehicleNo' },
  { title: '入场日期', dataIndex: 'entryDate', key: 'entryDate' },
  { title: '过磅日期', dataIndex: 'weighDate', key: 'weighDate' },
  { title: '入场时间', dataIndex: 'entryTime', key: 'entryTime' },
  { title: '出场时间', dataIndex: 'exitTime', key: 'exitTime' },
  { title: '过磅时间', dataIndex: 'weighTime', key: 'weighTime' },
  { title: '货物名称', dataIndex: 'goodsName', key: 'goodsName' },
  { title: '规格型号', dataIndex: 'specModel', key: 'specModel' },
  { title: '供应商编号', dataIndex: 'supplierNo', key: 'supplierNo' },
  { title: '供应商名称', dataIndex: 'supplierName', key: 'supplierName' },
  { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
  { title: '毛重', dataIndex: 'grossWeight', key: 'grossWeight' },
  { title: '皮重', dataIndex: 'tareWeight', key: 'tareWeight' },
  { title: '净重', dataIndex: 'netWeight', key: 'netWeight' },
  { title: '扣重', dataIndex: 'deductWeight', key: 'deductWeight' },
  { title: '实收重量', dataIndex: 'actualWeight', key: 'actualWeight' },
  { title: '过磅类型', dataIndex: 'weighType', key: 'weighType' },
  { title: '毛重过磅员', dataIndex: 'grossWeigher', key: 'grossWeigher' },
  { title: '皮重过磅员', dataIndex: 'tareWeigher', key: 'tareWeigher' },
  { title: '包装重量', dataIndex: 'packageWeight', key: 'packageWeight' },
  { title: '扣减', dataIndex: 'deduction', key: 'deduction' },
  { title: '其他', dataIndex: 'other', key: 'other' },
  { title: '结算数量', dataIndex: 'settlementQty', key: 'settlementQty' },
  { title: '收货仓库', dataIndex: 'receivingWarehouse', key: 'receivingWarehouse' },
  { title: '原始数量', dataIndex: 'originalQty', key: 'originalQty' },
  { title: '车次数', dataIndex: 'vehicleCount', key: 'vehicleCount' },
  { title: '合同编号', dataIndex: 'contractNo', key: 'contractNo' },
  { title: '发货单号', dataIndex: 'dispatchNo', key: 'dispatchNo' },
  { title: '通知单号', dataIndex: 'noticeNo', key: 'noticeNo' },
  { title: '收货人', dataIndex: 'receiver', key: 'receiver' },
  { title: '出场过磅员', dataIndex: 'exitWeigher', key: 'exitWeigher' },
  { title: '备注', dataIndex: 'remark', key: 'remark' },
  { title: '是否汇总', dataIndex: 'isSummary', key: 'isSummary' },
  { title: '是否删除', dataIndex: 'deleted', key: 'deleted' },
  { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', key: 'updateTime' },
];

  const handleViewOrderDetail = async (orderId: number) => {
    try {
      const [orderData, detailResponse] = await Promise.all([
        request.get<Order>(`/orders/${orderId}`),
        request.get<{ detailList: OrderDetail[] }>(`/order-detail/order/${orderId}`),
      ]);
      setDetailOrder(orderData);
      setDetailOrderDetails(detailResponse.detailList || []);
      setIsDetailModalVisible(true);
    } catch (error) {
      console.error('获取订单详情失败:', error);
      message.error('获取订单详情失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '合同编号',
      dataIndex: 'contractNo',
      key: 'contractNo',
    },
    // {
    //   title: '事业部',
    //   dataIndex: 'division',
    //   key: 'division',
    // },
    // {
    //   title: '分类',
    //   dataIndex: 'category',
    //   key: 'category',
    // },
    {
      title: '公司名称',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: '物料名称',
      dataIndex: 'material',
      key: 'material',
    },
    {
      title: '签订时间',
      dataIndex: 'signDate',
      key: 'signDate',
    },
    {
      title: '期限天数',
      dataIndex: 'termDays',
      key: 'termDays',
    },
    {
      title: '合同数量（吨）',
      dataIndex: 'contractQty',
      key: 'contractQty',
    },
    {
      title: '单价（元）',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
    },
    {
      title: '付款方式',
      dataIndex: 'payType',
      key: 'payType',
    },
    {
      title: '执行时段',
      dataIndex: 'executePeriod',
      key: 'executePeriod',
    },
    // {
    //   title: '回货吨数',
    //   dataIndex: 'receivedQty',
    //   key: 'receivedQty',
    // },
    // {
    //   title: '剩余吨数',
    //   dataIndex: 'remainingQty',
    //   key: 'remainingQty',
    // },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '订单状态',
      dataIndex: 'orderStatus',
      key: 'orderStatus',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_: any, record: Order) => (
        <Space size="middle">
            <Button type="primary" size="small" onClick={() => handleViewOrderDetail(record.id)}>详情</Button>
            <Button type="primary" size="small" onClick={() => handleEditOrder(record)}>编辑</Button>
            <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
          </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = dateRange ? {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD')
      } : {};
      const data = await request.get<Order[]>('/orders/list', params);
      setOrders(data);
    } catch (error) {
      console.error('获取订单列表失败:', error);
      message.error('获取订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/orders/${id}`);
      message.success('删除订单成功');
      fetchOrders();
    } catch (error) {
      console.error('删除订单失败:', error);
      message.error('删除订单失败');
    }
  };

  const handleSubmitOrder = async (values: any) => {
    try {
      // 格式化日期
      const orderData = {
        ...values,
        signDate: values.signDate ? values.signDate.format('YYYY-MM-DD') : '',
      };
      
      await request.post('/orders/create', orderData);
      message.success('添加订单成功');
      setIsAddModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('添加订单失败:', error);
      message.error('添加订单失败');
    }
  };

  const handleUpdateOrder = async (values: any) => {
    try {
      if (!editingOrder) return;
      
      // 格式化日期
      const orderData = {
        ...values,
        signDate: values.signDate ? values.signDate.format('YYYY-MM-DD') : '',
      };
      
      await request.put(`/orders/${editingOrder.id}`, orderData);
      message.success('更新订单成功');
      setIsEditModalVisible(false);
      fetchOrders();
    } catch (error) {
      console.error('更新订单失败:', error);
      message.error('更新订单失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 构建完整的 URL
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${BASE_URL}/api/orders/export`;
      
      // 获取 token
      const token = localStorage.getItem('token');
      
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
      link.download = `orders_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/orders/import`,
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchOrders();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="订单表" 
        extra={
          <Space size="middle">
            <DatePicker.RangePicker 
              value={dateRange} 
              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              style={{ width: 300 }}
            />
            <Button onClick={fetchOrders}>查询</Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>导入</Button>
            </Upload>
            <Button type="primary" onClick={handleAddOrder}>添加订单</Button>
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={orders.map(order => ({ ...order, key: order.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>

      <Modal
        title="添加订单"
        open={isAddModalVisible}
        onCancel={() => setIsAddModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={addForm}
          layout="vertical"
          onFinish={handleSubmitOrder}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractNo"
                label="合同编号"
                rules={[{ required: true, message: '请输入合同编号' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company"
                label="公司名称"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer"
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="material"
                label="物料名称"
                rules={[{ required: true, message: '请输入物料名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="signDate"
                label="签订时间"
                rules={[{ required: true, message: '请选择签订时间' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="termDays"
                label="期限天数"
                rules={[{ required: true, message: '请输入期限天数' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractQty"
                label="合同数量（吨）"
                rules={[{ required: true, message: '请输入合同数量' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="单价（元）"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="payType"
                label="付款方式"
                rules={[{ required: true, message: '请输入付款方式' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="executePeriod"
                label="执行时段"
                rules={[{ required: true, message: '请输入执行时段' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="division"
                label="事业部"
                rules={[{ required: true, message: '请输入事业部' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请输入分类' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row> */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="remark"
                label="备注"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsAddModalVisible(false)}>取消</Button>
                <Button type="primary" htmlType="submit">提交</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="编辑订单"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateOrder}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractNo"
                label="合同编号"
                rules={[{ required: true, message: '请输入合同编号' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="company"
                label="公司名称"
                rules={[{ required: true, message: '请输入公司名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customer"
                label="客户名称"
                rules={[{ required: true, message: '请输入客户名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="material"
                label="物料名称"
                rules={[{ required: true, message: '请输入物料名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="signDate"
                label="签订时间"
                rules={[{ required: true, message: '请选择签订时间' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="termDays"
                label="期限天数"
                rules={[{ required: true, message: '请输入期限天数' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractQty"
                label="合同数量（吨）"
                rules={[{ required: true, message: '请输入合同数量' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="unitPrice"
                label="单价（元）"
                rules={[{ required: true, message: '请输入单价' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="payType"
                label="付款方式"
                rules={[{ required: true, message: '请输入付款方式' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="executePeriod"
                label="执行时段"
                rules={[{ required: true, message: '请输入执行时段' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          {/* <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="division"
                label="事业部"
                rules={[{ required: true, message: '请输入事业部' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="分类"
                rules={[{ required: true, message: '请输入分类' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row> */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderStatus"
                label="订单状态"
                rules={[{ required: true, message: '请选择订单状态' }]}
              >
                <Select style={{ width: '100%' }}>
                  <Select.Option value="未完成">未完成</Select.Option>
                  <Select.Option value="完成">完成</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="remark"
                label="备注"
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>订单明细</h3>
                <Space>
                  <Button type="primary" onClick={handleOpenSyncModal}>同步明细</Button>
                  <Button onClick={() => editingOrder && fetchOrderDetails(editingOrder.id)}>刷新</Button>
                </Space>
              </div>
              <Table
                dataSource={orderDetails.map(detail => ({ ...detail, key: detail.id }))}
                loading={detailLoading}
                pagination={false}
                scroll={{ x: 'max-content' }}
              >
                <Table.Column title="ID" dataIndex="id" key="id" />
                <Table.Column title="单据编号" dataIndex="documentNo" key="documentNo" />
                <Table.Column title="来源文件" dataIndex="sourceFile" key="sourceFile" />
                <Table.Column title="单据类型" dataIndex="documentType" key="documentType" />
                <Table.Column title="地磅位置" dataIndex="weighbridgeLocation" key="weighbridgeLocation" />
                <Table.Column title="车牌号" dataIndex="vehicleNo" key="vehicleNo" />
                <Table.Column title="入场日期" dataIndex="entryDate" key="entryDate" />
                <Table.Column title="过磅日期" dataIndex="weighDate" key="weighDate" />
                <Table.Column title="入场时间" dataIndex="entryTime" key="entryTime" />
                <Table.Column title="出场时间" dataIndex="exitTime" key="exitTime" />
                <Table.Column title="过磅时间" dataIndex="weighTime" key="weighTime" />
                <Table.Column title="货物名称" dataIndex="goodsName" key="goodsName" />
                <Table.Column title="规格型号" dataIndex="specModel" key="specModel" />
                <Table.Column title="供应商编号" dataIndex="supplierNo" key="supplierNo" />
                <Table.Column title="供应商名称" dataIndex="supplierName" key="supplierName" />
                <Table.Column title="客户名称" dataIndex="customerName" key="customerName" />
                <Table.Column title="毛重" dataIndex="grossWeight" key="grossWeight" />
                <Table.Column title="皮重" dataIndex="tareWeight" key="tareWeight" />
                <Table.Column title="净重" dataIndex="netWeight" key="netWeight" />
                <Table.Column title="扣重" dataIndex="deductWeight" key="deductWeight" />
                <Table.Column title="实收重量" dataIndex="actualWeight" key="actualWeight" />
                <Table.Column title="过磅类型" dataIndex="weighType" key="weighType" />
                <Table.Column title="毛重过磅员" dataIndex="grossWeigher" key="grossWeigher" />
                <Table.Column title="皮重过磅员" dataIndex="tareWeigher" key="tareWeigher" />
                <Table.Column title="包装重量" dataIndex="packageWeight" key="packageWeight" />
                <Table.Column title="扣减" dataIndex="deduction" key="deduction" />
                <Table.Column title="其他" dataIndex="other" key="other" />
                <Table.Column title="结算数量" dataIndex="settlementQty" key="settlementQty" />
                <Table.Column title="收货仓库" dataIndex="receivingWarehouse" key="receivingWarehouse" />
                <Table.Column title="原始数量" dataIndex="originalQty" key="originalQty" />
                <Table.Column title="车次数" dataIndex="vehicleCount" key="vehicleCount" />
                <Table.Column title="合同编号" dataIndex="contractNo" key="contractNo" />
                <Table.Column title="发货单号" dataIndex="dispatchNo" key="dispatchNo" />
                <Table.Column title="通知单号" dataIndex="noticeNo" key="noticeNo" />
                <Table.Column title="收货人" dataIndex="receiver" key="receiver" />
                <Table.Column title="出场过磅员" dataIndex="exitWeigher" key="exitWeigher" />
                <Table.Column title="备注" dataIndex="remark" key="remark" />
                <Table.Column title="是否汇总" dataIndex="isSummary" key="isSummary" />
                <Table.Column title="是否删除" dataIndex="deleted" key="deleted" />
                <Table.Column title="创建时间" dataIndex="createTime" key="createTime" />
                <Table.Column title="更新时间" dataIndex="updateTime" key="updateTime" />
                <Table.Column 
                  title="操作" 
                  key="action" 
                  render={(_: any, record: OrderDetail) => (
                    <Button danger size="small" onClick={() => handleDeleteDetail(record.id)}>删除</Button>
                  )}
                />
              </Table>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsEditModalVisible(false)}>取消</Button>
                <Button type="primary" htmlType="submit">提交</Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="订单详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={
          <Button onClick={() => setIsDetailModalVisible(false)}>关闭</Button>
        }
        width={1000}
      >
        {detailOrder && (
          <div>
            <Row gutter={16} style={{ marginBottom: 20 }}>
              <Col span={12}>
                <p><strong>合同编号：</strong>{detailOrder.contractNo}</p>
                <p><strong>公司名称：</strong>{detailOrder.company}</p>
                <p><strong>客户名称：</strong>{detailOrder.customer}</p>
                <p><strong>物料名称：</strong>{detailOrder.material}</p>
                <p><strong>签订时间：</strong>{detailOrder.signDate}</p>
                <p><strong>期限天数：</strong>{detailOrder.termDays}</p>
                <p><strong>合同数量（吨）：</strong>{detailOrder.contractQty}</p>
                <p><strong>单价（元）：</strong>{detailOrder.unitPrice}</p>
              </Col>
              <Col span={12}>
                <p><strong>付款方式：</strong>{detailOrder.payType}</p>
                <p><strong>执行时段：</strong>{detailOrder.executePeriod}</p>
                <p><strong>回货吨数：</strong>{detailOrder.receivedQty}</p>
                <p><strong>剩余吨数：</strong>{detailOrder.remainingQty}</p>
                <p><strong>备注：</strong>{detailOrder.remark}</p>
                <p><strong>订单状态：</strong>{detailOrder.orderStatus}</p>
                <p><strong>订单金额：</strong>{detailOrder.orderAmount}</p>
                <p><strong>创建时间：</strong>{detailOrder.createTime}</p>
              </Col>
            </Row>
            <Divider />
            <h3 style={{ marginBottom: 16 }}>订单明细</h3>
            <Table
              dataSource={detailOrderDetails.map(detail => ({ ...detail, key: detail.id }))}
              pagination={false}
              scroll={{ x: 'max-content' }}
            >
              <Table.Column title="ID" dataIndex="id" key="id" />
              <Table.Column title="单据编号" dataIndex="documentNo" key="documentNo" />
              <Table.Column title="来源文件" dataIndex="sourceFile" key="sourceFile" />
              <Table.Column title="货物名称" dataIndex="goodsName" key="goodsName" />
              <Table.Column title="规格型号" dataIndex="specModel" key="specModel" />
              <Table.Column title="供应商名称" dataIndex="supplierName" key="supplierName" />
              <Table.Column title="客户名称" dataIndex="customerName" key="customerName" />
              <Table.Column title="实收重量" dataIndex="actualWeight" key="actualWeight" />
              <Table.Column title="过磅日期" dataIndex="weighDate" key="weighDate" />
            </Table>
          </div>
        )}
      </Modal>

      <Modal
        title="同步明细"
        open={isSyncModalVisible}
        onCancel={() => {
          setIsSyncModalVisible(false);
          setSelectedWeighingRows([]);
          setSyncMaterial('');
          setSyncSupplier('');
          setSyncSourceFile('');
          setSyncDateRange(null);
        }}
        footer={
          <Space>
            <Button onClick={() => {
              setIsSyncModalVisible(false);
              setSelectedWeighingRows([]);
              setSyncMaterial('');
              setSyncSupplier('');
              setSyncSourceFile('');
              setSyncDateRange(null);
            }}>取消</Button>
            <Button type="primary" onClick={handleSyncDetails}>确认同步</Button>
          </Space>
        }
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="物料名称"
              value={syncMaterial}
              onChange={(e) => setSyncMaterial(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="供应商名称"
              value={syncSupplier}
              onChange={(e) => setSyncSupplier(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="来源文件"
              value={syncSourceFile}
              onChange={(e) => setSyncSourceFile(e.target.value)}
              style={{ width: 180 }}
            />
            <DatePicker.RangePicker
              value={syncDateRange}
              onChange={(dates) => setSyncDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              style={{ width: 250 }}
              placeholder={['开始日期', '结束日期']}
            />
            <Button type="primary" onClick={handleSearchWeighing}>查询</Button>
          </Space>
        </div>
        <Table
          dataSource={weighingData.map(item => ({ ...item, key: item.id }))}
          loading={weighingLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys: selectedWeighingRows.map(row => row.id),
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedWeighingRows(selectedRows);
            },
          }}
          columns={weighingColumns}
        />
      </Modal>
    </div>
  );
};

export default Orders;