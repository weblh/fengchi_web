import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import { Card, Button, Select, Table, Tag, Row, Col, Spin } from 'antd';
import request from '../../../utils/request';
import './PurchaseDashboard.css';

const { Option } = Select;

interface PurchaseOrder {
  id: string;
  date: string;
  material: string;
  orderer: string;
  supplier: string;
  qty: number;
  delivered: number;
  price: number;
  isClosed: string;
}

interface DeliveryDispatch {
  materialName: string;
  supplier: string;
  orderDate: string;
  orderQty: number;
}

interface VehicleDemand {
  seq: number;
  planDate: string;
  dispatchDate: string;
  material: string;
  reqType: string;
  supplier: string;
  origin: string;
  dest: string;
  qty: number;
  demander: string;
}

interface ProcurementPayment {
  id: string;
  applyNo: string;
  createTime: string;
  creator: string;
  payUnit: string;
  payType: string;
  reason: string;
  payMethod: string;
  amount: number;
  receiveUnit: string;
  receiveAccount: string;
  status: string;
  relatedQty: number;
}

// Mock数据
const purchaseOrders: PurchaseOrder[] = [
  { id: '黄2026042301', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '田辉', qty: 140, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042302', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '田辉', qty: 210, delivered: 0, price: 2530, isClosed: '进行中' },
  { id: '黄2026042303', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '田辉', qty: 35, delivered: 0, price: 2431, isClosed: '进行中' },
  { id: '黄2026042304', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '田辉', qty: 35, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042305', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '田辉', qty: 35, delivered: 0, price: 2530, isClosed: '进行中' },
  { id: '黄2026042306', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '田辉', qty: 70, delivered: 0, price: 2453, isClosed: '进行中' },
  { id: '黄2026042307', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '李向佰', qty: 210, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042308', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '李向佰', qty: 105, delivered: 0, price: 2530, isClosed: '进行中' },
  { id: '黄2026042309', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '李向佰', qty: 70, delivered: 0, price: 2453, isClosed: '已关闭' },
  { id: '黄2026042310', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '李向佰', qty: 35, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042311', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '房中迎', qty: 35, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042312', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '房中迎', qty: 105, delivered: 0, price: 2530, isClosed: '进行中' },
  { id: '黄2026042313', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '房中迎', qty: 105, delivered: 0, price: 2442, isClosed: '进行中' },
  { id: '黄2026042314', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '李志锋', qty: 140, delivered: 0, price: 2530, isClosed: '进行中' },
  { id: '黄2026042315', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '李志锋', qty: 70, delivered: 0, price: 2453, isClosed: '进行中' },
  { id: '黄2026042316', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '李红妹', qty: 35, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042317', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '李红妹', qty: 70, delivered: 0, price: 2541, isClosed: '进行中' },
  { id: '黄2026042318', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '王义成', qty: 280, delivered: 0, price: 2536, isClosed: '进行中' },
  { id: '黄2026042319', date: '2026/4/23', material: 'FL010005', orderer: '黄鸿政', supplier: '槐双峰', qty: 315, delivered: 0, price: 2545, isClosed: '进行中' },
  { id: '黄2026042320', date: '2026/4/23', material: 'FL010004', orderer: '黄鸿政', supplier: '刘光军', qty: 35, delivered: 0, price: 2453, isClosed: '进行中' },
];

const deliveryDispatchSource: DeliveryDispatch[] = [
  { materialName: '壳子', supplier: '李志锋', orderDate: '2026-01-01', orderQty: 1 },
  { materialName: '壳子', supplier: '李志锋', orderDate: '2026-01-02', orderQty: 1 },
  { materialName: '壳子', supplier: '李志锋', orderDate: '2026-01-03', orderQty: 3 },
  { materialName: '壳子', supplier: '李红妹', orderDate: '2026-01-02', orderQty: 1 },
  { materialName: '壳子', supplier: '李红妹', orderDate: '2026-01-03', orderQty: 1 },
  { materialName: '壳子', supplier: '张彬', orderDate: '2026-01-01', orderQty: 1 },
  { materialName: '壳子', supplier: '张彬', orderDate: '2026-01-02', orderQty: 2 },
  { materialName: '铸件', supplier: '李长太', orderDate: '2026-01-02', orderQty: 1 },
  { materialName: '铸件', supplier: '李长太', orderDate: '2026-01-04', orderQty: 1 },
  { materialName: '铸件', supplier: '李向柏', orderDate: '2026-01-02', orderQty: 1 },
  { materialName: '铸件', supplier: '李向柏', orderDate: '2026-01-06', orderQty: 1 },
];

const vehicleDemandData: VehicleDemand[] = [
  { seq: 1, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '铸件', reqType: '低栏', supplier: '李长太', origin: '天津', dest: '秦壁', qty: 1, demander: '黄鸿政' },
  { seq: 2, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '铸件', reqType: '低栏', supplier: '李向佰', origin: '大城', dest: '秦壁', qty: 1, demander: '黄鸿政' },
  { seq: 3, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '铸件', reqType: '低栏', supplier: '田辉', origin: '大城', dest: '秦壁', qty: 1, demander: '黄鸿政' },
  { seq: 4, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '铸件', reqType: '低栏', supplier: '李志锋', origin: '天津', dest: '秦壁', qty: 2, demander: '黄鸿政' },
  { seq: 5, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '壳子', reqType: '高栏', supplier: '李志锋', origin: '天津', dest: '甘亭', qty: 3, demander: '黄鸿政' },
  { seq: 6, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '壳子', reqType: '高栏', supplier: '李向佰', origin: '天津', dest: '甘亭', qty: 1, demander: '黄鸿政' },
  { seq: 7, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '壳子', reqType: '高栏', supplier: '王义城', origin: '大城', dest: '甘亭', qty: 2, demander: '黄鸿政' },
  { seq: 8, planDate: '2026-04-21', dispatchDate: '2026-04-22', material: '壳子', reqType: '高栏', supplier: '田辉', origin: '大城', dest: '甘亭', qty: 2, demander: '黄鸿政' },
];

const procurementPaymentData: ProcurementPayment[] = [
  { id: '1', applyNo: 'FK202604001', createTime: '2026-04-01 09:30', creator: '张三', payUnit: '丰驰', payType: '货款', reason: '4月货款支付', payMethod: '银行转账', amount: 500000, receiveUnit: '天津供应商', receiveAccount: '622202****1234', status: '已审批', relatedQty: 140 },
  { id: '2', applyNo: 'FK202604002', createTime: '2026-04-05 14:20', creator: '李四', payUnit: '丰驰', payType: '货款', reason: '3月尾款支付', payMethod: '银行转账', amount: 320000, receiveUnit: '大城供应商', receiveAccount: '622202****5678', status: '审批中', relatedQty: 80 },
  { id: '3', applyNo: 'FK202604003', createTime: '2026-04-10 10:15', creator: '王五', payUnit: '昌泽', payType: '预付款', reason: '预付款', payMethod: '银行承兑', amount: 1500000, receiveUnit: '信阳申淮', receiveAccount: '622202****9012', status: '已审批', relatedQty: 350 },
  { id: '4', applyNo: 'FK202604004', createTime: '2026-04-15 16:45', creator: '赵六', payUnit: '耀通', payType: '货款', reason: '4月货款', payMethod: '银行转账', amount: 880000, receiveUnit: '湖北供应商', receiveAccount: '622202****3456', status: '待审批', relatedQty: 220 },
  { id: '5', applyNo: 'FK202604005', createTime: '2026-04-20 09:00', creator: '张三', payUnit: '丰驰', payType: '运费', reason: '运输费用', payMethod: '银行转账', amount: 55000, receiveUnit: '物流公司', receiveAccount: '622202****7890', status: '已审批', relatedQty: 0 },
];

const fundPlanDailyData = [
  { date: '4月1日', amount: 1200000, type: '计划' },
  { date: '4月5日', amount: 800000, type: '计划' },
  { date: '4月10日', amount: 1500000, type: '计划' },
  { date: '4月15日', amount: 900000, type: '计划' },
  { date: '4月20日', amount: 1100000, type: '计划' },
  { date: '4月25日', amount: 750000, type: '计划' },
  { date: '4月30日', amount: 1300000, type: '计划' },
  { date: '4月1日', amount: 1000000, type: '实际' },
  { date: '4月5日', amount: 750000, type: '实际' },
  { date: '4月10日', amount: 1400000, type: '实际' },
  { date: '4月15日', amount: 850000, type: '实际' },
  { date: '4月20日', amount: 950000, type: '实际' },
];

const supplierMonthlyOverviewData = [
  { supplier: '田辉', month1: 420, month2: 380, month3: 450, month4: 520 },
  { supplier: '李向佰', month1: 315, month2: 290, month3: 340, month4: 400 },
  { supplier: '房中迎', month1: 140, month2: 160, month3: 180, month4: 200 },
  { supplier: '李志锋', month1: 210, month2: 230, month3: 260, month4: 290 },
  { supplier: '李红妹', month1: 105, month2: 95, month3: 110, month4: 130 },
  { supplier: '王义成', month1: 280, month2: 310, month3: 350, month4: 380 },
];

type ViewType = 'level1' | 'level2';
type Level2Card = 'funds' | 'approval' | 'pay' | 'vehicle' | 'map';

const cityCoordinates: Record<string, Record<string, [number, number]>> = {
  '北京': { '东城区': [116.4074, 39.9042], '西城区': [116.3656, 39.9242], '朝阳区': [116.4730, 39.9962], '海淀区': [116.2954, 39.9992], '丰台区': [116.2820, 39.8587], '通州区': [116.6523, 39.9172] },
  '天津': { '和平区': [117.2017, 39.1302], '河东区': [117.2371, 39.1528], '河西区': [117.1827, 39.1213], '南开区': [117.1919, 39.1387], '红桥区': [117.1584, 39.1428], '滨海新区': [117.7239, 39.0232] },
  '河北': { '石家庄': [114.4859, 38.0423], '唐山': [118.1948, 39.6271], '秦皇岛': [119.5965, 39.9428], '邯郸': [114.4775, 36.6066], '邢台': [114.5044, 37.0619], '保定': [115.4883, 38.8675], '张家口': [114.8798, 40.8153], '承德': [117.9360, 40.9742] },
  '山西': { '太原': [112.5492, 37.8570], '大同': [113.3077, 40.1317], '阳泉': [113.5721, 37.8542], '长治': [113.0878, 36.1841], '晋城': [112.8621, 35.5143], '朔州': [112.4478, 39.3252] },
  '内蒙古': { '呼和浩特': [111.6515, 40.8172], '包头': [109.8448, 40.6576], '乌海': [106.8286, 39.6771], '赤峰': [118.9422, 42.2755], '通辽': [122.2626, 43.6156], '鄂尔多斯': [109.7730, 39.6271] },
  '辽宁': { '沈阳': [123.4328, 41.8047], '大连': [121.6147, 38.9140], '鞍山': [122.9956, 41.1218], '抚顺': [123.9366, 41.8464], '本溪': [123.7671, 41.3279], '丹东': [124.3722, 40.1229] },
  '吉林': { '长春': [125.3272, 43.8868], '吉林': [126.5682, 43.8264], '四平': [124.3669, 43.1589], '辽源': [125.1593, 42.9175], '通化': [125.9138, 41.7290] },
  '黑龙江': { '哈尔滨': [126.6425, 45.8038], '齐齐哈尔': [123.9462, 47.3504], '牡丹江': [129.5890, 44.6171], '佳木斯': [130.3468, 46.8054], '大庆': [125.0373, 46.5730] },
  '上海': { '黄浦区': [121.4998, 31.2397], '徐汇区': [121.4365, 31.1882], '长宁区': [121.3908, 31.2198], '静安区': [121.4708, 31.2391], '普陀区': [121.3995, 31.2435], '虹口区': [121.5146, 31.2617], '杨浦区': [121.5482, 31.2643], '浦东新区': [121.5271, 31.2397] },
  '江苏': { '南京': [118.7969, 32.0603], '苏州': [120.6204, 31.3251], '无锡': [120.3016, 31.5775], '常州': [119.9558, 31.7898], '镇江': [119.4543, 32.2004], '扬州': [119.4478, 32.3962], '泰州': [119.9149, 32.4921], '南通': [120.8694, 32.0162] },
  '浙江': { '杭州': [120.1552, 30.2874], '宁波': [121.5547, 29.8739], '温州': [120.6597, 28.0112], '嘉兴': [120.4551, 30.7408], '湖州': [120.1156, 30.8662], '绍兴': [120.5853, 30.0174] },
  '安徽': { '合肥': [117.2272, 31.8204], '芜湖': [118.3803, 31.3379], '蚌埠': [117.3442, 32.9278], '淮南': [116.9866, 32.6224], '马鞍山': [118.5186, 31.6807] },
  '福建': { '福州': [119.3062, 26.0753], '厦门': [118.0895, 24.4798], '莆田': [119.0098, 25.4461], '三明': [117.6190, 26.2368], '泉州': [118.5878, 24.9048] },
  '江西': { '南昌': [115.8921, 28.6765], '景德镇': [117.2272, 29.3066], '萍乡': [113.8503, 27.6107], '九江': [115.9804, 29.7155], '新余': [114.9280, 27.8176] },
  '山东': { '济南': [117.0009, 36.6754], '青岛': [120.3316, 36.0671], '淄博': [117.8539, 36.8026], '枣庄': [117.5786, 34.8029], '东营': [118.4925, 37.4514], '烟台': [121.3920, 37.5337], '潍坊': [119.1068, 36.6271], '济宁': [116.5958, 35.4140] },
  '河南': { '郑州': [113.6243, 34.7466], '开封': [114.3597, 34.8008], '洛阳': [112.4329, 34.6234], '平顶山': [113.2821, 33.7490], '安阳': [114.3597, 36.1023], '鹤壁': [114.2929, 35.7474] },
  '湖北': { '武汉': [114.2871, 30.5855], '黄石': [115.0355, 30.2234], '十堰': [110.7893, 32.6426], '宜昌': [111.2816, 30.7029], '襄阳': [112.1348, 32.0891] },
  '湖南': { '长沙': [112.9388, 28.2281], '株洲': [113.1667, 27.8393], '湘潭': [112.9153, 27.8773], '衡阳': [112.5697, 26.8926], '邵阳': [111.4696, 27.2315] },
  '广东': { '广州': [113.2644, 23.1291], '深圳': [114.0579, 22.5431], '珠海': [113.5500, 22.2753], '汕头': [116.6993, 23.3562], '佛山': [113.1063, 23.0289], '韶关': [113.6243, 24.8021], '湛江': [110.3645, 21.2731], '肇庆': [112.4648, 23.0506] },
  '广西': { '南宁': [108.3200, 22.8175], '柳州': [109.4097, 24.3134], '桂林': [110.2896, 25.2731], '梧州': [111.3024, 23.4878], '北海': [109.1190, 21.4802] },
  '海南': { '海口': [110.3312, 20.0319], '三亚': [109.5091, 18.2529], '文昌': [110.7219, 19.6147], '琼海': [110.4608, 19.2519] },
  '重庆': { '渝中区': [106.5516, 29.5630], '大渡口区': [106.4956, 29.4868], '江北区': [106.5794, 29.6052], '沙坪坝区': [106.4526, 29.5471], '九龙坡区': [106.4526, 29.4489], '南岸区': [106.5894, 29.5106], '北碚区': [106.3041, 29.8245] },
  '四川': { '成都': [104.0668, 30.5728], '自贡': [104.7760, 29.3324], '攀枝花': [101.7189, 26.5894], '泸州': [105.4474, 28.8019], '德阳': [104.2299, 31.0077], '绵阳': [104.7264, 31.4639] },
  '贵州': { '贵阳': [106.7135, 26.5783], '六盘水': [104.8164, 26.5914], '遵义': [106.9141, 27.7276], '安顺': [105.9390, 26.2525] },
  '云南': { '昆明': [102.7122, 25.0406], '曲靖': [103.7964, 25.5099], '玉溪': [102.5438, 24.3531], '保山': [99.1936, 25.1031], '昭通': [103.7282, 27.3529] },
  '西藏': { '拉萨': [91.1323, 29.6604], '日喀则': [88.8271, 29.2692], '山南': [91.7611, 29.2937] },
  '陕西': { '西安': [108.9480, 34.2619], '铜川': [109.1190, 34.9079], '宝鸡': [107.1464, 34.3491], '咸阳': [108.7222, 34.3433], '渭南': [109.5091, 34.5222] },
  '甘肃': { '兰州': [103.8235, 36.0516], '嘉峪关': [98.2952, 39.7899], '金昌': [102.1863, 38.5066], '白银': [104.1307, 36.5314] },
  '青海': { '西宁': [101.7789, 36.6231], '海东': [102.0795, 36.5645], '海西': [94.9086, 37.3826] },
  '宁夏': { '银川': [106.2785, 38.4663], '石嘴山': [106.3982, 39.0489], '吴忠': [106.2157, 37.9953] },
  '新疆': { '乌鲁木齐': [87.6169, 43.8268], '克拉玛依': [84.8902, 45.5952], '吐鲁番': [89.1873, 42.9116], '哈密': [93.4489, 42.8365] }
};

const getProvinceCenter = (province: string): [number, number] => {
  const centers: Record<string, [number, number]> = {
    '北京': [116.4074, 39.9042],
    '天津': [117.2017, 39.1302],
    '河北': [114.4859, 38.0423],
    '山西': [112.5492, 37.8570],
    '内蒙古': [111.6515, 40.8172],
    '辽宁': [123.4328, 41.8047],
    '吉林': [125.3272, 43.8868],
    '黑龙江': [126.6425, 45.8038],
    '上海': [121.4998, 31.2397],
    '江苏': [118.7969, 32.0603],
    '浙江': [120.1552, 30.2874],
    '安徽': [117.2272, 31.8204],
    '福建': [119.3062, 26.0753],
    '江西': [115.8921, 28.6765],
    '山东': [117.0009, 36.6754],
    '河南': [113.6243, 34.7466],
    '湖北': [114.2871, 30.5855],
    '湖南': [112.9388, 28.2281],
    '广东': [113.2644, 23.1291],
    '广西': [108.3200, 22.8175],
    '海南': [110.3312, 20.0319],
    '重庆': [106.5516, 29.5630],
    '四川': [104.0668, 30.5728],
    '贵州': [106.7135, 26.5783],
    '云南': [102.7122, 25.0406],
    '西藏': [91.1323, 29.6604],
    '陕西': [108.9480, 34.2619],
    '甘肃': [103.8235, 36.0516],
    '青海': [101.7789, 36.6231],
    '宁夏': [106.2785, 38.4663],
    '新疆': [87.6169, 43.8268]
  };
  return centers[province] || [104.5, 36.5];
};

/** provinceData / cityData 使用省级简称作 key；界面标题用完整区划名 */
const formatProvinceRegionTitle = (shortName: string): string => {
  const municipalities = new Set(['北京', '天津', '上海', '重庆']);
  if (municipalities.has(shortName)) {
    return `${shortName}市`;
  }
  if (shortName === '内蒙古') return '内蒙古自治区';
  if (shortName === '广西') return '广西壮族自治区';
  if (shortName === '西藏') return '西藏自治区';
  if (shortName === '宁夏') return '宁夏回族自治区';
  if (shortName === '新疆') return '新疆维吾尔自治区';
  if (shortName === '香港') return '香港特别行政区';
  if (shortName === '澳门') return '澳门特别行政区';
  if (shortName === '台湾') return '台湾省';
  return `${shortName}省`;
};

/** 阿里云 DataV 省级边界 adcode，用于加载「仅该省」地图 GeoJSON */
const PROVINCE_GEO_ADCODE: Record<string, string> = {
  北京: '110000',
  天津: '120000',
  河北: '130000',
  山西: '140000',
  内蒙古: '150000',
  辽宁: '210000',
  吉林: '220000',
  黑龙江: '230000',
  上海: '310000',
  江苏: '320000',
  浙江: '330000',
  安徽: '340000',
  福建: '350000',
  江西: '360000',
  山东: '370000',
  河南: '410000',
  湖北: '420000',
  湖南: '430000',
  广东: '440000',
  广西: '450000',
  海南: '460000',
  重庆: '500000',
  四川: '510000',
  贵州: '520000',
  云南: '530000',
  西藏: '540000',
  陕西: '610000',
  甘肃: '620000',
  青海: '630000',
  宁夏: '640000',
  新疆: '650000',
  台湾: '710000',
  香港: '810000',
  澳门: '820000',
};

/** public/geo 资源 URL。Vite base 为 `./` 时若用 `./geo/` 会在非根路径路由下解析到错误地址，故相对 base 时用站点根路径 `/geo/` */
const getGeoAssetUrl = (file: string): string => {
  const base = import.meta.env.BASE_URL ?? '/';
  if (base.startsWith('/')) {
    const p = base.endsWith('/') ? base : `${base}/`;
    return `${p}geo/${file}`.replace(/\/{2,}/g, '/');
  }
  return `/geo/${file}`;
};

const getProvinceGeoJsonUrl = (adcode: string): string => getGeoAssetUrl(`${adcode}_full.json`);

/**
 * 全国 100000_full 仅含省级面，无法得到省内地市；无单省文件时用于降级显示省界轮廓。
 */
const extractProvinceOutlineFromChina = (chinaGeo: { features?: any[] }, provinceAdcode: string): { type: 'FeatureCollection'; features: any[] } | null => {
  if (!chinaGeo?.features?.length) return null;
  const code = String(provinceAdcode);
  const matchAdcode = (f: any) => String(f?.properties?.adcode) === code;
  let hit = chinaGeo.features.find((f: any) => matchAdcode(f) && f?.properties?.level === 'province');
  if (!hit) {
    hit = chinaGeo.features.find((f: any) => matchAdcode(f));
  }
  if (!hit) return null;
  return { type: 'FeatureCollection', features: [hit] };
};

/** 省界降级：缓存为空时按序拉取全国图（本地 → DataV → 备用），写入 chinaRef */
async function fetchChinaGeoJsonForOutline(chinaRef: { current: { features?: any[] } | null }): Promise<{ features?: any[] } | null> {
  if (chinaRef.current?.features?.length) {
    return chinaRef.current;
  }
  const urls = [
    getGeoAssetUrl('100000_full.json'),
    'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json',
    'https://geojson.cn/data/china.json',
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data?.features?.length) {
        chinaRef.current = data;
        return data;
      }
    } catch {
      /* 下一源 */
    }
  }
  return null;
};

/** 可选：`public/geo/provinces_pack.json`，形如 `{ "410000": { type, features }, ... }`，一次请求覆盖多省地市边界 */
const isProvincePack = (obj: unknown): obj is Record<string, { type: string; features: unknown[] }> => {
  if (!obj || typeof obj !== 'object') return false;
  const rec = obj as Record<string, unknown>;
  const keys = Object.keys(rec);
  if (!keys.length) return false;
  const v = rec[keys[0]];
  return (
    typeof v === 'object' &&
    v !== null &&
    (v as { type?: string }).type === 'FeatureCollection' &&
    Array.isArray((v as { features?: unknown[] }).features)
  );
};

/** 地图要素名称（如「西安市」）与本地 cityData 城市名对齐 */
const matchCityRow = (
  featureName: string,
  rows: { city: string; orderQty: number; suppliers: number }[]
): { city: string; orderQty: number; suppliers: number } | undefined => {
  const raw = (featureName || '').trim();
  if (!raw) return undefined;
  const exact = rows.find((r) => r.city === raw);
  if (exact) return exact;
  const noSuffix = raw.replace(/(市|自治州|地区|盟|县|区|旗)$/, '');
  return rows.find((r) => r.city === noSuffix || raw.startsWith(r.city) || noSuffix === r.city);
};

const parseSupplierTokens = (suppliersList: string | string[]): string[] => {
  if (Array.isArray(suppliersList)) {
    return suppliersList.map((s) => String(s).trim()).filter(Boolean);
  }
  return String(suppliersList || '')
    .split('、')
    .map((s) => s.trim())
    .filter(Boolean);
};

const LEVEL2_KPI_TABLE_COLUMNS = [
  { title: '指标', dataIndex: 'label', key: 'label', width: 200 },
  { title: '数值', dataIndex: 'value', key: 'value' },
];

const LEVEL2_CITY_TABLE_COLUMNS = [
  { title: '城市', dataIndex: 'city', key: 'city' },
  { title: '订货量（吨）', dataIndex: 'orderQty', key: 'orderQty', align: 'right' as const },
  { title: '供应商数', dataIndex: 'suppliers', key: 'suppliers', align: 'right' as const },
];

const LEVEL2_FLOW_TABLE_COLUMNS = [
  { title: '起点', dataIndex: 'from', key: 'from' },
  { title: '终点', dataIndex: 'to', key: 'to' },
  { title: '流向强度', dataIndex: 'value', key: 'value', align: 'right' as const },
];

const getFlightLines = (province: string): { from: string; to: string; coords: [[number, number], [number, number]]; value: number }[] => {
  const lines = flightLinesData[province] || [];
  return lines.map(line => {
    const fromCoord = cityCoordinates[province]?.[line.from] || cityCoordinates[province]?.[Object.keys(cityCoordinates[province] || {})[0]] || [0, 0];
    const toCoord = cityCoordinates[province]?.[line.to] || cityCoordinates[province]?.[Object.keys(cityCoordinates[province] || {})[0]] || [0, 0];
    return {
      from: line.from,
      to: line.to,
      coords: [fromCoord, toCoord],
      value: line.value
    };
  }).filter(line => line.coords[0][0] !== 0 && line.coords[1][0] !== 0);
};

const flightLinesData: Record<string, { from: string; to: string; value: number }[]> = {
  '北京': [
    { from: '北京', to: '天津', value: 50 },
    { from: '北京', to: '石家庄', value: 30 },
    { from: '北京', to: '太原', value: 25 },
    { from: '北京', to: '沈阳', value: 40 },
    { from: '天津', to: '石家庄', value: 20 },
    { from: '石家庄', to: '太原', value: 15 }
  ],
  '河北': [
    { from: '石家庄', to: '北京', value: 35 },
    { from: '石家庄', to: '天津', value: 25 },
    { from: '石家庄', to: '太原', value: 20 },
    { from: '唐山', to: '北京', value: 30 },
    { from: '唐山', to: '秦皇岛', value: 25 },
    { from: '保定', to: '北京', value: 35 },
    { from: '邯郸', to: '石家庄', value: 20 },
    { from: '张家口', to: '北京', value: 25 }
  ],
  '陕西': [
    { from: '西安', to: '宝鸡', value: 30 },
    { from: '西安', to: '咸阳', value: 40 },
    { from: '西安', to: '渭南', value: 35 },
    { from: '西安', to: '铜川', value: 25 },
    { from: '宝鸡', to: '咸阳', value: 20 },
    { from: '咸阳', to: '渭南', value: 25 }
  ],
  '广东': [
    { from: '广州', to: '深圳', value: 50 },
    { from: '广州', to: '佛山', value: 45 },
    { from: '广州', to: '东莞', value: 35 },
    { from: '深圳', to: '珠海', value: 30 },
    { from: '佛山', to: '肇庆', value: 25 },
    { from: '广州', to: '惠州', value: 20 }
  ],
  '江苏': [
    { from: '南京', to: '苏州', value: 40 },
    { from: '南京', to: '无锡', value: 35 },
    { from: '苏州', to: '无锡', value: 30 },
    { from: '苏州', to: '上海', value: 45 },
    { from: '无锡', to: '常州', value: 25 },
    { from: '南京', to: '扬州', value: 20 }
  ],
  '浙江': [
    { from: '杭州', to: '宁波', value: 40 },
    { from: '杭州', to: '嘉兴', value: 30 },
    { from: '杭州', to: '绍兴', value: 35 },
    { from: '宁波', to: '绍兴', value: 25 },
    { from: '嘉兴', to: '上海', value: 35 },
    { from: '杭州', to: '温州', value: 30 }
  ],
  '四川': [
    { from: '成都', to: '绵阳', value: 35 },
    { from: '成都', to: '德阳', value: 30 },
    { from: '成都', to: '泸州', value: 25 },
    { from: '成都', to: '自贡', value: 20 },
    { from: '绵阳', to: '德阳', value: 20 },
    { from: '泸州', to: '自贡', value: 15 }
  ],
  '山东': [
    { from: '济南', to: '青岛', value: 40 },
    { from: '济南', to: '淄博', value: 25 },
    { from: '济南', to: '潍坊', value: 30 },
    { from: '青岛', to: '烟台', value: 35 },
    { from: '潍坊', to: '淄博', value: 20 },
    { from: '济南', to: '济宁', value: 25 }
  ],
  '河南': [
    { from: '郑州', to: '开封', value: 35 },
    { from: '郑州', to: '洛阳', value: 30 },
    { from: '郑州', to: '安阳', value: 30 },
    { from: '洛阳', to: '平顶山', value: 20 },
    { from: '开封', to: '商丘', value: 25 },
    { from: '安阳', to: '鹤壁', value: 15 }
  ],
  '湖北': [
    { from: '武汉', to: '宜昌', value: 35 },
    { from: '武汉', to: '黄石', value: 30 },
    { from: '武汉', to: '襄阳', value: 40 },
    { from: '宜昌', to: '襄阳', value: 25 },
    { from: '黄石', to: '鄂州', value: 20 },
    { from: '襄阳', to: '十堰', value: 25 }
  ],
  '湖南': [
    { from: '长沙', to: '株洲', value: 35 },
    { from: '长沙', to: '湘潭', value: 30 },
    { from: '长沙', to: '衡阳', value: 35 },
    { from: '株洲', to: '湘潭', value: 20 },
    { from: '衡阳', to: '郴州', value: 25 },
    { from: '长沙', to: '邵阳', value: 25 }
  ],
  '上海': [
    { from: '上海', to: '苏州', value: 45 },
    { from: '上海', to: '嘉兴', value: 35 },
    { from: '上海', to: '无锡', value: 30 },
    { from: '上海', to: '杭州', value: 40 },
    { from: '上海', to: '南通', value: 30 },
    { from: '上海', to: '宁波', value: 35 }
  ],
  '重庆': [
    { from: '重庆', to: '成都', value: 40 },
    { from: '重庆', to: '贵阳', value: 35 },
    { from: '重庆', to: '西安', value: 30 },
    { from: '重庆', to: '武汉', value: 35 },
    { from: '重庆', to: '昆明', value: 25 }
  ],
  '福建': [
    { from: '福州', to: '厦门', value: 40 },
    { from: '福州', to: '泉州', value: 35 },
    { from: '厦门', to: '泉州', value: 30 },
    { from: '福州', to: '莆田', value: 25 },
    { from: '厦门', to: '漳州', value: 25 },
    { from: '泉州', to: '莆田', value: 20 }
  ],
  '安徽': [
    { from: '合肥', to: '芜湖', value: 35 },
    { from: '合肥', to: '蚌埠', value: 30 },
    { from: '合肥', to: '南京', value: 35 },
    { from: '芜湖', to: '马鞍山', value: 25 },
    { from: '蚌埠', to: '淮南', value: 20 },
    { from: '合肥', to: '安庆', value: 30 }
  ],
  '辽宁': [
    { from: '沈阳', to: '大连', value: 40 },
    { from: '沈阳', to: '鞍山', value: 30 },
    { from: '沈阳', to: '抚顺', value: 25 },
    { from: '大连', to: '鞍山', value: 25 },
    { from: '沈阳', to: '本溪', value: 20 },
    { from: '大连', to: '丹东', value: 30 }
  ],
  '黑龙江': [
    { from: '哈尔滨', to: '齐齐哈尔', value: 35 },
    { from: '哈尔滨', to: '牡丹江', value: 30 },
    { from: '哈尔滨', to: '佳木斯', value: 35 },
    { from: '哈尔滨', to: '大庆', value: 25 },
    { from: '齐齐哈尔', to: '大庆', value: 20 },
    { from: '牡丹江', to: '佳木斯', value: 25 }
  ],
  '吉林': [
    { from: '长春', to: '吉林', value: 35 },
    { from: '长春', to: '四平', value: 30 },
    { from: '长春', to: '辽源', value: 25 },
    { from: '吉林', to: '通化', value: 30 },
    { from: '四平', to: '辽源', value: 20 },
    { from: '长春', to: '通化', value: 35 }
  ],
  '云南': [
    { from: '昆明', to: '曲靖', value: 35 },
    { from: '昆明', to: '玉溪', value: 30 },
    { from: '昆明', to: '大理', value: 35 },
    { from: '昆明', to: '保山', value: 30 },
    { from: '曲靖', to: '昭通', value: 25 },
    { from: '玉溪', to: '普洱', value: 25 }
  ],
  '贵州': [
    { from: '贵阳', to: '遵义', value: 35 },
    { from: '贵阳', to: '安顺', value: 30 },
    { from: '贵阳', to: '六盘水', value: 30 },
    { from: '遵义', to: '毕节', value: 25 },
    { from: '安顺', to: '六盘水', value: 20 },
    { from: '贵阳', to: '铜仁', value: 25 }
  ],
  '广西': [
    { from: '南宁', to: '柳州', value: 35 },
    { from: '南宁', to: '桂林', value: 40 },
    { from: '南宁', to: '北海', value: 35 },
    { from: '柳州', to: '桂林', value: 30 },
    { from: '南宁', to: '梧州', value: 30 },
    { from: '北海', to: '钦州', value: 25 }
  ],
  '山西': [
    { from: '太原', to: '大同', value: 35 },
    { from: '太原', to: '阳泉', value: 30 },
    { from: '太原', to: '长治', value: 35 },
    { from: '大同', to: '朔州', value: 25 },
    { from: '长治', to: '晋城', value: 25 },
    { from: '太原', to: '晋中', value: 20 }
  ],
  '内蒙古': [
    { from: '呼和浩特', to: '包头', value: 35 },
    { from: '呼和浩特', to: '鄂尔多斯', value: 30 },
    { from: '呼和浩特', to: '赤峰', value: 40 },
    { from: '包头', to: '鄂尔多斯', value: 25 },
    { from: '赤峰', to: '通辽', value: 35 },
    { from: '包头', to: '乌海', value: 30 }
  ],
  '新疆': [
    { from: '乌鲁木齐', to: '克拉玛依', value: 35 },
    { from: '乌鲁木齐', to: '吐鲁番', value: 30 },
    { from: '乌鲁木齐', to: '哈密', value: 40 },
    { from: '吐鲁番', to: '哈密', value: 30 },
    { from: '克拉玛依', to: '石河子', value: 25 },
    { from: '乌鲁木齐', to: '昌吉', value: 20 }
  ],
  '甘肃': [
    { from: '兰州', to: '嘉峪关', value: 40 },
    { from: '兰州', to: '金昌', value: 35 },
    { from: '兰州', to: '白银', value: 30 },
    { from: '嘉峪关', to: '酒泉', value: 25 },
    { from: '金昌', to: '武威', value: 25 },
    { from: '兰州', to: '天水', value: 35 }
  ],
  '宁夏': [
    { from: '银川', to: '石嘴山', value: 30 },
    { from: '银川', to: '吴忠', value: 35 },
    { from: '石嘴山', to: '吴忠', value: 25 },
    { from: '银川', to: '中卫', value: 30 },
    { from: '吴忠', to: '固原', value: 25 },
    { from: '银川', to: '固原', value: 35 }
  ],
  '青海': [
    { from: '西宁', to: '海东', value: 30 },
    { from: '西宁', to: '海西', value: 40 },
    { from: '海东', to: '海北', value: 25 },
    { from: '西宁', to: '海南', value: 35 },
    { from: '海西', to: '格尔木', value: 30 },
    { from: '西宁', to: '玉树', value: 45 }
  ],
  '江西': [
    { from: '南昌', to: '九江', value: 35 },
    { from: '南昌', to: '景德镇', value: 30 },
    { from: '南昌', to: '上饶', value: 35 },
    { from: '九江', to: '景德镇', value: 25 },
    { from: '南昌', to: '抚州', value: 25 },
    { from: '南昌', to: '宜春', value: 30 }
  ]
};

const PurchaseDashboard: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<ViewType>('level1');
  const [activeLevel2Card, setActiveLevel2Card] = useState<Level2Card>('funds');
  const [selectedMonth, setSelectedMonth] = useState<string>('4');
  const [selectedDay, setSelectedDay] = useState<string>('21');
  const [orderDetailData, setOrderDetailData] = useState<PurchaseOrder[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const orderCardsRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  /** 一级地图加载后的全国 GeoJSON，用于省级地图降级截取省界 */
  const chinaGeoJsonRef = useRef<{ features?: any[] } | null>(null);
  /** 可选 `provinces_pack.json` 解析结果，只拉取一次 */
  const provincePackCacheRef = useRef<{ attempted: boolean; data: Record<string, { type: string; features: any[] }> | null }>({
    attempted: false,
    data: null,
  });

  // API数据状态
  const [dailyFundData, setDailyFundData] = useState<any[]>([]);
  const [paymentPlanData, setPaymentPlanData] = useState<any[]>([]);
  const [purchaseOrderData, setPurchaseOrderData] = useState<PurchaseOrder[]>(purchaseOrders);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');
  const [chinaMapLoaded, setChinaMapLoaded] = useState<boolean>(false);
  const [mapLoading, setMapLoading] = useState<boolean>(true);
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [provinceGeoMapName, setProvinceGeoMapName] = useState<string | null>(null);
  const [provinceGeoLoading, setProvinceGeoLoading] = useState(false);
  const [provinceGeoError, setProvinceGeoError] = useState<string | null>(null);

  const totalTons = purchaseOrderData.reduce((sum, order) => sum + order.qty, 0);
  const activeSupplierCount = new Set(purchaseOrderData.map(order => order.supplier)).size;
  const signedOrderCount = purchaseOrderData.length;
  const totalPayment = procurementPaymentData.filter(p => p.status === '已审批').reduce((sum, p) => sum + p.amount, 0);

  const handleProvinceClick = (params: any) => {
    if (!params.name) return;
    let provName = params.name;
    if (provName.endsWith('省')) {
      provName = provName.substring(0, provName.length - 1);
    } else if (provName.endsWith('市') && provName !== '北京市' && provName !== '天津市' && provName !== '上海市' && provName !== '重庆市') {
      provName = provName.substring(0, provName.length - 1);
    }
    if (provinceData[provName]) {
      setSelectedProvince(provName);
      setActiveLevel2Card('map');
      setActiveLevel('level2');
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (dashboardRef.current) {
        if (dashboardRef.current.requestFullscreen) {
          dashboardRef.current.requestFullscreen();
        } else if (dashboardRef.current.webkitRequestFullscreen) {
          dashboardRef.current.webkitRequestFullscreen();
        } else if (dashboardRef.current.msRequestFullscreen) {
          dashboardRef.current.msRequestFullscreen();
        }
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const startAutoScroll = () => {
      if (!orderCardsRef.current) return;
      
      scrollIntervalRef.current = setInterval(() => {
        const container = orderCardsRef.current;
        if (!container) return;
        
        const scrollHeight = container.scrollHeight;
        const clientHeight = container.clientHeight;
        
        if (scrollHeight <= clientHeight) return;
        
        container.scrollTop += 1;
        
        if (container.scrollTop >= scrollHeight - clientHeight) {
          container.scrollTop = 0;
        }
      }, 30);
    };
    
    const stopAutoScroll = () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
    
    startAutoScroll();
    
    return () => {
      stopAutoScroll();
    };
  }, []);

  useEffect(() => {
    const loadChinaMap = async () => {
      try {
        setMapLoading(true);
        let chinaMapData: { features?: any[] } | null = null;
        try {
          const localRes = await fetch(getGeoAssetUrl('100000_full.json'));
          if (localRes.ok) {
            chinaMapData = await localRes.json();
          }
        } catch {
          /* 忽略本地缺失 */
        }
        if (!chinaMapData) {
          const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
          if (!response.ok) {
            throw new Error('Failed to load China map data');
          }
          chinaMapData = await response.json();
        }
        chinaGeoJsonRef.current = chinaMapData;
        echarts.registerMap('china', chinaMapData);
        setChinaMapLoaded(true);
      } catch (error) {
        console.error('加载中国地图数据失败:', error);
        try {
          const response = await fetch('https://geojson.cn/data/china.json');
          if (response.ok) {
            const chinaMapData = await response.json();
            chinaGeoJsonRef.current = chinaMapData;
            echarts.registerMap('china', chinaMapData);
            setChinaMapLoaded(true);
          }
        } catch (fallbackError) {
          console.error('备用地图数据加载失败:', fallbackError);
        }
      } finally {
        setMapLoading(false);
      }
    };

    if (!chinaMapLoaded) {
      loadChinaMap();
    }
  }, [chinaMapLoaded]);

  useEffect(() => {
    if (activeLevel !== 'level2' || activeLevel2Card !== 'map' || !selectedProvince) {
      return undefined;
    }
    const adcode = PROVINCE_GEO_ADCODE[selectedProvince];
    if (!adcode) {
      setProvinceGeoMapName(null);
      setProvinceGeoError('暂无该省份地图数据');
      return undefined;
    }
    const mapKey = `provinceGeo_${adcode}`;
    let cancelled = false;
    setProvinceGeoLoading(true);
    setProvinceGeoError(null);
    setProvinceGeoMapName(null);
    (async () => {
      try {
        let json: { type: string; features: any[] } | null = null;

        if (!provincePackCacheRef.current.attempted) {
          provincePackCacheRef.current.attempted = true;
          try {
            const packRes = await fetch(getGeoAssetUrl('provinces_pack.json'));
            if (packRes.ok) {
              const packRaw = await packRes.json();
              if (isProvincePack(packRaw)) {
                provincePackCacheRef.current.data = packRaw;
              }
            }
          } catch {
            /* 无大包时忽略 */
          }
        }

        const fromPack = provincePackCacheRef.current.data?.[adcode];
        if (fromPack?.features?.length) {
          json = fromPack;
        }

        if (!json) {
          const res = await fetch(getProvinceGeoJsonUrl(adcode));
          if (res.ok) {
            json = await res.json();
          }
        }

        if (!json?.features?.length) {
          let china = chinaGeoJsonRef.current;
          if (!china?.features?.length) {
            china = await fetchChinaGeoJsonForOutline(chinaGeoJsonRef);
            if (china?.features?.length) {
              try {
                echarts.registerMap('china', china);
              } catch {
                /* 已注册过同名地图 */
              }
            }
          }
          const outline = china ? extractProvinceOutlineFromChina(china, adcode) : null;
          if (outline?.features?.length) {
            json = outline;
          }
        }

        if (!json?.features?.length) {
          throw new Error('no province geo');
        }
        if (cancelled) return;
        echarts.registerMap(mapKey, json);
        setProvinceGeoMapName(mapKey);
      } catch {
        if (!cancelled) {
          setProvinceGeoMapName(null);
          setProvinceGeoError(
            `暂无该省（adcode ${adcode}）矢量：请在 public/geo/provinces_pack.json 中包含 "${adcode}"，或添加 ${adcode}_full.json；纯离线请同时放置 100000_full.json 以显示省界轮廓。`
          );
        }
      } finally {
        if (!cancelled) setProvinceGeoLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [activeLevel, activeLevel2Card, selectedProvince]);

  // 获取API数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 获取每日资金计划数据
        try {
          // const fundResult = await request.get('/api/daily-fund-plan/list');
          // if (fundResult && fundResult.data) {
            // setDailyFundData(fundResult.data);
          // }
        } catch (error) {
          console.error('获取每日资金计划失败:', error);
        }

        // 获取付款计划数据
        try {
          const paymentResult = await request.get('/api/payment-plan/list');
          if (paymentResult && paymentResult.data) {
            setPaymentPlanData(paymentResult.data);
          }
        } catch (error) {
          console.error('获取付款计划失败:', error);
        }

        // 获取采购订单数据
        try {
          // const orderResult = await request.get('/api/purchase-orders/list');
          // if (orderResult && orderResult.data) {
          //   setPurchaseOrderData(orderResult.data);
          // }
        } catch (error) {
          console.error('获取采购订单失败:', error);
        }

        setLastUpdateTime(new Date().toISOString());
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const switchToLevel = (card: Level2Card) => {
    setActiveLevel2Card(card);
    setActiveLevel('level2');
  };

  const switchToLevel1 = () => {
    setActiveLevel('level1');
  };

  // 辅助函数
  const toWanInt = (yuan: number) => Math.round(yuan / 10000);

  const monthWeekStr = () => {
    const d = new Date();
    const m = d.getMonth() + 1;
    const week = Math.ceil(d.getDate() / 7);
    return `${m}月 第${week}周`;
  };

  const updateTimeStr = () => {
    if (lastUpdateTime) {
      return lastUpdateTime.substring(0, 10);
    }
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const cityData: Record<string, { city: string; orderQty: number; suppliers: number }[]> = {
    '北京': [
      { city: '东城区', orderQty: 80, suppliers: 2 },
      { city: '西城区', orderQty: 65, suppliers: 2 },
      { city: '朝阳区', orderQty: 95, suppliers: 3 },
      { city: '海淀区', orderQty: 120, suppliers: 4 },
      { city: '丰台区', orderQty: 45, suppliers: 2 },
      { city: '通州区', orderQty: 35, suppliers: 1 }
    ],
    '天津': [
      { city: '和平区', orderQty: 55, suppliers: 2 },
      { city: '河东区', orderQty: 70, suppliers: 2 },
      { city: '河西区', orderQty: 65, suppliers: 2 },
      { city: '南开区', orderQty: 85, suppliers: 3 },
      { city: '红桥区', orderQty: 45, suppliers: 1 },
      { city: '滨海新区', orderQty: 120, suppliers: 4 }
    ],
    '河北': [
      { city: '石家庄', orderQty: 280, suppliers: 3 },
      { city: '唐山', orderQty: 320, suppliers: 4 },
      { city: '秦皇岛', orderQty: 180, suppliers: 2 },
      { city: '邯郸', orderQty: 250, suppliers: 3 },
      { city: '邢台', orderQty: 160, suppliers: 2 },
      { city: '保定', orderQty: 350, suppliers: 4 },
      { city: '张家口', orderQty: 80, suppliers: 1 },
      { city: '承德', orderQty: 90, suppliers: 1 }
    ],
    '山西': [
      { city: '太原', orderQty: 150, suppliers: 3 },
      { city: '大同', orderQty: 80, suppliers: 2 },
      { city: '阳泉', orderQty: 60, suppliers: 1 },
      { city: '长治', orderQty: 90, suppliers: 2 },
      { city: '晋城', orderQty: 70, suppliers: 1 },
      { city: '朔州', orderQty: 50, suppliers: 1 }
    ],
    '内蒙古': [
      { city: '呼和浩特', orderQty: 120, suppliers: 2 },
      { city: '包头', orderQty: 90, suppliers: 2 },
      { city: '乌海', orderQty: 40, suppliers: 1 },
      { city: '赤峰', orderQty: 80, suppliers: 1 },
      { city: '通辽', orderQty: 70, suppliers: 1 }
    ],
    '辽宁': [
      { city: '沈阳', orderQty: 180, suppliers: 3 },
      { city: '大连', orderQty: 220, suppliers: 4 },
      { city: '鞍山', orderQty: 120, suppliers: 2 },
      { city: '抚顺', orderQty: 80, suppliers: 1 },
      { city: '本溪', orderQty: 70, suppliers: 1 },
      { city: '丹东', orderQty: 90, suppliers: 2 }
    ],
    '吉林': [
      { city: '长春', orderQty: 160, suppliers: 3 },
      { city: '吉林', orderQty: 140, suppliers: 2 },
      { city: '四平', orderQty: 80, suppliers: 1 },
      { city: '辽源', orderQty: 50, suppliers: 1 },
      { city: '通化', orderQty: 70, suppliers: 1 }
    ],
    '黑龙江': [
      { city: '哈尔滨', orderQty: 180, suppliers: 3 },
      { city: '齐齐哈尔', orderQty: 120, suppliers: 2 },
      { city: '牡丹江', orderQty: 90, suppliers: 2 },
      { city: '佳木斯', orderQty: 70, suppliers: 1 },
      { city: '大庆', orderQty: 100, suppliers: 2 }
    ],
    '上海': [
      { city: '黄浦区', orderQty: 60, suppliers: 2 },
      { city: '徐汇区', orderQty: 75, suppliers: 2 },
      { city: '长宁区', orderQty: 80, suppliers: 3 },
      { city: '静安区', orderQty: 70, suppliers: 2 },
      { city: '普陀区', orderQty: 55, suppliers: 2 },
      { city: '虹口区', orderQty: 50, suppliers: 2 },
      { city: '杨浦区', orderQty: 65, suppliers: 2 },
      { city: '浦东新区', orderQty: 180, suppliers: 5 }
    ],
    '江苏': [
      { city: '南京', orderQty: 220, suppliers: 4 },
      { city: '苏州', orderQty: 280, suppliers: 5 },
      { city: '无锡', orderQty: 180, suppliers: 3 },
      { city: '常州', orderQty: 150, suppliers: 3 },
      { city: '镇江', orderQty: 100, suppliers: 2 },
      { city: '扬州', orderQty: 120, suppliers: 2 },
      { city: '泰州', orderQty: 90, suppliers: 2 },
      { city: '南通', orderQty: 160, suppliers: 3 }
    ],
    '浙江': [
      { city: '杭州', orderQty: 240, suppliers: 4 },
      { city: '宁波', orderQty: 200, suppliers: 4 },
      { city: '温州', orderQty: 150, suppliers: 3 },
      { city: '嘉兴', orderQty: 120, suppliers: 2 },
      { city: '湖州', orderQty: 90, suppliers: 2 },
      { city: '绍兴', orderQty: 130, suppliers: 2 }
    ],
    '安徽': [
      { city: '合肥', orderQty: 180, suppliers: 3 },
      { city: '芜湖', orderQty: 120, suppliers: 2 },
      { city: '蚌埠', orderQty: 90, suppliers: 2 },
      { city: '淮南', orderQty: 80, suppliers: 1 },
      { city: '马鞍山', orderQty: 100, suppliers: 2 }
    ],
    '福建': [
      { city: '福州', orderQty: 160, suppliers: 3 },
      { city: '厦门', orderQty: 140, suppliers: 3 },
      { city: '莆田', orderQty: 90, suppliers: 2 },
      { city: '三明', orderQty: 80, suppliers: 1 },
      { city: '泉州', orderQty: 180, suppliers: 3 }
    ],
    '江西': [
      { city: '南昌', orderQty: 150, suppliers: 3 },
      { city: '景德镇', orderQty: 80, suppliers: 1 },
      { city: '萍乡', orderQty: 60, suppliers: 1 },
      { city: '九江', orderQty: 120, suppliers: 2 },
      { city: '新余', orderQty: 50, suppliers: 1 }
    ],
    '山东': [
      { city: '济南', orderQty: 220, suppliers: 4 },
      { city: '青岛', orderQty: 260, suppliers: 4 },
      { city: '淄博', orderQty: 150, suppliers: 3 },
      { city: '枣庄', orderQty: 90, suppliers: 2 },
      { city: '东营', orderQty: 100, suppliers: 2 },
      { city: '烟台', orderQty: 180, suppliers: 3 },
      { city: '潍坊', orderQty: 200, suppliers: 3 },
      { city: '济宁', orderQty: 160, suppliers: 3 }
    ],
    '河南': [
      { city: '郑州', orderQty: 240, suppliers: 4 },
      { city: '开封', orderQty: 100, suppliers: 2 },
      { city: '洛阳', orderQty: 150, suppliers: 3 },
      { city: '平顶山', orderQty: 110, suppliers: 2 },
      { city: '安阳', orderQty: 100, suppliers: 2 },
      { city: '鹤壁', orderQty: 60, suppliers: 1 }
    ],
    '湖北': [
      { city: '武汉', orderQty: 280, suppliers: 5 },
      { city: '黄石', orderQty: 100, suppliers: 2 },
      { city: '十堰', orderQty: 80, suppliers: 1 },
      { city: '宜昌', orderQty: 140, suppliers: 2 },
      { city: '襄阳', orderQty: 120, suppliers: 2 }
    ],
    '湖南': [
      { city: '长沙', orderQty: 220, suppliers: 4 },
      { city: '株洲', orderQty: 120, suppliers: 2 },
      { city: '湘潭', orderQty: 100, suppliers: 2 },
      { city: '衡阳', orderQty: 140, suppliers: 2 },
      { city: '邵阳', orderQty: 90, suppliers: 1 }
    ],
    '广东': [
      { city: '广州', orderQty: 320, suppliers: 6 },
      { city: '深圳', orderQty: 280, suppliers: 5 },
      { city: '珠海', orderQty: 120, suppliers: 3 },
      { city: '汕头', orderQty: 100, suppliers: 2 },
      { city: '佛山', orderQty: 180, suppliers: 4 },
      { city: '韶关', orderQty: 80, suppliers: 1 },
      { city: '湛江', orderQty: 100, suppliers: 2 },
      { city: '肇庆', orderQty: 90, suppliers: 2 }
    ],
    '广西': [
      { city: '南宁', orderQty: 150, suppliers: 3 },
      { city: '柳州', orderQty: 120, suppliers: 2 },
      { city: '桂林', orderQty: 100, suppliers: 2 },
      { city: '梧州', orderQty: 80, suppliers: 1 },
      { city: '北海', orderQty: 60, suppliers: 1 }
    ],
    '海南': [
      { city: '海口', orderQty: 80, suppliers: 2 },
      { city: '三亚', orderQty: 60, suppliers: 2 },
      { city: '文昌', orderQty: 30, suppliers: 1 },
      { city: '琼海', orderQty: 40, suppliers: 1 }
    ],
    '重庆': [
      { city: '渝中区', orderQty: 60, suppliers: 2 },
      { city: '大渡口区', orderQty: 45, suppliers: 1 },
      { city: '江北区', orderQty: 85, suppliers: 2 },
      { city: '沙坪坝区', orderQty: 75, suppliers: 2 },
      { city: '九龙坡区', orderQty: 90, suppliers: 3 },
      { city: '南岸区', orderQty: 70, suppliers: 2 },
      { city: '北碚区', orderQty: 50, suppliers: 1 }
    ],
    '四川': [
      { city: '成都', orderQty: 280, suppliers: 5 },
      { city: '自贡', orderQty: 80, suppliers: 2 },
      { city: '攀枝花', orderQty: 70, suppliers: 1 },
      { city: '泸州', orderQty: 90, suppliers: 2 },
      { city: '德阳', orderQty: 110, suppliers: 2 },
      { city: '绵阳', orderQty: 130, suppliers: 3 }
    ],
    '贵州': [
      { city: '贵阳', orderQty: 140, suppliers: 3 },
      { city: '六盘水', orderQty: 60, suppliers: 1 },
      { city: '遵义', orderQty: 90, suppliers: 2 },
      { city: '安顺', orderQty: 50, suppliers: 1 }
    ],
    '云南': [
      { city: '昆明', orderQty: 180, suppliers: 3 },
      { city: '曲靖', orderQty: 100, suppliers: 2 },
      { city: '玉溪', orderQty: 80, suppliers: 1 },
      { city: '保山', orderQty: 60, suppliers: 1 },
      { city: '昭通', orderQty: 70, suppliers: 1 }
    ],
    '西藏': [
      { city: '拉萨', orderQty: 40, suppliers: 1 },
      { city: '日喀则', orderQty: 20, suppliers: 1 },
      { city: '山南', orderQty: 15, suppliers: 1 }
    ],
    '陕西': [
      { city: '西安', orderQty: 280, suppliers: 5 },
      { city: '铜川', orderQty: 60, suppliers: 1 },
      { city: '宝鸡', orderQty: 110, suppliers: 2 },
      { city: '咸阳', orderQty: 130, suppliers: 2 },
      { city: '渭南', orderQty: 100, suppliers: 2 }
    ],
    '甘肃': [
      { city: '兰州', orderQty: 120, suppliers: 2 },
      { city: '嘉峪关', orderQty: 40, suppliers: 1 },
      { city: '金昌', orderQty: 30, suppliers: 1 },
      { city: '白银', orderQty: 50, suppliers: 1 }
    ],
    '青海': [
      { city: '西宁', orderQty: 60, suppliers: 2 },
      { city: '海东', orderQty: 30, suppliers: 1 },
      { city: '海西', orderQty: 25, suppliers: 1 }
    ],
    '宁夏': [
      { city: '银川', orderQty: 80, suppliers: 2 },
      { city: '石嘴山', orderQty: 40, suppliers: 1 },
      { city: '吴忠', orderQty: 50, suppliers: 1 }
    ],
    '新疆': [
      { city: '乌鲁木齐', orderQty: 100, suppliers: 2 },
      { city: '克拉玛依', orderQty: 50, suppliers: 1 },
      { city: '吐鲁番', orderQty: 30, suppliers: 1 },
      { city: '哈密', orderQty: 40, suppliers: 1 }
    ],
    '香港': [
      { city: '香港岛', orderQty: 60, suppliers: 2 },
      { city: '九龙', orderQty: 80, suppliers: 3 },
      { city: '新界', orderQty: 40, suppliers: 1 }
    ],
    '澳门': [
      { city: '澳门半岛', orderQty: 25, suppliers: 1 },
      { city: '氹仔', orderQty: 20, suppliers: 1 },
      { city: '路环', orderQty: 15, suppliers: 1 }
    ],
    '台湾': [
      { city: '台北', orderQty: 40, suppliers: 2 },
      { city: '高雄', orderQty: 30, suppliers: 1 },
      { city: '台中', orderQty: 25, suppliers: 1 }
    ]
  };

  const provinceData: Record<string, { suppliers: number; orderQty: number; deliveredQty: number; pendingOrders: number; suppliersList: string[] }> = {
    '北京': { suppliers: 8, orderQty: 280, deliveredQty: 220, pendingOrders: 12, suppliersList: '田辉、田辉、李向佰' },
    '天津': { suppliers: 6, orderQty: 350, deliveredQty: 300, pendingOrders: 8, suppliersList: '房中班、王义成、槐双峰' },
    '河北': { suppliers: 6, orderQty: 1750, deliveredQty: 0, pendingOrders: 15, suppliersList: '田辉、田辉、李向佰、房中班、王义成、槐双峰' },
    '山西': { suppliers: 4, orderQty: 120, deliveredQty: 95, pendingOrders: 5, suppliersList: '刘光军、张三、李四' },
    '内蒙古': { suppliers: 3, orderQty: 95, deliveredQty: 70, pendingOrders: 3, suppliersList: '王五、赵六' },
    '辽宁': { suppliers: 5, orderQty: 220, deliveredQty: 180, pendingOrders: 6, suppliersList: '孙七、周八' },
    '吉林': { suppliers: 4, orderQty: 150, deliveredQty: 130, pendingOrders: 4, suppliersList: '吴九、郑十' },
    '黑龙江': { suppliers: 4, orderQty: 130, deliveredQty: 100, pendingOrders: 3, suppliersList: '钱十一、陈十二' },
    '上海': { suppliers: 12, orderQty: 320, deliveredQty: 280, pendingOrders: 18, suppliersList: '供应商A、供应商B、供应商C' },
    '江苏': { suppliers: 15, orderQty: 420, deliveredQty: 380, pendingOrders: 22, suppliersList: '供应商D、供应商E、供应商F' },
    '浙江': { suppliers: 10, orderQty: 380, deliveredQty: 340, pendingOrders: 15, suppliersList: '供应商G、供应商H' },
    '安徽': { suppliers: 5, orderQty: 190, deliveredQty: 160, pendingOrders: 7, suppliersList: '供应商I、供应商J' },
    '福建': { suppliers: 7, orderQty: 260, deliveredQty: 230, pendingOrders: 9, suppliersList: '供应商K、供应商L' },
    '江西': { suppliers: 4, orderQty: 160, deliveredQty: 140, pendingOrders: 5, suppliersList: '供应商M、供应商N' },
    '山东': { suppliers: 18, orderQty: 450, deliveredQty: 400, pendingOrders: 25, suppliersList: '供应商O、供应商P、供应商Q' },
    '河南': { suppliers: 8, orderQty: 310, deliveredQty: 270, pendingOrders: 12, suppliersList: '供应商R、供应商S' },
    '湖北': { suppliers: 7, orderQty: 280, deliveredQty: 240, pendingOrders: 10, suppliersList: '供应商T、供应商U' },
    '湖南': { suppliers: 6, orderQty: 240, deliveredQty: 210, pendingOrders: 8, suppliersList: '供应商V、供应商W' },
    '广东': { suppliers: 20, orderQty: 480, deliveredQty: 440, pendingOrders: 28, suppliersList: '供应商X、供应商Y、供应商Z' },
    '广西': { suppliers: 5, orderQty: 180, deliveredQty: 150, pendingOrders: 6, suppliersList: '供应商AA、供应商BB' },
    '海南': { suppliers: 2, orderQty: 80, deliveredQty: 65, pendingOrders: 3, suppliersList: '供应商CC' },
    '重庆': { suppliers: 6, orderQty: 200, deliveredQty: 170, pendingOrders: 8, suppliersList: '供应商DD、供应商EE' },
    '四川': { suppliers: 10, orderQty: 340, deliveredQty: 300, pendingOrders: 14, suppliersList: '供应商FF、供应商GG' },
    '贵州': { suppliers: 3, orderQty: 110, deliveredQty: 90, pendingOrders: 4, suppliersList: '供应商HH' },
    '云南': { suppliers: 4, orderQty: 150, deliveredQty: 120, pendingOrders: 5, suppliersList: '供应商II、供应商JJ' },
    '西藏': { suppliers: 1, orderQty: 20, deliveredQty: 15, pendingOrders: 1, suppliersList: '供应商KK' },
    '陕西': { suppliers: 5, orderQty: 220, deliveredQty: 190, pendingOrders: 7, suppliersList: '供应商LL、供应商MM' },
    '甘肃': { suppliers: 3, orderQty: 90, deliveredQty: 70, pendingOrders: 3, suppliersList: '供应商NN' },
    '青海': { suppliers: 1, orderQty: 30, deliveredQty: 25, pendingOrders: 1, suppliersList: '供应商OO' },
    '宁夏': { suppliers: 2, orderQty: 50, deliveredQty: 40, pendingOrders: 2, suppliersList: '供应商PP' },
    '新疆': { suppliers: 3, orderQty: 70, deliveredQty: 55, pendingOrders: 3, suppliersList: '供应商QQ、供应商RR' },
    '香港': { suppliers: 4, orderQty: 120, deliveredQty: 100, pendingOrders: 5, suppliersList: '供应商SS' },
    '澳门': { suppliers: 2, orderQty: 40, deliveredQty: 35, pendingOrders: 2, suppliersList: '供应商TT' },
    '台湾': { suppliers: 2, orderQty: 60, deliveredQty: 50, pendingOrders: 2, suppliersList: '供应商UU' }
  };

  const chinaMapCoords: Record<string, [number, number]> = {
    '北京': [116.46, 39.92],
    '天津': [117.2, 39.13],
    '河北': [114.53, 38.04],
    '山西': [112.53, 37.87],
    '内蒙古': [111.75, 40.82],
    '辽宁': [123.43, 41.8],
    '吉林': [125.35, 43.88],
    '黑龙江': [126.63, 45.8],
    '上海': [121.48, 31.22],
    '江苏': [118.78, 32.04],
    '浙江': [120.19, 30.26],
    '安徽': [117.27, 31.86],
    '福建': [119.3, 26.08],
    '江西': [115.89, 28.68],
    '山东': [117, 36.65],
    '河南': [113.65, 34.76],
    '湖北': [114.29, 30.52],
    '湖南': [112.94, 28.23],
    '广东': [113.23, 23.16],
    '广西': [108.33, 22.84],
    '海南': [110.35, 20.02],
    '重庆': [106.54, 29.59],
    '四川': [104.06, 30.67],
    '贵州': [106.71, 26.57],
    '云南': [102.73, 25.04],
    '西藏': [91.11, 29.97],
    '陕西': [108.95, 34.27],
    '甘肃': [103.82, 36.07],
    '青海': [101.74, 36.56],
    '宁夏': [106.27, 38.47],
    '新疆': [87.68, 43.77],
    '香港': [114.17, 22.28],
    '澳门': [113.54, 22.19],
    '台湾': [121.5, 25.05]
  };

  const chinaMapGeoJSON = {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { name: '北京' }, geometry: { type: 'Point', coordinates: [116.46, 39.92] } },
      { type: 'Feature', properties: { name: '天津' }, geometry: { type: 'Point', coordinates: [117.2, 39.13] } },
      { type: 'Feature', properties: { name: '河北' }, geometry: { type: 'Point', coordinates: [114.53, 38.04] } },
      { type: 'Feature', properties: { name: '山西' }, geometry: { type: 'Point', coordinates: [112.53, 37.87] } },
      { type: 'Feature', properties: { name: '内蒙古' }, geometry: { type: 'Point', coordinates: [111.75, 40.82] } },
      { type: 'Feature', properties: { name: '辽宁' }, geometry: { type: 'Point', coordinates: [123.43, 41.8] } },
      { type: 'Feature', properties: { name: '吉林' }, geometry: { type: 'Point', coordinates: [125.35, 43.88] } },
      { type: 'Feature', properties: { name: '黑龙江' }, geometry: { type: 'Point', coordinates: [126.63, 45.8] } },
      { type: 'Feature', properties: { name: '上海' }, geometry: { type: 'Point', coordinates: [121.48, 31.22] } },
      { type: 'Feature', properties: { name: '江苏' }, geometry: { type: 'Point', coordinates: [118.78, 32.04] } },
      { type: 'Feature', properties: { name: '浙江' }, geometry: { type: 'Point', coordinates: [120.19, 30.26] } },
      { type: 'Feature', properties: { name: '安徽' }, geometry: { type: 'Point', coordinates: [117.27, 31.86] } },
      { type: 'Feature', properties: { name: '福建' }, geometry: { type: 'Point', coordinates: [119.3, 26.08] } },
      { type: 'Feature', properties: { name: '江西' }, geometry: { type: 'Point', coordinates: [115.89, 28.68] } },
      { type: 'Feature', properties: { name: '山东' }, geometry: { type: 'Point', coordinates: [117, 36.65] } },
      { type: 'Feature', properties: { name: '河南' }, geometry: { type: 'Point', coordinates: [113.65, 34.76] } },
      { type: 'Feature', properties: { name: '湖北' }, geometry: { type: 'Point', coordinates: [114.29, 30.52] } },
      { type: 'Feature', properties: { name: '湖南' }, geometry: { type: 'Point', coordinates: [112.94, 28.23] } },
      { type: 'Feature', properties: { name: '广东' }, geometry: { type: 'Point', coordinates: [113.23, 23.16] } },
      { type: 'Feature', properties: { name: '广西' }, geometry: { type: 'Point', coordinates: [108.33, 22.84] } },
      { type: 'Feature', properties: { name: '海南' }, geometry: { type: 'Point', coordinates: [110.35, 20.02] } },
      { type: 'Feature', properties: { name: '重庆' }, geometry: { type: 'Point', coordinates: [106.54, 29.59] } },
      { type: 'Feature', properties: { name: '四川' }, geometry: { type: 'Point', coordinates: [104.06, 30.67] } },
      { type: 'Feature', properties: { name: '贵州' }, geometry: { type: 'Point', coordinates: [106.71, 26.57] } },
      { type: 'Feature', properties: { name: '云南' }, geometry: { type: 'Point', coordinates: [102.73, 25.04] } },
      { type: 'Feature', properties: { name: '西藏' }, geometry: { type: 'Point', coordinates: [91.11, 29.97] } },
      { type: 'Feature', properties: { name: '陕西' }, geometry: { type: 'Point', coordinates: [108.95, 34.27] } },
      { type: 'Feature', properties: { name: '甘肃' }, geometry: { type: 'Point', coordinates: [103.82, 36.07] } },
      { type: 'Feature', properties: { name: '青海' }, geometry: { type: 'Point', coordinates: [101.74, 36.56] } },
      { type: 'Feature', properties: { name: '宁夏' }, geometry: { type: 'Point', coordinates: [106.27, 38.47] } },
      { type: 'Feature', properties: { name: '新疆' }, geometry: { type: 'Point', coordinates: [87.68, 43.77] } },
      { type: 'Feature', properties: { name: '香港' }, geometry: { type: 'Point', coordinates: [114.17, 22.28] } },
      { type: 'Feature', properties: { name: '澳门' }, geometry: { type: 'Point', coordinates: [113.54, 22.19] } },
      { type: 'Feature', properties: { name: '台湾' }, geometry: { type: 'Point', coordinates: [121.5, 25.05] } }
    ]
  };

  // 中国地图采购订单位置监控热力图配置（含飞线效果）
  const chinaMapPurchaseOption = {
    backgroundColor: '#0a192f',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10, 25, 47, 0.95)',
      borderColor: '#0099ff',
      borderWidth: 1,
      textStyle: { color: '#e0f2ff', fontSize: '12px' },
      padding: [12, 16],
      formatter: (params: any) => {
        if (!params.name) return '';
        let provName = params.name;
        if (provName.endsWith('省')) {
          provName = provName.substring(0, provName.length - 1);
        } else if (provName.endsWith('市') && provName !== '北京市' && provName !== '天津市' && provName !== '上海市' && provName !== '重庆市') {
          provName = provName.substring(0, provName.length - 1);
        }
        const provData = provinceData[provName];
        const value = params.data && params.data.value ? params.data.value : 0;
        if (provData) {
          return `
            <div style="font-weight: bold; margin-bottom: 8px; color: #00d4ff; font-size: 14px;">${params.name}</div>
            <div style="margin-bottom: 4px;">供应商数量: <strong style="color: #00d4ff">${provData.suppliers}</strong> 家</div>
            <div style="margin-bottom: 4px;">订货量(吨): <strong style="color: #34d399">${provData.orderQty}</strong> 吨</div>
            <div style="margin-bottom: 4px;">已交付(吨): <strong style="color: #60a5fa">${provData.deliveredQty}</strong> 吨</div>
            <div style="margin-bottom: 4px;">审批中订单: <strong style="color: #fbbf24">${provData.pendingOrders}</strong> 单</div>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(0, 153, 255, 0.3);">采购订单量: <strong style="color: #a78bfa">${value}</strong> 吨</div>
          `;
        }
        return `<div style="font-weight: bold; color: #00d4ff;">${params.name}</div><div style="margin-top: 4px;">采购订单量: <strong style="color:#00d4ff">${value}</strong> 吨</div>`;
      }
    },
    grid: {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      containLabel: false
    },
    geo: {
      map: 'china',
      roam: true,
      zoom: 1.3,
      center: [104.5, 36.5],
      aspectScale: 0.75,
      layoutCenter: ['50%', '50%'],
      layoutSize: '100%',
      label: {
        show: true,
        fontSize: 10,
        color: '#00d4ff'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold',
          color: '#ffffff'
        },
        itemStyle: {
          areaColor: '#0099ff',
          shadowBlur: 15,
          shadowColor: 'rgba(0, 153, 255, 0.8)'
        }
      },
      tooltip: {
        show: true
      },
      itemStyle: {
        borderColor: '#0066ff',
        areaColor: '#1e3a5f'
      },
      regions: [
        {
          name: '南海诸岛',
          itemStyle: {
            areaColor: '#3966A2',
            borderColor: '#6191D3'
          }
        }
      ]
    },
    visualMap: {
      min: 0,
      max: 500,
      left: '2%',
      top: '10%',
      text: ['高', '低'],
      calculable: true,
      orient: 'vertical',
      inRange: {
        color: ['#1e3a5f', '#0066ff', '#0099ff', '#00d4ff']
      },
      textStyle: { fontSize: 11, color: '#e0f2ff' }
    },
    series: [
      {
        name: '采购订单量',
        type: 'map',
        map: 'china',
        geoIndex: 0,
        tooltip: {
          show: true
        },
        emphasis: {
          focus: 'self',
          label: {
            show: true,
            fontSize: 12,
            fontWeight: 'bold',
            color: '#ffffff'
          },
          itemStyle: {
            areaColor: '#0099ff',
            shadowBlur: 15,
            shadowColor: 'rgba(0, 153, 255, 0.8)'
          }
        },
        data: [
          { name: '北京', value: 280 },
          { name: '天津', value: 350 },
          { name: '河北', value: 180 },
          { name: '山西', value: 120 },
          { name: '内蒙古', value: 95 },
          { name: '辽宁', value: 220 },
          { name: '吉林', value: 150 },
          { name: '黑龙江', value: 130 },
          { name: '上海', value: 320 },
          { name: '江苏', value: 420 },
          { name: '浙江', value: 380 },
          { name: '安徽', value: 190 },
          { name: '福建', value: 260 },
          { name: '江西', value: 160 },
          { name: '山东', value: 450 },
          { name: '河南', value: 310 },
          { name: '湖北', value: 280 },
          { name: '湖南', value: 240 },
          { name: '广东', value: 480 },
          { name: '广西', value: 180 },
          { name: '海南', value: 80 },
          { name: '重庆', value: 200 },
          { name: '四川', value: 340 },
          { name: '贵州', value: 110 },
          { name: '云南', value: 150 },
          { name: '西藏', value: 20 },
          { name: '陕西', value: 220 },
          { name: '甘肃', value: 90 },
          { name: '青海', value: 30 },
          { name: '宁夏', value: 50 },
          { name: '新疆', value: 70 },
          { name: '香港', value: 120 },
          { name: '澳门', value: 40 },
          { name: '台湾', value: 60 }
        ]
      },
      {
        name: '飞线路径',
        type: 'lines',
        zlevel: 1,
        coordinateSystem: 'geo',
        lineStyle: {
          color: '#0066ff',
          width: 1,
          curveness: 0.2,
          opacity: 0.5
        },
        data: [
          {
            fromName: '云南',
            toName: '北京',
            coords: [[102.73, 25.04], [116.46, 39.92]]
          },
          {
            fromName: '广东',
            toName: '上海',
            coords: [[113.23, 23.16], [121.48, 31.22]]
          },
          {
            fromName: '四川',
            toName: '北京',
            coords: [[104.06, 30.67], [116.46, 39.92]]
          },
          {
            fromName: '山东',
            toName: '广东',
            coords: [[117, 36.65], [113.23, 23.16]]
          },
          {
            fromName: '新疆',
            toName: '上海',
            coords: [[87.68, 43.77], [121.48, 31.22]]
          },
          {
            fromName: '浙江',
            toName: '重庆',
            coords: [[120.19, 30.26], [106.54, 29.59]]
          }
        ]
      },
      {
        name: '飞线动画',
        type: 'lines',
        zlevel: 2,
        coordinateSystem: 'geo',
        effect: {
          show: true,
          period: 3,
          trailLength: 0.15,
          color: '#00d4ff',
          symbolSize: 4
        },
        lineStyle: {
          color: '#0099ff',
          width: 0,
          curveness: 0.2
        },
        data: [
          {
            fromName: '云南',
            toName: '北京',
            coords: [[102.73, 25.04], [116.46, 39.92]]
          },
          {
            fromName: '广东',
            toName: '上海',
            coords: [[113.23, 23.16], [121.48, 31.22]]
          },
          {
            fromName: '四川',
            toName: '北京',
            coords: [[104.06, 30.67], [116.46, 39.92]]
          },
          {
            fromName: '山东',
            toName: '广东',
            coords: [[117, 36.65], [113.23, 23.16]]
          },
          {
            fromName: '新疆',
            toName: '上海',
            coords: [[87.68, 43.77], [121.48, 31.22]]
          },
          {
            fromName: '浙江',
            toName: '重庆',
            coords: [[120.19, 30.26], [106.54, 29.59]]
          }
        ]
      },
      {
        name: '端点',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        symbol: 'circle',
        symbolSize: 8,
        rippleEffect: {
          brushType: 'stroke',
          scale: 3
        },
        itemStyle: {
          color: '#00d4ff',
          shadowBlur: 10,
          shadowColor: '#00d4ff'
        },
        data: [
          { name: '北京', value: [116.46, 39.92] },
          { name: '上海', value: [121.48, 31.22] },
          { name: '广东', value: [113.23, 23.16] },
          { name: '云南', value: [102.73, 25.04] },
          { name: '四川', value: [104.06, 30.67] },
          { name: '山东', value: [117, 36.65] }
        ]
      }
    ]
  };

  // 每日资金使用计划图表配置
  const fundPlanDailyOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      enterable: true,
      confine: true,
      formatter: (params: any[]) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          const value = (param.value / 10000).toFixed(1);
          result += `${param.marker} ${param.seriesName}: ${value} 万<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['计划', '实际'],
      bottom: 10,
      textStyle: { fontSize: 12, color: '#e0f2ff' }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['4月1日', '4月5日', '4月10日', '4月15日', '4月20日', '4月25日', '4月30日'],
      axisLabel: { fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: '#0066ff' } },
      axisLabel: { color: '#e0f2ff' }
    },
    yAxis: {
      type: 'value',
      name: '金额(元)',
      nameTextStyle: { color: '#00d4ff' },
      axisLabel: {
        fontSize: 11,
        color: '#e0f2ff',
        formatter: (value: number) => (value / 10000).toFixed(0) + '万'
      },
      splitLine: { lineStyle: { color: 'rgba(0, 102, 255, 0.2)', type: 'dashed' } }
    },
    series: [
      {
        name: '计划',
        type: 'bar' as const,
        data: [1200000, 800000, 1500000, 900000, 1100000, 750000, 1300000],
        color: '#0099ff',
        barWidth: '30%',
        itemStyle: { borderRadius: [4, 4, 0, 0], shadowBlur: 10, shadowColor: 'rgba(0, 153, 255, 0.3)' },
      label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: (params: any) => (params.value / 10000).toFixed(0) + '万'
        }
      },
      {
        name: '实际',
        type: 'bar' as const,
        data: [1000000, 750000, 1400000, 850000, 950000, 700000, 1150000],
        color: '#00d4ff',
        barWidth: '30%',
        itemStyle: { borderRadius: [4, 4, 0, 0], shadowBlur: 10, shadowColor: 'rgba(0, 212, 255, 0.3)' },
      label: {
          show: true,
          position: 'top',
          fontSize: 10,
          formatter: (params: any) => (params.value / 10000).toFixed(0) + '万'
        }
      }
    ]
  };

  // 采购付款监控图表配置
  const procurementPayOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      enterable: true,
      confine: true,
      formatter: (params: any[]) => {
        let result = `${params[0].axisValue}<br/>`;
        params.forEach((param: any) => {
          const value = (param.value / 10000).toFixed(1);
          result += `${param.marker} ${param.seriesName}: ${value} 万<br/>`;
        });
        return result;
      }
    },
    legend: {
      data: ['丰驰', '昌泽', '耀通'],
      bottom: 10,
      textStyle: { fontSize: 12 }
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['4月1日', '4月5日', '4月10日', '4月15日', '4月20日', '4月25日', '4月30日'],
      axisLabel: { fontSize: 11, rotate: 30 },
      axisLine: { lineStyle: { color: '#0066ff' } },
      axisLabel: { color: '#e0f2ff' }
    },
    yAxis: {
      type: 'value',
      name: '金额(元)',
      nameTextStyle: { color: '#00d4ff' },
      axisLabel: {
        fontSize: 11,
        color: '#e0f2ff',
        formatter: (value: number) => (value / 10000).toFixed(0) + '万'
      },
      splitLine: { lineStyle: { color: 'rgba(0, 102, 255, 0.2)', type: 'dashed' } }
    },
    series: [
      {
        name: '丰驰',
        type: 'line' as const,
        smooth: true,
        data: [500000, 820000, 950000, 1200000, 1450000, 1650000, 1800000],
        color: '#0099ff',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 153, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 153, 255, 0.05)' }
            ]
          }
        }
      },
      {
        name: '昌泽',
        type: 'line' as const,
        smooth: true,
        data: [300000, 450000, 750000, 950000, 1200000, 1400000, 1600000],
        color: '#00d4ff',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.05)' }
            ]
          }
        }
      },
      {
        name: '耀通',
        type: 'line' as const,
        smooth: true,
        data: [200000, 350000, 550000, 750000, 950000, 1150000, 1350000],
        color: '#0066ff',
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { width: 3 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 102, 255, 0.3)' },
              { offset: 1, color: 'rgba(19, 40, 67, 0.05)' }
            ]
          }
        }
      }
    ]
  };

  const buildProvinceDetailMapOption = () => {
    if (!selectedProvince || !provinceGeoMapName) return {};
    const rows = cityData[selectedProvince];
    if (!rows) return {};
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: 'rgba(10, 25, 47, 0.95)',
        borderColor: '#0099ff',
        borderWidth: 1,
        textStyle: { color: '#e0f2ff' },
        formatter: (params: any) => {
          if (params.seriesType === 'scatter') {
            const cityInfo = rows.find((c) => c.city === params.name) || matchCityRow(String(params.name || ''), rows);
            return `
              <div style="font-weight:bold;margin-bottom:6px;color:#00d4ff">${cityInfo?.city || params.name}</div>
              <div>订货量: <strong style="color:#00d4ff">${cityInfo?.orderQty ?? 0}</strong> 吨</div>
              <div>供应商: <strong style="color:#10b981">${cityInfo?.suppliers ?? 0}</strong> 家</div>
            `;
          }
          if (params.seriesType === 'lines') {
            return `
              <div style="font-weight:bold;margin-bottom:6px;color:#00d4ff">${params.data.from} → ${params.data.to}</div>
              <div>流向强度: <strong style="color:#f59e0b">${params.data.value}</strong></div>
            `;
          }
          if (params.componentType === 'geo' && params.name) {
            const row = matchCityRow(String(params.name), rows);
            if (row) {
              return `${row.city}<br/>订货量: ${row.orderQty} 吨<br/>供应商: ${row.suppliers} 家`;
            }
          }
          return params.name ? String(params.name) : '';
        },
      },
      geo: {
        map: provinceGeoMapName,
        roam: true,
        zoom: 1.05,
        layoutCenter: ['50%', '52%'],
        layoutSize: '98%',
        label: {
          show: true,
          fontSize: 10,
          color: '#64748b',
          formatter: (p: any) => {
            const row = matchCityRow(String(p.name || ''), rows);
            return row ? row.city : String(p.name || '');
          },
        },
        itemStyle: {
          areaColor: 'rgba(0, 35, 70, 0.5)',
          borderColor: 'rgba(0, 212, 255, 0.5)',
          borderWidth: 1,
        },
        emphasis: {
          label: { color: '#e0f2ff' },
          itemStyle: {
            areaColor: 'rgba(0, 90, 130, 0.55)',
            borderColor: '#00d4ff',
            borderWidth: 1.5,
          },
        },
      },
      series: [
        {
          name: '采购节点',
          type: 'scatter' as const,
          coordinateSystem: 'geo' as const,
          data: rows.map((c) => {
            const coord = cityCoordinates[selectedProvince]?.[c.city];
            return {
              name: c.city,
              value: coord ? [...coord, c.orderQty] : [0, 0, c.orderQty],
              symbolSize: Math.max(11, Math.min(34, c.orderQty / 9)),
              itemStyle: {
                color: '#00d4ff',
                shadowBlur: 12,
                shadowColor: 'rgba(0, 212, 255, 0.45)',
              },
            };
          }),
          label: {
            show: true,
            formatter: '{b}',
            position: 'bottom' as const,
            fontSize: 9,
            color: '#e0f2ff',
          },
        },
        {
          name: '采购流向',
          type: 'lines' as const,
          coordinateSystem: 'geo' as const,
          data: getFlightLines(selectedProvince),
          lineStyle: {
            color: 'rgba(0, 212, 255, 0.65)',
            width: 2,
            curveness: 0.22,
          },
          effect: {
            show: true,
            period: 3,
            trailLength: 0.45,
            color: '#00d4ff',
            symbolSize: 5,
          },
        },
      ],
    };
  };

  const provinceKpiTableRows =
    selectedProvince && provinceData[selectedProvince]
      ? (() => {
          const p = provinceData[selectedProvince];
          const suppliersText = Array.isArray(p.suppliersList)
            ? p.suppliersList.join('、')
            : String(p.suppliersList ?? '');
          return [
            { key: 'sup', label: '供应商数量', value: `${p.suppliers} 家` },
            { key: 'ord', label: '订货总量', value: `${p.orderQty} 吨` },
            { key: 'del', label: '已交付量', value: `${p.deliveredQty} 吨` },
            { key: 'pen', label: '审批中订单', value: `${p.pendingOrders} 单` },
            { key: 'main', label: '主要供应商', value: suppliersText },
          ];
        })()
      : [];

  const provinceFlowTableRows = selectedProvince
    ? getFlightLines(selectedProvince).map((l, i) => ({
        key: `${i}`,
        from: l.from,
        to: l.to,
        value: l.value,
      }))
    : [];

  const provinceOrderTableRows =
    selectedProvince && provinceData[selectedProvince]
      ? purchaseOrderData.filter((o) => {
          const tokens = parseSupplierTokens(
            provinceData[selectedProvince].suppliersList as unknown as string | string[]
          );
          return tokens.some((t) => o.supplier.includes(t));
        })
      : [];

  const orderDetailTableColumns = [
    { title: '序号', key: 'seq', render: (_, __, index) => index + 1 },
    { title: '采购订单编号', dataIndex: 'id', key: 'id' },
    { title: '订货方式', key: 'orderMethod', render: () => '自提' },
    { title: '订货人', dataIndex: 'orderer', key: 'orderer' },
    { title: '性质', key: 'nature', render: () => '--' },
    { title: '供应商', dataIndex: 'supplier', key: 'supplier' },
    { title: '结算方式', key: 'settleMethod', render: () => '未形成合同' },
    { title: '结算单价', dataIndex: 'price', key: 'price' },
    { title: '订货量（吨）', dataIndex: 'qty', key: 'qty' },
    { title: '状态', dataIndex: 'isClosed', key: 'isClosed', render: (status: string) => <Tag color={status === '进行中' ? 'green' : 'red'}>{status}</Tag> }
  ];

  const payDetailTableColumns = [
    { title: '序号', key: 'seq', render: (_, __, index) => index + 1 },
    { title: '申请编号', dataIndex: 'applyNo', key: 'applyNo' },
    { title: '发起时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '发起人', dataIndex: 'creator', key: 'creator' },
    { title: '付款单位', dataIndex: 'payUnit', key: 'payUnit' },
    { title: '付款类型', dataIndex: 'payType', key: 'payType' },
    { title: '付款事由', dataIndex: 'reason', key: 'reason' },
    { title: '付款方式', dataIndex: 'payMethod', key: 'payMethod' },
    { title: '付款总额（元）', dataIndex: 'amount', key: 'amount', render: (val: number) => val.toLocaleString() },
    { title: '收款单位', dataIndex: 'receiveUnit', key: 'receiveUnit' },
    { title: '审批状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === '已审批' ? 'green' : status === '审批中' ? 'yellow' : 'gray'}>{status}</Tag> }
  ];

  return (
    <div ref={dashboardRef} className={isFullscreen ? 'fullscreen' : ''}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <div style={{ fontSize: '1.2rem', color: '#2f73ff' }}>加载数据中...</div>
        </div>
      ) : (
        <>
          {/* 一级看板 */}
          {activeLevel === 'level1' && (
            <div className="page">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button 
                  onClick={toggleFullscreen}
                  style={{
                    background: 'rgba(47, 115, 255, 0.1)',
                    border: '1px solid rgba(47, 115, 255, 0.3)',
                    borderRadius: '32px',
                    padding: '6px 16px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: '#2f73ff',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#2f73ff';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.borderColor = '#2f73ff';
                    e.currentTarget.style.boxShadow = '0 4px 10px rgba(47,115,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(47, 115, 255, 0.1)';
                    e.currentTarget.style.color = '#2f73ff';
                    e.currentTarget.style.borderColor = 'rgba(47, 115, 255, 0.3)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <i className={isFullscreen ? "fas fa-compress" : "fas fa-expand"}></i> {isFullscreen ? '退出全屏' : '全屏'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 12 }}>
                {/* 第一行：3个卡片，比例3:3:3 */}
                <div className="pie-grid">
                  {/* 每日资金使用计划 */}
                  <div className="pie-card" onClick={() => switchToLevel('funds')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>💰 每日资金使用计划</h3>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#f97316' }}>合计: ¥ {toWanInt(fundPlanDailyData.filter(d => d.type === '计划').reduce((sum, d) => sum + d.amount, 0)).toLocaleString()} 万</span>
                        {/* 更新时间 */}
                        <div className="date-selector"><span className="status-dot"></span>  {updateTimeStr()}</div>
                      </div>
                    </div>
                    <div className="pie-chart">
                      <ReactECharts option={fundPlanDailyOption} style={{ height: '100%' }} />
                    </div>
                  </div>

                  {/* 中国地图采购订单位置监控 */}
                  <div className="pie-card" style={{padding: '0', display: 'flex', flexDirection: 'column', height: '100%'}}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      {/* <div style={{ display: 'flex', gap: '12px' }}>
                        <h3 style={{margin:0}}>🗺️ 采购订单位置监控</h3>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <div className="mini-kpi">
                          <div className="kpi-title">覆盖区域</div>
                          <div className="kpi-value">34 省</div>
                        </div>
                        <div className="mini-kpi">
                          <div className="kpi-title">供应商</div>
                          <div className="kpi-value" style={{ color: '#3b82f6' }}>{activeSupplierCount}</div>
                        </div>
                        <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
                      </div> */}
                    </div>
                    <div className="pie-chart" style={{flex:1, minHeight:0}}>
                      {mapLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                          <span>正在加载地图...</span>
                        </div>
                      ) : chinaMapLoaded ? (
                        <ReactECharts 
                          option={chinaMapPurchaseOption} 
                          style={{ height: '100%', width: '100%' }}
                          onEvents={{
                            click: handleProvinceClick
                          }}
                        />
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#ef4444' }}>
                          <span>地图加载失败，请刷新重试</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 采购付款监控维度显示周具体金额使用+付款计划 */}
                  <div className="pie-card" onClick={() => switchToLevel('pay')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>💵 采购付款监控</h3>
                      {/* 更新时间 */}
                      <div className="date-selector"><span className="status-dot"></span>  {updateTimeStr()}</div>
                    </div>
                    <div className="pie-chart">
                      <ReactECharts option={procurementPayOption} style={{ height: '100%' }} />
                    </div>
                    <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(0, 153, 255, 0.2)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '0.8rem' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>周金额:</span>
                          <span style={{ marginLeft: '4px', fontWeight: '600', color: '#2f73ff' }}>¥ {toWanInt(totalPayment).toLocaleString()} 万</span>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>付款计划:</span>
                          <span style={{ marginLeft: '4px', fontWeight: '600', color: '#10b981' }}>{procurementPaymentData.length} 笔</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 第二行：2个卡片，比例5:5 */}
                <div className="pie-grid-row2">
                  {/* 订单交付 */}
                  <div className="pie-card" onClick={() => switchToLevel('approval')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>📦 订单交付情况</h3>
                      {/* 更新时间 */}
                      <div className="date-selector"><span className="status-dot"></span>  {updateTimeStr()}</div>
                    </div>
                    <div className="order-cards" ref={orderCardsRef} onMouseEnter={() => {
                      if (scrollIntervalRef.current) {
                        clearInterval(scrollIntervalRef.current);
                        scrollIntervalRef.current = null;
                      }
                    }} onMouseLeave={() => {
                      if (!scrollIntervalRef.current) {
                        const container = orderCardsRef.current;
                        if (!container) return;
                        
                        scrollIntervalRef.current = setInterval(() => {
                          const scrollHeight = container.scrollHeight;
                          const clientHeight = container.clientHeight;
                          
                          if (scrollHeight <= clientHeight) return;
                          
                          container.scrollTop += 1;
                          
                          if (container.scrollTop >= scrollHeight - clientHeight) {
                            container.scrollTop = 0;
                          }
                        }, 30);
                      }
                    }}>
                      {purchaseOrderData.map(order => {
                        const completionRate = order.qty > 0 ? ((order.delivered / order.qty) * 100).toFixed(1) : 0;
                        return (
                          <div key={order.id} className="order-card">
                            <div className="order-card-header">
                              <div className="order-card-title">
                                <div className="customer-name">{order.id}</div>
                                <div className="material-name">{order.supplier} - {order.material}</div>
                              </div>
                              <div className={`order-card-trend ${parseFloat(completionRate) > 0 ? 'up' : ''}`}>
                                {completionRate}%
                              </div>
                            </div>
                            <div className="order-card-stats">
                              <span className="received-qty">已交付: {order.delivered} 吨</span>
                              <span className="remaining-qty">剩余: {order.qty - order.delivered} 吨</span>
                              <span className="total-qty">总计: {order.qty} 吨</span>
                              <span className="order-amount">单价: ¥{order.price}</span>
                            </div>
                            <div className="order-card-progress">
                              <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${Math.min(parseFloat(completionRate), 100)}%` }}></div>
                              </div>
                              <div className="progress-text">交付进度</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 车辆需求（按路线） */}
                  <div className="pie-card" onClick={() => switchToLevel('vehicle')}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3>🚛 车辆需求（按路线）</h3>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Tag color="blue">计划: {vehicleDemandData.length} 辆</Tag>
                        <Tag color="green">实际: {vehicleDemandData.length} 辆</Tag>
                      </div>
                    </div>
                    <div className="pie-chart" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {vehicleDemandData.slice(0, 8).map(item => (
                        <div key={item.seq} style={{ padding: '10px', borderBottom: '1px solid rgba(0, 153, 255, 0.2)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '600', fontSize: '0.85rem', color: '#e0f2ff' }}>{item.supplier}</span>
                            <span style={{ fontSize: '0.8rem', color: '#00d4ff' }}>{item.material}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#0099ff' }}>{item.origin} → {item.dest} | {item.reqType}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 二级看板 */}
          {activeLevel === 'level2' && (
            <div className="page">
              <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button 
                    onClick={() => {
                      setActiveLevel('level1');
                      setSelectedProvince(null);
                    }}
                    style={{
                      background: 'rgba(0, 153, 255, 0.1)',
                      border: '1px solid rgba(0, 153, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.85rem',
                      color: '#0099ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    ← 返回
                  </button>
                  <h1>{selectedProvince ? `${formatProvinceRegionTitle(selectedProvince)}采购分析` : '智慧采购管理 | 深度分析'}</h1>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={toggleFullscreen}
                    style={{
                      background: 'rgba(47, 115, 255, 0.1)',
                      border: '1px solid rgba(47, 115, 255, 0.3)',
                      borderRadius: '32px',
                      padding: '6px 16px',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      color: '#2f73ff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#2f73ff';
                      e.currentTarget.style.color = 'white';
                      e.currentTarget.style.borderColor = '#2f73ff';
                      e.currentTarget.style.boxShadow = '0 4px 10px rgba(47,115,255,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(47, 115, 255, 0.1)';
                      e.currentTarget.style.color = '#2f73ff';
                      e.currentTarget.style.borderColor = 'rgba(47, 115, 255, 0.3)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {isFullscreen ? '退出全屏' : '全屏'}
                  </button>
                  <div className="back-link" onClick={switchToLevel1}>
                    返回一级
                  </div>
                </div>
              </div>
              <div className="charts-grid">
                {activeLevel2Card !== 'map' && (
                <>
                {/* 省份详情卡片 */}
                {selectedProvince && provinceData[selectedProvince] && (
                  <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                    <div className="chart-header-kpis">
                      <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>{formatProvinceRegionTitle(selectedProvince)}采购数据概览</h3>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '16px' }}>
                      <div style={{ background: 'rgba(0, 153, 255, 0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>供应商数量</div>
                        <div style={{ color: '#00d4ff', fontSize: '1.5rem', fontWeight: 'bold' }}>{provinceData[selectedProvince].suppliers} 家</div>
                      </div>
                      <div style={{ background: 'rgba(0, 153, 255, 0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>订货总量</div>
                        <div style={{ color: '#00d4ff', fontSize: '1.5rem', fontWeight: 'bold' }}>{provinceData[selectedProvince].orderQty} 吨</div>
                      </div>
                      <div style={{ background: 'rgba(0, 153, 255, 0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>已交付量</div>
                        <div style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: 'bold' }}>{provinceData[selectedProvince].deliveredQty} 吨</div>
                      </div>
                      <div style={{ background: 'rgba(0, 153, 255, 0.1)', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>审批中订单</div>
                        <div style={{ color: '#f59e0b', fontSize: '1.5rem', fontWeight: 'bold' }}>{provinceData[selectedProvince].pendingOrders} 单</div>
                      </div>
                    </div>
                    <div style={{ padding: '0 16px 16px' }}>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '8px' }}>主要供应商：</div>
                      <div style={{ color: '#e0f2ff', fontSize: '0.9rem' }}>{provinceData[selectedProvince].suppliersList}</div>
                    </div>
                  </div>
                )}

                {/* 省份地图 */}
                {selectedProvince && cityData[selectedProvince] && (
                  <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                    <div className="chart-header-kpis">
                      <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>{formatProvinceRegionTitle(selectedProvince)}各地采购分布</h3>
                    </div>
                    <div className="chart-container">
                      <ReactECharts 
                        option={{
                          backgroundColor: 'transparent',
                          tooltip: {
                            trigger: 'axis',
                            backgroundColor: 'rgba(10, 25, 47, 0.95)',
                            borderColor: '#0099ff',
                            borderWidth: 1,
                            textStyle: { color: '#e0f2ff' },
                            axisPointer: {
                              type: 'shadow'
                            }
                          },
                          grid: {
                            left: '10%',
                            right: '15%',
                            bottom: '8%',
                            top: '8%',
                            containLabel: true
                          },
                          xAxis: {
                            type: 'value',
                            axisLabel: {
                              color: '#94a3b8',
                              fontSize: 10,
                              formatter: '{value}吨'
                            },
                            axisLine: { lineStyle: { color: 'rgba(0, 153, 255, 0.3)' } },
                            splitLine: { lineStyle: { color: 'rgba(0, 153, 255, 0.1)' } }
                          },
                          yAxis: {
                            type: 'category',
                            data: cityData[selectedProvince].map(c => c.city),
                            axisLabel: {
                              color: '#94a3b8',
                              fontSize: 11
                            },
                            axisLine: { lineStyle: { color: 'rgba(0, 153, 255, 0.3)' } },
                            splitLine: { show: false }
                          },
                          series: [
                            {
                              type: 'bar',
                              data: cityData[selectedProvince].map(c => ({
                                value: c.orderQty,
                                itemStyle: {
                                  color: {
                                    type: 'linear',
                                    x: 0, y: 0, x2: 1, y2: 0,
                                    colorStops: [
                                      { offset: 0, color: '#0066ff' },
                                      { offset: 1, color: '#00d4ff' }
                                    ]
                                  },
                                  borderRadius: [0, 4, 4, 0]
                                }
                              })),
                              barWidth: '50%',
                              label: {
                                show: true,
                                position: 'right',
                                color: '#00d4ff',
                                fontSize: 10,
                                formatter: '{c}吨'
                              }
                            }
                          ]
                        }}
                        style={{ height: '280px' }}
                      />
                    </div>
                  </div>
                )}

                {/* 市级分布图表 */}
                {selectedProvince && cityData[selectedProvince] && (
                  <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                    <div className="chart-header-kpis">
                      <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>{formatProvinceRegionTitle(selectedProvince)}各地采购分布</h3>
                    </div>
                      <div className="chart-container">
                        <ReactECharts 
                          option={{
                            tooltip: {
                              trigger: 'axis',
                              backgroundColor: 'rgba(10, 25, 47, 0.95)',
                              borderColor: '#0099ff',
                              borderWidth: 1,
                              textStyle: { color: '#e0f2ff' },
                              axisPointer: {
                                type: 'shadow'
                              }
                            },
                            grid: {
                              left: '3%',
                              right: '4%',
                              bottom: '3%',
                              top: '10%',
                              containLabel: true
                            },
                            xAxis: {
                              type: 'category',
                              data: cityData[selectedProvince].map(c => c.city),
                              axisLabel: {
                                color: '#94a3b8',
                                fontSize: 10,
                                rotate: 45
                              },
                              axisLine: { lineStyle: { color: 'rgba(0, 153, 255, 0.3)' } }
                            },
                            yAxis: {
                              type: 'value',
                              name: '订货量(吨)',
                              nameTextStyle: { color: '#94a3b8' },
                              axisLabel: { color: '#94a3b8' },
                              axisLine: { lineStyle: { color: 'rgba(0, 153, 255, 0.3)' } },
                              splitLine: { lineStyle: { color: 'rgba(0, 153, 255, 0.1)' } }
                            },
                            series: [
                              {
                                name: '订货量',
                                type: 'bar',
                                data: cityData[selectedProvince].map(c => c.orderQty),
                                itemStyle: {
                                  color: {
                                    type: 'linear',
                                    x: 0, y: 0, x2: 0, y2: 1,
                                    colorStops: [
                                      { offset: 0, color: '#00d4ff' },
                                      { offset: 1, color: '#0066ff' }
                                    ]
                                  },
                                  borderRadius: [4, 4, 0, 0]
                                },
                                barWidth: '60%'
                              }
                            ]
                          }}
                          style={{ height: '200px' }}
                        />
                      </div>
                      <div style={{ padding: '0 16px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {cityData[selectedProvince].map(c => (
                            <span 
                              key={c.city}
                              style={{
                                background: 'rgba(0, 153, 255, 0.1)',
                                border: '1px solid rgba(0, 153, 255, 0.3)',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                fontSize: '0.75rem',
                                color: '#00d4ff'
                              }}
                            >
                              {c.city}: {c.orderQty}吨 ({c.suppliers}家)
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 供应商订单列表 */}
                  {selectedProvince && provinceData[selectedProvince] && (
                    <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                      <div className="chart-header-kpis">
                        <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>供应商订单明细</h3>
                      </div>
                      <div style={{ padding: '0 12px 12px' }}>
                        <Table
                          className="purchase-dashboard-level2-table"
                          columns={orderDetailTableColumns}
                          dataSource={provinceOrderTableRows}
                          rowKey="id"
                          pagination={{ pageSize: 8 }}
                          size="small"
                          scroll={{ x: 'max-content' }}
                          bordered={false}
                        />
                      </div>
                    </div>
                  )}
                </>
                )}
                {/* 资金使用计划详情 */}
                {activeLevel2Card === 'funds' && (
                  <div className="chart-card">
                    <div className="chart-header-kpis">
                      {/* 更新时间 */}
                      <div className="date-selector"><span className="status-dot"></span>  {updateTimeStr()}</div>
                    </div>
                    <div className="chart-container">
                      <ReactECharts option={fundPlanDailyOption} style={{ height: '100%' }} />
                    </div>
                    <div className="kpi-mini-row">
                      <div className="kpi-mini-item">
                        <span className="kpi-mini-label">计划总额</span>
                        <div className="kpi-mini-value">¥ {toWanInt(fundPlanDailyData.filter(d => d.type === '计划').reduce((sum, d) => sum + d.amount, 0)).toLocaleString()} 万</div>
                      </div>
                      <div className="kpi-mini-item">
                        <span className="kpi-mini-label">实际总额</span>
                        <div className="kpi-mini-value">¥ {toWanInt(fundPlanDailyData.filter(d => d.type === '实际').reduce((sum, d) => sum + d.amount, 0)).toLocaleString()} 万</div>
                      </div>
                      <div className="kpi-mini-item">
                        <span className="kpi-mini-label">完成率</span>
                        <div className="kpi-mini-value" style={{ color: '#10b981' }}>
                          {fundPlanDailyData.filter(d => d.type === '计划').length > 0 
                            ? ((fundPlanDailyData.filter(d => d.type === '实际').reduce((sum, d) => sum + d.amount, 0) / 
                               (fundPlanDailyData.filter(d => d.type === '计划').reduce((sum, d) => sum + d.amount, 0))) * 100).toFixed(1) 
                            : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 订单审批详情 */}
                {activeLevel2Card === 'approval' && (
                  <div className="chart-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div className="kpi-title" style={{ margin: '0' }}>采购订单详情</div>
                      <div className="date-selector"><span className="status-dot"></span> {monthWeekStr()}</div>
                    </div>
                    <div className="detail-chart-container">
                      <Table
                        columns={orderDetailTableColumns}
                        dataSource={purchaseOrderData}
                        pagination={{ pageSize: 10 }}
                        scroll={{ y: '60vh' }}
                        bordered={false}
                      />
                    </div>
                  </div>
                )}

                {/* 付款详情 */}
                {activeLevel2Card === 'pay' && (
                  <div className="chart-card">
                    <div className="chart-header-kpis">
                      <div className="mini-kpi">
                        <div className="kpi-title"><i className="fas fa-chart-line"></i> 采购付款监控</div>
                      {/* 更新时间 */}
                      <div className="date-selector"><span className="status-dot"></span>  {updateTimeStr()}</div>
                      </div>
                    </div>
                    <div className="chart-container">
                      <ReactECharts option={procurementPayOption} style={{ height: '50%' }} />
                    </div>
                    <div style={{ marginTop: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                      <h4 style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: '600' }}>付款申请明细</h4>
                      <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        <Table
                          columns={payDetailTableColumns}
                          dataSource={procurementPaymentData}
                          pagination={false}
                          scroll={{ y: '180px' }}
                          bordered={false}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 车辆需求详情 */}
                {activeLevel2Card === 'vehicle' && (
                  <div className="chart-card">
                    <div className="chart-header-kpis">
                      <div className="kpi-title">车辆需求（按路线）</div>
                      <div className="date-selector"><span className="status-dot"></span> 计划日: {selectedMonth}月{selectedDay}日</div>
                    </div>
                    <div className="tab-header-mini">
                      <Select
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        style={{ width: 80 }}
                      >
                        <Option value="4">4月</Option>
                        <Option value="5">5月</Option>
                      </Select>
                      <Select
                        value={selectedDay}
                        onChange={setSelectedDay}
                        style={{ width: 80 }}
                      >
                        {Array.from({ length: 30 }, (_, i) => (
                          <Option key={i + 1} value={(i + 1).toString()}>{i + 1}日</Option>
                        ))}
                      </Select>
                    </div>
                    <div className="detail-chart-container" style={{ height: '70vh' }}>
                      <Table
                        columns={[
                          { title: '序号', key: 'seq', dataIndex: 'seq' },
                          { title: '物料', key: 'material', dataIndex: 'material' },
                          { title: '车型', key: 'reqType', dataIndex: 'reqType' },
                          { title: '供应商', key: 'supplier', dataIndex: 'supplier' },
                          { title: '路线', key: 'route', render: (_, record: VehicleDemand) => `${record.origin} → ${record.dest}` },
                          { title: '数量', key: 'qty', dataIndex: 'qty' },
                          { title: '需求人', key: 'demander', dataIndex: 'demander' },
                        ]}
                        dataSource={vehicleDemandData}
                        pagination={{ pageSize: 15 }}
                        scroll={{ y: '55vh' }}
                        bordered={false}
                      />
                    </div>
                    <div className="kpi-mini-row">
                      <div className="kpi-mini-item">
                        <span className="kpi-mini-label">计划用车</span>
                        <div className="kpi-mini-value">{vehicleDemandData.length} 辆</div>
                      </div>
                      <div className="kpi-mini-item">
                        <span className="kpi-mini-label">实际用车</span>
                        <div className="kpi-mini-value">{vehicleDemandData.length} 辆</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 地图详情：仅省级底图 + 表格展示指标与明细 */}
                {activeLevel2Card === 'map' && selectedProvince && (
                  <div style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                      <div className="chart-header-kpis">
                        <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>{formatProvinceRegionTitle(selectedProvince)}行政区划与采购流向</h3>
                      </div>
                      <div
                        className="chart-container purchase-province-map-wrap"
                        style={{
                          height: 'clamp(620px, 68vh, 880px)',
                          minHeight: 620,
                          display: 'flex',
                          alignItems: 'stretch',
                          justifyContent: 'center',
                        }}
                      >
                        {provinceGeoLoading ? (
                          <Spin tip="加载省界地图..." />
                        ) : provinceGeoError ? (
                          <div style={{ color: '#f59e0b', padding: 24 }}>{provinceGeoError}</div>
                        ) : provinceGeoMapName ? (
                          <ReactECharts
                            key={`${selectedProvince}-${provinceGeoMapName}`}
                            option={buildProvinceDetailMapOption()}
                            style={{ height: '100%', width: '100%' }}
                            notMerge
                            lazyUpdate
                          />
                        ) : (
                          <div style={{ color: '#94a3b8' }}>暂无地图</div>
                        )}
                      </div>
                    </div>

                    {provinceData[selectedProvince] && (
                      <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                        <div className="chart-header-kpis">
                          <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>省级采购概览</h3>
                        </div>
                        <div style={{ padding: '0 12px 12px' }}>
                          <Table
                            className="purchase-dashboard-level2-table"
                            columns={LEVEL2_KPI_TABLE_COLUMNS}
                            dataSource={provinceKpiTableRows}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered={false}
                          />
                        </div>
                      </div>
                    )}

                    {cityData[selectedProvince] && (
                      <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                        <div className="chart-header-kpis">
                          <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>地市订货分布</h3>
                        </div>
                        <div style={{ padding: '0 12px 12px' }}>
                          <Table
                            className="purchase-dashboard-level2-table"
                            columns={LEVEL2_CITY_TABLE_COLUMNS}
                            dataSource={cityData[selectedProvince]}
                            rowKey="city"
                            pagination={{ pageSize: 10 }}
                            size="small"
                            bordered={false}
                          />
                        </div>
                      </div>
                    )}

                    {provinceFlowTableRows.length > 0 && (
                      <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                        <div className="chart-header-kpis">
                          <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>采购流向（示意）</h3>
                        </div>
                        <div style={{ padding: '0 12px 12px' }}>
                          <Table
                            className="purchase-dashboard-level2-table"
                            columns={LEVEL2_FLOW_TABLE_COLUMNS}
                            dataSource={provinceFlowTableRows}
                            rowKey="key"
                            pagination={false}
                            size="small"
                            bordered={false}
                          />
                        </div>
                      </div>
                    )}

                    {provinceData[selectedProvince] && (
                      <div className="chart-card" style={{ backgroundColor: 'rgba(10, 25, 47, 0.9)', borderColor: 'rgba(0, 153, 255, 0.3)' }}>
                        <div className="chart-header-kpis">
                          <h3 style={{ color: '#00d4ff', margin: '0', fontSize: '1.1rem' }}>供应商订单明细</h3>
                        </div>
                        <div style={{ padding: '0 12px 12px' }}>
                          <Table
                            className="purchase-dashboard-level2-table"
                            columns={orderDetailTableColumns}
                            dataSource={provinceOrderTableRows}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            size="small"
                            scroll={{ x: 'max-content' }}
                            bordered={false}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #1e293b;
            overflow: hidden;
        }
        .fullscreen {
            background: radial-gradient(circle at top right, #0a192f, #1e3a5f);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 9999;
            overflow: hidden;
        }
        .fullscreen .page {
            height: 100vh;
            background: radial-gradient(circle at top right, #0a192f, #1e3a5f);
        }
        .page {
            max-width: 100%;
            margin: 0;
            padding: 12px 16px;
            transition: all 0.3s ease;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: radial-gradient(circle at top right, #0a192f, #1e3a5f);
        }
        .page-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: nowrap;
            margin-bottom: 12px;
            gap: 16px;
        }
        h1 {
            font-size: 1.4rem;
            font-weight: 800;
            background: linear-gradient(135deg, #00d4ff, #0099ff, #0066ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: -0.5px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .back-link {
            background: rgba(57, 102, 162, 0.1);
            border: 1px solid rgba(57, 102, 162, 0.3);
            border-radius: 32px;
            padding: 6px 16px;
            font-size: 0.8rem;
            font-weight: 600;
            color: #3966A2;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .back-link:hover {
            background: #3966A2;
            color: white;
            border-color: #3966A2;
            box-shadow: 0 4px 10px rgba(57,102,162,0.3);
        }
        .pie-grid {
            display: grid;
            grid-template-columns: 2.9fr 4.2fr 2.9fr;
            grid-template-rows: 1fr;
            gap: 12px;
            flex: 0.6;
            min-height: 0;
        }
        .pie-grid-row2 {
            display: grid;
            grid-template-columns: 5fr 5fr;
            grid-template-rows: 1fr;
            gap: 12px;
            flex: 0.4;
            min-height: 0;
            margin-top: 12px;
        }
        .pie-card {
            background: rgba(10, 25, 47, 0.85);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 12px 16px;
            border: 1px solid rgba(0, 153, 255, 0.25);
            box-shadow: 0 0 30px rgba(0, 153, 255, 0.1), inset 0 1px 0 rgba(0, 212, 255, 0.1);
            transition: all 0.25s;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .pie-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 0 40px rgba(0, 153, 255, 0.2), inset 0 1px 0 rgba(0, 212, 255, 0.15);
            border-color: rgba(0, 212, 255, 0.4);
        }
        .pie-card h3 {
            font-size: 0.95rem;
            font-weight: 700;
            margin-bottom: 8px;
            color: #00d4ff;
            display: flex;
            align-items: center;
            gap: 8px;
            border-left: 4px solid #0099ff;
            padding-left: 10px;
            flex-shrink: 0;
            text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
        }
        .pie-card * {
            color: #e0f2ff;
        }
        .pie-chart { width: 100%; flex: 1; min-height: 0; }
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            gap: 0;
            flex: 1;
            min-height: 0;
            overflow: hidden;
            align-content: stretch;
        }
        .chart-card {
            background: rgba(10, 25, 47, 0.85);
            backdrop-filter: blur(12px);
            border-radius: 20px;
            padding: 16px 24px;
            border: 1px solid rgba(0, 153, 255, 0.25);
            box-shadow: 0 0 30px rgba(0, 153, 255, 0.1), inset 0 1px 0 rgba(0, 212, 255, 0.1);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            height: 100%;
        }
        .chart-card * {
            color: #e0f2ff;
        }
        .chart-container { width: 100%; height: 75vh; min-height: 0; flex: 1; }
        .purchase-province-map-wrap {
            flex: 1 1 auto;
        }
        .purchase-province-map-wrap > div {
            flex: 1;
            width: 100% !important;
            min-height: 0;
        }
        .chart-header-kpis {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #D6DEEB;
            flex-shrink: 0;
        }
        .mini-kpi .kpi-title { font-size: 0.8rem; color: #00d4ff; margin-bottom: 4px; white-space: nowrap; }  
        .mini-kpi .kpi-value { font-size: 1.4rem; font-weight: 800; white-space: nowrap; color: #ffffff; text-shadow: 0 0 10px rgba(0, 212, 255, 0.3); }
        .tab-header-mini {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
            border-bottom: 1px solid rgba(0, 153, 255, 0.25);
            padding-bottom: 8px;
            flex-shrink: 0;
        }
        .mini-tab-btn {
            padding: 4px 16px;
            border-radius: 24px;
            font-size: 0.8rem;
            font-weight: 600;
            background: rgba(0, 153, 255, 0.15);
            border: 1px solid rgba(0, 153, 255, 0.3);
            cursor: pointer;
            transition: 0.2s;
            color: #00d4ff;
        }
        .mini-tab-btn.active {
            background: linear-gradient(135deg, #0099ff, #0066ff);
            color: white;
            box-shadow: 0 0 20px rgba(0, 153, 255, 0.4);
        }
        .detail-chart-container { width: 100%; height: 70vh; min-height: 0; flex: 1; }
        .kpi-mini-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            margin-top: 12px;
            background: rgba(0, 153, 255, 0.1);
            border: 1px solid rgba(0, 153, 255, 0.25);
            border-radius: 16px;
            padding: 10px 16px;
            flex-shrink: 0;
        }
        .kpi-mini-item { flex: 1; text-align: center; }
        .kpi-mini-label { font-size: 0.75rem; color: #00d4ff; }
        .kpi-mini-value { font-weight: 800; font-size: 1.1rem; color: #ffffff; text-shadow: 0 0 8px rgba(0, 212, 255, 0.4); }
        .click-hint { font-size: 0.7rem; color: #0099ff; text-align: right; margin-top: 10px; }
        .date-selector {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
            background: rgba(0, 153, 255, 0.15);
            border: 1px solid rgba(0, 153, 255, 0.3);
            padding: 6px 16px;
            border-radius: 24px;
            color: #00d4ff;
        }
        .status-dot {
            width: 10px;
            height: 10px;
            background: #00d4ff;
            border-radius: 50%;
            display: inline-block;
            animation: pulse-blue 2s infinite;
        }
        @keyframes pulse-blue {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(0, 212, 255, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); }
        }
        .triple-tab-container { display: flex; flex-direction: column; flex: 1; min-height: 0; }
        .triple-tabs {
            display: flex;
            gap: 12px;
            margin-bottom: 16px;
            border-bottom: 1px solid #D6DEEB;
            padding-bottom: 8px;
            flex-shrink: 0;
        }
        .triple-tab {
            background: transparent;
            border: 1px solid rgba(0, 153, 255, 0.25);
            padding: 8px 20px;
            font-size: 0.9rem;
            font-weight: 600;
            border-radius: 28px;
            cursor: pointer;
            color: #00d4ff;
            transition: all 0.2s;
        }
        .triple-tab.active {
            background: linear-gradient(135deg, #0099ff, #0066ff);
            color: white;
            border-color: transparent;
            box-shadow: 0 0 20px rgba(0, 153, 255, 0.4);
        }
        .triple-chart-panel { width: 100%; height: 70vh; }
        .panel-chart { width: 100%; height: 100%; min-height: 0; }
        .order-cards {
            max-height: 40vh;
            min-height: 0;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-top: 12px;
            padding-right: 8px;
        }
        .order-cards::-webkit-scrollbar {
            width: 6px;
        }
        .order-cards::-webkit-scrollbar-track {
            background: rgba(0, 153, 255, 0.1);
            border-radius: 3px;
        }
        .order-cards::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #00d4ff, #0099ff);
            border-radius: 3px;
        }
        .order-cards::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #0099ff, #0066ff);
        }
        .order-card {
            background: rgba(10, 25, 47, 0.7);
            border-radius: 12px;
            padding: 12px;
            border: 1px solid rgba(0, 153, 255, 0.25);
            transition: all 0.2s;
        }
        .order-card:hover {
            background: rgba(10, 25, 47, 0.9);
            box-shadow: 0 0 30px rgba(0, 153, 255, 0.3);
            border-color: rgba(0, 212, 255, 0.5);
            transform: translateY(-2px);
        }
        .order-card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        .order-card-title {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .customer-name {
            font-weight: 600;
            font-size: 0.9rem;
            color: #ffffff;
            text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
        }
        .material-name {
            font-size: 0.8rem;
            color: #00d4ff;
        }
        .order-card-trend {
            font-size: 0.85rem;
            font-weight: 600;
            padding: 4px 8px;
            border-radius: 12px;
            background: rgba(0, 153, 255, 0.2);
            color: #00d4ff;
            border: 1px solid rgba(0, 212, 255, 0.3);
        }
        .order-card-trend.up {
            background: rgba(0, 102, 255, 0.25);
            color: #00d4ff;
            border: 1px solid rgba(0, 153, 255, 0.4);
        }
        .order-card-stats {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 12px;
            font-size: 0.8rem;
        }
        .order-card-stats span {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        .received-qty {
            color: #00d4ff;
            font-weight: 500;
            text-shadow: 0 0 6px rgba(0, 212, 255, 0.4);
        }
        .remaining-qty {
            color: #0099ff;
            font-weight: 500;
        }
        .total-qty {
            color: #ffffff;
            font-weight: 500;
            text-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
        }
        .order-amount {
            color: #00d4ff;
            font-weight: 500;
        }
        .order-card-progress {
            margin-top: 8px;
        }
        .progress-bar {
            height: 6px;
            background: rgba(0, 153, 255, 0.15);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 4px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00d4ff, #0099ff, #0066ff);
            border-radius: 3px;
            transition: width 0.3s ease;
            box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
        }
        .progress-text {
            font-size: 0.75rem;
            color: #00d4ff;
        }
        .purchase-dashboard-level2-table.ant-table-wrapper .ant-table {
            background: transparent;
        }
        .purchase-dashboard-level2-table .ant-table-thead > tr > th {
            background: rgba(0, 40, 80, 0.6) !important;
            color: #94a3b8 !important;
            border-bottom: 1px solid rgba(0, 153, 255, 0.25) !important;
        }
        .purchase-dashboard-level2-table .ant-table-tbody > tr > td {
            background: rgba(10, 25, 47, 0.6);
            color: #e0f2ff;
            border-bottom: 1px solid rgba(0, 153, 255, 0.12);
        }
        .purchase-dashboard-level2-table .ant-table-tbody > tr:hover > td {
            background: rgba(0, 60, 100, 0.45) !important;
        }
        .purchase-dashboard-level2-table .ant-pagination-item a {
            color: #94a3b8;
        }
        .purchase-dashboard-level2-table .ant-pagination-item-active {
            border-color: #00d4ff;
        }
        .purchase-dashboard-level2-table .ant-pagination-item-active a {
            color: #00d4ff;
        }
        @media (max-width: 1024px) {
            .pie-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
            .pie-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default PurchaseDashboard;