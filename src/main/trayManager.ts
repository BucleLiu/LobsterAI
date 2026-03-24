/**
 * 系统托盘管理模块
 *
 * 负责管理系统托盘图标和菜单
 * 支持 Windows、macOS 和 Linux 平台
 *
 * @module trayManager
 */

import { app, Tray, Menu, nativeImage, BrowserWindow } from 'electron';
import path from 'path';
import { APP_NAME } from './appConstants';
import { t } from './i18n';

/** 托盘实例 */
let tray: Tray | null = null;
let contextMenu: Menu | null = null;
let clickHandler: (() => void) | null = null;
let rightClickHandler: (() => void) | null = null;

/**
 * 获取托盘图标路径
 *
 * 根据平台返回对应的图标文件路径
 *
 * @returns {string} 图标文件的绝对路径
 */
function getTrayIconPath(): string {
  const isMac = process.platform === 'darwin';
  const isWin = process.platform === 'win32';

  const basePath = app.isPackaged
    ? path.join(process.resourcesPath, 'tray')
    : path.join(__dirname, '..', 'resources', 'tray');

  if (isMac) {
    return path.join(basePath, 'tray-icon-mac.png');
  }
  if (isWin) {
    return path.join(basePath, 'tray-icon.ico');
  }
  // Linux
  return path.join(basePath, 'tray-icon.png');
}

/**
 * 获取托盘菜单标签
 *
 * @returns {Object} 菜单标签对象
 * @returns {string} returns.showWindow - 显示窗口
 * @returns {string} returns.newTask - 新建任务
 * @returns {string} returns.settings - 设置
 * @returns {string} returns.quit - 退出
 */
function getLabels(): { showWindow: string; newTask: string; settings: string; quit: string } {
  return {
    showWindow: t('trayShowWindow'),
    newTask: t('trayNewTask'),
    settings: t('traySettings'),
    quit: t('trayQuit'),
  };
}

function buildContextMenu(getWindow: () => BrowserWindow | null): Menu {
  const labels = getLabels();

  return Menu.buildFromTemplate([
    {
      label: labels.showWindow,
      click: () => {
        const win = getWindow();
        if (win && !win.isDestroyed()) {
          if (!win.isVisible()) win.show();
          if (!win.isFocused()) win.focus();
        }
      },
    },
    {
      label: labels.newTask,
      click: () => {
        const win = getWindow();
        if (win && !win.isDestroyed()) {
          if (!win.isVisible()) win.show();
          if (!win.isFocused()) win.focus();
          win.webContents.send('app:newTask');
        }
      },
    },
    { type: 'separator' },
    {
      label: labels.settings,
      click: () => {
        const win = getWindow();
        if (win && !win.isDestroyed()) {
          if (!win.isVisible()) win.show();
          if (!win.isFocused()) win.focus();
          win.webContents.send('app:openSettings');
        }
      },
    },
    { type: 'separator' },
    {
      label: labels.quit,
      click: () => {
        app.quit();
      },
    },
  ]);
}

/**
 * 创建系统托盘
 *
 * @param {Function} getWindow - 获取主窗口的函数
 * @returns {Tray} 创建的托盘实例
 */
export function createTray(getWindow: () => BrowserWindow | null): Tray {
  if (tray) {
    return tray;
  }

  const iconPath = getTrayIconPath();
  let icon = nativeImage.createFromPath(iconPath);

  if (process.platform === 'darwin') {
    icon.setTemplateImage(false);
    // Keep the tray icon within macOS menu bar bounds.
    if (icon.getSize().height > 18) {
      icon = icon.resize({ height: 18 });
      icon.setTemplateImage(false);
    }
  }

  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);

  contextMenu = buildContextMenu(getWindow);

  clickHandler = () => {
    const win = getWindow();
    if (!win || win.isDestroyed()) return;
    if (!win.isVisible()) win.show();
    if (!win.isFocused()) win.focus();
  };

  rightClickHandler = () => {
    if (contextMenu) {
      tray?.popUpContextMenu(contextMenu);
    }
  };

  tray.on('click', clickHandler);
  tray.on('right-click', rightClickHandler);

  return tray;
}

/**
 * 更新托盘菜单
 *
 * @param {Function} getWindow - 获取主窗口的函数
 */
export function updateTrayMenu(getWindow: () => BrowserWindow | null): void {
  if (!tray) return;
  contextMenu = buildContextMenu(getWindow);
}

/**
 * 销毁托盘实例
 *
 * 清理托盘相关的所有资源和事件监听器
 */
export function destroyTray(): void {
  if (tray) {
    try {
      if (clickHandler) tray.removeListener('click', clickHandler);
      if (rightClickHandler) tray.removeListener('right-click', rightClickHandler);
    } catch (e) {
      // 忽略清理时的错误，托盘可能已被系统销毁
    }
    tray.destroy();
    tray = null;
    contextMenu = null;
    clickHandler = null;
    rightClickHandler = null;
  }
}
