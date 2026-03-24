# Technology News Search

搜索技术博客、开发者论坛和 IT 媒体获取软件和硬件行业更新。

## 功能描述

Technology News Search Skill 实时搜索 75 个技术新闻源，具有智能域名路由、自动网络适配、热度排名和中英翻译功能。

## 总览

**总来源：75 个（18 个中国 + 57 个全球，跨越 9 个核心技术领域）**

**自动网络适配**：静默检测网络可访问性并自动调整来源选择：
- ✅ **全球网络可访问**：使用所有 75 个来源（中国 + 全球）
- 🇨🇳 **仅中国网络**：自动仅使用 18 个中国来源
- ⚡ **完全透明**：检测缓存 5 分钟，无需用户通知

### 新闻来源按领域

- **通用（25 个来源）**：TechCrunch, The Verge, Wired, 36氪, 虎嗅, IT之家, 机器之心等
- **前端/Web（14 个来源）**：Dev.to, Reddit, 官方博客, 掘金
- **后端（16 个来源）**：Dev.to, Reddit, 官方博客, 掘金, 博客园
- **移动端（4 个来源）**：Reddit, Android Developers Blog
- **AI/ML（11 个来源）**：VentureBeat, 机器之心, 量子位, Reddit
- **DevOps（9 个来源）**：Reddit, 官方博客, 阿里云开发者
- **硬件（4 个来源）**：Hackaday, Arduino Blog, Reddit
- **安全（4 个来源）**：The Hacker News, Krebs on Security, Reddit
- **操作系统（1 个来源）**：Phoronix

## 使用方法

### 快速开始

```bash
bash "$SKILLS_ROOT/technology-news-search/scripts/search-news.sh" "关键词" --limit 15
```

### 智能来源路由

技能自动从关键词检测技术领域并仅搜索相关来源：

| 关键词示例 | 检测领域 | 搜索来源数 |
|-----------|---------|-----------|
| "Electron 技术资讯" | 通用 + 前端 | ~37 个 |
| "ChatGPT 最新消息" | 通用 + AI | ~30 个 |
| "Docker 安全漏洞" | 通用 + DevOps + 安全 | ~32 个 |
| "技术新闻"（通用） | 通用 | ~25 个 |

### 禁用智能路由

搜索所有可用来源：
```bash
bash "$SKILLS_ROOT/technology-news-search/scripts/search-news.sh" "关键词" --all-sources
```

### 参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--limit 15` | 每个来源获取最多文章数 | 15 |
| `--max-per-source 5` | 每个来源显示最多文章数 | 5 |
| `--no-balance` | 禁用平衡（仅按热度排序） | - |
| `--all-sources` | 搜索所有 75 个来源 | - |

## 输出格式

```markdown
# 🔍 "[关键词]" Technology News

> 📊 从 7 个来源找到 12 篇文章
> 🕐 搜索时间：2026-02-18 14:30

---

## 🔥 热门新闻（热度 90+）

### 1. OpenAI Announces GPT-5 Release Date / OpenAI 宣布 GPT-5 发布日期
**来源**：TechCrunch | **发布时间**：2小时前 | **热度**：⭐⭐⭐⭐⭐ (95)

**摘要**：OpenAI CEO Sam Altman 透露 GPT-5 将在 2026 年第二季度推出...

🔗 [阅读更多](https://techcrunch.com/...)

*💡 同时出现在：The Verge, Wired, MIT Tech Review*

---

## 📈 趋势新闻（热度 60-89）
...

## 📰 相关新闻（热度 <60）
...
```

## 热度评分

热度评分（0-100）结合多个因素：

- **多来源奖励**：每个重复来源 +20 分
- **时间衰减**：
  - 24小时内：+40 分
  - 24-48小时：+28 分
  - 48-72小时：+16 分
  - 72小时以上：+8 分
- **关键词匹配质量**：
  - 标题完全匹配：+30
  - 标题部分匹配：+15
  - 摘要匹配：+5
- **HN 参与度**：每 10 分 +1（最多 +20）
- **Reddit 参与度**：每 10 个赞 +1（最多 +20）
- **官方来源奖励**：+10

## 配置

来源配置在 `references/sources.json` 中。

启用/禁用来源：编辑 JSON 文件并设置 `"enabled": true/false`。

## 注意事项

- 始终翻译英文内容到中文
- 保留技术术语英文（AI, GPT, API, SDK 等）
- 使用 Markdown 格式，避免复杂 HTML
- 显示重复来源：使用 "Also on: ..." 行
- 使用星级可视化热度（5星 = 90-100, 4星 = 70-89 等）
