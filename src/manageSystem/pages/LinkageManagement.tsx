import React, { useState, useEffect } from 'react';
import { Table, Button, Upload, message, Modal, Checkbox, Space, Select, Card, Radio } from 'antd';
import { DeleteOutlined, UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const { Option } = Select;

interface SteelPrice {
  id: number;
  date: string;
  beijing68mm: number;
  guangzhou68mm: number;
  guangzhouHeavy: number;
  taiyuanHeavy: number;
  beijingHeavy: number;
  shijiazhuangHeavy: number;
  beijing_6_8mm: number;
  guangzhou_6_8mm: number;
  guangzhou_heavy: number;
  taiyuan_heavy: number;
  beijing_heavy: number;
  shijiazhuang_heavy: number;
  liaocheng_steel_plate: number;
  ningxia_sife: number;
  gansu_sife: number;
  inner_mongolia_simn: number;
  createTime: string;
  updateTime: string;
  deleted: number;
}

interface Pagination {
  pageNum: number;
  pageSize: number;
  total: number;
}

interface QueryRule {
  name: string;
  key: string;
  fields: Array<{
    name: string;
    key: string;
  }>;
}

const BAICHUAN_RULES: QueryRule[] = [
  {
    name: '罐子料',
    key: 'guanliao',
    fields: [
      { name: '北京6-8mm', key: 'beijing68mm' },
      { name: '广州6-8mm', key: 'guangzhou68mm' },
      { name: '广州重废', key: 'guangzhouHeavy' },
      { name: '太原重废', key: 'taiyuanHeavy' }
    ]
  },
  {
    name: '灰铁废铸件',
    key: 'huitie',
    fields: [
      { name: '北京重废', key: 'beijingHeavy' },
      { name: '广州重废', key: 'guangzhouHeavy' },
      { name: '太原重废', key: 'taiyuanHeavy' }
    ]
  },
  {
    name: '除锈二级',
    key: 'chuxiu',
    fields: [
      { name: '太原重废', key: 'taiyuanHeavy' },
      { name: '北京重废', key: 'beijingHeavy' },
      { name: '石家庄重废', key: 'shijiazhuangHeavy' }
    ]
  }
];

const FUBAO_RULES: QueryRule[] = [
  {
    name: '冲子料',
    key: 'chongzi',
    fields: [
      { name: '聊城钢板料（≥10mm）', key: 'liaochengSteelplate' }
    ]
  },
  {
    name: '硅铁',
    key: 'guitie',
    fields: [
      { name: '宁夏硅铁（72#）', key: 'ningxiaSife' },
      { name: '甘肃硅铁（75#）', key: 'gansuSife' }
    ]
  },
  {
    name: '内蒙硅锰',
    key: 'neimeng',
    fields: [
      { name: '内蒙硅锰（6517）', key: 'innerMongoliaSimn' }
    ]
  }
];

const LinkageManagement: React.FC = () => {
  const [steelPrices, setSteelPrices] = useState<SteelPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    pageNum: 1,
    pageSize: 10,
    total: 0
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [batchDeleteModalVisible, setBatchDeleteModalVisible] = useState(false);
  const [currentDeleteId, setCurrentDeleteId] = useState<number | null>(null);
  const [queryType, setQueryType] = useState<'baichuan' | 'fubao'>('baichuan');
  const [selectedRule, setSelectedRule] = useState<string>('');

  const fetchSteelPrices = async () => {
    setLoading(true);
    try {
      const ruleFields = selectedRule 
        ? getCurrentRules().find(r => r.key === selectedRule)?.fields.map(f => f.key).join(',')
        : '';
      const data = await request.get('/api/steel-prices/list', {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        type: queryType,
        rule: ruleFields
      });
      setSteelPrices(data.records);
      setPagination({
        ...pagination,
        total: data.total
      });
    } catch (error) {
      console.error('Error fetching steel prices:', error);
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSteelPrices();
  }, [pagination.pageNum, pagination.pageSize, queryType, selectedRule]);

  const getCurrentRules = (): QueryRule[] => {
    return queryType === 'baichuan' ? BAICHUAN_RULES : FUBAO_RULES;
  };

  const handleQueryTypeChange = (value: 'baichuan' | 'fubao') => {
    setQueryType(value);
    setSelectedRule('');
    // 不再手动调用 fetchSteelPrices，由 useEffect 自动处理
  };

  const handleDelete = async () => {
    if (currentDeleteId) {
      try {
        await request.delete(`/api/steel-prices/${currentDeleteId}`);
        message.success('删除成功');
        setDeleteModalVisible(false);
        fetchSteelPrices();
      } catch (error) {
        console.error('Error deleting steel price:', error);
        message.error('删除失败');
      }
    }
  };

  const showDeleteModal = (id: number) => {
    setCurrentDeleteId(id);
    setDeleteModalVisible(true);
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) {
      message.warning('请选择要删除的记录');
      return;
    }
    setBatchDeleteModalVisible(true);
  };

  const confirmBatchDelete = async () => {
    try {
      await request.post('/api/steel-prices/batch-delete', {
        ids: selectedIds
      });
      message.success('批量删除成功');
      setBatchDeleteModalVisible(false);
      setSelectedIds([]);
      fetchSteelPrices();
    } catch (error) {
      console.error('Error batch deleting steel prices:', error);
      message.error('批量删除失败');
    }
  };

  const handleImport = async () => {
    if (!file) {
      message.warning('请选择要导入的Excel文件');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      await request.post('/api/steel-prices/import', formData);
      message.success('导入成功');
      setFile(null);
      fetchSteelPrices();
    } catch (error) {
      console.error('Error importing steel prices:', error);
      message.error('导入失败');
    }
  };

  const handleExport = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 构建查询参数
      const params = new URLSearchParams();
      params.append('type', queryType);
      
      // 添加查询规则参数
      if (selectedRule) {
        const ruleFields = getCurrentRules().find(r => r.key === selectedRule)?.fields.map(f => f.key).join(',') || '';
        params.append('rule', ruleFields);
      }
      
      // 构建导出URL
      const exportUrl = `/api/steel-prices/export?${params.toString()}`;
      
      const response = await fetch(exportUrl, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // 获取选中的查询规则名称
      const ruleName = selectedRule 
        ? getCurrentRules().find(r => r.key === selectedRule)?.name || ''
        : '';
      
      // 构建下载文件名
      const fileName = `${queryType === 'baichuan' ? '百川网' : '富宝网'}${ruleName ? ruleName : '数据'}-${new Date().toISOString().split('T')[0]}.xlsx`;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      message.success('导出成功');
    } catch (error) {
      console.error('Error exporting steel prices:', error);
      message.error('导出失败');
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination({ 
      pageNum: page, 
      pageSize, 
      total: pagination.total 
    });
  };

  const handleCheckboxChange = (id: number) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(steelPrices.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const getColumns = () => {
    const baseColumns = [
      {
        title: (
          <Checkbox 
            onChange={handleSelectAll}
            checked={steelPrices.length > 0 && selectedIds.length === steelPrices.length}
          />
        ),
        key: 'selection',
        render: (_: any, record: SteelPrice) => (
          <Checkbox 
            checked={selectedIds.includes(record.id)}
            onChange={() => handleCheckboxChange(record.id)}
          />
        ),
        width: 60
      },
      {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 80
      },
      {
        title: '日期',
        dataIndex: 'date',
        key: 'date',
        render: (date: string) => new Date(date).toLocaleDateString(),
        width: 120
      }
    ];

    const actionColumn = {
      title: '操作',
      key: 'action',
      render: (_: any, record: SteelPrice) => (
        <Button 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => showDeleteModal(record.id)}
        >
          删除
        </Button>
      ),
      width: 100
    };

    if (selectedRule) {
      const currentRule = getCurrentRules().find(r => r.key === selectedRule);
      if (currentRule) {
        const ruleColumns = currentRule.fields.map(field => ({
          title: field.name,
          dataIndex: field.key,
          key: field.key
        }));
        return [...baseColumns, ...ruleColumns, actionColumn];
      }
    }

    if (queryType === 'baichuan') {
      return [
        ...baseColumns,
        {
          title: '北京6-8mm',
          dataIndex: 'beijing68mm',
          key: 'beijing68mm'
        },
        {
          title: '广州6-8mm',
          dataIndex: 'guangzhou68mm',
          key: 'guangzhou68mm'
        },
        {
          title: '广州重废',
          dataIndex: 'guangzhouHeavy',
          key: 'guangzhouHeavy'
        },
        {
          title: '太原重废',
          dataIndex: 'taiyuanHeavy',
          key: 'taiyuanHeavy'
        },
        {
          title: '北京重废',
          dataIndex: 'beijingHeavy',
          key: 'beijingHeavy'
        },
        {
          title: '石家庄重废',
          dataIndex: 'shijiazhuangHeavy',
          key: 'shijiazhuangHeavy'
        },
        actionColumn
      ];
    } else {
      return [
        ...baseColumns,
        {
          title: '聊城钢板料（≥10mm）',
          dataIndex: 'liaochengSteelplate',
          key: 'liaochengSteelplate'
        },
        {
          title: '宁夏硅铁（72#）',
          dataIndex: 'ningxiaSife',
          key: 'ningxiaSife'
        },
        {
          title: '甘肃硅铁（75#）',
          dataIndex: 'gansuSife',
          key: 'gansuSife'
        },
        {
          title: '内蒙硅锰（6517）',
          dataIndex: 'innerMongoliaSimn',
          key: 'innerMongoliaSimn'
        },
        actionColumn
      ];
    }
  };

  const columns = getColumns();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">联动管理</h1>
        <Space>
          <Upload
            accept=".xlsx,.xls"
            showUploadList={false}
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
          >
            <Button icon={<UploadOutlined />} onClick={handleImport}>
              导入
            </Button>
          </Upload>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
          <Button 
            danger 
            onClick={handleBatchDelete}
            disabled={selectedIds.length === 0}
          >
            批量删除
          </Button>
        </Space>
      </div>

      <Card className="mb-6">
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <div>
            <span className="mr-4 font-medium">接口类型：</span>
            <Radio.Group value={queryType} onChange={(e) => handleQueryTypeChange(e.target.value)}>
              <Radio.Button value="baichuan">百川接口</Radio.Button>
              <Radio.Button value="fubao">富宝接口</Radio.Button>
            </Radio.Group>
          </div>
          <div>
            <span className="mr-4 font-medium">查询规则：</span>
            <Select
              style={{ width: 300 }}
              placeholder="请选择查询规则"
              value={selectedRule || undefined}
              onChange={(value) => setSelectedRule(value)}
              allowClear
            >
              {getCurrentRules().map((rule) => (
                <Option key={rule.key} value={rule.key}>
                  {rule.name}
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={steelPrices}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.pageNum,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: handlePageChange,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `共 ${total} 条记录`
        }}
      />

      {/* 删除确认对话框 */}
      <Modal
        title="确认删除"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <p>确定要删除这条记录吗？</p>
      </Modal>

      {/* 批量删除确认对话框 */}
      <Modal
        title="批量删除"
        open={batchDeleteModalVisible}
        onOk={confirmBatchDelete}
        onCancel={() => setBatchDeleteModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <p>确定要批量删除选中的 {selectedIds.length} 条记录吗？</p>
      </Modal>
    </div>
  );
};

export default LinkageManagement;