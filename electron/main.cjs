const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// 确保只有一个实例运行
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow;

// 获取硬件指纹
function getHardwareFingerprint() {
  try {
    // 基础硬件信息（所有平台通用）
    const hardwareInfo = {
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || 'unknown',
        speed: os.cpus()[0]?.speed || 0,
      },
      system: {
        platform: os.platform(),
        release: os.release(),
        arch: os.arch(),
        hostname: os.hostname(),
      },
      memory: {
        total: os.totalmem(),
      },
      network: {
        macAddresses: getMacAddresses(),
      },
    };

    // Windows 特定信息
    if (os.platform() === 'win32') {
      const windowsInfo = getWindowsHardwareInfo();
      Object.assign(hardwareInfo, windowsInfo);
    }

    // 生成唯一指纹
    const fingerprintString = JSON.stringify(hardwareInfo);
    const fingerprint = generateHash(fingerprintString);

    console.log('Hardware fingerprint generated:', fingerprint);
    return fingerprint;

  } catch (error) {
    console.error('Error getting hardware fingerprint:', error);
    // 返回基于主机名和时间戳的备用ID
    return generateHash(`${os.hostname()}-${Date.now()}`);
  }
}

// 获取 Windows 系统信息
function getWindowsHardwareInfo() {
  const info = {};

  try {
    // 方法1：使用 PowerShell 获取 BIOS 序列号
    try {
      const psCommand = 'Get-WmiObject Win32_BIOS | Select-Object -ExpandProperty SerialNumber';
      const serial = execSync(`powershell -command "${psCommand}"`, { encoding: 'utf8' }).trim();
      if (serial) {
        info.biosSerial = serial;
      }
    } catch (e) {
      console.log('PowerShell method failed:', e.message);
    }

    // 方法2：尝试获取 CPU 信息
    try {
      const cpuInfo = execSync('wmic cpu get ProcessorId', { encoding: 'utf8', shell: 'powershell.exe' });
      const lines = cpuInfo.split('\n').filter(line => line.trim() && line !== 'ProcessorId');
      if (lines.length > 0) {
        info.cpuId = lines[0].trim();
      }
    } catch (e) {
      console.log('CPU ID method failed:', e.message);
    }

    // 方法3：获取系统驱动器的卷序列号
    try {
      const volumeInfo = execSync('vol C:', { encoding: 'utf8' });
      const match = volumeInfo.match(/Serial Number is ([A-F0-9-]+)/i);
      if (match) {
        info.volumeSerial = match[1];
      }
    } catch (e) {
      console.log('Volume serial method failed:', e.message);
    }

  } catch (error) {
    console.error('Error getting Windows hardware info:', error);
  }

  return info;
}

// 获取 MAC 地址列表
function getMacAddresses() {
  const interfaces = os.networkInterfaces();
  const macs = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (!iface.internal && iface.mac !== '00:00:00:00:00:00') {
        macs.push(iface.mac);
      }
    }
  }

  return macs.sort();
}

// 生成哈希值
function generateHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + Date.now().toString(36);
}

// 创建主窗口
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 关键：区分开发环境和生产环境
  if (app.isPackaged) {
    // 生产环境：加载打包后的文件
    const appPath = app.getAppPath();
    console.log('App path:', appPath);
    
    // 尝试所有可能的路径
    const possiblePaths = [
      // 路径1：直接在 build 目录
      path.join(__dirname, '..', 'build', 'index.html'),
      // 路径2：从 app.asar 向上两级到 win-unpacked，再向上一级到 build
      path.join(path.dirname(path.dirname(appPath)), '..', 'index.html'),
      // 路径3：当前目录
      path.join(__dirname, 'index.html'),
      // 路径4：向上一级目录
      path.join(__dirname, '..', 'index.html')
    ];
    
    let foundPath = null;
    for (const indexPath of possiblePaths) {
      console.log('Checking path:', indexPath);
      const fs = require('fs');
      if (fs.existsSync(indexPath)) {
        foundPath = indexPath;
        console.log('Found index.html at:', foundPath);
        break;
      }
    }
    
    if (foundPath) {
      mainWindow.loadFile(foundPath);
    } else {
      console.error('Index.html not found in any path');
      // 显示错误信息
      const errorHtml = `
        <h1>Error: Index.html not found</h1>
        <p>App path: ${appPath}</p>
        <p>__dirname: ${__dirname}</p>
        <p>Tried paths:</p>
        <ul>
          ${possiblePaths.map(p => `<li>${p}</li>`).join('')}
        </ul>
      `;
      mainWindow.loadURL('data:text/html,' + errorHtml);
    }
    
    // 生产环境打开开发者工具调试
    mainWindow.webContents.openDevTools();
  } else {
    // 开发环境：加载 Vite 开发服务器
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  }

  // 监听加载失败事件
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // 监听控制台消息
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log('Renderer console:', message);
  });

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

// 设置内容安全策略
function setupCSP() {
  const isDev = !app.isPackaged;
  let csp = "default-src 'self'; script-src 'self' 'unsafe-inline'";

  if (isDev) {
    csp = "default-src 'self' http://localhost:* ws://localhost:*; " +
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:* https://*.vitejs.dev; " +
          "style-src 'self' 'unsafe-inline' http://localhost:*; " +
          "connect-src 'self' http://localhost:* ws://localhost:*;";
  }

  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    });
  });
}

// 应用准备就绪
app.on('ready', () => {
  setupCSP();
  createWindow();
});

// 监听获取设备ID的请求
ipcMain.handle('get-device-id', () => {
  return getHardwareFingerprint();
});

// 所有窗口关闭时退出应用
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 在 macOS 上，点击 dock 图标时重新创建窗口
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});