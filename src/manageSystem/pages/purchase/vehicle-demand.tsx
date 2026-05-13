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
  VehicleDemand,
  CreateVehicleDemandRequest,
  UpdateVehicleDemandRequest,
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

const VehicleDemandPage: React.FC = () => {
  const [data, setData] = useState<VehicleDemand[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<VehicleDemand | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    planDate: '',
    supplierName: '',
    isConfirmed: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const vehicleTypeOptions = [
    { value: '高栏', label: '高栏' },
    { value: '低栏', label: '低栏' },
  ];

  const confirmedOptions = [
    { value: '0', label: '未确认' },
    { value: '1', label: '已确认' },
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

      if (searchParams.planDate) {
        params.planDate = searchParams.planDate;
      }
      if (searchParams.supplierName) {
        params.supplierName = searchParams.supplierName;
      }
      if (searchParams.isConfirmed) {
        params.isConfirmed = searchParams.isConfirmed;
      }

      const result = await purchaseApi.vehicleDemand.search(params);
      console.log('车辆需求列表数据:', result);
      
      if (result.list !== undefined) {
       
          setData(result.list);
        setPagination({
          current: result.page || page,
          pageSize: result.size || pageSize,
          total: result.total || 0,
        });
      } else {
        const sampleData: VehicleDemand[] = [
          {
            id: 1,
            planDate: '2026-05-10',
            requestDate: '2026-05-08',
            materialName: '螺纹钢',
            vehicleType: '高栏',
            supplierName: '供应商A',
            origin: '上海',
            destination: '杭州',
            vehicleCount: 3,
            requester: '张三',
            specialRemark: '需要冷藏运输',
            isConfirmed: 0,
            orderId: 1,
            deleted: 0,
            createTime: '2026-05-07 10:00:00',
            updateTime: '2026-05-07 10:00:00',
          },
        ];
        setData(sampleData);
      }
    } catch (error) {
      console.error('获取车辆需求失败:', error);
      const sampleData: VehicleDemand[] = [
        {
          id: 1,
          planDate: '2026-05-10',
          requestDate: '2026-05-08',
          materialName: '螺纹钢',
          vehicleType: '高栏',
          supplierName: '供应商A',
          origin: '上海',
          destination: '杭州',
          vehicleCount: 3,
          requester: '张三',
          specialRemark: '需要冷藏运输',
          isConfirmed: 0,
          orderId: 1,
          deleted: 0,
          createTime: '2026-05-07 10:00:00',
          updateTime: '2026-05-07 10:00:00',
        },
      ];
      setData(sampleData);
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

  const handleEdit = (record: VehicleDemand) => {
    setEditingItem(record);
    form.resetFields();
    setTimeout(() => {
      const formValues: any = { ...record };
      if (record.planDate) {
        formValues.planDate = dayjs(record.planDate);
      }
      if (record.requestDate) {
        formValues.requestDate = dayjs(record.requestDate);
      }
      form.setFieldsValue(formValues);
    }, 0);
    setVisible(true);
  };



  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该车辆需求吗？',
      onOk: async () => {
        try {
          await purchaseApi.vehicleDemand.delete(id);
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleConfirm = async (id: number) => {
    Modal.confirm({
      title: '确认需求',
      content: '确定要确认该车辆需求吗？',
      onOk: async () => {
        try {
          await purchaseApi.vehicleDemand.confirm(id);
          message.success('确认成功');
          fetchData();
        } catch (error) {
          message.error('确认失败');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        requester: currentUser?.username || '',
        requesterId: currentUser?.userId || 0,
      };
      if (editingItem) {
        await purchaseApi.vehicleDemand.update(editingItem.id, submitData as UpdateVehicleDemandRequest);
        message.success('更新成功');
      } else {
        await purchaseApi.vehicleDemand.create(submitData as CreateVehicleDemandRequest);
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
      title: '计划日期',
      dataIndex: 'planDate',
      key: 'planDate',
      width: 100,
    },
    {
      title: '要车日期',
      dataIndex: 'requestDate',
      key: 'requestDate',
      width: 100,
    },
    {
      title: '所装物料',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 120,
    },
    {
      title: '需求类型',
      dataIndex: 'vehicleType',
      key: 'vehicleType',
      width: 80,
      render: (text: string) => (
        <span>{text === '高栏' ? '高栏' : text === '低栏' ? '低栏' : text}</span>
      ),
    },
    {
      title: '装货供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
      width: 120,
    },
    {
      title: '始发地',
      dataIndex: 'origin',
      key: 'origin',
      width: 100,
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      width: 100,
    },
    {
      title: '数量(辆)',
      dataIndex: 'vehicleCount',
      key: 'vehicleCount',
      width: 80,
    },
    {
      title: '需求人',
      dataIndex: 'requester',
      key: 'requester',
      width: 80,
    },
    {
      title: '特殊备注',
      dataIndex: 'specialRemark',
      key: 'specialRemark',
      width: 150,
      ellipsis: true,
    },
    {
      title: '确认状态',
      dataIndex: 'isConfirmed',
      key: 'isConfirmed',
      width: 80,
      render: (text: number) => (
        <span className={`px-2 py-1 rounded text-xs ${text === 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {text === 1 ? '已确认' : '未确认'}
        </span>
      ),
    },
    {
      title: '关联订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record: VehicleDemand) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.isConfirmed === 0 && (
            <Button
              size="small"
              
              onClick={() => handleConfirm(record.id)}
            >
              确认需求
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
        title="车辆需求管理"
        extra={<Button type="primary" onClick={handleAdd}>
          添加需求
        </Button>}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <DatePicker
              placeholder="计划日期"
              value={searchParams.planDate ? dayjs(searchParams.planDate) : undefined}
              onChange={(date) => setSearchParams({ ...searchParams, planDate: date ? date.format('YYYY-MM-DD') : '' })}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={6}>
            <Input
              placeholder="供应商名称"
              value={searchParams.supplierName}
              onChange={(e) => setSearchParams({ ...searchParams, supplierName: e.target.value })}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="确认状态"
              value={searchParams.isConfirmed || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, isConfirmed: value })}
            >
              {confirmedOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
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
          scroll={{ x: 1500 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑车辆需求' : '添加车辆需求'}
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
              <Form.Item name="planDate" label="计划日期">
                <DatePicker 
                  style={{ width: '100%' }} 
                  valueFormat="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="requestDate"
                label="要车日期"
                rules={[{ required: true, message: '请选择要车日期' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  valueFormat="YYYY-MM-DD"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="materialName"
                label="所装物料"
                rules={[
                  { required: true, message: '请输入所装物料' },
                  { max: 100, message: '物料名称长度不能超过100个字符' },
                ]}
              >
                <Input placeholder="请输入所装物料" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="vehicleType" label="需求类型">
                <Select placeholder="请选择需求类型">
                  {vehicleTypeOptions.map((item) => (
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
                name="supplierName" 
                label="装货供应商"
                rules={[{ max: 100, message: '供应商名称长度不能超过100个字符' }]}
              >
                <Input placeholder="请输入装货供应商" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="origin" 
                label="始发地"
                rules={[{ pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '始发地只能包含中文和字母' }]}
              >
                <Input placeholder="请输入始发地" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="destination" 
                label="目的地"
                rules={[{ pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '目的地只能包含中文和字母' }]}
              >
                <Input placeholder="请输入目的地" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vehicleCount"
                label="数量(辆)"
                rules={[
                  { required: true, message: '请输入车辆数量' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const numValue = parseFloat(String(value));
                      if (isNaN(numValue) || numValue <= 0) {
                        return Promise.reject(new Error('车辆数量必须大于0'));
                      }
                      return Promise.resolve();
                    },
                  }),
                ]}
              >
                <InputNumber style={{ width: '100%' }} placeholder="请输入车辆数量" min={1} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="requester" 
                label="需求人"
                initialValue={currentUser?.username || ''}
              >
                <Input 
                  placeholder="请输入需求人" 
                  disabled 
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="orderId" label="关联订单ID">
                <InputNumber style={{ width: '100%' }} placeholder="请输入关联订单ID" min={0} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="specialRemark" label="特殊备注">
                <Input.TextArea placeholder="请输入特殊备注" rows={2} />
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

export default VehicleDemandPage;