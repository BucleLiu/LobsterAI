# Develop Web Game

使用 Playwright 进行 Web 游戏开发和测试的可靠开发循环。

## 功能描述

Develop Web Game Skill 提供了一个完整的 Web 游戏开发工作流，支持小步迭代、自动化测试和状态验证。适用于使用 HTML/JS 构建的网页游戏。

## 使用方法

### 环境设置

```bash
export SKILLS_ROOT="${LOBSTERAI_SKILLS_ROOT:-${SKILLS_ROOT:-$HOME/Library/Application Support/LobsterAI/SKILLs}}"
export WEB_GAME_CLIENT="$SKILLS_ROOT/develop-web-game/scripts/web_game_playwright_client.js"
export WEB_GAME_ACTIONS="$SKILLS_ROOT/develop-web-game/references/action_payloads.json"
```

### 核心工作流程

1. **选择目标** - 定义单个功能或行为
2. **小步实现** - 做出最小的有效改动
3. **确保集成点** - 提供 `window.render_game_to_text` 函数
4. **添加时间步进钩子** - 提供 `window.advanceTime(ms)` 函数
5. **初始化 progress.md** - 记录原始提示和 TODO
6. **运行 Playwright 测试** - 每次改动后运行测试脚本
7. **检查截图** - 打开并验证最新截图
8. **检查错误** - 修复控制台错误
9. **迭代优化** - 小步调整，重复测试

### 游戏要求

**必须实现：**

```javascript
// 游戏状态文本输出（用于测试验证）
function renderGameToText() {
  const payload = {
    mode: state.mode,
    player: { x: state.player.x, y: state.player.y },
    entities: state.entities.map(e => ({ x: e.x, y: e.y })),
    score: state.score,
  };
  return JSON.stringify(payload);
}
window.render_game_to_text = renderGameToText;

// 确定性时间步进（用于自动化测试）
window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  for (let i = 0; i < steps; i++) update(1 / 60);
  render();
};
```

### 测试命令

```bash
# 基本测试循环
node "$WEB_GAME_CLIENT" --url http://localhost:5173 \
  --actions-file "$WEB_GAME_ACTIONS" \
  --click-selector "#start-btn" \
  --iterations 3 \
  --pause-ms 250
```

### 操作载荷示例

```json
{
  "steps": [
    { "buttons": ["left_mouse_button"], "frames": 2, "mouse_x": 120, "mouse_y": 80 },
    { "buttons": [], "frames": 6 },
    { "buttons": ["right"], "frames": 8 },
    { "buttons": ["space"], "frames": 4 }
  ]
}
```

## 测试清单

测试以下功能：
- 主要移动/交互输入（移动、跳跃、射击、确认/选择）
- 胜负或成功/失败转换
- 分数/生命值/资源变化
- 边界条件（碰撞、墙壁、屏幕边缘）
- 菜单/暂停/开始流程
- 与请求相关的特殊动作（强化道具、连击、能力、谜题、计时器）

## 视觉要求

- 使用单个居中的 canvas
- 屏幕上文字最少
- 避免过暗的场景
- 在 canvas 本身上绘制背景
- 使用单个按键（推荐 `f`）切换全屏

## 依赖要求

- Playwright（本地依赖或全局安装）
- Node.js
- Chrome/Chromium 浏览器

## 注意事项

- 每次有意义改动后必须运行 Playwright 测试脚本
- 必须实际打开并检查最新截图
- 修复第一个新错误后再继续
- 在不同场景间重置状态
- 一次只改变一个变量
