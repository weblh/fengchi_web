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
  ProcurementOrderDetail,
  CreateProcurementOrderDetailRequest,
  UpdateProcurementOrderDetailRequest,
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

const PurchaseOrderDetail: React.FC = () => {
  const [data, setData] = useState<ProcurementOrderDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcurementOrderDetail | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    orderId: '',
    vehicleNo: '',
    deliveryDate: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

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

      if (searchParams.orderId) {
        params.orderId = parseInt(searchParams.orderId);
      }
      if (searchParams.vehicleNo) {
        params.vehicleNo = searchParams.vehicleNo;
      }
      if (searchParams.deliveryDate) {
        params.deliveryDate = searchParams.deliveryDate;
      }

      const result = await purchaseApi.procurementOrderDetail.search(params);
      console.log('采购订单明细列表数据:', result);
      if (result.list !== undefined) {
        setData(result.list);
        setPagination({
          current: result.page || page,
          pageSize: result.size || pageSize,
          total: result.total || 0,
        });
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('获取采购订单明细失败:', error);
      setData([]);
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

  const handleEdit = (record: ProcurementOrderDetail) => {
    setEditingItem(record);
    form.resetFields();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        deliveryDate: record.deliveryDate ? dayjs(record.deliveryDate) : null,
        weighDate: record.weighDate ? dayjs(record.weighDate) : null,
      });
    }, 0);
    setVisible(true);
  };



  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该采购订单明细吗？',
      onOk: async () => {
        try {
          await purchaseApi.procurementOrderDetail.delete(id);
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleConfirmDelivery = async (id: number) => {
    Modal.confirm({
      title: '确认交付',
      content: '确定要确认该明细已交付吗？',
      onOk: async () => {
        try {
          await purchaseApi.procurementOrderDetail.confirmDelivery(id);
          message.success('确认交付成功');
          fetchData();
        } catch (error) {
          message.error('确认交付失败');
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
        await purchaseApi.procurementOrderDetail.update(editingItem.id, submitData as UpdateProcurementOrderDetailRequest);
        message.success('更新成功');
      } else {
        await purchaseApi.procurementOrderDetail.create(submitData as CreateProcurementOrderDetailRequest);
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
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 80,
    },
    {
      title: '订单编号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 120,
    },
    {
      title: '交付日期',
      dataIndex: 'deliveryDate',
      key: 'deliveryDate',
      width: 100,
    },
    {
      title: '上级供应商',
      dataIndex: 'upstreamSupplier',
      key: 'upstreamSupplier',
      width: 120,
    },
    {
      title: '下游公司',
      dataIndex: 'downstreamCompany',
      key: 'downstreamCompany',
      width: 120,
    },
    {
      title: '车号',
      dataIndex: 'vehicleNo',
      key: 'vehicleNo',
      width: 100,
    },
    {
      title: '毛重',
      dataIndex: 'grossWeight',
      key: 'grossWeight',
      width: 80,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '皮重',
      dataIndex: 'tareWeight',
      key: 'tareWeight',
      width: 80,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '净重',
      dataIndex: 'netWeight',
      key: 'netWeight',
      width: 80,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '扣重',
      dataIndex: 'deductWeight',
      key: 'deductWeight',
      width: 80,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '结算吨位',
      dataIndex: 'settlementQty',
      key: 'settlementQty',
      width: 100,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '结算金额',
      dataIndex: 'settlementAmount',
      key: 'settlementAmount',
      width: 110,
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '过磅编号',
      dataIndex: 'weighbridgeNo',
      key: 'weighbridgeNo',
      width: 100,
    },
    {
      title: '过磅日期',
      dataIndex: 'weighDate',
      key: 'weighDate',
      width: 100,
    },
    {
      title: '过磅位置',
      dataIndex: 'weighLocation',
      key: 'weighLocation',
      width: 120,
    },
    {
      title: '过磅员',
      dataIndex: 'weigher',
      key: 'weigher',
      width: 80,
    },
    {
      title: '是否送到',
      dataIndex: 'isDelivered',
      key: 'isDelivered',
      width: 80,
      render: (text: number) => (
        <span className={`px-2 py-1 rounded text-xs ${text === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
          {text === 1 ? '已送到' : '未送到'}
        </span>
      ),
    },
    {
      title: '入库吨位',
      dataIndex: 'warehouseInQty',
      key: 'warehouseInQty',
      width: 100,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '扣杂',
      dataIndex: 'impurityDeduction',
      key: 'impurityDeduction',
      width: 80,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '合计到货吨位',
      dataIndex: 'totalArrivalQty',
      key: 'totalArrivalQty',
      width: 120,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '磅差',
      dataIndex: 'weighbridgeDiff',
      key: 'weighbridgeDiff',
      width: 80,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '填表人',
      dataIndex: 'filler',
      key: 'filler',
      width: 80,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record: ProcurementOrderDetail) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.isDelivered === 0 && (
            <Button
              size="small"
              
              onClick={() => handleConfirmDelivery(record.id)}
            >
              确认交付
            </Button>
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
        title="采购订单明细管理"
        extra={<Button type="primary" onClick={handleAdd}>
          添加明细
        </Button>}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Input
              placeholder="订单ID"
              value={searchParams.orderId}
              onChange={(e) => setSearchParams({ ...searchParams, orderId: e.target.value })}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="车号"
              value={searchParams.vehicleNo}
              onChange={(e) => setSearchParams({ ...searchParams, vehicleNo: e.target.value })}
            />
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="交付日期"
              value={searchParams.deliveryDate ? new Date(searchParams.deliveryDate) : undefined}
              onChange={(date) => setSearchParams({ ...searchParams, deliveryDate: date ? date.format('YYYY-MM-DD') : '' })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
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
          scroll={{ x: 2500 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑采购订单明细' : '添加采购订单明细'}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={900}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="orderId"
                label="订单ID"
                rules={[{ required: true, message: '请输入订单ID' }]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入订单ID" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="orderNo" label="订单编号（冗余）">
                <Input placeholder="请输入订单编号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="deliveryDate" label="交付日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="upstreamSupplier" label="上级供应商">
                <Input placeholder="请输入上级供应商" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="downstreamCompany" label="下游公司">
                <Input placeholder="请输入下游公司" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vehicleNo" label="车号">
                <Input placeholder="请输入车号" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="grossWeight" label="毛重">
                <InputNumber style={{ width: '100%' }} placeholder="请输入毛重" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="tareWeight" label="皮重">
                <InputNumber style={{ width: '100%' }} placeholder="请输入皮重" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="netWeight" label="净重">
                <InputNumber style={{ width: '100%' }} placeholder="请输入净重" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="deductWeight" label="扣重">
                <InputNumber style={{ width: '100%' }} placeholder="请输入扣重" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="settlementQty" label="结算吨位">
                <InputNumber style={{ width: '100%' }} placeholder="请输入结算吨位" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="settlementAmount" label="结算金额">
                <InputNumber style={{ width: '100%' }} placeholder="请输入结算金额" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="weighbridgeNo" label="过磅编号">
                <Input placeholder="请输入过磅编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weighDate" label="过磅日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="weighLocation" label="过磅位置">
                <Input placeholder="请输入过磅位置" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="weigher" label="过磅员">
                <Input placeholder="请输入过磅员" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="warehouseInQty" label="入库吨位">
                <InputNumber style={{ width: '100%' }} placeholder="请输入入库吨位" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="impurityDeduction" label="扣杂">
                <InputNumber style={{ width: '100%' }} placeholder="请输入扣杂" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="totalArrivalQty" label="合计到货吨位">
                <InputNumber style={{ width: '100%' }} placeholder="请输入合计到货吨位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="filler" label="填表人">
                <Input placeholder="请输入填表人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="remark" label="备注">
                <Input.TextArea placeholder="请输入备注" rows={2} />
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

export default PurchaseOrderDetail;