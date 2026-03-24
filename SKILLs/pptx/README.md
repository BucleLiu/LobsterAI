# PPTX

演示文稿创建、编辑和分析工具。

## 功能描述

PPTX Skill 提供了完整的 PowerPoint 演示文稿处理能力，支持：
- 创建新演示文稿
- 编辑现有演示文稿
- 处理幻灯片布局
- 添加批注和演讲者备注
- 文本提取和分析

## 使用方法

### 决策树

| 任务类型 | 推荐方法 |
|---------|---------|
| 读取/分析内容 | 文本提取或原始 XML 访问 |
| 不使用模板创建新演示文稿 | **html2pptx** 工作流 |
| 编辑现有演示文稿 | OOXML 编辑工作流 |
| 使用模板创建演示文稿 | 模板工作流 |

### 不使用模板创建新演示文稿

使用 **html2pptx** 工作流将 HTML 幻灯片转换为 PowerPoint：

#### 设计原则

创建演示文稿前，分析内容并选择适当的设计元素：

1. **考虑主题**：这个演示文稿是关于什么的？什么色调、行业或氛围适合？
2. **检查品牌**：如果用户提到公司/组织，考虑他们的品牌色彩和身份
3. **匹配调色板**：选择反映主题的颜色
4. **说明你的方法**：在编写代码前解释你的设计选择

**要求**：
- 在编写代码前说明内容导向的设计方法
- 仅使用网络安全字体：Arial、Helvetica、Times New Roman、Georgia、Courier New、Verdana、Tahoma、Trebuchet MS、Impact
- 通过大小、粗细和颜色创建清晰的视觉层次
- 确保可读性：强对比度、适当大小的文本、干净的对齐
- 保持一致性：重复模式、间距和视觉语言

#### 工作流程

1. **必须阅读**：完整阅读 `html2pptx.md` 文件
2. 为每个幻灯片创建 HTML 文件（如 720pt × 405pt 用于 16:9）
   - 使用 `<p>`、`<h1>`-`<h6>`、`<ul>`、`<ol>` 表示所有文本内容
   - 使用 `class="placeholder"` 标记图表/表格区域
   - **关键**：使用 Sharp 将渐变和图标栅格化为 PNG，然后在 HTML 中引用
3. 使用 `html2pptx.js` 库将 HTML 幻灯片转换为 PowerPoint
4. **视觉验证**：生成缩略图并检查布局问题

### 编辑现有演示文稿

涉及解包 .pptx 文件、编辑 XML 内容、重新打包：

1. **必须阅读**：完整阅读 `ooxml.md` 文件
2. 解包演示文稿：`python ooxml/scripts/unpack.py <file.pptx> <dir>`
3. 编辑 XML 文件（主要是 `ppt/slides/slide{N}.xml`）
4. **关键**：每次编辑后立即验证：`python ooxml/scripts/validate.py <dir> --original <file>`
5. 打包演示文稿：`python ooxml/scripts/pack.py <input_directory> <office_file>`

### 使用模板创建演示文稿

1. **提取模板文本并创建视觉缩略图网格**
   - 提取文本：`python -m markitdown template.pptx > template-content.md`
   - 创建缩略图：`python scripts/thumbnail.py template.pptx`

2. **分析模板并保存清单到文件**
   - 查看缩略图网格了解幻灯片布局、设计模式和视觉结构
   - 创建 `template-inventory.md` 清单文件

3. **基于模板清单创建演示文稿大纲**
   - 选择标题幻灯片模板
   - 为其他幻灯片选择安全、基于文本的布局
   - 将内容映射到模板布局

4. **使用 `rearrange.py` 复制、重新排序和删除幻灯片**
   ```bash
   python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52
   ```

5. **使用 `inventory.py` 提取所有文本**
   ```bash
   python scripts/inventory.py working.pptx text-inventory.json
   ```

6. **生成替换文本并保存到 JSON 文件**
   - 基于文本清单创建替换内容
   - 保存到 `replacement-text.json`

7. **使用 `replace.py` 应用替换**
   ```bash
   python scripts/replace.py working.pptx replacement-text.json output.pptx
   ```

### 文本提取

```bash
# 转换为 Markdown
python -m markitdown path-to-file.pptx
```

### 创建缩略图网格

```bash
# 基本用法
python scripts/thumbnail.py presentation.pptx

# 自定义名称和列数
python scripts/thumbnail.py template.pptx analysis --cols 4
```

### 幻灯片转图像

```bash
# 1. PPTX 转 PDF
soffice --headless --convert-to pdf template.pptx

# 2. PDF 转 JPEG
pdftoppm -jpeg -r 150 template.pdf slide
```

## 关键文件结构

- `ppt/presentation.xml` - 主演示文稿元数据和幻灯片引用
- `ppt/slides/slide{N}.xml` - 单个幻灯片内容
- `ppt/notesSlides/notesSlide{N}.xml` - 演讲者备注
- `ppt/comments/modernComment_*.xml` - 批注
- `ppt/slideLayouts/` - 幻灯片布局模板
- `ppt/slideMasters/` - 母版幻灯片模板
- `ppt/theme/` - 主题和样式信息
- `ppt/media/` - 图像和其他媒体文件

## 依赖要求

- **markitdown**: `pip install "markitdown[pptx]"`（文本提取）
- **pptxgenjs**: `npm install -g pptxgenjs`（通过 html2pptx 创建演示文稿）
- **playwright**: `npm install -g playwright`（html2pptx 中的 HTML 渲染）
- **react-icons**: `npm install -g react-icons react react-dom`（图标）
- **sharp**: `npm install -g sharp`（SVG 栅格化和图像处理）
- **LibreOffice**: `sudo apt-get install libreoffice`（PDF 转换）
- **Poppler**: `sudo apt-get install poppler-utils`（PDF 转图像）
- **defusedxml**: `pip install defusedxml`（安全 XML 解析）

## 代码风格指南

- 编写简洁代码
- 避免冗长变量名和冗余操作
- 避免不必要的 print 语句

## 注意事项

- 编辑前始终完整阅读相关文档文件
- 创建演示文稿时优先使用两栏布局展示图表/表格
- 每次编辑后验证文档
- 幻灯片使用 0 索引（第一张幻灯片 = 0）
