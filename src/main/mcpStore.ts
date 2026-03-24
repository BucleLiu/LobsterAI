/**
 * MCP (Model Context Protocol) 服务器存储模块
 *
 * 管理 MCP 服务器的配置信息，包括：
 * - 服务器基本配置（名称、描述、启用状态）
 * - 传输配置（stdio/sse/http）
 * - 认证配置（命令、参数、环境变量、URL、请求头）
 * - 元数据（是否内置、GitHub URL、注册表 ID）
 *
 * 使用 SQLite 数据库存储，通过 sql.js 在内存中操作
 *
 * @module mcpStore
 */

import crypto from 'crypto';
import { Database } from 'sql.js';

/**
 * MCP 服务器记录
 * @interface
 */
export interface McpServerRecord {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  transportType: 'stdio' | 'sse' | 'http';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  isBuiltIn: boolean;
  githubUrl?: string;
  registryId?: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * MCP 服务器表单数据
 * 用于创建或更新服务器配置
 * @interface
 */
export interface McpServerFormData {
  name: string;
  description: string;
  transportType: 'stdio' | 'sse' | 'http';
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  isBuiltIn?: boolean;
  githubUrl?: string;
  registryId?: string;
}

interface McpServerRow {
  id: string;
  name: string;
  description: string;
  enabled: number;
  transport_type: string;
  config_json: string;
  created_at: number;
  updated_at: number;
}

interface McpConfigJson {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string;
  headers?: Record<string, string>;
  isBuiltIn?: boolean;
  githubUrl?: string;
  registryId?: string;
}

/**
 * MCP 服务器存储管理类
 *
 * 提供 MCP 服务器的 CRUD 操作和状态管理
 */
export class McpStore {
  private db: Database;
  private saveDb: () => void;

  /**
   * 创建 MCP 存储实例
   *
   * @param {Database} db - sql.js 数据库实例
   * @param {Function} saveDb - 保存数据库的回调函数
   */
  constructor(db: Database, saveDb: () => void) {
    this.db = db;
    this.saveDb = saveDb;
  }

  private deserializeRow(values: unknown[]): McpServerRecord {
    const row: McpServerRow = {
      id: values[0] as string,
      name: values[1] as string,
      description: values[2] as string,
      enabled: values[3] as number,
      transport_type: values[4] as string,
      config_json: values[5] as string,
      created_at: values[6] as number,
      updated_at: values[7] as number,
    };

    let config: McpConfigJson = {};
    try {
      config = JSON.parse(row.config_json) as McpConfigJson;
    } catch {
      // Invalid JSON, use defaults
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      enabled: row.enabled === 1,
      transportType: row.transport_type as 'stdio' | 'sse' | 'http',
      command: config.command,
      args: config.args,
      env: config.env,
      url: config.url,
      headers: config.headers,
      isBuiltIn: config.isBuiltIn === true,
      githubUrl: config.githubUrl,
      registryId: config.registryId,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private serializeConfig(data: Partial<McpServerFormData>): string {
    const config: McpConfigJson = {};
    if (data.command !== undefined) config.command = data.command;
    if (data.args !== undefined) config.args = data.args;
    if (data.env !== undefined && Object.keys(data.env).length > 0) config.env = data.env;
    if (data.url !== undefined) config.url = data.url;
    if (data.headers !== undefined && Object.keys(data.headers).length > 0) config.headers = data.headers;
    if (data.isBuiltIn) config.isBuiltIn = true;
    if (data.githubUrl) config.githubUrl = data.githubUrl;
    if (data.registryId) config.registryId = data.registryId;
    return JSON.stringify(config);
  }

  /**
   * 列出所有 MCP 服务器
   *
   * @returns {McpServerRecord[]} 服务器记录列表，按创建时间升序排列
   */
  listServers(): McpServerRecord[] {
    const result = this.db.exec(
      'SELECT id, name, description, enabled, transport_type, config_json, created_at, updated_at FROM mcp_servers ORDER BY created_at ASC'
    );
    if (!result[0]) return [];
    return result[0].values.map((row) => this.deserializeRow(row));
  }

  /**
   * 获取指定 ID 的 MCP 服务器
   *
   * @param {string} id - 服务器 ID
   * @returns {McpServerRecord | null} 服务器记录，不存在时返回 null
   */
  getServer(id: string): McpServerRecord | null {
    const result = this.db.exec(
      'SELECT id, name, description, enabled, transport_type, config_json, created_at, updated_at FROM mcp_servers WHERE id = ?',
      [id]
    );
    if (!result[0]?.values[0]) return null;
    return this.deserializeRow(result[0].values[0]);
  }

  /**
   * 创建新的 MCP 服务器
   *
   * @param {McpServerFormData} data - 服务器配置数据
   * @returns {McpServerRecord} 创建的服务器记录
   */
  createServer(data: McpServerFormData): McpServerRecord {
    const id = crypto.randomUUID();
    const now = Date.now();
    const configJson = this.serializeConfig(data);

    this.db.run(
      `INSERT INTO mcp_servers (id, name, description, enabled, transport_type, config_json, created_at, updated_at)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?)`,
      [id, data.name, data.description, data.transportType, configJson, now, now]
    );
    this.saveDb();

    return this.getServer(id)!;
  }

  /**
   * 更新 MCP 服务器配置
   *
   * @param {string} id - 服务器 ID
   * @param {Partial<McpServerFormData>} data - 要更新的配置数据
   * @returns {McpServerRecord | null} 更新后的服务器记录，不存在时返回 null
   */
  updateServer(id: string, data: Partial<McpServerFormData>): McpServerRecord | null {
    const existing = this.getServer(id);
    if (!existing) return null;

    const now = Date.now();
    const merged: McpServerFormData = {
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      transportType: data.transportType ?? existing.transportType,
      command: data.command !== undefined ? data.command : existing.command,
      args: data.args !== undefined ? data.args : existing.args,
      env: data.env !== undefined ? data.env : existing.env,
      url: data.url !== undefined ? data.url : existing.url,
      headers: data.headers !== undefined ? data.headers : existing.headers,
      isBuiltIn: data.isBuiltIn !== undefined ? data.isBuiltIn : existing.isBuiltIn,
      githubUrl: data.githubUrl !== undefined ? data.githubUrl : existing.githubUrl,
      registryId: data.registryId !== undefined ? data.registryId : existing.registryId,
    };

    const configJson = this.serializeConfig(merged);

    this.db.run(
      `UPDATE mcp_servers SET name = ?, description = ?, transport_type = ?, config_json = ?, updated_at = ? WHERE id = ?`,
      [merged.name, merged.description, merged.transportType, configJson, now, id]
    );
    this.saveDb();

    return this.getServer(id);
  }

  /**
   * 删除 MCP 服务器
   *
   * @param {string} id - 服务器 ID
   * @returns {boolean} 是否删除成功
   */
  deleteServer(id: string): boolean {
    const existing = this.getServer(id);
    if (!existing) return false;

    this.db.run('DELETE FROM mcp_servers WHERE id = ?', [id]);
    this.saveDb();
    return true;
  }

  /**
   * 设置 MCP 服务器的启用状态
   *
   * @param {string} id - 服务器 ID
   * @param {boolean} enabled - 是否启用
   * @returns {boolean} 是否设置成功
   */
  setEnabled(id: string, enabled: boolean): boolean {
    const existing = this.getServer(id);
    if (!existing) return false;

    const now = Date.now();
    this.db.run(
      'UPDATE mcp_servers SET enabled = ?, updated_at = ? WHERE id = ?',
      [enabled ? 1 : 0, now, id]
    );
    this.saveDb();
    return true;
  }

  getEnabledServers(): McpServerRecord[] {
    const result = this.db.exec(
      'SELECT id, name, description, enabled, transport_type, config_json, created_at, updated_at FROM mcp_servers WHERE enabled = 1 ORDER BY created_at ASC'
    );
    if (!result[0]) return [];
    return result[0].values.map((row) => this.deserializeRow(row));
  }
}
