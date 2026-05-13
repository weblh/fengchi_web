import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface SteelChemicalCompositionItem {
  id: number;
  materialName: string;
  c: string;
  si: string;
  mn: string;
  p: string;
  s: string;
  cu: string;
  cr: string;
  ni: string;
  mo: string;
  ti: string;
  al: string;
  v: string;
  b: string;
  sn: string;
  shelfLife: string;
  materialImg: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const SteelChemicalComposition: React.FC = () => {
  const [steelChemicalCompositions, setSteelChemicalCompositions] = useState<SteelChemicalCompositionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '料型名称',
      dataIndex: 'materialName',
      key: 'materialName',
    },
    {
      title: 'C%',
      dataIndex: 'c',
      key: 'c',
    },
    {
      title: 'Si%',
      dataIndex: 'si',
      key: 'si',
    },
    {
      title: 'Mn%',
      dataIndex: 'mn',
      key: 'mn',
    },
    {
      title: 'P%',
      dataIndex: 'p',
      key: 'p',
    },
    {
      title: 'S%',
      dataIndex: 's',
      key: 's',
    },
    {
      title: 'Cu%',
      dataIndex: 'cu',
      key: 'cu',
    },
    {
      title: 'Cr%',
      dataIndex: 'cr',
      key: 'cr',
    },
    {
      title: 'Ni%',
      dataIndex: 'ni',
      key: 'ni',
    },
    {
      title: 'Mo%',
      dataIndex: 'mo',
      key: 'mo',
    },
    {
      title: 'Ti%',
      dataIndex: 'ti',
      key: 'ti',
    },
    {
      title: 'Al%',
      dataIndex: 'al',
      key: 'al',
    },
    {
      title: 'V%',
      dataIndex: 'v',
      key: 'v',
    },
    {
      title: 'B%',
      dataIndex: 'b',
      key: 'b',
    },
    {
      title: 'Sn%',
      dataIndex: 'sn',
      key: 'sn',
    },
    {
      title: '保质期',
      dataIndex: 'shelfLife',
      key: 'shelfLife',
    },
    {
      title: '材料图路径',
      dataIndex: 'materialImg',
      key: 'materialImg',
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
      render: (_: any, record: SteelChemicalCompositionItem) => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchSteelChemicalCompositions();
  }, []);

  const fetchSteelChemicalCompositions = async () => {
    try {
      setLoading(true);
      const data = await request.get<SteelChemicalCompositionItem[]>('/api/steel-chemical-composition/list');
      setSteelChemicalCompositions(data);
    } catch (error) {
      console.error('获取废钢化学成分列表失败:', error);
      message.error('获取废钢化学成分列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/steel-chemical-composition/${id}`);
      message.success('删除废钢化学成分记录成功');
      fetchSteelChemicalCompositions();
    } catch (error) {
      console.error('删除废钢化学成分记录失败:', error);
      message.error('删除废钢化学成分记录失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 构建完整的 URL
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${BASE_URL}/api/steel-chemical-composition/export`;
      
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
      link.download = `steel_chemical_composition_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/steel-chemical-composition/import`,
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchSteelChemicalCompositions();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="废钢化学成分表" 
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
            {/* <Button type="primary">添加废钢化学成分记录</Button> */}
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={steelChemicalCompositions.map(item => ({ ...item, key: item.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>
    </div>
  );
};

export default SteelChemicalComposition;