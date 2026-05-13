import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload, Select, Input } from 'antd';
import type { SelectProps } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface ReceiptWeighingItem {
  id: number;
  sourceFile: string;
  documentNo: string;
  documentType: string;
  weighbridgeLocation: string;
  vehicleNo: string;
  entryDate: string;
  weighDate: string;
  entryTime: string;
  exitTime: string;
  weighTime: string;
  goodsName: string;
  specModel: string;
  supplierNo: string;
  supplierName: string;
  customerName: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  deductWeight: number;
  actualWeight: number;
  weighType: string;
  grossWeigher: string;
  tareWeigher: string;
  packageWeight: number;
  deduction: number;
  other: string;
  settlementQty: number;
  receivingWarehouse: string;
  originalQty: number;
  vehicleCount: number;
  contractNo: string;
  dispatchNo: string;
  noticeNo: string;
  receiver: string;
  exitWeigher: string;
  remark: string;
  isSummary: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const ReceiptWeighing: React.FC = () => {
  const [receiptWeighings, setReceiptWeighings] = useState<ReceiptWeighingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [suppliers, setSuppliers] = useState<{ value: string; label: string }[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [supplierSearch, setSupplierSearch] = useState<string>('');

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '单据编号',
      dataIndex: 'documentNo',
      key: 'documentNo',
    },
    {
      title: '来源文件',
      dataIndex: 'sourceFile',
      key: 'sourceFile',
    },
    {
      title: '过磅日期',
      dataIndex: 'weighDate',
      key: 'weighDate',
    },
    {
      title: '车辆编号',
      dataIndex: 'vehicleNo',
      key: 'vehicleNo',
    },
    {
      title: '货物名称',
      dataIndex: 'goodsName',
      key: 'goodsName',
    },
    {
      title: '规格型号',
      dataIndex: 'specModel',
      key: 'specModel',
    },
    {
      title: '供应商',
      dataIndex: 'supplierName',
      key: 'supplierName',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '毛重',
      dataIndex: 'grossWeight',
      key: 'grossWeight',
    },
    {
      title: '皮重',
      dataIndex: 'tareWeight',
      key: 'tareWeight',
    },
    {
      title: '净重',
      dataIndex: 'netWeight',
      key: 'netWeight',
    },
    {
      title: '扣重',
      dataIndex: 'deductWeight',
      key: 'deductWeight',
    },
    {
      title: '实收重量',
      dataIndex: 'actualWeight',
      key: 'actualWeight',
    },
    {
      title: '过磅类型',
      dataIndex: 'weighType',
      key: 'weighType',
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
      render: (_: any, record: ReceiptWeighingItem) => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSuppliers();
    fetchReceiptWeighings();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const data = await request.get<string[]>('/api/receipt-weighing-unified/supplier-names');
      const supplierOptions = data.map(supplier => ({
        value: supplier,
        label: supplier
      }));
      setSuppliers(supplierOptions);
    } catch (error) {
      console.error('获取供应商列表失败:', error);
      message.error('获取供应商列表失败');
    }
  };

  const fetchReceiptWeighings = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedSuppliers.length > 0) {
        params.suppliers = selectedSuppliers.join(',');
      }
      if (supplierSearch) {
        params.supplierSearch = supplierSearch;
      }
      const data = await request.get<ReceiptWeighingItem[]>('/api/receipt-weighing-unified/list', params);
      setReceiptWeighings(data);
    } catch (error) {
      console.error('获取大宗过磅记录失败:', error);
      message.error('获取大宗过磅记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/receipt-weighing-unified/${id}`);
      message.success('删除大宗过磅记录成功');
      fetchReceiptWeighings();
    } catch (error) {
      console.error('删除大宗过磅记录失败:', error);
      message.error('删除大宗过磅记录失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 获取 token
      const token = localStorage.getItem('token');
      
      // 构建完整的 URL
      const url = '/receipt-weighing-unified/export';
      
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
      link.download = `receipt_weighing_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      message.error('导出失败');
      console.error('Error exporting data:', error);
    }
  };

  // 处理供应商筛选
  const handleSupplierChange = (values: string[]) => {
    setSelectedSuppliers(values);
    fetchReceiptWeighings();
  };

  // 导入数据
  const uploadProps: UploadProps = {
    name: 'file',
    action: '/api/receipt-weighing-unified/import',
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchReceiptWeighings();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="大宗过磅管理" 
        extra={
          <Space size="middle">
            <Select
              mode="multiple"
              placeholder="选择供应商"
              style={{ width: 200 }}
              options={suppliers}
              value={selectedSuppliers}
              onChange={handleSupplierChange}
            />
            <Input
              placeholder="供应商搜索"
              style={{ width: 150 }}
              value={supplierSearch}
              onChange={(e) => setSupplierSearch(e.target.value)}
            />
            <Button onClick={fetchReceiptWeighings}>筛选</Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>导入</Button>
            </Upload>
            <Button type="primary">添加过磅记录</Button>
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={receiptWeighings.map(item => ({ ...item, key: item.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>
    </div>
  );
};

export default ReceiptWeighing;