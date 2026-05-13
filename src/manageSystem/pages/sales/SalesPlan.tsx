import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface SalesPlanItem {
  id: number;
  month: string;
  planQty: number;
  actualQty: number;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const SalesPlan: React.FC = () => {
  const [salesPlans, setSalesPlans] = useState<SalesPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '月份',
      dataIndex: 'month',
      key: 'month',
    },
    {
      title: '计划销量（吨）',
      dataIndex: 'planQty',
      key: 'planQty',
    },
    {
      title: '实际销量（吨）',
      dataIndex: 'actualQty',
      key: 'actualQty',
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
      render: (_: any, record: SalesPlanItem) => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSalesPlans();
  }, []);

  const fetchSalesPlans = async () => {
    try {
      setLoading(true);
      const data = await request.get<SalesPlanItem[]>('/api/sales-plan/list');
      setSalesPlans(data);
    } catch (error) {
      console.error('获取年度销量计划列表失败:', error);
      message.error('获取年度销量计划列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/sales-plan/${id}`);
      message.success('删除年度销量计划成功');
      fetchSalesPlans();
    } catch (error) {
      console.error('删除年度销量计划失败:', error);
      message.error('删除年度销量计划失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 构建完整的 URL
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${BASE_URL}/api/sales-plan/export`;
      
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
      link.download = `sales_plan_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/sales-plan/import`,
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchSalesPlans();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="年度销量计划表" 
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
            {/* <Button type="primary">添加销量计划</Button> */}
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={salesPlans.map(plan => ({ ...plan, key: plan.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>
    </div>
  );
};

export default SalesPlan;