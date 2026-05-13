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
  PaymentApplication,
  CreatePaymentApplicationRequest,
  UpdatePaymentApplicationRequest,
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

const PaymentApplicationPage: React.FC = () => {
  const [data, setData] = useState<PaymentApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PaymentApplication | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    approvalStatus: '',
    startDate: '',
    endDate: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const paymentMethodOptions = [
    { value: '现汇', label: '现汇' },
    { value: '银承', label: '银承' },
    { value: '其他', label: '其他' },
  ];

  const paymentTypeOptions = [
    { value: '采购付款', label: '采购付款' },
    { value: '预付款', label: '预付款' },
    { value: '月结付款', label: '月结付款' },
    { value: '其他', label: '其他' },
  ];

  const approvalStatusOptions = [
    { value: '未审批', label: '未审批' },
    { value: '已审批', label: '已审批' },
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

      if (searchParams.approvalStatus) {
        params.approvalStatus = searchParams.approvalStatus;
      }
      if (searchParams.startDate) {
        params.startDate = searchParams.startDate;
      }
      if (searchParams.endDate) {
        params.endDate = searchParams.endDate;
      }

      const result = await purchaseApi.paymentApplication.search(params);
      console.log('付款申请列表数据:', result);
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
      console.error('获取付款申请失败:', error);
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

  const handleEdit = (record: PaymentApplication) => {
    setEditingItem(record);
    form.resetFields();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        initiatedAt: record.initiatedAt ? dayjs(record.initiatedAt) : null,
      });
    }, 0);
    setVisible(true);
  };



  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该付款申请吗？',
      onOk: async () => {
        try {
          await purchaseApi.paymentApplication.delete(id);
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleApprove = async (id: number) => {
    Modal.confirm({
      title: '审批通过',
      content: '确定要通过该付款申请吗？',
      onOk: async () => {
        try {
          await purchaseApi.paymentApplication.approve(id);
          message.success('审批通过');
          fetchData();
        } catch (error) {
          message.error('审批失败');
        }
      },
    });
  };

  const handleReject = async (id: number) => {
    Modal.confirm({
      title: '审批拒绝',
      content: '确定要拒绝该付款申请吗？',
      onOk: async () => {
        try {
          await purchaseApi.paymentApplication.reject(id);
          message.success('已拒绝');
          fetchData();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        initiator: currentUser?.username || '',
        initiatorId: currentUser?.userId || 0,
      };
      if (editingItem) {
        await purchaseApi.paymentApplication.update(editingItem.id, submitData as UpdatePaymentApplicationRequest);
        message.success('更新成功');
      } else {
        await purchaseApi.paymentApplication.create(submitData as CreatePaymentApplicationRequest);
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
      title: '申请编号',
      dataIndex: 'applicationNo',
      key: 'applicationNo',
      width: 120,
    },
    {
      title: '发起时间',
      dataIndex: 'initiatedAt',
      key: 'initiatedAt',
      width: 190,
    },
    {
      title: '发起人',
      dataIndex: 'initiator',
      key: 'initiator',
      width: 80,
    },
    {
      title: '付款单位',
      dataIndex: 'payerUnit',
      key: 'payerUnit',
      width: 120,
    },
    {
      title: '付款类型',
      dataIndex: 'paymentType',
      key: 'paymentType',
      width: 100,
    },
    {
      title: '付款事由',
      dataIndex: 'paymentReason',
      key: 'paymentReason',
      width: 150,
      ellipsis: true,
    },
    {
      title: '付款方式',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 100,
      render: (text: string) => (
        <span>{text === '现汇' ? '现汇' : text === '银承' ? '银承' : text}</span>
      ),
    },
    {
      title: '付款总额(元)',
      dataIndex: 'paymentAmount',
      key: 'paymentAmount',
      width: 120,
      render: (text: number) => text.toFixed(2),
    },
    {
      title: '收款单位',
      dataIndex: 'payeeName',
      key: 'payeeName',
      width: 120,
    },
    {
      title: '收款账号',
      dataIndex: 'payeeAccount',
      key: 'payeeAccount',
      width: 150,
      ellipsis: true,
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      width: 100,
      render: (text: string) => (
        <span className={`px-2 py-1 rounded text-xs ${text === '已审批' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {text}
        </span>
      ),
    },
    {
      title: '关联订货量',
      dataIndex: 'relatedOrderQty',
      key: 'relatedOrderQty',
      width: 120,
      render: (text: number) => text.toFixed(3),
    },
    {
      title: '关联订单',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: PaymentApplication) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.approvalStatus === '未审批' && (
            <>
              <Button
                size="small"
                
                onClick={() => handleApprove(record.id)}
              >
                审批通过
              </Button>
              <Button
                danger
                size="small"
                
                onClick={() => handleReject(record.id)}
              >
                拒绝
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
        title="付款申请管理"
        extra={<Button type="primary" onClick={handleAdd}>
          添加申请
        </Button>}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Select
              placeholder="审批状态"
              value={searchParams.approvalStatus || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, approvalStatus: value })}
            >
              {approvalStatusOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="开始日期"
              value={searchParams.startDate ? new Date(searchParams.startDate) : undefined}
              onChange={(date) => setSearchParams({ ...searchParams, startDate: date ? date.format('YYYY-MM-DD') : '' })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="结束日期"
              value={searchParams.endDate ? new Date(searchParams.endDate) : undefined}
              onChange={(date) => setSearchParams({ ...searchParams, endDate: date ? date.format('YYYY-MM-DD') : '' })}
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
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑付款申请' : '添加付款申请'}
        open={visible}
        onCancel={() => setVisible(false)}
        footer={null}
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicationNo"
                label="申请编号"
                rules={[
                  { required: true, message: '请输入申请编号' },
                  { pattern: /^[A-Za-z0-9_-]+$/, message: '申请编号只能包含字母、数字、下划线和连字符' },
                  { min: 3, message: '申请编号长度不能少于3个字符' },
                  { max: 50, message: '申请编号长度不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入申请编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="initiatedAt" 
                label="发起时间"
                rules={[{ required: true, message: '请选择发起时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="initiator" 
                label="发起人"
                initialValue={currentUser?.username || ''}
              >
                <Input 
                  placeholder="请输入发起人" 
                  disabled 
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="payerUnit" 
                label="付款单位"
                rules={[
                  { required: true, message: '请输入付款单位' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '付款单位只能包含中文、字母和数字' },
                  { min: 2, message: '付款单位长度不能少于2个字符' },
                  { max: 100, message: '付款单位长度不能超过100个字符' },
                ]}
              >
                <Input placeholder="请输入付款单位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="paymentType" 
                label="付款类型"
                rules={[{ required: true, message: '请选择付款类型' }]}
              >
                <Select placeholder="请选择付款类型">
                  {paymentTypeOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="paymentMethod" 
                label="付款方式"
                rules={[{ required: true, message: '请选择付款方式' }]}
              >
                <Select placeholder="请选择付款方式">
                  {paymentMethodOptions.map((item) => (
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
              <Form.Item
                name="paymentAmount"
                label="付款总额(元)"
                rules={[
                  { required: true, message: '请输入付款总额' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const numValue = parseFloat(String(value));
                      if (isNaN(numValue)) {
                        return Promise.reject(new Error('付款总额必须是数字'));
                      }
                      if (numValue <= 0) {
                        return Promise.reject(new Error('付款总额必须大于0'));
                      }
                      if (numValue > 99999999999.99) {
                        return Promise.reject(new Error('付款总额不能超过99999999999.99元'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入付款总额" step={0.01} min={0.01} max={99999999999.99} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="payeeName" 
                label="收款单位"
                rules={[
                  { required: true, message: '请输入收款单位' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '收款单位只能包含中文、字母和数字' },
                  { min: 2, message: '收款单位长度不能少于2个字符' },
                  { max: 100, message: '收款单位长度不能超过100个字符' },
                ]}
              >
                <Input placeholder="请输入收款单位" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="payeeAccount" 
                label="收款账号"
                rules={[
                  { required: true, message: '请输入收款账号' },
                  { pattern: /^\d{16,20}$/, message: '请输入正确的银行卡号(16-20位)' },
                ]}
              >
                <Input placeholder="请输入收款账号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="relatedOrderQty" 
                label="关联订货量(吨)"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const numValue = parseFloat(String(value));
                      if (numValue !== undefined && numValue !== null) {
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('关联订货量必须是数字'));
                        }
                        if (numValue < 0) {
                          return Promise.reject(new Error('关联订货量不能为负数'));
                        }
                        if (numValue > 9999999.999) {
                          return Promise.reject(new Error('关联订货量不能超过9999999.999吨'));
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入关联订货量" step={0.001} min={0} max={9999999.999} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="orderId" 
                label="关联订单ID"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (value !== undefined && value !== null && value !== '') {
                        const numValue = parseInt(String(value), 10);
                        if (isNaN(numValue)) {
                          return Promise.reject(new Error('关联订单ID必须是整数'));
                        }
                        if (numValue < 0) {
                          return Promise.reject(new Error('关联订单ID不能为负数'));
                        }
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入关联订单ID" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item 
                name="paymentReason" 
                label="付款事由"
                rules={[
                  { max: 500, message: '付款事由长度不能超过500个字符' },
                ]}
              >
                <Input.TextArea placeholder="请输入付款事由" rows={2} />
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

export default PaymentApplicationPage;