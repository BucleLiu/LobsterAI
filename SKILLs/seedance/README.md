# Seedance

使用火山引擎 Seedance 模型生成高质量 AI 视频。

## 功能描述

Seedance Skill 使用火山引擎 Seedance 模型生成高质量 AI 视频，支持：
- 文本生成视频（T2V）
- 图片生成视频（I2V）
- 音画同步视频生成

## 配置

- **Base URL**: `https://ark.cn-beijing.volces.com/api/v3`
- **API Key**: 从环境变量 `ARK_API_KEY` 读取

### 配置 API Key

```bash
# macOS/Linux
export ARK_API_KEY="你的API密钥"

# Windows PowerShell
$env:ARK_API_KEY="你的API密钥"
```

获取 API Key：
1. 访问火山方舟控制台：https://console.volcengine.com/ark/region:ark+cn-beijing/apikey
2. 创建新的 API Key
3. 复制密钥并设置为环境变量

## 使用方法

### 文本生成视频（T2V）

```bash
bash "$SKILLS_ROOT/seedance/scripts/generate-video.sh" \
  --prompt "一只小猫在草地上玩耍，阳光明媚，镜头缓缓推进" \
  --duration 5 \
  --output generated_video.mp4
```

### 图片生成视频（I2V）- 首帧引导

```bash
# 使用本地图片
bash "$SKILLS_ROOT/seedance/scripts/generate-video.sh" \
  --prompt "女孩睁开眼，温柔地看向镜头，头发被风吹动" \
  --image "/Users/yourname/Pictures/girl.jpg" \
  --duration 5 \
  --output i2v_video.mp4

# 使用网络图片
bash "$SKILLS_ROOT/seedance/scripts/generate-video.sh" \
  --prompt "女孩睁开眼，温柔地看向镜头，头发被风吹动" \
  --image "https://example.com/first_frame.jpg" \
  --duration 5 \
  --output i2v_video.mp4
```

### 图片生成视频（I2V）- 首尾帧引导

```bash
bash "$SKILLS_ROOT/seedance/scripts/generate-video.sh" \
  --prompt "360度环绕运镜，流畅过渡" \
  --image "/Users/yourname/Pictures/first_frame.jpg" \
  --image "/Users/yourname/Pictures/last_frame.jpg" \
  --duration 5 \
  --output transition_video.mp4
```

### 音画同步视频生成（仅 1.5 pro）

```bash
bash "$SKILLS_ROOT/seedance/scripts/generate-video.sh" \
  --prompt "镜头围绕人物推镜头拉近，特写人物面部，她正在用京剧唱腔唱'月移花影，疑是玉人来'" \
  --image "/Users/yourname/Pictures/actress.jpg" \
  --audio \
  --duration 5 \
  --model "doubao-seedance-1-5-pro-251215" \
  --output audio_video.mp4
```

## 参数说明

### 必需参数

| 参数 | 说明 | 示例 |
|-----|------|------|
| `--prompt` | 视频描述提示词（必需） | "小猫在玩耍" |

### 可选参数

| 参数 | 说明 | 默认值 | 可选值 |
|-----|------|-------|--------|
| `--image` | 参考图片路径或URL（可多次使用） | 无 | 本地文件路径或URL |
| `--model` | 模型ID | `doubao-seedance-1-5-pro-251215` | 见模型列表 |
| `--duration` | 视频时长（秒） | 5 | 2-12（不同模型范围不同） |
| `--ratio` | 宽高比 | `adaptive` | `adaptive`, `16:9`, `9:16`, `1:1` |
| `--audio` | 生成音频（仅1.5 pro支持） | 否 | 标志参数 |
| `--no-watermark` | 不添加水印 | 否 | 标志参数 |
| `--output` | 输出文件路径 | `generated_video.mp4` | 文件路径 |
| `--poll-interval` | 状态查询间隔（秒） | 5 | 1-10 |
| `--timeout` | 最大等待时间（秒） | 300 | 60-600 |

## 模型选择

| 模型 | 模型ID | 特点 | 支持功能 |
|------|--------|------|---------|
| **Seedance 1.5 pro**（推荐） | `doubao-seedance-1-5-pro-251215` | 音画同生，最高质量 | T2V, I2V, 首尾帧, 有声视频 |
| **Seedance 1.0 pro** | `doubao-seedance-1-0-pro-250528` | 高质量标准版本 | T2V, I2V, 首尾帧 |
| **Seedance 1.0 pro fast** | `doubao-seedance-1-0-pro-fast-251015` | 快速生成，成本更低 | T2V, I2V |
| **Seedance 1.0 lite** | T2V: `doubao-seedance-1-0-lite-t2v-250428`<br>I2V: `doubao-seedance-1-0-lite-i2v-250428` | 更快速度，支持多参考图 | T2V, I2V, 多参考图 |

## 提示词最佳实践

### 优秀提示词的特点

1. **清晰的场景描述** - 说明环境、时间、氛围
2. **具体的动作细节** - 描述物体或人物的具体动作
3. **镜头运动** - 说明推拉摇移、特写等镜头语言
4. **风格指定** - 写实、卡通、动漫等风格说明

### 提示词模板

```
[风格]，[场景描述]，[主体动作]，[镜头运动]，[氛围/情绪]
```

**示例：**
```
写实风格，海边日落，一只海鸥在空中盘旋，镜头从远处缓缓推进到海鸥特写，宁静祥和的氛围
```

## 注意事项

- 任务数据（包括视频URL）仅保留 **24 小时**，请及时下载
- 免费额度：default 模式下 **200万 token**
- Seedance 1.5 pro 支持 4-12 秒，1.0 系列支持 2-12 秒
- 支持的图片格式：jpg, jpeg, png, gif, webp, bmp, tiff, heic
