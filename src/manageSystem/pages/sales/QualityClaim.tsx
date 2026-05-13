import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload, Modal } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined, EyeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface QualityClaimItem {
  id: number;
  claimDate: string;
  workshop: string;
  material: string;
  reason: string;
  amount: number;
  attachments: string;
  deleted: number;
  createTime: string;
  updateTime: string;
}

const QualityClaim: React.FC = () => {
  const [qualityClaims, setQualityClaims] = useState<QualityClaimItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewVisible, setPreviewVisible] = useState<boolean>(false);

  const BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '索赔日期',
      dataIndex: 'claimDate',
      key: 'claimDate',
    },
    {
      title: '车间',
      dataIndex: 'workshop',
      key: 'workshop',
    },
    {
      title: '物料',
      dataIndex: 'material',
      key: 'material',
    },
    {
      title: '索赔原因',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: '索赔金额（元）',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '附件列表',
      dataIndex: 'attachments',
      key: 'attachments',
      render: (text: string) => {
        if (!text) return '-';
        const fileName = text.split('/').pop() || text;
        const fullUrl = `${BASE_URL}${text}`;
        console.log('图片URL:', fullUrl);
        return (
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setPreviewImage(fullUrl);
              setPreviewVisible(true);
            }}
          >
            {fileName}
          </Button>
        );
      },
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
      render: (_: any, record: QualityClaimItem) => (
        <Space size="middle">
          <Button type="primary" size="small">编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchQualityClaims();
  }, []);

  const fetchQualityClaims = async () => {
    try {
      setLoading(true);
      const data = await request.get<QualityClaimItem[]>('/api/quality-claim/list');
      setQualityClaims(data);
    } catch (error) {
      console.error('获取质量索赔列表失败:', error);
      message.error('获取质量索赔列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/quality-claim/${id}`);
      message.success('删除质量索赔记录成功');
      fetchQualityClaims();
    } catch (error) {
      console.error('删除质量索赔记录失败:', error);
      message.error('删除质量索赔记录失败');
    }
  };

  // 导出数据
  const handleExport = async () => {
    try {
      // 构建完整的 URL
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${BASE_URL}/api/quality-claim/export`;
      
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
      link.download = `quality_claim_${dayjs().format('YYYY-MM-DD')}.xlsx`;
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
    action: `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/quality-claim/import`,
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchQualityClaims();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="质量索赔表" 
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
            {/* <Button type="primary">添加质量索赔记录</Button> */}
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={qualityClaims.map(claim => ({ ...claim, key: claim.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>

      {/* 图片预览 Modal */}
      <Modal
        open={previewVisible}
        title="图片预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width={800}
      >
        <img
          alt="预览"
          style={{ width: '100%' }}
          src={previewImage}
          onError={(e) => {
            console.error('图片加载失败，URL:', previewImage);
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3E图片加载失败%3C/text%3E%3C/svg%3E';
          }}
        />
      </Modal>
    </div>
  );
};

export default QualityClaim;