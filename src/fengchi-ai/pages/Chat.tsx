import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Select, Spin, message, Avatar, Tooltip, Drawer, Tree, Tag, Input as AntInput, Modal, List, Upload, Badge, Popconfirm, Empty } from 'antd';
import { SendOutlined, RobotOutlined, UserOutlined, DeleteOutlined, CopyOutlined, ApiOutlined, DatabaseOutlined, PlusOutlined, MessageOutlined, FileTextOutlined, ClusterOutlined, LikeOutlined, DislikeOutlined, UploadOutlined, ReloadOutlined, MenuOutlined } from '@ant-design/icons';
import apiData, { getApiInfoText, type ApiEndpoint } from '../data/apiData';
import AI_MODELS, { DEFAULT_MODEL } from '../config/models';

const { TextArea } = Input;

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  feedback?: 'like' | 'dislike' | null;
}

interface Session {
  id: number;
  title: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
}

interface Document {
  id: number;
  fileName: string;
  fileSize: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  indexed: boolean;
  createdAt: string;
  updatedAt: string;
}

const methodColors: Record<string, string> = {
  GET: '#52c41a',
  POST: '#1890ff',
  PUT: '#fa8c16',
  DELETE: '#f5222d',
};

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [apiDrawerVisible, setApiDrawerVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<any>(null);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionsDrawerVisible, setSessionsDrawerVisible] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [documentsDrawerVisible, setDocumentsDrawerVisible] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [vectorDrawerVisible, setVectorDrawerVisible] = useState(false);
  const [vectorIndexing, setVectorIndexing] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadSessions();
  }, []);

  const getUserId = (): number => {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.userId || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  };

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const getBaseUrl = () => {
    return import.meta.env.VITE_API_BASE_URL || '/api';
  };

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const callAiChat = async (content: string) => {
    try {
      const baseUrl = getBaseUrl();
      const url = `${baseUrl}/api/ai/chat`;
      
      const body = {
        msg: content,
        model: selectedModel,
        sessionId: currentSession?.id,
        userId: getUserId(),
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { ...getHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('AI 服务请求失败');

      const data = await response.json();
      console.log('AI Chat Response:', data);
      return data.data?.aiResponse?.content || data.message || data.content || data.data || 'AI 未返回有效内容';
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  };

  const loadSessions = async () => {
    setSessionLoading(true);
    try {
      const userId = getUserId();
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/sessions?userId=${userId}`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Load Sessions Response:', data);
        const sessionsList = data.data || data || [];
        sessionsList.sort((a: any, b: any) => {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });
        setSessions(sessionsList);
        if (sessionsList.length > 0 && !currentSession?.id) {
          await selectSession(sessionsList[0]);
        }
      }
    } catch (error) {
      console.error('Load sessions error:', error);
    } finally {
      setSessionLoading(false);
    }
  };

  const createSession = () => {
    setCurrentSession(null);
    setMessages([]);
  };

  const createSessionApi = async (msg?: string): Promise<number | undefined> => {
    try {
      const userId = getUserId();
      const baseUrl = getBaseUrl();
      const sessionTitle = msg ? `${msg.substring(0, 20)}${msg.length > 20 ? '...' : ''}` : `新会话 ${new Date().toLocaleString()}`;
      // 注释掉创建会话接口
      // const response = await fetch(`${baseUrl}/api/ai/sessions`, {
      //   method: 'POST',
      //   headers: getHeaders(),
      //   body: JSON.stringify({ userId, sessionTitle, sessionType: 'chat' }),
      // });
      // if (response.ok) {
      //   const data = await response.json();
      //   console.log('Create Session Response:', data);
      //   message.success('会话创建成功');
      //   await loadSessions();
      //   if (data.data?.id) {
      //     setCurrentSession({ ...data.data, messageCount: 0 });
      //     return data.data.id;
      //   }
      // }
    } catch (error) {
      console.error('Create session error:', error);
      message.error('创建会话失败');
    }
    return undefined;
  };

  const deleteSession = async (sessionId: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Delete Session Response:', data);
        message.success('会话已删除');
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }
        await loadSessions();
      }
    } catch (error) {
      console.error('Delete session error:', error);
      message.error('删除会话失败');
    }
  };

  const selectSession = async (session: Session) => {
    setCurrentSession(session);
    setSessionsDrawerVisible(false);
    setMessages([]);
    setLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/messages/${session.id}`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Select Session (Load Messages) Response:', data);
        const loadedMessages: Message[] = (data.data || data || []).map((m: any) => ({
          id: generateId(),
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: new Date(m.createdAt || Date.now()),
          feedback: m.feedback,
        }));
        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMessage = async (sessionId: number, role: string, content: string, feedback?: string) => {
    try {
      const userId = getUserId();
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ sessionId, userId, content, messageType: role, role }),
      });
      const data = await response.json();
      console.log('Save Message Response:', data);
    } catch (error) {
      console.error('Save message error:', error);
    }
  };

  const sendFeedback = async (messageId: string, feedbackType: 'like' | 'dislike') => {
    const msgIndex = messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const currentFeedback = messages[msgIndex].feedback;
    const newFeedback = currentFeedback === feedbackType ? null : feedbackType;

    setMessages(prev => prev.map((m, i) => i === msgIndex ? { ...m, feedback: newFeedback } : m));

    try {
      const baseUrl = getBaseUrl();
      const feedbackScore = newFeedback === 'like' ? 5 : newFeedback === 'dislike' ? 1 : 0;
      const response = await fetch(`${baseUrl}/api/ai/messages/${messageId}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ feedback: feedbackScore, feedbackRemark: newFeedback === 'like' ? '有帮助' : newFeedback === 'dislike' ? '没帮助' : '' }),
      });
      const data = await response.json();
      console.log('Send Feedback Response:', data);
    } catch (error) {
      console.error('Send feedback error:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue.trim();
    setInputValue('');
    setLoading(true);

    try {
      const aiContent = await callAiChat(currentInput);
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        model: selectedModel,
      };
      setMessages(prev => [...prev, aiMessage]);

      if (currentSession?.id) {
        await saveMessage(currentSession.id, 'user', currentInput);
        await saveMessage(currentSession.id, 'assistant', aiContent);
      } else {
        let sessionId = currentSession?.id;
        if (!sessionId) {
          sessionId = await createSessionApi(currentInput);
          await loadSessions();
        }
        if (sessionId) {
          await saveMessage(sessionId, 'user', currentInput);
          await saveMessage(sessionId, 'assistant', aiContent);
        }
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用，请稍后再试。',
        timestamp: new Date(),
        model: selectedModel,
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/documents`, {
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Load Documents Response:', data);
        setDocuments(data.data || data || []);
      }
    } catch (error) {
      console.error('Load documents error:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const uploadDocument = async (file: File) => {
    try {
      const userId = getUserId();
      const baseUrl = getBaseUrl();
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId.toString());

      const response = await fetch(`${baseUrl}/api/ai/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Upload Document Response:', data);
        message.success('文档上传成功');
        await loadDocuments();
      } else {
        message.error('文档上传失败');
      }
    } catch (error) {
      console.error('Upload document error:', error);
      message.error('文档上传失败');
    }
    return false;
  };

  const updateDocumentStatus = async (documentId: number, status: string) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/documents/${documentId}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Update Document Status Response:', data);
        message.success('状态更新成功');
        await loadDocuments();
      }
    } catch (error) {
      console.error('Update document status error:', error);
    }
  };

  const deleteDocument = async (documentId: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/documents/${documentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Delete Document Response:', data);
        message.success('文档已删除');
        await loadDocuments();
      }
    } catch (error) {
      console.error('Delete document error:', error);
    }
  };

  const createVectorIndex = async (documentId: number) => {
    setVectorIndexing(true);
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/vector-index`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ documentId, chunkIndex: 0, chunkContent: '' }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Create Vector Index Response:', data);
        message.success('向量索引创建成功');
        await loadDocuments();
      }
    } catch (error) {
      console.error('Create vector index error:', error);
    } finally {
      setVectorIndexing(false);
    }
  };

  const deleteVectorIndex = async (documentId: number) => {
    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/ai/vector-index/${documentId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Delete Vector Index Response:', data);
        message.success('向量索引已删除');
        await loadDocuments();
      }
    } catch (error) {
      console.error('Delete vector index error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    message.success('已复制到剪贴板');
  };

  const formatTime = (date: Date) => date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });

  const callApi = async (api: ApiEndpoint): Promise<any> => {
    const baseUrl = getBaseUrl();
    
    const options: RequestInit = {
      method: api.method,
      headers: getHeaders(),
    };

    let requestBody: string | undefined;
    if (api.method === 'POST' || api.method === 'PUT') {
      if (api.requestBody) {
        await new Promise<void>((resolve) => {
          Modal.confirm({
            title: '请输入请求参数',
            content: (
              <div>
                <p style={{ marginBottom: 8, color: '#666' }}>接口: {api.path}</p>
                <TextArea
                  id="request-body-input"
                  rows={6}
                  placeholder={api.requestBody}
                  defaultValue={api.requestBody}
                />
              </div>
            ),
            onOk: () => {
              const textarea = document.getElementById('request-body-input') as HTMLTextAreaElement;
              if (textarea) {
                try {
                  JSON.parse(textarea.value);
                  requestBody = textarea.value;
                } catch {
                  requestBody = textarea.value;
                }
              }
              resolve();
            },
            onCancel: () => {
              resolve();
            },
          });
        });
      }
    }
    
    if (requestBody) {
      options.body = requestBody;
    }

    let url: string;
    if (api.path.startsWith('http://') || api.path.startsWith('https://')) {
      url = api.path;
    } else if (api.path.startsWith('/api/')) {
      url = `${baseUrl}${api.path.substring(4)}`;
    } else {
      url = `${baseUrl}/api${api.path}`;
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`API 请求失败: ${response.status}`);
    }

    const data = await response.json();
    console.log(`API Response (${api.method} ${api.path}):`, data);
    return data;
  };

  const handleApiSelect = async (selectedKeys: React.Key[], info: any) => {
    if (!info.node.api) return;
    
    const api = info.node.api as ApiEndpoint;
    setApiDrawerVisible(false);
    setApiLoading(true);

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: `调用接口: ${api.title}\n路径: ${api.method} ${api.path}\n描述: ${api.description}`,
      timestamp: new Date(),
    };

    if (!currentSession?.id) {
      await createSessionApi(api.title);
    }
    
    setMessages(prev => [...prev, userMessage]);

    try {
      const apiResponse = await callApi(api);
      
      const promptForAi = `我调用了以下API接口，请帮我分析返回的数据：

接口信息:
- 名称: ${api.title}
- 方法: ${api.method}
- 路径: ${api.path}
- 描述: ${api.description}

返回数据:
\`\`\`json
${JSON.stringify(apiResponse, null, 2)}
\`\`\`

请对以上数据进行分析和总结。`;

      const aiContent = await callAiChat(promptForAi);
      
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date(),
        model: selectedModel,
      }]);
      
      await loadSessions();
    } catch (error: any) {
      console.error('API call error:', error);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'assistant',
        content: `接口调用失败: ${error.message || '未知错误'}\n\n接口信息:\n- 路径: ${api.method} ${api.path}\n- 描述: ${api.description}`,
        timestamp: new Date(),
        model: selectedModel,
      }]);
    } finally {
      setApiLoading(false);
    }
  };

  const convertToTreeData = () => {
    return apiData.map((category, ci) => ({
      key: `cat-${ci}`,
      title: (
        <span style={{ fontWeight: 500 }}>
          <DatabaseOutlined style={{ marginRight: 6, color: '#667eea' }} />
          {category.title}
        </span>
      ),
      children: category.children.map((api, ai) => ({
        key: `api-${ci}-${ai}`,
        title: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <Tag color={methodColors[api.method]} style={{ margin: 0, minWidth: 50, textAlign: 'center' }}>
              {api.method}
            </Tag>
            <span style={{ fontSize: 13 }}>{api.title}</span>
          </div>
        ),
        api,
      })),
    }));
  };

  const filteredTreeData = React.useMemo(() => {
    if (!searchValue) return convertToTreeData();
    const lowerSearch = searchValue.toLowerCase();
    return convertToTreeData().map(cat => ({
      ...cat,
      children: cat.children?.filter((item: any) => 
        item.title?.props?.children?.[1]?.props?.children?.toLowerCase().includes(lowerSearch) ||
        item.api?.path?.toLowerCase().includes(lowerSearch) ||
        item.api?.description?.toLowerCase().includes(lowerSearch)
      ),
    })).filter(cat => cat.children && cat.children.length > 0);
  }, [searchValue]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending: { color: 'default', text: '待处理' },
      processing: { color: 'processing', text: '处理中' },
      completed: { color: 'success', text: '已完成' },
      failed: { color: 'error', text: '失败' },
    };
    const s = statusMap[status] || statusMap.pending;
    return <Badge status={s.color as any} text={s.text} />;
  };

  const renderMessage = (msg: Message) => {
    const isUser = msg.role === 'user';
    return (
      <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
        <div style={{ display: 'flex', maxWidth: '75%', flexDirection: isUser ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: 12 }}>
          <Avatar style={{ backgroundColor: isUser ? '#1890ff' : '#722ed1', flexShrink: 0 }} icon={isUser ? <UserOutlined /> : <RobotOutlined />} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
              backgroundColor: isUser ? '#1890ff' : '#f5f5f5',
              color: isUser ? '#fff' : '#333',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}>
              {msg.content}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#999', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              <span>{formatTime(msg.timestamp)}</span>
              {msg.model && !isUser && <span style={{ padding: '2px 6px', backgroundColor: '#f0f0f0', borderRadius: 4, fontSize: 11 }}>{msg.model}</span>}
              {!isUser && (
                <>
                  <Tooltip title="有帮助"><LikeOutlined style={{ cursor: 'pointer', color: msg.feedback === 'like' ? '#52c41a' : undefined }} onClick={() => sendFeedback(msg.id, 'like')} /></Tooltip>
                  <Tooltip title="没帮助"><DislikeOutlined style={{ cursor: 'pointer', color: msg.feedback === 'dislike' ? '#f5222d' : undefined }} onClick={() => sendFeedback(msg.id, 'dislike')} /></Tooltip>
                  <Tooltip title="复制"><CopyOutlined style={{ cursor: 'pointer', fontSize: 14 }} onClick={() => copyMessage(msg.content)} /></Tooltip>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: '100vh', display: 'flex', background: '#f0f2f5' }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .chat-container::-webkit-scrollbar { width: 6px; }
        .chat-container::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 3px; }
        .chat-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 3px; }
        .chat-container::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.5); }
        .session-item:hover { background: #f5f5f5; }
        .session-item.active { background: #e6f7ff; }
      `}</style>
      
      <div style={{ width: 280, background: '#fff', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#333' }}>会话列表</h2>
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => createSession()} loading={sessionLoading}>新建</Button>
          </div>
          {/* <Button size="small" icon={<ReloadOutlined />} onClick={loadSessions} style={{ width: '100%' }}>刷新会话</Button> */}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          <Spin spinning={sessionLoading}>
            <List
              dataSource={sessions}
              renderItem={(session) => (
                <List.Item
                  className={`session-item ${currentSession?.id === session.id ? 'active' : ''}`}
                  style={{ padding: '12px 8px', cursor: 'pointer', borderRadius: 8, marginBottom: 4 }}
                  actions={[
                    <Popconfirm key="delete" title="确定删除此会话？" onConfirm={() => deleteSession(session.id)}>
                      <DeleteOutlined style={{ color: '#ff4d4f' }} />
                    </Popconfirm>
                  ]}
                  onClick={() => selectSession(session)}
                >
                  <List.Item.Meta
                    avatar={<MessageOutlined style={{ fontSize: 20, color: '#667eea' }} />}
                    title={<span style={{ fontSize: 14 }}>{session.sessionTitle || session.title || '未命名会话'}</span>}
                    description={<span style={{ fontSize: 12, color: '#999' }}>{session.updatedAt ? (new Date(session.updatedAt).toString() !== 'Invalid Date' ? new Date(session.updatedAt).toLocaleString() : '未知时间') : '未知时间'}</span>}
                  />
                </List.Item>
              )}
            />
          </Spin>
          {!sessionLoading && sessions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
              <MessageOutlined style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }} />
              <p>暂无会话</p>
              <p style={{ fontSize: 12 }}>点击上方按钮创建新会话</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20 }}><RobotOutlined /></div>
            <div>
              <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#333' }}>AI 智能助手</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                {currentSession ? `会话: ${currentSession.title}` : '新会话'}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Select value={selectedModel} onChange={setSelectedModel} style={{ width: 140 }} options={AI_MODELS} placeholder="选择模型" />
            <Tooltip title="API 接口库">
              <Button icon={<ApiOutlined />} onClick={() => setApiDrawerVisible(true)} style={{ borderRadius: 8 }} loading={apiLoading}>接口库</Button>
            </Tooltip>
            <Tooltip title="文档管理">
              <Button icon={<FileTextOutlined />} onClick={() => { setDocumentsDrawerVisible(true); loadDocuments(); }} style={{ borderRadius: 8 }}>文档</Button>
            </Tooltip>
            {/* <Tooltip title="向量索引">
              <Button icon={<ClusterOutlined />} onClick={() => setVectorDrawerVisible(true)} style={{ borderRadius: 8 }}>向量</Button>
            </Tooltip> */}
            <Tooltip title="清空对话">
              <Button icon={<DeleteOutlined />} onClick={() => { setMessages([]); message.success('对话已清空'); }} danger ghost />
            </Tooltip>
          </div>
        </div>

      <div className="chat-container" style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.9)' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24, animation: 'pulse 2s infinite' }}><RobotOutlined style={{ fontSize: 40 }} /></div>
            <h2 style={{ margin: 0, marginBottom: 8, fontSize: 24, fontWeight: 500 }}>欢迎使用 AI 智能助手</h2>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>选择模型并输入您的问题，开始智能对话</p>
            <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {['帮我写一段代码', '解释这个概念', '翻译这段文字', '帮我分析数据'].map(s => (
                <Button key={s} ghost style={{ borderRadius: 20, borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.9)' }} onClick={() => setInputValue(s)}>{s}</Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {(loading || apiLoading) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <Avatar style={{ backgroundColor: '#722ed1' }} icon={<RobotOutlined />} />
                  <div style={{ padding: '12px 16px', borderRadius: '4px 16px 16px 16px', backgroundColor: 'rgba(255,255,255,0.95)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Spin size="small" /><span style={{ color: '#666' }}>{apiLoading ? '正在调用接口...' : 'AI 正在思考...'}</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div style={{ padding: '16px 24px', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', maxWidth: 1000, margin: '0 auto' }}>
          <TextArea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入您的问题... (Shift+Enter 换行，Enter 发送)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{ borderRadius: 12, padding: '12px 16px', fontSize: 14, resize: 'none' }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={sendMessage}
            loading={loading}
            disabled={!inputValue.trim() || apiLoading}
            style={{ height: 'auto', padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}
          >发送</Button>
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 12, color: '#999', textAlign: 'center' }}>AI 生成内容仅供参考，请注意甄别</p>
      </div>

      <Drawer
        title={<span><FileTextOutlined style={{ marginRight: 8 }} />文档管理</span>}
        placement="right"
        width={600}
        open={documentsDrawerVisible}
        onClose={() => setDocumentsDrawerVisible(false)}
      >
        <div style={{ marginBottom: 16 }}>
          <Upload beforeUpload={uploadDocument} showUploadList={false} accept=".pdf,.doc,.docx,.txt">
            <Button icon={<UploadOutlined />}>上传文档</Button>
          </Upload>
          <Button icon={<ReloadOutlined />} onClick={loadDocuments} style={{ marginLeft: 8 }}>刷新</Button>
        </div>
        <Spin spinning={documentsLoading}>
          <List
            dataSource={documents}
            renderItem={(doc) => (
              <List.Item
                actions={[
                  <Select
                    key="status"
                    value={doc.status}
                    onChange={(value) => updateDocumentStatus(doc.id, value)}
                    style={{ width: 100 }}
                    size="small"
                    options={[
                      { value: 'pending', label: '待处理' },
                      { value: 'processing', label: '处理中' },
                      { value: 'completed', label: '已完成' },
                      { value: 'failed', label: '失败' },
                    ]}
                  />,
                  <Tooltip key="index" title={doc.indexed ? '删除向量索引' : '创建向量索引'}>
                    <Button
                      size="small"
                      icon={<ClusterOutlined />}
                      onClick={() => doc.indexed ? deleteVectorIndex(doc.id) : createVectorIndex(doc.id)}
                      loading={vectorIndexing}
                    />
                  </Tooltip>,
                  <Popconfirm key="delete" title="确定删除此文档？" onConfirm={() => deleteDocument(doc.id)}>
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24, color: '#667eea' }} />}
                  title={<span style={{ fontSize: 14 }}>{doc.fileName}</span>}
                  description={
                    <div style={{ fontSize: 12 }}>
                      <div>大小: {(doc.fileSize / 1024).toFixed(2)} KB</div>
                      <div>状态: {getStatusBadge(doc.status)} | 索引: {doc.indexed ? '是' : '否'}</div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
      </Drawer>

      <Drawer
        title={<span><ClusterOutlined style={{ marginRight: 8 }} />向量索引管理</span>}
        placement="right"
        width={500}
        open={vectorDrawerVisible}
        onClose={() => setVectorDrawerVisible(false)}
      >
        <p style={{ color: '#666', marginBottom: 16 }}>向量索引用于文档语义搜索功能。创建索引后可对文档内容进行语义查询。</p>
        <List
          dataSource={documents.filter(d => d.indexed)}
          renderItem={(doc) => (
            <List.Item
              actions={[
                <Popconfirm key="delete" title="确定删除此向量索引？" onConfirm={() => deleteVectorIndex(doc.id)}>
                  <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                </Popconfirm>
              ]}
            >
              <List.Item.Meta
                avatar={<ClusterOutlined style={{ fontSize: 24, color: '#722ed1' }} />}
                title={<span style={{ fontSize: 14 }}>{doc.fileName}</span>}
                description={<span style={{ fontSize: 12, color: '#999' }}>已建立向量索引</span>}
              />
            </List.Item>
          )}
        />
        {documents.filter(d => d.indexed).length === 0 && (
          <Empty description="暂无向量索引" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </Drawer>

      <Drawer
        title={<span><ApiOutlined style={{ marginRight: 8 }} />API 接口库 - 点击调用</span>}
        placement="right"
        width={500}
        open={apiDrawerVisible}
        onClose={() => setApiDrawerVisible(false)}
        styles={{ body: { padding: 0 } }}
      >
        <div style={{ padding: 12, borderBottom: '1px solid #f0f0f0' }}>
          <AntInput prefix={<ApiOutlined />} placeholder="搜索接口..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} allowClear />
        </div>
        <div style={{ padding: 12, maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
          <Tree
            showLine={{ showLeafIcon: false }}
            defaultExpandedKeys={['cat-0', 'cat-3']}
            treeData={filteredTreeData}
            onSelect={handleApiSelect}
          />
        </div>
        <div style={{ padding: 12, borderTop: '1px solid #f0f0f0', background: '#fafafa', fontSize: 12, color: '#999' }}>
          <ApiOutlined style={{ marginRight: 4 }} />点击接口将自动调用并让AI分析返回数据
        </div>
      </Drawer>
      </div>
    </div>
  );
};

export default Chat;
