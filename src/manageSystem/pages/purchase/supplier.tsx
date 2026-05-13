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
  message,
  Row,
  Col,
} from 'antd';
import dayjs from 'dayjs';

import purchaseApi from '../../../services/purchase';
import type {
  SupplierInfo,
  CreateSupplierInfoRequest,
  UpdateSupplierInfoRequest,
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

const SupplierInfoPage: React.FC = () => {
  const [data, setData] = useState<SupplierInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<SupplierInfo | null>(null);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({
    supplierCode: '',
    province: '',
    cooperationStatus: '',
    fullName: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const supplierTypeOptions = [
    { value: '壳子铸件类', label: '壳子铸件类' },
    { value: '综合类', label: '综合类' },
    { value: '有色类', label: '有色类' },
  ];

  const natureOptions = [
    { value: '个人', label: '个人' },
    { value: '公司', label: '公司' },
  ];

  const cooperationStatusOptions = [
    { value: '合作中', label: '合作中' },
    { value: '暂停', label: '暂停' },
    { value: '备选', label: '备选' },
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

      if (searchParams.supplierCode) {
        params.supplierCode = searchParams.supplierCode;
      }
      if (searchParams.province) {
        params.province = searchParams.province;
      }
      if (searchParams.cooperationStatus) {
        params.cooperationStatus = searchParams.cooperationStatus;
      }
      if (searchParams.fullName) {
        params.fullName = searchParams.fullName;
      }

      const result = await purchaseApi.supplierInfo.search(params);
      console.log('供应商列表数据:', result);
      if (result.list !== undefined) {
        setData(result.list);
        setPagination({
          current: result.page || page,
          pageSize: result.size || pageSize,
          total: result.total || 0,
        });
      } else {
        setData(result.list || result.data || result);
      }
    } catch (error) {
      console.error('获取供应商信息失败:', error);
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

  const handleEdit = (record: SupplierInfo) => {
    setEditingItem(record);
    form.resetFields();
    setTimeout(() => {
      form.setFieldsValue({
        ...record,
        updatedDate: record.updatedDate ? dayjs(record.updatedDate) : null,
      });
    }, 0);
    setVisible(true);
  };



  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该供应商吗？',
      onOk: async () => {
        try {
          await purchaseApi.supplierInfo.delete(id);
          message.success('删除成功');
          fetchData();
        } catch (error) {
          message.error('删除失败');
        }
      },
    });
  };

  const handleSuspend = async (id: number) => {
    Modal.confirm({
      title: '暂停合作',
      content: '确定要暂停与该供应商的合作吗？',
      onOk: async () => {
        try {
          await purchaseApi.supplierInfo.suspend(id);
          message.success('暂停成功');
          fetchData();
        } catch (error) {
          message.error('操作失败');
        }
      },
    });
  };

  const handleActivate = async (id: number) => {
    Modal.confirm({
      title: '激活合作',
      content: '确定要激活与该供应商的合作吗？',
      onOk: async () => {
        try {
          await purchaseApi.supplierInfo.activate(id);
          message.success('激活成功');
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
        owner: currentUser?.username || '',
        ownerId: currentUser?.userId || 0,
      };
      if (editingItem) {
        await purchaseApi.supplierInfo.update(editingItem.id, submitData as UpdateSupplierInfoRequest);
        message.success('更新成功');
      } else {
        await purchaseApi.supplierInfo.create(submitData as CreateSupplierInfoRequest);
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
      title: '供应商编码',
      dataIndex: 'supplierCode',
      key: 'supplierCode',
      width: 120,
    },
    {
      title: '类型',
      dataIndex: 'supplierType',
      key: 'supplierType',
      width: 100,
      render: (text: string) => (
        <span>{text === '壳子铸件类' ? '壳子铸件类' : text === '综合类' ? '综合类' : text === '有色类' ? '有色类' : text}</span>
      ),
    },
    {
      title: '省份',
      dataIndex: 'province',
      key: 'province',
      width: 80,
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city',
      width: 80,
    },
    {
      title: '性质',
      dataIndex: 'nature',
      key: 'nature',
      width: 60,
      render: (text: string) => (
        <span>{text === '个人' ? '个人' : text === '公司' ? '公司' : text}</span>
      ),
    },
    {
      title: '全称',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      ellipsis: true,
    },
    {
      title: '简称',
      dataIndex: 'shortName',
      key: 'shortName',
      width: 100,
    },
    {
      title: '供应料型',
      dataIndex: 'supplyMaterial',
      key: 'supplyMaterial',
      width: 120,
      ellipsis: true,
    },
    {
      title: '合作状态',
      dataIndex: 'cooperationStatus',
      key: 'cooperationStatus',
      width: 80,
      render: (text: string) => (
        <span className={`px-2 py-1 rounded text-xs ${
          text === '合作中' ? 'bg-green-100 text-green-800' :
          text === '暂停' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {text}
        </span>
      ),
    },
    {
      title: '联系人',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
      width: 80,
    },
    {
      title: '联系方式',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
      width: 120,
    },
    {
      title: '更新日期',
      dataIndex: 'updatedDate',
      key: 'updatedDate',
      width: 100,
    },
    {
      title: '对接人',
      dataIndex: 'owner',
      key: 'owner',
      width: 80,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: SupplierInfo) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.cooperationStatus === '合作中' && (
            <Button
              size="small"
              
              onClick={() => handleSuspend(record.id)}
            >
              暂停合作
            </Button>
          )}
          {record.cooperationStatus !== '合作中' && (
            <Button
              size="small"
              
              onClick={() => handleActivate(record.id)}
            >
              激活合作
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
        title="供应商信息管理"
        extra={<Button type="primary" onClick={handleAdd}>
          添加供应商
        </Button>}
      >
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={5}>
            <Input
              placeholder="供应商编码"
              value={searchParams.supplierCode}
              onChange={(e) => setSearchParams({ ...searchParams, supplierCode: e.target.value })}
            />
          </Col>
          <Col span={5}>
            <Input
              placeholder="省份"
              value={searchParams.province}
              onChange={(e) => setSearchParams({ ...searchParams, province: e.target.value })}
            />
          </Col>
          <Col span={5}>
            <Select
              placeholder="合作状态"
              value={searchParams.cooperationStatus || undefined}
              onChange={(value) => setSearchParams({ ...searchParams, cooperationStatus: value })}
            >
              {cooperationStatusOptions.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={5}>
            <Input
              placeholder="全称模糊查询"
              value={searchParams.fullName}
              onChange={(e) => setSearchParams({ ...searchParams, fullName: e.target.value })}
            />
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
          scroll={{ x: 1800 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑供应商信息' : '添加供应商信息'}
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
                name="supplierCode"
                label="供应商编码"
                rules={[
                  { required: true, message: '请输入供应商编码' },
                  { pattern: /^[A-Za-z0-9_-]+$/, message: '供应商编码只能包含字母、数字、下划线和连字符' },
                  { max: 50, message: '供应商编码长度不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入供应商编码" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="supplierType" label="类型">
                <Select placeholder="请选择类型">
                  {supplierTypeOptions.map((item) => (
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
                name="province" 
                label="省份"
                rules={[{ pattern: /^[\u4e00-\u9fa5]+$/, message: '省份只能包含中文' }]}
              >
                <Input placeholder="请输入省份" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="city" 
                label="城市"
                rules={[{ pattern: /^[\u4e00-\u9fa5]+$/, message: '城市只能包含中文' }]}
              >
                <Input placeholder="请输入城市" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="nature" label="性质">
                <Select placeholder="请选择性质">
                  {natureOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="fullName" 
                label="全称"
                rules={[
                  { required: true, message: '请输入全称' },
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9()（）-]+$/, message: '全称只能包含中文、字母、数字和括号' },
                  { max: 200, message: '全称长度不能超过200个字符' },
                ]}
              >
                <Input placeholder="请输入全称" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="shortName" 
                label="简称"
                rules={[
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9]+$/, message: '简称只能包含中文、字母和数字' },
                  { max: 50, message: '简称长度不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入简称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="supplyMaterial" 
                label="供应料型"
                rules={[{ max: 200, message: '供应料型长度不能超过200个字符' }]}
              >
                <Input placeholder="请输入供应料型" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item 
                name="contactPerson" 
                label="联系人"
                rules={[
                  { pattern: /^[\u4e00-\u9fa5a-zA-Z]+$/, message: '联系人只能包含中文和字母' },
                  { max: 50, message: '联系人长度不能超过50个字符' },
                ]}
              >
                <Input placeholder="请输入联系人" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="contactPhone" 
                label="联系方式"
                rules={[
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式' },
                ]}
              >
                <Input placeholder="请输入手机号码" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="updatedDate" label="更新日期">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item 
                name="owner" 
                label="对接人"
                initialValue={currentUser?.username || ''}
              >
                <Input 
                  placeholder="请输入对接人" 
                  disabled 
                  style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="cooperationStatus" label="合作状态">
                <Select placeholder="请选择合作状态">
                  {cooperationStatusOptions.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
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

export default SupplierInfoPage;