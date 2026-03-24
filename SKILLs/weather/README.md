# Weather

获取当前天气和预报（无需 API 密钥）。

## 功能描述

Weather Skill 提供免费的天气查询服务，使用两个免费服务：wttr.in（主要）和 Open-Meteo（备用）。

## 使用方法

### wttr.in（主要）

快速单行：
```bash
curl -s "wttr.in/London?format=3"
# 输出：London: ⛅️ +8°C
```

紧凑格式：
```bash
curl -s "wttr.in/London?format=%l:+%c+%t+%h+%w"
# 输出：London: ⛅️ +8°C 71% ↙5km/h
```

完整预报：
```bash
curl -s "wttr.in/London?T"
```

### 格式代码

| 代码 | 含义 |
|------|------|
| `%c` | 天气状况 |
| `%t` | 温度 |
| `%h` | 湿度 |
| `%w` | 风速 |
| `%l` | 位置 |
| `%m` | 月相 |

### 提示

- URL 编码空格：`wttr.in/New+York`
- 机场代码：`wttr.in/JFK`
- 单位：`?m`（公制）`?u`（美制）
- 仅今天：`?1`
- 仅当前：`?0`
- PNG 图像：`curl -s "wttr.in/Berlin.png" -o /tmp/weather.png`

### Open-Meteo（备用，JSON）

免费，无需密钥，适合编程使用：

```bash
curl -s "https://api.open-meteo.com/v1/forecast?latitude=51.5&longitude=-0.12&current_weather=true"
```

查找城市坐标，然后查询。返回包含温度、风速、天气代码的 JSON。

文档：https://open-meteo.com/en/docs

## 使用示例

**用户请求：** "北京今天天气怎么样？"

**执行命令：**
```bash
curl -s "wttr.in/Beijing?format=3"
# 或
curl -s "wttr.in/Beijing?T"  # 完整预报
```

## 依赖要求

- curl

## 注意事项

- wttr.in 服务可能偶尔不可用
- Open-Meteo 作为可靠的备用选项
- 需要网络连接
