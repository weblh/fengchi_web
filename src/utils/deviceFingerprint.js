import FingerprintJS from '@fingerprintjs/fingerprintjs';

class DeviceFingerprint {
  constructor() {
    this.fingerprint = null;
  }
  
  async init() {
    try {
      // 检查是否在 Electron 环境中
      if (window.electronAPI) {
        console.log('Using Electron device ID');
        // 使用 Electron API 获取设备ID
        this.fingerprint = await window.electronAPI.getDeviceId();
      } else {
        console.log('Using browser fingerprint');
        // 在浏览器环境中使用 FingerprintJS
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        
        // 采集硬件相关信息
        const hardwareInfo = await this.collectHardwareInfo();
        
        // 组合多个标识符
        const components = {
          // 基础浏览器信息
          userAgent: navigator.userAgent,
          language: navigator.language,
          platform: navigator.platform,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          
          // 硬件相关信息
          hardware: hardwareInfo,
          
          // FingerprintJS 提供的组件
          canvas: result.components?.canvas?.value || 'unknown',
          webgl: result.components?.webgl?.value || 'unknown',
          fonts: result.components?.fonts?.value || 'unknown',
          audio: result.components?.audio?.value || 'unknown',
          colorDepth: result.components?.colorDepth?.value || 'unknown',
          deviceMemory: result.components?.deviceMemory?.value || 'unknown',
          cpuClass: result.components?.cpuClass?.value || 'unknown'
        };
        
        // 生成唯一ID
        this.fingerprint = this.generateHash(JSON.stringify(components));
      }
      
      // 存储在 localStorage 中
      localStorage.setItem('device_id', this.fingerprint);
      
      return this.fingerprint;
    } catch (error) {
      console.error('Error initializing device fingerprint:', error);
      //  fallback to browser fingerprint
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      this.fingerprint = result.visitorId;
      localStorage.setItem('device_id', this.fingerprint);
      return this.fingerprint;
    }
  }
  
  async collectHardwareInfo() {
    const hardwareInfo = {
      // CPU 信息
      cpu: {
        cores: navigator.hardwareConcurrency || 'unknown',
        // 浏览器环境无法直接获取 CPU 序列号
        serial: 'browser_restricted'
      },
      
      // 存储设备信息
      storage: {
        // 浏览器环境无法直接获取硬盘 ID/卷标
        diskId: 'browser_restricted',
        totalSpace: this.getStorageInfo()
      },
      
      // 网络信息
      network: {
        // 浏览器环境无法直接获取 MAC 地址
        macAddress: 'browser_restricted',
        connectionType: this.getConnectionType()
      },
      
      // 系统信息
      system: {
        // 浏览器环境无法直接获取主板信息
        motherboard: 'browser_restricted',
        os: navigator.platform,
        userAgent: navigator.userAgent
      }
    };
    
    return hardwareInfo;
  }
  
  getStorageInfo() {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        return 'available';
      }
    } catch (e) {
      console.error('Error getting storage info:', e);
    }
    return 'unknown';
  }
  
  getConnectionType() {
    try {
      if ('connection' in navigator) {
        return navigator.connection.type || 'unknown';
      }
    } catch (e) {
      console.error('Error getting connection info:', e);
    }
    return 'unknown';
  }
  
  generateHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
  
  getDeviceId() {
    return localStorage.getItem('device_id') || this.fingerprint;
  }
}

export default new DeviceFingerprint();