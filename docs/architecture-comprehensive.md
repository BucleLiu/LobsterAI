# LobsterAI 架构文档

> 本文档详细描述了 LobsterAI 的架构设计、模块关系、数据流和通信机制。
> 最后更新：2026-03-24

## 目录

1. [系统概述](#系统概述)
2. [整体架构](#整体架构)
3. [模块依赖关系](#模块依赖关系)
4. [通信机制](#通信机制)
5. [数据流说明](#数据流说明)
6. [Skill 加载和执行流程](#skill-加载和执行流程)
7. [配置和数据存储机制](#配置和数据存储机制)
8. [IM 集成架构](#im-集成架构)
9. [内存管理](#内存管理)

---

## 系统概述

LobsterAI 是一个基于 Electron 的桌面 AI 助手应用，支持多种 AI 模型提供商（OpenAI、Anthropic、Moonshot、DeepSeek 等）。它提供了以下核心功能：

- **AI 对话协作 (Cowork)**：与 AI 进行多轮对话，支持工具调用
- **Skill 系统**：可扩展的技能插件机制
- **IM 集成**：支持钉钉、飞书、Telegram、Discord、企业微信、POPO、NIM 等多种 IM 平台
- **定时任务**：支持创建和管理定时任务
- **MCP 服务器**：支持 Model Context Protocol 服务器集成

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LobsterAI 应用                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        渲染进程 (Renderer)                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │   │
│  │  │  React UI   │  │  Redux Store│  │   Services  │  │   Hooks     │ │   │
│  │  │  Components │  │  (State)    │  │  (API/Cowork)│  │             │ │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────────┘ │   │
│  │         │                │                │                         │   │
│  │         └────────────────┴────────────────┘                         │   │
│  │                          │                                          │   │
│  │                    ┌─────┴─────┐                                    │   │
│  │                    │  IPC API  │                                    │   │
│  │                    │ (Preload) │                                    │   │
│  │                    └─────┬─────┘                                    │   │
│  └──────────────────────────┼──────────────────────────────────────────┘   │
│                             │ IPC 通信                                      │
├─────────────────────────────┼───────────────────────────────────────────────┤
│  ┌──────────────────────────┼──────────────────────────────────────────┐   │
│  │                          ▼                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                    主进程 (Main)                             │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │   │
│  │  │  │  Electron   │  │   Cowork    │  │    Skill    │          │   │   │
│  │  │  │    Core     │  │   Engine    │  │   Manager   │          │   │   │
│  │  │  └─────────────┘  └──────┬──────┘  └──────┬──────┘          │   │   │
│  │  │                          │                │                 │   │   │
│  │  │  ┌─────────────┐  ┌──────┴──────┐  ┌──────┴──────┐          │   │   │
│  │  │  │  IM Gateway │  │OpenClaw Eng │  │  MCP Server │          │   │   │
│  │  │  │  Manager    │  │   Manager   │  │   Manager   │          │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                      数据存储层                              │   │   │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │   │
│  │  │  │  SQLite     │  │  File Store │  │  Config     │          │   │   │
│  │  │  │  (sql.js)   │  │             │  │   Files     │          │   │   │
│  │  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 模块依赖关系

### 1. 渲染进程模块依赖

```
main.tsx
  └── App.tsx
       ├── Sidebar.tsx
       ├── Settings.tsx
       ├── CoworkView.tsx
       │    └── CoworkSessionDetail.tsx
       │         └── CoworkPromptInput.tsx
       ├── SkillsView.tsx
       ├── ScheduledTasksView.tsx
       └── McpView.tsx

store/index.ts
  ├── coworkSlice.ts
  ├── skillSlice.ts
  ├── modelSlice.ts
  ├── imSlice.ts
  ├── mcpSlice.ts
  ├── scheduledTaskSlice.ts
  └── quickActionSlice.ts

services/
  ├── cowork.ts
  ├── api.ts
  ├── config.ts
  ├── i18n.ts
  └── theme.ts
```

### 2. 主进程模块依赖

```
main.ts
  ├── ipcHandlers.ts
  │    ├── coworkHandlers.ts
  │    ├── skillHandlers.ts
  │    ├── imHandlers.ts
  │    └── mcpHandlers.ts
  ├── openclawEngineManager.ts
  ├── skillManager.ts
  ├── coworkStore.ts
  ├── mcpStore.ts
  └── im/
       ├── imGatewayManager.ts
       ├── imCoworkHandler.ts
       └── [各平台适配器]

libs/
  ├── agentEngine/
  │    ├── coworkEngineRouter.ts
  │    ├── openclawRuntimeAdapter.ts
  │    └── claudeRuntimeAdapter.ts
  ├── openclawConfigSync.ts
  └── [工具库]
```

### 3. 跨层依赖关系

```
渲染进程                    主进程
   │                          │
   │  ┌────────────────────┐  │
   ├──┤   IPC Channels     ├──┤
   │  └────────────────────┘  │
   │                          │
   │  window.electron.*       │
   │       │                  │
   │       ▼                  ▼
   │  ┌─────────────────────────────┐
   └──┤      Preload Script        │
      │   (Context Bridge API)     │
      └─────────────────────────────┘
```

---

## 通信机制

### 1. 主进程 ↔ 渲染进程通信

#### 1.1 IPC 通道定义 (preload.ts)

```typescript
// 主要 IPC 通道
export interface ElectronAPI {
  // Cowork 相关
  cowork: {
    startSession: (options: CoworkStartOptions) => Promise<CoworkResult>;
    continueSession: (options: CoworkContinueOptions) => Promise<CoworkResult>;
    stopSession: (sessionId: string) => Promise<void>;
    listSessions: () => Promise<ListSessionsResult>;
    // ... 更多方法
    
    // 事件监听
    onStreamMessage: (callback) => () => void;
    onStreamMessageUpdate: (callback) => () => void;
    onStreamPermission: (callback) => () => void;
    onStreamComplete: (callback) => () => void;
    onStreamError: (callback) => () => void;
  };
  
  // OpenClaw 引擎
  openclaw: {
    engine: {
      getStatus: () => Promise<OpenClawEngineStatus>;
      start: () => Promise<OpenClawEngineStatus>;
      stop: () => Promise<void>;
      restart: () => Promise<OpenClawEngineStatus>;
      onProgress: (callback) => () => void;
    };
  };
  
  // Skill 管理
  skills: {
    list: () => Promise<Skill[]>;
    install: (source: string) => Promise<InstallResult>;
    uninstall: (skillId: string) => Promise<void>;
    enable: (skillId: string) => Promise<void>;
    disable: (skillId: string) => Promise<void>;
  };
}
```

#### 1.2 通信模式

| 模式 | 方向 | 使用场景 | 实现方式 |
|------|------|----------|----------|
| 请求-响应 | Renderer → Main | API 调用、数据获取 | `ipcRenderer.invoke` / `ipcMain.handle` |
| 单向事件 | Main → Renderer | 状态推送、流式数据 | `webContents.send` / `ipcRenderer.on` |
| 双向流 | 双向 | 实时消息、流式响应 | EventEmitter + IPC |

#### 1.3 流式消息处理

```
CoworkRunner (Main)          IPC Channel           CoworkService (Renderer)
       │                           │                        │
       │  emit('message')          │                        │
       ├───────────────────────────┼───────────────────────►│
       │                           │  onStreamMessage       │
       │                           │                        │
       │  emit('messageUpdate')    │                        │
       ├───────────────────────────┼───────────────────────►│
       │                           │  onStreamMessageUpdate │
       │                           │                        │
       │  emit('permissionRequest')│                        │
       ├───────────────────────────┼───────────────────────►│
       │                           │  onStreamPermission    │
```

### 2. 运行时引擎通信

#### 2.1 引擎运行时适配器模式

```
┌─────────────────────────────────────────────────────────────┐
│                    CoworkEngineRouter                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Runtime Adapter 接口                    │   │
│  │  - startSession()                                   │   │
│  │  - continueSession()                                │   │
│  │  - stopSession()                                    │   │
│  │  - Event: message, messageUpdate, complete, error   │   │
│  └─────────────────────────────────────────────────────┘   │
│                         │                                   │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ OpenClaw    │ │   Claude    │ │  (Future)   │           │
│  │   Adapter   │ │   Adapter   │ │  Adapters   │           │
│  └──────┬──────┘ └──────┬──────┘ └─────────────┘           │
│         │               │                                   │
│         ▼               ▼                                   │
│  ┌─────────────────────────────────────┐                   │
│  │         OpenClaw Gateway            │                   │
│  │  (WebSocket / HTTP Gateway)         │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2 OpenClaw 网关通信

```typescript
// 网关连接信息
interface OpenClawGatewayConnectionInfo {
  version: string | null;
  port: number | null;
  token: string | null;
  url: string | null;  // ws://127.0.0.1:{port}
  clientEntryPath: string | null;
}

// 启动流程
1. OpenClawEngineManager.startGateway()
2. 生成/读取 gateway token
3. 扫描可用端口 (DEFAULT_GATEWAY_PORT: 18789)
4. fork/spawn 网关进程 (UtilityProcess / ChildProcess)
5. 等待健康检查通过
6. 返回连接信息
```

---

## 数据流说明

### 1. 会话创建数据流

```
用户输入
   │
   ▼
┌──────────────────┐
│ CoworkPromptInput │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌──────────────────┐
│  coworkService   │────►│  window.electron │
│  .startSession() │     │  .cowork.start   │
└────────┬─────────┘     └────────┬─────────┘
         │                        │
         │                        ▼
         │               ┌──────────────────┐
         │               │  IPC Handler     │
         │               │  (main process)  │
         │               └────────┬─────────┘
         │                        │
         │                        ▼
         │               ┌──────────────────┐
         │               │ CoworkEngineRouter│
         │               │ .routeStart()     │
         │               └────────┬─────────┘
         │                        │
         │         ┌──────────────┼──────────────┐
         │         ▼              ▼              ▼
         │   ┌──────────┐   ┌──────────┐   ┌──────────┐
         │   │ OpenClaw │   │  Claude  │   │   ...    │
         │   │ Adapter  │   │ Adapter  │   │          │
         │   └────┬─────┘   └────┬─────┘   └──────────┘
         │        │              │
         │        ▼              ▼
         │   ┌─────────────────────────────────────┐
         │   │         AI Model Provider            │
         │   │  (OpenAI/Anthropic/Moonshot/...)     │
         │   └─────────────────────────────────────┘
         │
         │  流式响应
         │◄────────────────────────────────────────────
         │
         ▼
┌──────────────────┐
│  Redux Store     │
│  addMessage()    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  UI Re-render    │
└──────────────────┘
```

### 2. 工具调用数据流

```
AI Model
   │
   │  Tool Use Request
   ▼
┌──────────────────┐
│  CoworkRunner    │
│  (Event: 'message')│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Permission Check │
│  (如果需要确认)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Tool Execution  │
│  (Bash/Read/Write)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Tool Result     │
│  (Event: 'message')│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Continue Stream │
│  (发送给 AI)      │
└──────────────────┘
```

### 3. IM 消息数据流

```
IM Platform
   │
   │ Webhook / WebSocket
   ▼
┌──────────────────┐
│  IM Gateway      │
│  (dingtalk/      │
│   feishu/telegram│
│   /discord/...)  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  IMCoworkHandler │
│  .processMessage()│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Session Mapping │
│  (IM ↔ Cowork)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  CoworkRuntime   │
│  .startSession() │
│  .continueSession()│
└────────┬─────────┘
         │
         │ 流式响应
         ▼
┌──────────────────┐
│  IM Reply        │
│  (格式化后发送)   │
└──────────────────┘
```

---

## Skill 加载和执行流程

### 1. Skill 目录结构

```
SKILLs/
├── skill-name/
│   ├── SKILL.md          # Skill 定义文件 (Frontmatter + Prompt)
│   ├── agent/            # Agent 子目录 (可选)
│   │   └── agent-name/
│   │       └── AGENT.md
│   └── [其他资源文件]
└── another-skill/
    └── SKILL.md
```

### 2. Skill 加载流程

```
skillManager.ts
   │
   ▼
┌──────────────────┐
│  扫描 SKILLs 目录 │
│  listSkillDirs() │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  解析 SKILL.md   │
│  parseFrontmatter()│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  安全扫描        │
│  scanSkillSecurity()│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  构建 SkillRecord│
│  (id, name, desc, │
│   prompt, enabled)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  同步到 OpenClaw │
│  (AGENTS.md 生成) │
└──────────────────┘
```

### 3. Skill 执行流程

```
用户消息
   │
   ▼
┌──────────────────┐
│  系统 Prompt 构建 │
│  (包含可用 Skills)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  AI 模型处理     │
│  (识别 Skill 调用)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Skill 路由      │
│  (根据名称匹配)   │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  执行 Skill 脚本 │
│  (Node/Python/...)│
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  返回结果给 AI   │
└──────────────────┘
```

### 4. Skill 安全机制

```typescript
// 安全扫描流程
scanSkillSecurity(skillDir) {
  1. 静态代码分析 (Static Analysis)
     - 检测危险 API 调用
     - 检测可疑文件操作
     
  2. 行为分析 (Behavioral Analysis)
     - 网络请求检测
     - 敏感数据访问检测
     
  3. 提示词审计 (Prompt Audit)
     - 检查 SKILL.md 内容
     - 检测潜在注入风险
     
  4. 生成安全报告
     - riskLevel: 'low' | 'medium' | 'high' | 'critical'
     - findings: 具体问题列表
}
```

---

## 配置和数据存储机制

### 1. 配置体系

```
┌─────────────────────────────────────────────────────────────┐
│                       配置层级                               │
├─────────────────────────────────────────────────────────────┤
│  Level 1: 默认配置 (代码中)                                  │
│  Level 2: 应用配置 (Electron Store)                          │
│  Level 3: OpenClaw 配置 (openclaw.json)                      │
│  Level 4: Skill 配置 (skills.config.json)                    │
│  Level 5: 会话配置 (SQLite)                                  │
└─────────────────────────────────────────────────────────────┘
```

### 2. 存储位置

| 类型 | 位置 | 说明 |
|------|------|------|
| 应用配置 | `app.getPath('userData')/config.json` | Electron Store |
| OpenClaw 状态 | `userData/openclaw/state/` | 网关状态、token、端口 |
| OpenClaw 配置 | `userData/openclaw/state/openclaw.json` | 网关配置 |
| Skill 目录 | `userData/SKILLs/` | 用户安装的 Skills |
| 会话数据库 | `app.getPath('userData')/cowork.db` | SQLite (sql.js) |
| 日志 | `userData/openclaw/logs/gateway.log` | 网关日志 |

### 3. 数据模型

#### 3.1 会话模型 (CoworkSession)

```typescript
interface CoworkSession {
  id: string;                    // UUID
  title: string;                 // 会话标题
  claudeSessionId: string | null; // Claude SDK 会话 ID
  status: 'idle' | 'running' | 'completed' | 'error';
  pinned: boolean;
  cwd: string;                   // 工作目录
  systemPrompt: string;
  executionMode: 'auto' | 'local' | 'sandbox';
  activeSkillIds: string[];
  messages: CoworkMessage[];
  createdAt: number;
  updatedAt: number;
}
```

#### 3.2 消息模型 (CoworkMessage)

```typescript
interface CoworkMessage {
  id: string;
  type: 'user' | 'assistant' | 'tool_use' | 'tool_result' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    toolName?: string;
    toolInput?: Record<string, unknown>;
    toolResult?: string;
    toolUseId?: string | null;
    error?: string;
    isError?: boolean;
    isStreaming?: boolean;
    isFinal?: boolean;
    skillIds?: string[];
  };
}
```

#### 3.3 用户记忆模型 (CoworkUserMemory)

```typescript
interface CoworkUserMemory {
  id: string;
  text: string;                  // 记忆内容
  confidence: number;            // 置信度 0-1
  isExplicit: boolean;           // 是否显式添加
  status: 'created' | 'stale' | 'deleted';
  createdAt: number;
  updatedAt: number;
  lastUsedAt: number | null;
}
```

### 4. 配置同步机制

```
UI 修改配置
   │
   ▼
┌──────────────────┐
│  ConfigService   │
│  (Renderer)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  IPC: setConfig  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Main Process    │
│  configStore.ts  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  OpenClawConfigSync│
│  .sync()         │
└────────┬─────────┘
         │
         ├──► 更新 openclaw.json
         │
         ├──► 同步 AGENTS.md
         │
         └──► 重启 Gateway (如需要)
```

---

## IM 集成架构

### 1. IM 平台支持

```
┌─────────────────────────────────────────────────────────────┐
│                      IM Gateway Manager                      │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ DingTalk │ │  Feishu  │ │ Telegram │ │ Discord  │       │
│  │ (钉钉)   │ │ (飞书)   │ │          │ │          │       │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │
│  │  WeCom   │ │   POPO   │ │   NIM    │ │  Weixin  │       │
│  │(企业微信)│ │          │ │          │ │ (微信)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

### 2. IM 会话映射

```typescript
interface IMSessionMapping {
  imConversationId: string;    // IM 平台会话 ID
  platform: IMPlatform;        // 平台类型
  coworkSessionId: string;     // 对应的 Cowork 会话 ID
  createdAt: number;
  lastActiveAt: number;
}
```

### 3. IM 消息处理流程

```
IM 消息接收
   │
   ▼
┌──────────────────┐
│  Platform        │
│  Adapter         │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Normalize to    │
│  IMMessage       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  IMCoworkHandler │
│  .processMessage()│
└────────┬─────────┘
         │
         ├──► 检查待处理权限
         │
         ├──► 检测定时任务请求
         │
         └──► 转发到 CoworkRuntime
```

---

## 内存管理

### 1. 内存使用监控点

| 模块 | 潜在内存泄漏点 | 防护措施 |
|------|---------------|----------|
| CoworkRunner | 活跃会话 Map | 会话完成自动清理 |
| IM Cowork Handler | 消息累加器 | 5分钟超时清理 |
| OpenClaw Gateway | 子进程句柄 | 退出时强制终止 |
| Stream Listeners | 事件监听器 | cleanupListeners() |
| Redux Store | 消息历史 | 限制消息数量 |

### 2. 资源清理机制

```typescript
// 渲染进程清理
class CoworkService {
  private streamListenerCleanups: Array<() => void> = [];
  
  cleanupListeners(): void {
    this.streamListenerCleanups.forEach(cleanup => cleanup());
    this.streamListenerCleanups = [];
  }
}

// 主进程清理
class CoworkRunner {
  stopSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.abortController.abort();
      this.activeSessions.delete(sessionId);
    }
  }
}
```

### 3. 流式数据处理限制

```typescript
// 防止内存压力的内容截断
const STREAMING_TEXT_MAX_CHARS = 120_000;
const STREAMING_THINKING_MAX_CHARS = 60_000;
const TOOL_RESULT_MAX_CHARS = 120_000;
const FINAL_RESULT_MAX_CHARS = 120_000;
const STDERR_TAIL_MAX_CHARS = 24_000;

// 截断提示
const CONTENT_TRUNCATED_HINT = '\n...[truncated to prevent memory pressure]';
```

---

## 附录

### A. 关键文件路径

| 文件 | 路径 | 说明 |
|------|------|------|
| 主入口 | `src/main/main.ts` | Electron 主进程入口 |
| Preload | `src/main/preload.ts` | IPC 桥接脚本 |
| 渲染入口 | `src/renderer/main.tsx` | React 应用入口 |
| 引擎管理 | `src/main/libs/openclawEngineManager.ts` | OpenClaw 引擎管理 |
| Skill 管理 | `src/main/skillManager.ts` | Skill 安装/卸载/管理 |
| 会话存储 | `src/main/coworkStore.ts` | SQLite 数据操作 |
| IM 处理 | `src/main/im/imCoworkHandler.ts` | IM 消息处理 |

### B. 环境变量

| 变量 | 说明 |
|------|------|
| `OPENCLAW_HOME` | OpenClaw 运行时根目录 |
| `OPENCLAW_STATE_DIR` | 状态目录 |
| `OPENCLAW_CONFIG_PATH` | 配置文件路径 |
| `OPENCLAW_GATEWAY_TOKEN` | 网关访问令牌 |
| `OPENCLAW_GATEWAY_PORT` | 网关端口 |
| `LOBSTERAI_ELECTRON_PATH` | Electron 可执行路径 |
| `NODE_COMPILE_CACHE` | V8 编译缓存目录 |

### C. 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 网关启动时间 | < 30s | 首次启动 |
| 会话创建时间 | < 2s | 从点击到开始流式输出 |
| 消息响应延迟 | < 500ms | 首字符到达时间 |
| 内存占用 | < 500MB | 渲染进程 |
| 内存占用 | < 300MB | 主进程 |
