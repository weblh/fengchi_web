import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload, Modal, DatePicker, Select, Checkbox } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

const { Option } = Select;

interface SupplierMonthlyTonnageItem {
  id: number;
  supplierName: string;
  materialType: string;
  month1Qty: number;
  month1Ratio: number;
  month2Qty: number;
  month2Ratio: number;
  month3Qty: number;
  month3Ratio: number;
  month4Qty: number;
  month4Ratio: number;
  month5Qty: number;
  month5Ratio: number;
  month6Qty: number;
  month6Ratio: number;
  month7Qty: number;
  month7Ratio: number;
  month8Qty: number;
  month8Ratio: number;
  month9Qty: number;
  month9Ratio: number;
  month10Qty: number;
  month10Ratio: number;
  month11Qty: number;
  month11Ratio: number;
  month12Qty: number;
  month12Ratio: number;
  totalQty: number;
  totalRatio: number;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const SupplierMonthlyTonnage: React.FC = () => {
  const [supplierMonthlyTonnages, setSupplierMonthlyTonnages] = useState<SupplierMonthlyTonnageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncModalVisible, setSyncModalVisible] = useState<boolean>(false);
  const [syncYear, setSyncYear] = useState<string>(dayjs().format('YYYY'));
  const [syncing, setSyncing] = useState<boolean>(false);
  
  // 固定的供应商列表
  const supplierOptions = [
    'FCR',
    '山西浩之顺',
    '晋源实业',
    '山西九州',
    '山西盛源',
    '山西华成',
    '陕西交通',
    '候马力信',
    '西安庆安'
  ];
  
  // 选中的供应商
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>(supplierOptions);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '供应商名称',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: '类型',
      dataIndex: 'materialType',
      key: 'materialType',
    },
    {
      title: '1月吨位',
      dataIndex: 'month1Qty',
      key: 'month1Qty',
    },
    {
      title: '1月占比（%）',
      dataIndex: 'month1Ratio',
      key: 'month1Ratio',
    },
    {
      title: '2月吨位',
      dataIndex: 'month2Qty',
      key: 'month2Qty',
    },
    {
      title: '2月占比（%）',
      dataIndex: 'month2Ratio',
      key: 'month2Ratio',
    },
    {
      title: '3月吨位',
      dataIndex: 'month3Qty',
      key: 'month3Qty',
    },
    {
      title: '3月占比（%）',
      dataIndex: 'month3Ratio',
      key: 'month3Ratio',
    },
    {
      title: '4月吨位',
      dataIndex: 'month4Qty',
      key: 'month4Qty',
    },
    {
      title: '4月占比（%）',
      dataIndex: 'month4Ratio',
      key: 'month4Ratio',
    },
    {
      title: '5月吨位',
      dataIndex: 'month5Qty',
      key: 'month5Qty',
    },
    {
      title: '5月占比（%）',
      dataIndex: 'month5Ratio',
      key: 'month5Ratio',
    },
    {
      title: '6月吨位',
      dataIndex: 'month6Qty',
      key: 'month6Qty',
    },
    {
      title: '6月占比（%）',
      dataIndex: 'month6Ratio',
      key: 'month6Ratio',
    },
    {
      title: '7月吨位',
      dataIndex: 'month7Qty',
      key: 'month7Qty',
    },
    {
      title: '7月占比（%）',
      dataIndex: 'month7Ratio',
      key: 'month7Ratio',
    },
    {
      title: '8月吨位',
      dataIndex: 'month8Qty',
      key: 'month8Qty',
    },
    {
      title: '8月占比（%）',
      dataIndex: 'month8Ratio',
      key: 'month8Ratio',
    },
    {
      title: '9月吨位',
      dataIndex: 'month9Qty',
      key: 'month9Qty',
    },
    {
      title: '9月占比（%）',
      dataIndex: 'month9Ratio',
      key: 'month9Ratio',
    },
    {
      title: '10月吨位',
      dataIndex: 'month10Qty',
      key: 'month10Qty',
    },
    {
      title: '10月占比（%）',
      dataIndex: 'month10Ratio',
      key: 'month10Ratio',
    },
    {
      title: '11月吨位',
      dataIndex: 'month11Qty',
      key: 'month11Qty',
    },
    {
      title: '11月占比（%）',
      dataIndex: 'month11Ratio',
      key: 'month11Ratio',
    },
    {
      title: '12月吨位',
      dataIndex: 'month12Qty',
      key: 'month12Qty',
    },
    {
      title: '12月占比（%）',
      dataIndex: 'month12Ratio',
      key: 'month12Ratio',
    },
    {
      title: '合计吨位',
      dataIndex: 'totalQty',
      key: 'totalQty',
    },
    {
      title: '合计占比（%）',
      dataIndex: 'totalRatio',
      key: 'totalRatio',
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
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
      width: 120,
      render: (_: any, record: SupplierMonthlyTonnageItem) => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSupplierMonthlyTonnages();
  }, []);

  // 当选中的供应商变化时重新获取数据
  useEffect(() => {
    fetchSupplierMonthlyTonnages();
  }, [selectedSuppliers]);

  const fetchSupplierMonthlyTonnages = async () => {
    try {
      setLoading(true);
      // 构建查询参数
      const params: any = {};
      if (selectedSuppliers.length > 0) {
        params.supplierName = selectedSuppliers;
      }
      const data = await request.get<SupplierMonthlyTonnageItem[]>('/api/supplier-monthly-tonnage/list', { params });
      setSupplierMonthlyTonnages(data);
    } catch (error) {
      console.error('获取供应商月度吨位列表失败:', error);
      message.error('获取供应商月度吨位列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/supplier-monthly-tonnage/${id}`);
      message.success('删除供应商月度吨位记录成功');
      fetchSupplierMonthlyTonnages();
    } catch (error) {
      console.error('删除供应商月度吨位记录失败:', error);
      message.error('删除供应商月度吨位记录失败');
    }
  };

  const handleSync = () => {
    setSyncYear(dayjs().format('YYYY'));
    setSyncModalVisible(true);
  };

  const confirmSync = async () => {
    try {
      setSyncing(true);
      await request.post(`/api/receipt-weighing-unified/sync-supplier-monthly-tonnage?year=${syncYear}`);
      message.success('同步供应商占比数据成功');
      setSyncModalVisible(false);
      fetchSupplierMonthlyTonnages();
    } catch (error) {
      console.error('同步供应商占比数据失败:', error);
      message.error('同步供应商占比数据失败');
    } finally {
      setSyncing(false);
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      const url = '/api/supplier-monthly-tonnage/export';
      
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
      link.download = `supplier_monthly_tonnage_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: '/api/supplier-monthly-tonnage/import',
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchSupplierMonthlyTonnages();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="供应商月度吨位表" 
        extra={
          <Space size="middle" wrap>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>供应商筛选：</span>
              <Select
                mode="multiple"
                style={{ width: 300 }}
                placeholder="请选择供应商"
                value={selectedSuppliers}
                onChange={setSelectedSuppliers}
              >
                {supplierOptions.map(supplier => (
                  <Option key={supplier} value={supplier}>{supplier}</Option>
                ))}
              </Select>
            </div>
            <Button
              icon={<SyncOutlined />}
              onClick={handleSync}
            >
              同步供应商占比数据
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>导入</Button>
            </Upload>
            <Button type="primary">添加供应商月度吨位记录</Button>
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={supplierMonthlyTonnages.map(item => ({ ...item, key: item.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
        <Modal
          title="同步供应商占比数据"
          open={syncModalVisible}
          onOk={confirmSync}
          onCancel={() => setSyncModalVisible(false)}
          confirmLoading={syncing}
        >
          <p>请选择要同步的年份：</p>
          <DatePicker
            picker="year"
            value={dayjs(syncYear, 'YYYY')}
            onChange={(date) => setSyncYear(date ? date.format('YYYY') : dayjs().format('YYYY'))}
            style={{ width: '100%' }}
          />
        </Modal>
      </Card>
    </div>
  );
};

export default SupplierMonthlyTonnage;