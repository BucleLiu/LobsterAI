# XLSX

全面的电子表格创建、编辑和分析工具，支持公式、格式化、数据分析和可视化。

## 功能描述

XLSX Skill 提供了完整的 Excel 电子表格处理能力，支持：
- 创建带公式和格式化的新电子表格
- 读取和分析数据
- 修改现有电子表格同时保留公式
- 电子表格中的数据分析和可视化
- 重新计算公式

## 使用方法

### 关键原则：使用公式，而非硬编码值

**始终使用 Excel 公式而不是在 Python 中计算值并硬编码。** 这确保电子表格保持动态和可更新。

**❌ 错误 - 硬编码计算值：**
```python
# 错误：在 Python 中计算并硬编码结果
total = df['Sales'].sum()
sheet['B10'] = total  # 硬编码 5000
```

**✅ 正确 - 使用 Excel 公式：**
```python
# 正确：让 Excel 计算总和
sheet['B10'] = '=SUM(B2:B9)'
```

### 读取和分析数据

```python
import pandas as pd

# 读取 Excel
df = pd.read_excel('file.xlsx')  # 默认：第一张表
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # 所有表作为字典

# 分析
df.head()      # 预览数据
df.info()      # 列信息
df.describe()  # 统计信息

# 写入 Excel
df.to_excel('output.xlsx', index=False)
```

### 创建新 Excel 文件

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

# 添加数据
sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])

# 添加公式
sheet['B2'] = '=SUM(A1:A10)'

# 格式化
sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')

# 列宽
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

### 编辑现有 Excel 文件

```python
from openpyxl import load_workbook

# 加载现有文件
wb = load_workbook('existing.xlsx')
sheet = wb.active  # 或 wb['SheetName'] 获取特定表

# 处理多个表
for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    print(f"表: {sheet_name}")

# 修改单元格
sheet['A1'] = '新值'
sheet.insert_rows(2)  # 在第 2 行插入行
sheet.delete_cols(3)  # 删除第 3 列

# 添加新表
new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

### 重新计算公式

使用提供的 `recalc.py` 脚本重新计算公式：

```bash
python recalc.py <excel_file> [timeout_seconds]
```

示例：
```bash
python recalc.py output.xlsx 30
```

脚本会：
- 首次运行时自动设置 LibreOffice 宏
- 重新计算所有表中的所有公式
- 扫描所有单元格查找 Excel 错误（#REF!, #DIV/0! 等）
- 返回包含详细错误位置和计数的 JSON

### 解释 recalc.py 输出

```json
{
  "status": "success",           // 或 "errors_found"
  "total_errors": 0,              // 总错误数
  "total_formulas": 42,           // 公式数量
  "error_summary": {              // 仅在有错误时存在
    "#REF!": {
      "count": 2,
      "locations": ["Sheet1!B5", "Sheet1!C10"]
    }
  }
}
```

## 财务模型标准

### 颜色编码标准

| 颜色 | 用途 |
|------|------|
| **蓝色文本 (RGB: 0,0,255)** | 硬编码输入，用户会改变的数字 |
| **黑色文本 (RGB: 0,0,0)** | 所有公式和计算 |
| **绿色文本 (RGB: 0,128,0)** | 从同一工作簿其他工作表拉取的链接 |
| **红色文本 (RGB: 255,0,0)** | 指向其他文件的外部链接 |
| **黄色背景 (RGB: 255,255,0)** | 需要注意的关键假设或需要更新的单元格 |

### 数字格式标准

- **年份**：格式化为文本字符串（如 "2024" 而非 "2,024"）
- **货币**：使用 $#,##0 格式；始终在标题中指定单位（"收入 ($mm)"）
- **零**：使用数字格式将所有零显示为 "-"
- **百分比**：默认使用 0.0% 格式（一位小数）
- **倍数**：估值倍数格式化为 0.0x
- **负数**：使用括号 (123) 而非减号 -123

## 公式验证清单

### 基本验证
- [ ] 测试 2-3 个样本引用：在构建完整模型前验证它们拉取正确的值
- [ ] 列映射：确认 Excel 列匹配（如第 64 列 = BL，不是 BK）
- [ ] 行偏移：记住 Excel 行是 1 索引的（DataFrame 第 5 行 = Excel 第 6 行）

### 常见陷阱
- [ ] NaN 处理：使用 `pd.notna()` 检查空值
- [ ] 最右列：财年数据通常在 50+ 列
- [ ] 多重匹配：搜索所有出现，不只是第一个
- [ ] 除零：在使用 `/` 前检查分母（#DIV/0!）
- [ ] 错误引用：验证所有单元格引用指向预期单元格（#REF!）

## 依赖要求

- **pandas**: `pip install pandas`（数据分析）
- **openpyxl**: `pip install openpyxl`（Excel 操作）
- **LibreOffice**: 用于公式重新计算

## 代码风格指南

- 编写最小、简洁的 Python 代码
- 避免冗长变量名和冗余操作
- 避免不必要的 print 语句
- 为复杂公式或重要假设添加单元格注释

## 注意事项

- 使用 `data_only=True` 读取计算值：`load_workbook('file.xlsx', data_only=True)`
- **警告**：如果用 `data_only=True` 打开并保存，公式将被值永久替换
- 对于大文件：读取使用 `read_only=True`，写入使用 `write_only=True`
- 公式被保留但不计算 - 使用 recalc.py 更新值
