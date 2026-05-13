import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface InventoryItem {
  id: number;
  materialName: string;
  qualifiedQty: number;
  unqualifiedQty: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const Inventory: React.FC = () => {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: '合格库存（吨）',
      dataIndex: 'qualifiedQty',
      key: 'qualifiedQty',
    },
    {
      title: '不合格库存（吨）',
      dataIndex: 'unqualifiedQty',
      key: 'unqualifiedQty',
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
      render: (_: any, record: InventoryItem) => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const data = await request.get<InventoryItem[]>('/api/inventory/list');
      setInventories(data);
    } catch (error) {
      console.error('获取库存列表失败:', error);
      message.error('获取库存列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/inventory/${id}`);
      message.success('删除库存记录成功');
      fetchInventories();
    } catch (error) {
      console.error('删除库存记录失败:', error);
      message.error('删除库存记录失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 构建完整的 URL
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${BASE_URL}/api/inventory/export`;
      
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
      link.download = `inventory_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/inventory/import`,
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchInventories();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="库存表" 
        extra={
          <Space size="middle">
            <Button 
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出
            </Button>
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>导入</Button>
            </Upload>
            {/* <Button type="primary">添加库存记录</Button> */}
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={inventories.map(inventory => ({ ...inventory, key: inventory.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Inventory;