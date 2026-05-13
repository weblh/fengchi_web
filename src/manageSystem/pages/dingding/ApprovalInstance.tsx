import React, { useState, useEffect } from 'react';
import { Card, Table, Input, Button, message, DatePicker, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import request from '../../../utils/request';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ApprovalInstance {
  id: number;
  processInstanceId: string;
  businessId: string;
  title: string;
  submitterId: string;
  submitterName: string;
  submitDept: string;
  submitTime: string;
  finishTime: string;
  result: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const ApprovalInstance: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApprovalInstance[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [result, setResult] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchTerm) params.processInstanceId = searchTerm;
      if (dateRange) {
        params.startDate = dateRange[0];
        params.endDate = dateRange[1];
      }
      if (result) params.result = result;

      const response = await request.get('/api/approval-instances', params);
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
    setDateRange(null);
    setResult('');
    fetchData();
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
      title: '业务关联ID',
      dataIndex: 'businessId',
      key: 'businessId',
      ellipsis: true,
    },
    {
      title: '审批标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '提交人',
      dataIndex: 'submitterName',
      key: 'submitterName',
    },
    {
      title: '提交部门',
      dataIndex: 'submitDept',
      key: 'submitDept',
      ellipsis: true,
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
      ellipsis: true,
    },
    {
      title: '完成时间',
      dataIndex: 'finishTime',
      key: 'finishTime',
      ellipsis: true,
    },
    {
      title: '审批结果',
      dataIndex: 'result',
      key: 'result',
      render: (text: string) => (
        <span style={{ color: text === 'agree' ? '#52c41a' : '#ff4d4f' }}>
          {text === 'agree' ? '同意' : '拒绝'}
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => (
        <span style={{ color: text === 'FINISHED' ? '#1890ff' : '#faad14' }}>
          {text === 'FINISHED' ? '已结束' : text}
        </span>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card
        title="钉钉审批实例管理"
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
          <RangePicker
            style={{ width: 300 }}
            onChange={(dates, dateStrings) => setDateRange(dateStrings as [string, string])}
          />
          <Select
            placeholder="审批结果"
            style={{ width: 120 }}
            value={result}
            onChange={setResult}
            allowClear
          >
            <Option value="agree">同意</Option>
            <Option value="refuse">拒绝</Option>
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
      </Card>
    </div>
  );
};

export default ApprovalInstance;