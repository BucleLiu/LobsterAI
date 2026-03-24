# Remotion

Remotion 最佳实践 - 使用 React 创建视频。

## 功能描述

Remotion Skill 提供了使用 Remotion 框架（React 视频创作）的最佳实践和规则指南，支持视频合成、动画、3D 内容、字幕处理等。

## 使用方法

### 何时使用

处理 Remotion 代码时使用此技能获取领域特定知识。

### 规则文件

阅读各个规则文件以获取详细解释和代码示例：

| 规则文件 | 描述 |
|---------|------|
| `rules/3d.md` | 使用 Three.js 和 React Three Fiber 的 3D 内容 |
| `rules/animations.md` | Remotion 的基础动画技能 |
| `rules/assets.md` | 导入图像、视频、音频和字体 |
| `rules/audio.md` | 音频使用 - 导入、修剪、音量、速度、音调 |
| `rules/calculate-metadata.md` | 动态设置合成时长、尺寸和属性 |
| `rules/can-decode.md` | 使用 Mediabunny 检查视频是否可被浏览器解码 |
| `rules/charts.md` | Remotion 的图表和数据可视化模式 |
| `rules/compositions.md` | 定义合成、静态图、文件夹、默认属性和动态元数据 |
| `rules/extract-frames.md` | 使用 Mediabunny 在特定时间戳提取视频帧 |
| `rules/fonts.md` | 加载 Google Fonts 和本地字体 |
| `rules/get-audio-duration.md` | 使用 Mediabunny 获取音频文件时长 |
| `rules/get-video-dimensions.md` | 使用 Mediabunny 获取视频宽度和高度 |
| `rules/get-video-duration.md` | 使用 Mediabunny 获取视频文件时长 |
| `rules/gifs.md` | 与 Remotion 时间线同步显示 GIF |
| `rules/images.md` | 使用 Img 组件嵌入图像 |
| `rules/light-leaks.md` | 使用 @remotion/light-leaks 的光漏叠加效果 |
| `rules/lottie.md` | 在 Remotion 中嵌入 Lottie 动画 |
| `rules/measuring-dom-nodes.md` | 测量 DOM 元素尺寸 |
| `rules/measuring-text.md` | 测量文本尺寸、适配文本到容器、检查溢出 |
| `rules/sequencing.md` | Remotion 的序列模式 - 延迟、修剪、限制项目时长 |
| `rules/tailwind.md` | 在 Remotion 中使用 TailwindCSS |
| `rules/text-animations.md` | Remotion 的排版和文本动画模式 |
| `rules/timing.md` | Remotion 中的插值曲线 - 线性、缓动、弹簧动画 |
| `rules/transitions.md` | Remotion 的场景过渡模式 |
| `rules/transparent-videos.md` | 渲染带透明度的视频 |
| `rules/trimming.md` | Remotion 的修剪模式 - 剪切动画开头或结尾 |
| `rules/videos.md` | 在 Remotion 中嵌入视频 - 修剪、音量、速度、循环、音调 |
| `rules/parameters.md` | 通过添加 Zod 模式使视频可参数化 |
| `rules/maps.md` | 使用 Mapbox 添加地图并制作动画 |

### 字幕处理

处理字幕或字幕时，加载 `rules/subtitles.md` 文件获取更多信息。

## 依赖要求

- Node.js 18+
- Remotion 框架
- React

## 注意事项

- 根据具体需求阅读相应的规则文件
- 遵循 Remotion 的最佳实践模式
- 使用 Mediabunny 进行媒体处理
