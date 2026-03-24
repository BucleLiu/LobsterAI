/**
 * 开机自启动管理模块
 *
 * 提供应用开机自启动的设置和查询功能
 * 支持 Windows、macOS 和 Linux 平台
 *
 * @module autoLaunchManager
 */

import { app } from 'electron';

/**
 * 获取当前开机自启动设置状态
 *
 * @returns {boolean} 是否已启用开机自启动
 */
export function getAutoLaunchEnabled(): boolean {
  try {
    // Windows: must pass the same args used in setLoginItemSettings,
    // otherwise openAtLogin defaults to comparing against [] which
    // won't match the registered ['--auto-launched'] and returns false.
    const settings = app.getLoginItemSettings({
      args: ['--auto-launched'],
    });
    return settings.openAtLogin;
  } catch (error) {
    console.error('Failed to get auto-launch settings:', error);
    return false;
  }
}

/**
 * 设置开机自启动状态
 *
 * @param {boolean} enabled - 是否启用开机自启动
 * @throws {Error} 设置失败时抛出错误
 */
export function setAutoLaunchEnabled(enabled: boolean): void {
  const isMac = process.platform === 'darwin';

  try {
    app.setLoginItemSettings({
      openAtLogin: enabled,
      // macOS: 自启后窗口不显示，M芯片和Intel均兼容
      openAsHidden: isMac ? enabled : false,
      // Windows: 通过命令行参数标记自启动
      args: enabled ? ['--auto-launched'] : [],
    });
  } catch (error) {
    console.error('Failed to set auto-launch settings:', error);
    throw error;
  }
}

/**
 * 检查当前应用是否是通过开机自启动启动的
 *
 * @returns {boolean} 是否为开机自启动
 */
export function isAutoLaunched(): boolean {
  try {
    if (process.platform === 'darwin') {
      const settings = app.getLoginItemSettings();
      return settings.wasOpenedAtLogin || false;
    }
    // Windows: 检查命令行参数
    return process.argv.includes('--auto-launched');
  } catch (error) {
    console.error('Failed to check auto-launch status:', error);
    return false;
  }
}
