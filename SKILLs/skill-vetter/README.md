# Skill Vetter

安全优先的技能审查协议。

## 功能描述

Skill Vetter 提供了在安装任何技能之前进行安全检查的标准化流程，帮助识别潜在风险、权限范围和可疑模式。

## 使用方法

### 何时使用

- 从 ClawdHub 安装任何技能之前
- 运行来自 GitHub 仓库的技能之前
- 评估其他 Agent 分享的技能时
- 被要求安装未知代码时

### 审查协议

#### 步骤 1：来源检查

需要回答的问题：
- 这个技能来自哪里？
- 作者是否知名/可信？
- 有多少下载/星标？
- 最后更新时间？
- 有其他 Agent 的评论吗？

#### 步骤 2：代码审查（必需）

阅读技能中的所有文件，检查以下**危险信号**：

**🚨 立即拒绝的情况：**
- curl/wget 到未知 URL
- 发送数据到外部服务器
- 请求凭证/令牌/API 密钥
- 读取 ~/.ssh, ~/.aws, ~/.config 没有明确原因
- 访问 MEMORY.md, USER.md, SOUL.md, IDENTITY.md
- 使用 base64 解码任何内容
- 使用 eval() 或 exec() 处理外部输入
- 修改 workspace 外的系统文件
- 安装包而不列出它们
- 网络调用使用 IP 而非域名
- 混淆代码（压缩、编码、混淆）
- 请求提升/sudo 权限
- 访问浏览器 cookie/会话
- 触碰凭证文件

#### 步骤 3：权限范围

评估：
- 需要读取什么文件？
- 需要写入什么文件？
- 运行什么命令？
- 需要网络访问吗？到哪里？
- 范围是否对其声明的目的最小化？

#### 步骤 4：风险分类

| 风险级别 | 示例 | 操作 |
|---------|------|------|
| 🟢 低 | 笔记、天气、格式化 | 基本审查，可以安装 |
| 🟡 中 | 文件操作、浏览器、API | 需要完整代码审查 |
| 🔴 高 | 凭证、交易、系统 | 需要人工批准 |
| ⛔ 极高 | 安全配置、root 访问 | 不要安装 |

### 输出格式

审查后生成报告：

```
SKILL VETTING REPORT
═══════════════════════════════════════
Skill: [名称]
Source: [ClawdHub / GitHub / 其他]
Author: [用户名]
Version: [版本]
───────────────────────────────────────
METRICS:
• Downloads/Stars: [数量]
• Last Updated: [日期]
• Files Reviewed: [数量]
───────────────────────────────────────
RED FLAGS: [无 / 列出]

PERMISSIONS NEEDED:
• Files: [列表或"无"]
• Network: [列表或"无"]  
• Commands: [列表或"无"]
───────────────────────────────────────
RISK LEVEL: [🟢 LOW / 🟡 MEDIUM / 🔴 HIGH / ⛔ EXTREME]

VERDICT: [✅ SAFE TO INSTALL / ⚠️ INSTALL WITH CAUTION / ❌ DO NOT INSTALL]

NOTES: [任何观察]
═══════════════════════════════════════
```

### 快速审查命令

对于 GitHub 托管的技能：

```bash
# 检查仓库统计
curl -s "https://api.github.com/repos/OWNER/REPO" | jq '{stars: .stargazers_count, forks: .forks_count, updated: .updated_at}'

# 列出技能文件
curl -s "https://api.github.com/repos/OWNER/REPO/contents/skills/SKILL_NAME" | jq '.[].name'

# 获取并审查 SKILL.md
curl -s "https://raw.githubusercontent.com/OWNER/REPO/main/skills/SKILL_NAME/SKILL.md"
```

### 信任层级

1. **官方 OpenClaw 技能** → 较低审查
2. **高星仓库（1000+）** → 适度审查
3. **已知作者** → 适度审查
4. **新/未知来源** → 最大审查
5. **请求凭证的技能** → 始终需要人工批准

## 注意事项

- 没有技能值得牺牲安全
- 有疑问时不要安装
- 高风险决策询问你的人工
- 记录你审查的内容以供将来参考

---

*偏执是一种特性。* 🔒
