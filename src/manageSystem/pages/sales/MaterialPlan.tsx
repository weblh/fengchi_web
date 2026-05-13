import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Button, message, Upload, Modal, Form, Input, InputNumber, Row, Col, Divider, DatePicker } from 'antd';
import type { UploadProps } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import request from '../../../utils/request';

interface MaterialPlanItem {
  id: number;
  materialName: string;
  planQty: number;
  actualQty: number;
  month: string;
  year: number;
  deleted: number;
  createTime: string;
  updateTime: string;
}

interface SalesDetail {
  id: number;
  materialPlanId: number;
  materialName: string;
  documentNo: string;
  sourceFile: string;
  actualWeight: number;
  weighDate: string;
  customerName: string;
  supplierName: string;
  createTime: string;
}

const MaterialPlan: React.FC = () => {
  const [materialPlans, setMaterialPlans] = useState<MaterialPlanItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<MaterialPlanItem | null>(null);
  const [form] = Form.useForm();
  const [salesDetails, setSalesDetails] = useState<SalesDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [isSyncModalVisible, setIsSyncModalVisible] = useState<boolean>(false);
  const [weighingData, setWeighingData] = useState<any[]>([]);
  const [weighingLoading, setWeighingLoading] = useState<boolean>(false);
  const [selectedWeighingRows, setSelectedWeighingRows] = useState<any[]>([]);
  const [syncMaterial, setSyncMaterial] = useState<string>('');
  const [syncSupplier, setSyncSupplier] = useState<string>('');
  const [syncSourceFile, setSyncSourceFile] = useState<string>('');
  const [syncDateRange, setSyncDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

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
      title: '月份',
      dataIndex: 'month',
      key: 'month',
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
      width: 180,
      render: (_: any, record: MaterialPlanItem) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => handleEditPlan(record)}>编辑</Button>
          <Button danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const salesDetailColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '单据编号', dataIndex: 'documentNo', key: 'documentNo' },
    { title: '来源文件', dataIndex: 'sourceFile', key: 'sourceFile' },
    { title: '货物名称', dataIndex: 'materialName', key: 'materialName' },
    { title: '实收重量', dataIndex: 'actualWeight', key: 'actualWeight' },
    { title: '过磅日期', dataIndex: 'weighDate', key: 'weighDate' },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '供应商名称', dataIndex: 'supplierName', key: 'supplierName' },
  ];

  const weighingColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '单据编号', dataIndex: 'documentNo', key: 'documentNo' },
    { title: '来源文件', dataIndex: 'sourceFile', key: 'sourceFile' },
    { title: '货物名称', dataIndex: 'goodsName', key: 'goodsName' },
    { title: '规格型号', dataIndex: 'specModel', key: 'specModel' },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '供应商名称', dataIndex: 'supplierName', key: 'supplierName' },
    { title: '实收重量', dataIndex: 'actualWeight', key: 'actualWeight' },
    { title: '过磅日期', dataIndex: 'weighDate', key: 'weighDate' },
  ];

  useEffect(() => {
    fetchMaterialPlans();
  }, []);

  const fetchMaterialPlans = async () => {
    try {
      setLoading(true);
      const data = await request.get<MaterialPlanItem[]>('/api/material-plan/list');
      setMaterialPlans(data);
    } catch (error) {
      console.error('获取物料计划列表失败:', error);
      message.error('获取物料计划列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/material-plan/${id}`);
      message.success('删除物料计划成功');
      fetchMaterialPlans();
    } catch (error) {
      console.error('删除物料计划失败:', error);
      message.error('删除物料计划失败');
    }
  };

  const handleEditPlan = (plan: MaterialPlanItem) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      materialName: plan.materialName,
      planQty: plan.planQty,
      actualQty: plan.actualQty,
      month: plan.month,
      year: plan.year,
    });
    fetchSalesDetails(plan.id);
    setIsEditModalVisible(true);
  };

  const fetchSalesDetails = async (planId: number) => {
    try {
      setDetailLoading(true);
      const response = await request.get<any>(`/api/sales-detail/plan/${planId}`);
      const data = response.detailList || response;
      const details = Array.isArray(data) ? data : [];
      setSalesDetails(details);
      
      // 计算实收重量合计并更新表单中的实际销量
      const totalActualWeight = details.reduce((sum, detail) => sum + (detail.actualWeight || 0), 0);
      form.setFieldValue('actualQty', totalActualWeight);
    } catch (error) {
      console.error('获取销售明细失败:', error);
      message.error('获取销售明细失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleUpdatePlan = async (values: any) => {
    try {
      if (!editingPlan) return;
      const requestData = {
        ...values,
        id: editingPlan.id
      };
      await request.put('/api/material-plan', requestData);
      message.success('更新物料计划成功');
      setIsEditModalVisible(false);
      fetchMaterialPlans();
    } catch (error) {
      console.error('更新物料计划失败:', error);
      message.error('更新物料计划失败');
    }
  };

  const handleOpenSyncModal = () => {
    if (!editingPlan) return;
    setSyncMaterial(editingPlan.materialName || '');
    setWeighingData([]);
    setIsSyncModalVisible(true);
  };

  const fetchWeighingData = async () => {
    try {
      setWeighingLoading(true);
      const params: any = {};
      if (syncMaterial) {
        params.material = syncMaterial;
      }
      if (syncSupplier) {
        params.supplier = syncSupplier;
      }
      if (syncSourceFile) {
        params.sourceFile = syncSourceFile;
      }
      if (syncDateRange) {
        params.startDate = syncDateRange[0].format('YYYY-MM-DD');
        params.endDate = syncDateRange[1].format('YYYY-MM-DD');
      }
      const data = await request.get<any[]>('/api/order-detail/receipt-weighing', params);
      setWeighingData(data || []);
    } catch (error) {
      console.error('获取大宗数据失败:', error);
      message.error('获取大宗数据失败');
    } finally {
      setWeighingLoading(false);
    }
  };

  const handleSyncDetails = async () => {
    if (!editingPlan || selectedWeighingRows.length === 0) return;
    try {
      const selectedIds = selectedWeighingRows.map(row => row.id);
      await request.post(`/api/sales-detail/sync-selected?planId=${editingPlan.id}`, selectedIds);
      message.success('同步明细成功');
      setIsSyncModalVisible(false);
      setSelectedWeighingRows([]);
      if (editingPlan) {
        await fetchSalesDetails(editingPlan.id);
      }
    } catch (error) {
      console.error('同步明细失败:', error);
      message.error('同步明细失败');
    }
  };

  const handleDeleteDetail = async (detailId: number) => {
    try {
      await request.delete(`/api/sales-detail/${detailId}`);
      message.success('删除明细成功');
      if (editingPlan) {
        await fetchSalesDetails(editingPlan.id);
      }
    } catch (error) {
      console.error('删除明细失败:', error);
      message.error('删除明细失败');
    }
  };

  const handleExport = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
      const url = `${BASE_URL}/api/material-plan/export`;
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `material_plan_${dayjs().format('YYYY-MM-DD')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(urlBlob);
    } catch (error) {
      message.error('导出失败');
      console.error('Error exporting data:', error);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    action: `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/material-plan/import`,
    headers: {
      'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
    },
    onChange(info) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 导入成功`);
        fetchMaterialPlans();
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 导入失败`);
      }
    },
  };

  return (
    <div>
      <Card 
        title="物料计划表" 
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
          </Space>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table 
            columns={columns} 
            dataSource={materialPlans.map(plan => ({ ...plan, key: plan.id }))} 
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{ scrollToFirstRowOnChange: true }}
          />
        </div>
      </Card>

      <Modal
        title="编辑物料计划"
        open={isEditModalVisible}
        onCancel={() => setIsEditModalVisible(false)}
        footer={null}
        width={1200}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdatePlan}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="materialName"
                label="物料名称"
                rules={[{ required: true, message: '请输入物料名称' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="planQty"
                label="计划销量（吨）"
                rules={[{ required: true, message: '请输入计划销量' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="actualQty"
                label="实际销量（吨）"
              >
                <InputNumber style={{ width: '100%' }} disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="month"
                label="月份"
                rules={[{ required: true, message: '请输入月份' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="year"
                label="年份"
                rules={[{ required: true, message: '请输入年份' }]}
              >
                <InputNumber style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24} style={{ textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsEditModalVisible(false)}>取消</Button>
                <Button type="primary" htmlType="submit">提交</Button>
              </Space>
            </Col>
          </Row>
        </Form>

        <Divider />
        
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Button type="primary" onClick={handleOpenSyncModal}>同步明细</Button>
            <Button onClick={() => editingPlan && fetchSalesDetails(editingPlan.id)}>刷新</Button>
          </Space>
        </div>

        <Table
          dataSource={salesDetails.map(detail => ({ ...detail, key: detail.id }))}
          loading={detailLoading}
          pagination={false}
          scroll={{ x: 'max-content' }}
        >
          {salesDetailColumns.map(({ key, ...colProps }) => (
            <Table.Column key={key} {...colProps} />
          ))}
          <Table.Column
            title="操作"
            key="action"
            render={(_: any, record: SalesDetail) => (
              <Button danger size="small" onClick={() => handleDeleteDetail(record.id)}>删除</Button>
            )}
          />
        </Table>
      </Modal>

      <Modal
        title="同步明细"
        open={isSyncModalVisible}
        onCancel={() => {
          setIsSyncModalVisible(false);
          setSelectedWeighingRows([]);
          setSyncMaterial('');
          setSyncSupplier('');
          setSyncSourceFile('');
          setSyncDateRange(null);
        }}
        footer={
          <Space>
            <Button onClick={() => {
              setIsSyncModalVisible(false);
              setSelectedWeighingRows([]);
              setSyncMaterial('');
              setSyncSupplier('');
              setSyncSourceFile('');
              setSyncDateRange(null);
            }}>取消</Button>
            <Button type="primary" onClick={handleSyncDetails}>确认同步</Button>
          </Space>
        }
        width={1000}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Input
              placeholder="物料名称"
              value={syncMaterial}
              onChange={(e) => setSyncMaterial(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="供应商名称"
              value={syncSupplier}
              onChange={(e) => setSyncSupplier(e.target.value)}
              style={{ width: 180 }}
            />
            <Input
              placeholder="来源文件"
              value={syncSourceFile}
              onChange={(e) => setSyncSourceFile(e.target.value)}
              style={{ width: 180 }}
            />
            <DatePicker.RangePicker
              value={syncDateRange}
              onChange={(dates) => setSyncDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
              style={{ width: 250 }}
              placeholder={['开始日期', '结束日期']}
            />
            <Button type="primary" onClick={fetchWeighingData}>查询</Button>
          </Space>
        </div>
        <Table
          dataSource={weighingData.map(item => ({ ...item, key: item.id }))}
          loading={weighingLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
          rowSelection={{
            selectedRowKeys: selectedWeighingRows.map(row => row.id),
            onChange: (selectedRowKeys, selectedRows) => {
              setSelectedWeighingRows(selectedRows);
            },
          }}
          columns={weighingColumns}
        />
      </Modal>
    </div>
  );
};

export default MaterialPlan;