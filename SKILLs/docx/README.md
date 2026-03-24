# DOCX

全面的 Word 文档创建、编辑和分析工具。

## 功能描述

DOCX Skill 提供了完整的 Word 文档处理能力，支持：
- 创建新文档
- 编辑现有文档
- 处理修订追踪
- 添加批注
- 文本提取和分析

## 使用方法

### 决策树

| 任务类型 | 推荐方法 |
|---------|---------|
| 读取/分析内容 | 文本提取或原始 XML 访问 |
| 创建新文档 | 使用 docx-js |
| 编辑自己的文档 + 简单改动 | 基本 OOXML 编辑 |
| 编辑他人文档 | **修订追踪工作流**（推荐） |
| 法律/学术/商业/政府文档 | **修订追踪工作流**（必需） |

### 创建新文档

使用 **docx-js** 库创建 Word 文档：

1. **必须阅读**：完整阅读 `docx-js.md` 文件
2. 创建 JavaScript/TypeScript 文件
3. 使用 Document、Paragraph、TextRun 组件
4. 使用 Packer.toBuffer() 导出

### 编辑现有文档

使用 **Document 库**（Python OOXML 操作库）：

1. **必须阅读**：完整阅读 `ooxml.md` 文件
2. 解包文档：`python ooxml/scripts/unpack.py <office_file> <output_directory>`
3. 使用 Document 库创建并运行 Python 脚本
4. 打包文档：`python ooxml/scripts/pack.py <input_directory> <office_file>`

### 修订追踪工作流

用于文档审阅和修改：

1. 转换为 Markdown：`pandoc --track-changes=all path-to-file.docx -o output.md`
2. 识别并分组修改
3. 阅读 `ooxml.md` 并解包文档
4. 分批实现修改（3-10 个相关修改为一组）
5. 验证：`python ooxml/scripts/validate.py <dir> --original <file>`
6. 打包文档

### 文本提取

```bash
# 转换为 Markdown（保留修订追踪）
pandoc --track-changes=all path-to-file.docx -o output.md

# 选项：--track-changes=accept/reject/all
```

### 文档转图像

```bash
# 1. DOCX 转 PDF
soffice --headless --convert-to pdf document.docx

# 2. PDF 转 JPEG
pdftoppm -jpeg -r 150 document.pdf page
```

## 依赖要求

- **pandoc**: `sudo apt-get install pandoc`（文本提取）
- **docx**: `npm install -g docx`（创建新文档）
- **LibreOffice**: `sudo apt-get install libreoffice`（PDF 转换）
- **Poppler**: `sudo apt-get install poppler-utils`（PDF 转图像）
- **defusedxml**: `pip install defusedxml`（安全 XML 解析）

## 代码风格指南

- 编写简洁代码
- 避免冗长变量名和冗余操作
- 避免不必要的 print 语句

## 关键文件结构

- `word/document.xml` - 主文档内容
- `word/comments.xml` - 批注
- `word/media/` - 嵌入的图像和媒体文件
- 修订追踪使用 `<w:ins>`（插入）和 `<w:del>`（删除）标签

## 注意事项

- 编辑他人文档时，使用修订追踪工作流
- 实现修改时只标记实际改变的文本
- 保留未更改文本的原始 RSID
- 每批修改后验证文档
