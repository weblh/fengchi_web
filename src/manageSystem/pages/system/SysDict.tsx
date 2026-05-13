import React, { useState, useEffect } from 'react';
import {
  Card,
  Tree,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import request from '../../../utils/request';

const { Option } = Select;

interface DictItem {
  id: number;
  parentId: number;
  dictCode: string;
  dictName: string;
  dictValue: string | null;
  dictType: string;
  level: number;
  path: string;
  sortOrder: number;
  status: number;
  deleted: number;
  createTime: string;
  updateTime: string;
  remark: string | null;
  children?: DictItem[];
}

const SysDict: React.FC = () => {
  const [dictTree, setDictTree] = useState<DictItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<DictItem | null>(null);
  const [form] = Form.useForm();
  const [parentOptions, setParentOptions] = useState<{ value: number; label: string }[]>([]);

  const fetchDictTree = async () => {
    setLoading(true);
    try {
      const response = await request.get('/api/sys-dict/tree');
      setDictTree(response.data || response || []);
      // 生成父级选项
      const options: { value: number; label: string }[] = [];
      const flattenTree = (nodes: DictItem[]) => {
        nodes.forEach(node => {
          options.push({ value: node.id, label: `${node.dictName} (${node.dictCode})` });
          if (node.children && node.children.length > 0) {
            flattenTree(node.children);
          }
        });
      };
      flattenTree(response.data || response || []);
      setParentOptions(options);
    } catch (error) {
      message.error('获取字典树失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDictTree();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddChild = (parentId: number) => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({ parentId });
    setModalVisible(true);
  };

  const handleEdit = (item: DictItem) => {
    setEditingItem(item);
    form.setFieldsValue({
      dictCode: item.dictCode,
      dictName: item.dictName,
      dictValue: item.dictValue,
      parentId: item.parentId === 0 ? null : item.parentId
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await request.delete(`/api/sys-dict/delete/${id}`);
      message.success('删除成功');
      fetchDictTree();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSave = async (values: any) => {
    try {
      if (editingItem) {
        await request.put('/api/sys-dict/update', {
          id: editingItem.id,
          ...values
        });
        message.success('更新成功');
      } else {
        await request.post('/api/sys-dict/add', values);
        message.success('添加成功');
      }
      setModalVisible(false);
      fetchDictTree();
    } catch (error) {
      message.error(editingItem ? '更新失败' : '添加失败');
    }
  };

  const handleGetChildren = async (parentId: number) => {
    try {
      const response = await request.get(`/api/sys-dict/children?parentId=${parentId}`);
      message.info(`获取到 ${response.data?.length || 0} 个子字典`);
    } catch (error) {
      message.error('获取子字典失败');
    }
  };

  const treeData = dictTree.map(item => ({
    title: (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span>{item.dictName} ({item.dictCode})</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            icon={<PlusOutlined />}
            size="small"
            onClick={() => handleAddChild(item.id)}
          >
            新增子项
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(item)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除此字典项吗？"
            onConfirm={() => handleDelete(item.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
            >
              删除
            </Button>
          </Popconfirm>
          <Button
            size="small"
            onClick={() => handleGetChildren(item.id)}
          >
            查看子项
          </Button>
        </div>
      </div>
    ),
    key: item.id,
    children: item.children?.map(child => ({
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <span>{child.dictName} ({child.dictCode})</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              icon={<PlusOutlined />}
              size="small"
              onClick={() => handleAddChild(child.id)}
            >
              新增子项
            </Button>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(child)}
            >
              编辑
            </Button>
            <Popconfirm
              title="确定删除此字典项吗？"
              onConfirm={() => handleDelete(child.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              >
                删除
              </Button>
            </Popconfirm>
          </div>
        </div>
      ),
      key: child.id,
      children: child.children
    }))
  }));

  return (
    <div>
      <Card
        title="字典管理"
        extra={
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加字典项
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchDictTree}>
              刷新
            </Button>
          </div>
        }
      >
        <Tree
          treeData={treeData}
          loading={loading}
          blockNode
          defaultExpandAll
        />
      </Card>

      <Modal
        title={editingItem ? "编辑字典项" : "添加字典项"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={handleSave}
          layout="vertical"
        >
          <Form.Item
            name="dictCode"
            label="字典编码"
            rules={[{ required: true, message: '请输入字典编码' }]}
          >
            <Input placeholder="请输入字典编码" />
          </Form.Item>

          <Form.Item
            name="dictName"
            label="字典名称"
            rules={[{ required: true, message: '请输入字典名称' }]}
          >
            <Input placeholder="请输入字典名称" />
          </Form.Item>

          <Form.Item
            name="dictValue"
            label="字典值"
          >
            <Input placeholder="请输入字典值（可选）" />
          </Form.Item>

          <Form.Item
            name="parentId"
            label="父级字典"
          >
            <Select placeholder="请选择父级字典（可选）" allowClear>
              {parentOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
              保存
            </Button>
            <Button onClick={() => setModalVisible(false)}>
              取消
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SysDict;