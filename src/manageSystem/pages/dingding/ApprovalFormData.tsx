import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, message, Select, Modal, Space, Descriptions } from 'antd';
import { SearchOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import request from '../../../utils/request';

const { Search } = Input;
const { Option } = Select;

interface ApprovalFormData {
  id: number;
  processInstanceId: string;
  fieldId: string;
  fieldLabel: string;
  fieldType: string;
  fieldValue: string;
  valueType: string;
  sortOrder: number;
  createdAt: string;
}

const ApprovalFormData: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApprovalFormData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [fieldType, setFieldType] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ApprovalFormData | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.processInstanceId = searchTerm;
      if (fieldType) params.fieldType = fieldType;

      const response = await request.get('/api/approval-form-data', params);
      setData(response || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSearch = () => {
    fetchData();
  };

  const handleReset = () => {
    setSearchTerm('');
    setFieldType('');
    fetchData();
  };

  const handleViewDetail = (record: ApprovalFormData) => {
    setCurrentRecord(record);
    setDetailModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '审批实例ID',
      dataIndex: 'processInstanceId',
      key: 'processInstanceId',
      ellipsis: true,
    },
    {
      title: '字段组件ID',
      dataIndex: 'fieldId',
      key: 'fieldId',
      ellipsis: true,
    },
    {
      title: '字段显示名称',
      dataIndex: 'fieldLabel',
      key: 'fieldLabel',
      ellipsis: true,
    },
    {
      title: '字段类型',
      dataIndex: 'fieldType',
      key: 'fieldType',
      ellipsis: true,
    },
    {
      title: '字段值',
      dataIndex: 'fieldValue',
      key: 'fieldValue',
      ellipsis: true,
    },
    {
      title: '值类型',
      dataIndex: 'valueType',
      key: 'valueType',
      ellipsis: true,
    },
    {
      title: '排序顺序',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApprovalFormData) => (
        <Space size="middle">
          <Button
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="钉钉审批表单数据管理"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchData}
            loading={loading}
          >
            刷新
          </Button>
        }
      >
        <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Search
            placeholder="搜索审批实例ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 240 }}
            allowClear
          />
          <Select
            placeholder="字段类型"
            style={{ width: 160 }}
            value={fieldType}
            onChange={setFieldType}
            allowClear
          >
            <Option value="text">text</Option>
            <Option value="textarea">textarea</Option>
            <Option value="number">number</Option>
            <Option value="date">date</Option>
            <Option value="select">select</Option>
          </Select>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            搜索
          </Button>
          <Button onClick={handleReset}>
            重置
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />

        <Modal
          title="表单字段详情"
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setDetailModalVisible(false)}>
              关闭
            </Button>,
          ]}
        >
          {currentRecord && (
            <Descriptions column={1} bordered>
              <Descriptions.Item label="ID">{currentRecord.id}</Descriptions.Item>
              <Descriptions.Item label="审批实例ID">{currentRecord.processInstanceId}</Descriptions.Item>
              <Descriptions.Item label="字段组件ID">{currentRecord.fieldId}</Descriptions.Item>
              <Descriptions.Item label="字段显示名称">{currentRecord.fieldLabel}</Descriptions.Item>
              <Descriptions.Item label="字段类型">{currentRecord.fieldType}</Descriptions.Item>
              <Descriptions.Item label="字段值">
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{currentRecord.fieldValue}</pre>
              </Descriptions.Item>
              <Descriptions.Item label="值类型">{currentRecord.valueType}</Descriptions.Item>
              <Descriptions.Item label="排序顺序">{currentRecord.sortOrder}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{currentRecord.createdAt}</Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default ApprovalFormData;