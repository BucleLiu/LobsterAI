# Local Tools

访问本地系统资源，包括 macOS 和 Windows 上的日历管理。

## 功能描述

Local Tools Skill 允许直接访问用户设备上的本地资源，目前支持：
- **日历管理** - 查看、创建、更新或删除日历事件

## 使用方法

### 架构

```
┌──────────┐    Bash/PowerShell    ┌─────────────────────────────────────────────────────────────┐
│  Claude  │──────────────────────▶│  calendar.sh / calendar.ps1                                 │
│          │                       │  ├─ macOS: osascript -l JavaScript (JXA) ──▶ Calendar.app   │
│          │                       │  └─ Windows: PowerShell ──▶ Outlook COM API                 │
└──────────┘                       └─────────────────────────────────────────────────────────────┘
```

### 平台支持

| 平台 | 实现方式 | 日历应用 | 状态 |
|------|---------|---------|------|
| **macOS 10.10+** | JXA + Calendar.app | Calendar.app | ✅ 完全支持 |
| **Windows 7+** | PowerShell + COM | Microsoft Outlook | ✅ 完全支持 |
| **Linux** | - | - | ❌ 不支持 |

### 权限

**macOS**：
- 需要"日历"访问权限
- 首次使用时用户将被提示授权
- 可在系统设置 > 隐私与安全 > 日历中管理

**Windows**：
- 需要安装 Microsoft Outlook
- COM 访问可能需要管理员权限

### 命令

**定位脚本**：

使用 SKILL.md 文件所在目录的绝对路径，追加 `/scripts/calendar.sh`（macOS）或 `/scripts/calendar.ps1`（Windows）。

```bash
# 示例：如果 SKILL.md 位于 /Users/username/path/to/SKILLs/local-tools/SKILL.md
# 则脚本路径为：/Users/username/path/to/SKILLs/local-tools/scripts/calendar.sh

bash "/Users/username/path/to/SKILLs/local-tools/scripts/calendar.sh" <操作> [选项]
```

### 列出事件

```bash
# 列出接下来 7 天的事件（默认）
bash "<skill-dir>/scripts/calendar.sh" list

# 列出特定日期范围的事件
bash "<skill-dir>/scripts/calendar.sh" list \
  --start "2026-02-12T00:00:00" \
  --end "2026-02-19T23:59:59"

# 从特定日历列出事件（macOS）
bash "<skill-dir>/scripts/calendar.sh" list \
  --calendar "Work"
```

### 创建事件

```bash
# 创建简单事件
bash "<skill-dir>/scripts/calendar.sh" create \
  --title "团队会议" \
  --start "2026-02-13T14:00:00" \
  --end "2026-02-13T15:00:00"

# 创建带位置和备注的事件
bash "<skill-dir>/scripts/calendar.sh" create \
  --title "客户电话" \
  --start "2026-02-14T10:00:00" \
  --end "2026-02-14T11:00:00" \
  --calendar "Work" \
  --location "会议室 A" \
  --notes "讨论 Q1 路线图"
```

### 更新事件

```bash
# 更新事件标题
bash "<skill-dir>/scripts/calendar.sh" update \
  --id "EVENT-ID" \
  --title "更新的会议标题"

# 更新时间
bash "<skill-dir>/scripts/calendar.sh" update \
  --id "EVENT-ID" \
  --start "2026-02-13T15:00:00" \
  --end "2026-02-13T16:00:00"
```

### 删除事件

```bash
bash "<skill-dir>/scripts/calendar.sh" delete \
  --id "EVENT-ID"
```

### 搜索事件

```bash
# 搜索包含关键词的事件（搜索所有日历）
bash "<skill-dir>/scripts/calendar.sh" search \
  --query "meeting"

# 仅在特定日历中搜索
bash "<skill-dir>/scripts/calendar.sh" search \
  --query "project" \
  --calendar "Work"
```

## 输出格式

### 成功响应

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "eventId": "E621F8C4-...",
        "title": "团队会议",
        "startTime": "2026-02-13T14:00:00.000Z",
        "endTime": "2026-02-13T15:00:00.000Z",
        "location": "会议室",
        "notes": "每周同步",
        "calendar": "Work",
        "allDay": false
      }
    ],
    "count": 1
  }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "CALENDAR_ACCESS_ERROR",
    "message": "Calendar access permission is required...",
    "recoverable": true,
    "permissionRequired": true
  }
}
```

## 日期格式指南

**始终使用 ISO 8601 格式**：`YYYY-MM-DDTHH:mm:ss`

**使用本地时区**：不要使用 UTC 或时区后缀

**示例：**
- 今天午夜：`2026-02-13T00:00:00`
- 今天结束：`2026-02-13T23:59:59`
- 明天上午：`2026-02-14T09:00:00`

## 注意事项

- 脚本期望与系统时区匹配的本地时间字符串
- 所有日期时间使用秒级精度
- 毫秒在日期比较中被忽略
- 重复事件的每次出现被视为单独的事件实例
- 在创建事件前检查现有事件以避免冲突
- 更新/删除前先搜索以获取正确的事件 ID
