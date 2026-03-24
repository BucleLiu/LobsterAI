# Seedream

使用火山引擎 Seedream 模型生成高质量 AI 图片。

## 功能描述

Seedream Skill 使用火山引擎 Seedream 模型生成高质量 AI 图片，支持：
- 文本生成图片（T2I）
- 图片编辑（I2I）
- 多图融合
- 组图生成
- 联网搜索增强生成

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

### 文本生成图片（T2I）

```bash
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "充满活力的特写编辑肖像，模特眼神犀利，头戴雕塑感帽子，色彩拼接丰富" \
  --output portrait.png
```

### 图片编辑（I2I）- 单图输入

```bash
# 使用本地图片
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "保持模特姿势不变，将服装材质改为透明玻璃质感" \
  --image "/Users/yourname/Pictures/model.jpg" \
  --output edited_model.png

# 使用网络图片
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "将背景改为海边日落场景" \
  --image "https://example.com/photo.jpg" \
  --output beach_sunset.png
```

### 多图融合（多图输入单图输出）

```bash
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "将图1的服装换为图2的服装" \
  --image "/Users/yourname/Pictures/person.jpg" \
  --image "https://example.com/clothes.jpg" \
  --output fusion_result.png
```

### 组图生成（多图输出）

#### 文生组图

```bash
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "生成一组共4张连贯插画，核心为同一庭院一角的四季变迁" \
  --sequential \
  --max-images 4 \
  --output seasons.png
```

输出文件会自动编号：`seasons_1.png`, `seasons_2.png`, `seasons_3.png`, `seasons_4.png`

#### 单图生组图

```bash
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "参考这个LOGO，做一套户外运动品牌视觉设计" \
  --image "/Users/yourname/Pictures/logo.png" \
  --sequential \
  --max-images 4 \
  --output brand_design.png
```

### 联网搜索增强生成（Seedream 5.0 lite）

```bash
bash "$SKILLS_ROOT/seedream/scripts/generate-image.sh" \
  --prompt "搜索下近期热门的白鸭子单手拿着风车形象，设计成巨型装置" \
  --search \
  --output search_result.png
```

**注意**：
- 联网搜索功能仅限 Seedream 5.0 lite 模型
- 使用 `--search` 参数会自动切换到 5.0 lite 模型

## 参数说明

### 必需参数

| 参数 | 说明 | 示例 |
|-----|------|------|
| `--prompt` | 图片描述提示词（必需） | "一只可爱的小猫" |

### 可选参数

| 参数 | 说明 | 默认值 | 可选值 |
|-----|------|-------|--------|
| `--image` | 参考图片路径或URL（可多次使用） | 无 | 本地文件路径或URL |
| `--model` | 模型ID | `doubao-seedream-4-5-251128` | 见模型列表 |
| `--size` | 图片尺寸 | `2K` | `1K`, `2K`, `4K` |
| `--no-watermark` | 不添加水印 | 否 | 标志参数 |
| `--sequential` | 生成组图 | 否 | 标志参数 |
| `--max-images` | 组图数量 | 4 | 1-8 |
| `--search` | 启用联网搜索 | 否 | 标志参数 |
| `--output` | 输出文件路径 | `generated_image.png` | 文件路径 |
| `--poll-interval` | 状态查询间隔（秒） | 5 | 1-10 |
| `--timeout` | 最大等待时间（秒） | 300 | 60-600 |

## 模型选择

| 模型 | 模型ID | 特点 | 推荐使用场景 |
|------|--------|------|-------------|
| **Seedream 4.5**（推荐） | `doubao-seedream-4-5-251128` | 最新版本，综合质量最佳 | 追求最高质量 |
| **Seedream 4.0** | `doubao-seedream-4-0-250828` | 成熟稳定版本 | 稳定生产环境 |
| **Seedream 5.0 lite** | `doubao-seedream-5-0-260128` | 支持联网搜索 | 需要实时信息 |

## 提示词最佳实践

### 优秀提示词的特点

1. **清晰的主体描述** - 说明画面的主要内容
2. **具体的风格指定** - 写实、卡通、赛博朋克等
3. **细节补充** - 色彩、光线、氛围等
4. **构图说明** - 特写、全景、俯视等视角

### 提示词模板

```
[风格]，[主体描述]，[细节补充]，[构图/氛围]
```

**示例：**
```
写实风格，一只橘色小猫坐在木制窗台上，阳光从左侧洒进来，温暖治愈的氛围，特写构图
```

## 注意事项

- 任务数据（包括图片URL）仅保留 **24 小时**，请及时下载
- IPM（每分钟图片数）限制：500 张/分钟（Seedream 4.5, 4.0）
- 支持的图片格式：jpg, jpeg, png, gif, webp, bmp, tiff, heic
- 尺寸越大，生成时间越长
- 4K 图片可能需要 40-60 秒
