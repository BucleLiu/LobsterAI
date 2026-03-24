# Playwright

通过终端自动化真实浏览器（导航、表单填写、快照、截图、数据提取、UI 流程调试）。

## 功能描述

Playwright Skill 提供了从终端控制真实浏览器的能力，支持页面导航、元素交互、截图捕获、数据提取等功能。适用于自动化测试、数据抓取和 UI 调试。

## 使用方法

### 前置检查

在使用前检查 `npx` 是否可用：

```bash
command -v npx >/dev/null 2>&1
```

如果不可用，需要安装 Node.js/npm。

### 环境设置

```bash
export SKILLS_ROOT="${LOBSTERAI_SKILLS_ROOT:-${SKILLS_ROOT:-$HOME/Library/Application Support/LobsterAI/SKILLs}}"
export PWCLI="$SKILLS_ROOT/playwright/scripts/playwright_cli.sh"
```

### 核心工作流程

1. **打开页面**
2. **获取快照**以获取稳定的元素引用
3. **使用最新快照中的引用进行交互**
4. **导航或 DOM 重大变化后重新获取快照**
5. **捕获工件**（截图、PDF、跟踪）

最小循环：

```bash
"$PWCLI" open https://example.com
"$PWCLI" snapshot
"$PWCLI" click e3
"$PWCLI" snapshot
```

### 何时重新获取快照

以下情况后需要重新获取快照：
- 页面导航
- 点击大幅改变 UI 的元素
- 打开/关闭模态框或菜单
- 标签切换

引用可能过期。当命令因缺少引用失败时，重新获取快照。

### 推荐模式

**表单填写和提交：**

```bash
"$PWCLI" open https://example.com/form
"$PWCLI" snapshot
"$PWCLI" fill e1 "user@example.com"
"$PWCLI" fill e2 "password123"
"$PWCLI" click e3
"$PWCLI" snapshot
```

**使用跟踪调试 UI 流程：**

```bash
"$PWCLI" open https://example.com --headed
"$PWCLI" tracing-start
# ...交互...
"$PWCLI" tracing-stop
```

**多标签工作：**

```bash
"$PWCLI" tab-new https://example.com
"$PWCLI" tab-list
"$PWCLI" tab-select 0
"$PWCLI" snapshot
```

### 包装脚本

包装脚本使用 `npx --package @playwright/mcp playwright-cli`，无需全局安装即可运行 CLI：

```bash
"$PWCLI" --help
```

## 依赖要求

- Node.js 18+
- npx
- Playwright（通过 npx 自动安装）
- Chrome/Chromium 浏览器

## 注意事项

- 引用元素 ID（如 `e12`）前始终先获取快照
- 引用似乎过期时重新获取快照
- 优先使用显式命令而非 `eval` 和 `run-code`
- 需要视觉检查时添加 `--headed`
- CLI 命令和工作流优先于 Playwright 测试规范
