import React, { useState, useEffect } from 'react';
import { Card, Table, Row, Col, Tag, Button, Badge } from 'antd';

interface SteelPriceData {
  id: string;
  millName: string;
  materialName: string;
  region: string;
  spec: string;
  price: number;
  lastPrice: number;
  date: string;
}

interface MillInfo {
  name: string;
  tag: string;
  color: string;
}

const mills: MillInfo[] = [
  { name: '山西立恒', tag: 'liheng', color: '#6d28d9' },
  { name: '山西建邦', tag: 'jianbang', color: '#1d4ed8' },
  { name: '首钢长治钢铁', tag: 'shougang', color: '#c2410c' },
];

const mockSteelData: SteelPriceData[] = [
  { id: '1', millName: '山西立恒', materialName: '钢筋头', region: '山西', spec: '—', price: 2360, lastPrice: 2340, date: '05-06' },
  { id: '2', millName: '山西立恒', materialName: '优质废钢', region: '山西', spec: '—', price: 2320, lastPrice: 2350, date: '05-06' },
  { id: '3', millName: '山西立恒', materialName: '道轨', region: '山西', spec: '—', price: 2320, lastPrice: 2320, date: '05-06' },
  { id: '4', millName: '山西立恒', materialName: '冲子料', region: '山西', spec: '—', price: 2300, lastPrice: 2300, date: '05-06' },
  { id: '5', millName: '山西立恒', materialName: '废钢', region: '山西', spec: '—', price: 2300, lastPrice: 2300, date: '05-06' },
  { id: '6', millName: '山西立恒', materialName: '钢筋压块', region: '山西', spec: '—', price: 2290, lastPrice: 2290, date: '05-06' },
  { id: '7', millName: '山西立恒', materialName: '缸体', region: '山西', spec: '—', price: 2270, lastPrice: 2270, date: '05-06' },
  { id: '8', millName: '山西立恒', materialName: '马蹄铁', region: '山西', spec: '—', price: 2270, lastPrice: 2270, date: '05-06' },
  { id: '9', millName: '山西立恒', materialName: '一级废钢压块', region: '山西', spec: '—', price: 2240, lastPrice: 2240, date: '05-06' },
  { id: '10', millName: '山西立恒', materialName: '边角料', region: '山西', spec: '—', price: 2230, lastPrice: 2230, date: '05-06' },
  { id: '11', millName: '山西建邦', materialName: '特级(15)', region: '山西', spec: '—', price: 2310, lastPrice: 2290, date: '05-06' },
  { id: '12', millName: '山西建邦', materialName: '重一(10)', region: '山西', spec: '—', price: 2270, lastPrice: 2270, date: '05-06' },
  { id: '13', millName: '山西建邦', materialName: '重二(6-8-10)', region: '山西', spec: '—', price: 2240, lastPrice: 2240, date: '05-06' },
  { id: '14', millName: '山西建邦', materialName: '重三(4-6)', region: '山西', spec: '—', price: 2200, lastPrice: 2200, date: '05-06' },
  { id: '15', millName: '山西建邦', materialName: '剪切料一级≥3mm', region: '山西', spec: '—', price: 2160, lastPrice: 2160, date: '05-06' },
  { id: '16', millName: '山西建邦', materialName: '破碎料一级＞2mm', region: '山西', spec: '—', price: 2130, lastPrice: 2130, date: '05-06' },
  { id: '17', millName: '首钢长治钢铁', materialName: '重优', region: '山西', spec: '—', price: 2670, lastPrice: 2680, date: '05-06' },
  { id: '18', millName: '首钢长治钢铁', materialName: '重一', region: '山西', spec: '—', price: 2630, lastPrice: 2630, date: '05-06' },
  { id: '19', millName: '首钢长治钢铁', materialName: '重二', region: '山西', spec: '—', price: 2600, lastPrice: 2600, date: '05-06' },
  { id: '20', millName: '首钢长治钢铁', materialName: '统料', region: '山西', spec: '—', price: 2510, lastPrice: 2500, date: '05-06' },
];

const SteelDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'level1' | 'level2'>('level1');
  const [selectedMill, setSelectedMill] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [data, setData] = useState<SteelPriceData[]>(mockSteelData);
  const [highlightRow, setHighlightRow] = useState<string | null>(null);
  const [updateTime, setUpdateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setUpdateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateChange = (current: number, last: number): { value: number; type: 'up' | 'down' | 'stable' } => {
    const diff = current - last;
    if (diff > 0) return { value: diff, type: 'up' };
    if (diff < 0) return { value: diff, type: 'down' };
    return { value: 0, type: 'stable' };
  };

  const handleRowClick = (record: SteelPriceData) => {
    setSelectedMill(record.millName);
    setSelectedMaterial(record.materialName);
    setHighlightRow(record.id);
    setTimeout(() => setActiveView('level2'), 100);
  };

  const handleBack = () => {
    setActiveView('level1');
    setTimeout(() => setHighlightRow(null), 500);
  };

  const filteredData = selectedMill 
    ? data.filter(item => item.millName === selectedMill)
    : data;

  const level1Columns = [
    {
      title: '钢厂',
      dataIndex: 'millName',
      key: 'millName',
      width: 120,
      render: (text: string) => {
        const mill = mills.find(m => m.name === text);
        return (
          <Tag 
            color={mill?.color} 
            style={{ 
              padding: '4px 10px', 
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {text}
          </Tag>
        );
      },
    },
    {
      title: '品名/料型',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 140,
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 80,
    },
    {
      title: '规格',
      dataIndex: 'spec',
      key: 'spec',
      width: 60,
    },
    {
      title: '价格 (元/吨)',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      align: 'right',
      render: (price: number) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#d97706', fontSize: '14px' }}>
          {price.toLocaleString()}
        </span>
      ),
    },
    {
      title: '涨跌',
      dataIndex: 'lastPrice',
      key: 'change',
      width: 100,
      align: 'center',
      render: (_: number, record: SteelPriceData) => {
        const change = calculateChange(record.price, record.lastPrice);
        const symbol = change.type === 'up' ? '▲' : change.type === 'down' ? '▼' : '—';
        const color = change.type === 'up' ? '#059669' : change.type === 'down' ? '#dc2626' : '#64748b';
        const bgColor = change.type === 'up' ? 'rgba(5, 150, 105, 0.1)' : change.type === 'down' ? 'rgba(220, 38, 38, 0.08)' : 'rgba(100, 116, 139, 0.1)';
        
        return (
          <Badge
            count={
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: color, fontSize: '12px' }}>
                <span>{symbol}</span>
                {change.value !== 0 ? (change.value > 0 ? '+' : '') + change.value : '平'}
              </span>
            }
            style={{ 
              backgroundColor: bgColor,
              border: `1px solid ${color}40`,
              borderRadius: '12px',
              padding: '4px 8px',
            }}
          />
        );
      },
    },
    {
      title: '数据日期',
      dataIndex: 'date',
      key: 'date',
      width: 90,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Card 
        className="border-0 shadow-sm"
        title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl"
                style={{ background: 'linear-gradient(135deg, #e0e7ff, #dbeafe)' }}
              >
                🛡️
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">钢铁原料风控面板</h2>
                <p className="text-xs text-gray-500">山西临汾 · 供应料型 & 生铁 & 钢厂挂牌价监控</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge status="processing" text="实时监控中" className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium" />
              <Badge status="warning" text={`⏱ 更新于${updateTime.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}`} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-medium" />
              <span className="text-xs text-gray-500 font-mono">📅 {updateTime.toLocaleDateString('zh-CN')}</span>
              <Button 
                type="text" 
                onClick={() => setUpdateTime(new Date())}
                className="text-gray-600 hover:text-blue-600"
              >
                ↻
              </Button>
            </div>
          </div>
        }
        style={{ margin: 0, borderRadius: 0 }}
      >
        {activeView === 'level1' ? (
          <div className="overflow-x-auto">
            <Table
              dataSource={data}
              columns={level1Columns}
              pagination={false}
              rowKey="id"
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                className: 'cursor-pointer hover:bg-blue-50 transition-colors',
              })}
              bordered={false}
              className="bg-white rounded-lg shadow-sm"
              title={() => (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-800">周边地区大型钢厂挂牌价（立恒 · 建邦 · 首钢长治）</h3>
                  <span className="text-xs text-gray-500">点击行查看二级明细</span>
                </div>
              )}
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <Button 
                onClick={handleBack}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                ← 返回一级看板
              </Button>
              <div className="flex items-center gap-2">
                <Tag color={mills.find(m => m.name === selectedMill)?.color} style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {selectedMill}
                </Tag>
                <span className="text-gray-600">→</span>
                <Tag color="orange" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {selectedMaterial}
                </Tag>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={8}>
                <Card title="价格详情" className="shadow-sm">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">当前价格</span>
                      <span className="text-xl font-bold text-orange-600 font-mono">
                        {data.find(d => d.millName === selectedMill && d.materialName === selectedMaterial)?.price.toLocaleString()} 元/吨
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">上次价格</span>
                      <span className="text-gray-800 font-mono">
                        {data.find(d => d.millName === selectedMill && d.materialName === selectedMaterial)?.lastPrice.toLocaleString()} 元/吨
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">涨跌幅度</span>
                      {(() => {
                        const record = data.find(d => d.millName === selectedMill && d.materialName === selectedMaterial);
                        if (!record) return null;
                        const change = calculateChange(record.price, record.lastPrice);
                        const symbol = change.type === 'up' ? '▲' : change.type === 'down' ? '▼' : '—';
                        const color = change.type === 'up' ? '#059669' : change.type === 'down' ? '#dc2626' : '#64748b';
                        return (
                          <span style={{ color, fontWeight: 600, fontSize: '16px' }}>
                            <span className="mr-1">{symbol}</span>
                            {change.value !== 0 ? (change.value > 0 ? '+' : '') + change.value + ' 元/吨' : '持平'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="同钢厂其他料型" className="shadow-sm">
                  <div className="space-y-2">
                    {filteredData.filter(item => item.materialName !== selectedMaterial).slice(0, 6).map(item => (
                      <div 
                        key={item.id}
                        className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedMaterial(item.materialName);
                          setHighlightRow(item.id);
                        }}
                      >
                        <span className="text-gray-700">{item.materialName}</span>
                        <span className="font-mono text-orange-600">{item.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>

              <Col span={8}>
                <Card title="市场参考" className="shadow-sm">
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-xs text-green-600 mb-1">供应充足</div>
                      <div className="text-sm font-medium text-green-800">临汾地区高锰压块库存充足</div>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="text-xs text-amber-600 mb-1">价格预警</div>
                      <div className="text-sm font-medium text-amber-800">部分料型价格波动较大</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-xs text-blue-600 mb-1">建议操作</div>
                      <div className="text-sm font-medium text-blue-800">关注后续价格走势</div>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SteelDashboard;
