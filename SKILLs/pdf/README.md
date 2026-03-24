# PDF

全面的 PDF 处理工具包，支持文本和表格提取、创建新 PDF、合并/拆分文档和处理表单。

## 功能描述

PDF Skill 提供了完整的 PDF 文档处理能力，包括：
- 提取文本和表格
- 创建新 PDF
- 合并/拆分文档
- 处理表单
- 添加水印
- 密码保护

## 使用方法

### 快速开始

```python
from pypdf import PdfReader, PdfWriter

# 读取 PDF
reader = PdfReader("document.pdf")
print(f"页数: {len(reader.pages)}")

# 提取文本
text = ""
for page in reader.pages:
    text += page.extract_text()
```

### 合并 PDF

```python
from pypdf import PdfWriter, PdfReader

writer = PdfWriter()
for pdf_file in ["doc1.pdf", "doc2.pdf", "doc3.pdf"]:
    reader = PdfReader(pdf_file)
    for page in reader.pages:
        writer.add_page(page)

with open("merged.pdf", "wb") as output:
    writer.write(output)
```

### 拆分 PDF

```python
reader = PdfReader("input.pdf")
for i, page in enumerate(reader.pages):
    writer = PdfWriter()
    writer.add_page(page)
    with open(f"page_{i+1}.pdf", "wb") as output:
        writer.write(output)
```

### 提取表格（使用 pdfplumber）

```python
import pdfplumber

with pdfplumber.open("document.pdf") as pdf:
    for page in pdf.pages:
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                print(row)
```

### 创建 PDF（使用 reportlab）

```python
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

c = canvas.Canvas("hello.pdf", pagesize=letter)
width, height = letter

c.drawString(100, height - 100, "Hello World!")
c.line(100, height - 140, 400, height - 140)

c.save()
```

### 命令行工具

```bash
# 提取文本
pdftotext input.pdf output.txt

# 保留布局提取
pdftotext -layout input.pdf output.txt

# 提取特定页面
pdftotext -f 1 -l 5 input.pdf output.txt  # 第 1-5 页

# 合并 PDF（使用 qpdf）
qpdf --empty --pages file1.pdf file2.pdf -- merged.pdf

# 拆分页面
qpdf input.pdf --pages . 1-5 -- pages1-5.pdf

# 旋转页面
qpdf input.pdf output.pdf --rotate=+90:1  # 第 1 页旋转 90 度
```

### 扫描 PDF OCR

```python
# 需要: pip install pytesseract pdf2image
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')

text = ""
for i, image in enumerate(images):
    text += f"第 {i+1} 页:\n"
    text += pytesseract.image_to_string(image)
    text += "\n\n"

print(text)
```

### 添加水印

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]

reader = PdfReader("document.pdf")
writer = PdfWriter()

for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)

with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

### 密码保护

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()

for page in reader.pages:
    writer.add_page(page)

writer.encrypt("userpassword", "ownerpassword")

with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```

## 快速参考

| 任务 | 最佳工具 | 命令/代码 |
|------|---------|----------|
| 合并 PDF | pypdf | `writer.add_page(page)` |
| 拆分 PDF | pypdf | 每页一个文件 |
| 提取文本 | pdfplumber | `page.extract_text()` |
| 提取表格 | pdfplumber | `page.extract_tables()` |
| 创建 PDF | reportlab | Canvas 或 Platypus |
| 命令行合并 | qpdf | `qpdf --empty --pages ...` |
| 扫描 PDF OCR | pytesseract | 先转换为图像 |
| 填写 PDF 表单 | pdf-lib 或 pypdf | 参见 forms.md |

## 依赖要求

- **pypdf**: `pip install pypdf`
- **pdfplumber**: `pip install pdfplumber`
- **reportlab**: `pip install reportlab`
- **poppler-utils**: `sudo apt-get install poppler-utils`（pdftotext）
- **qpdf**: `sudo apt-get install qpdf`
- **pytesseract**: `pip install pytesseract`（OCR）
- **pdf2image**: `pip install pdf2image`（OCR）

## 注意事项

- 对于复杂场景，可以访问底层 DOM
- 如需填写 PDF 表单，请阅读 forms.md
- 扫描 PDF 需要 OCR 处理
- 处理大文件时注意内存使用
