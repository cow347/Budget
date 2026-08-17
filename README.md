# 金金计较 — 简洁记账本

一个轻量级、离线可用的个人记账 Web 应用，基于 Vite + Vanilla JS + Tailwind CSS 构建。

## ✨ 功能特性

- **收支记录** — 快速记录支出和收入，支持备注
- **自定义分类** — 可手动添加、编辑、删除自定义分类（默认分类不可修改）
- **数据概览** — 月度汇总、分类占比、趋势图表
- **主题切换** — 支持亮色 / 暗色主题
- **字体缩放** — 自适应大屏或视力需求
- **数据导入/导出** — 支持 JSON 备份与 CSV 导出
- **离线可用** — 所有数据存储在 localStorage，无需网络

## 🛠 技术栈

| 项 | 技术 |
|---|---|
| 构建工具 | Vite 6.x |
| 样式框架 | Tailwind CSS 3.x |
| 前端语言 | Vanilla JS (ES Module) |
| 数据持久化 | localStorage |
| 版本控制 | Git |

## 📁 项目结构

```
├── index.html          # 入口页面
├── package.json        # 项目依赖与脚本
├── vite.config.ts      # Vite 构建配置
├── src/
│   ├── app.js          # 主应用逻辑（路由、渲染、弹窗、表单）
│   ├── data.js         # 数据层（CRUD、统计、导出/导入、主题）
│   └── index.css       # Tailwind + 自定义组件样式
└── .gitignore
```

## 🚀 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

启动后访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

## 📊 数据说明

所有数据存储在浏览器 `localStorage` 中，键名如下：

| 键名 | 内容 |
|---|---|
| `jinji_records` | 记账记录列表 |
| `jinji_user_categories` | 用户自定义分类 |
| `jinji_theme` | 主题（light / dark）|
| `jinji_font_scale` | 字体缩放比例 |
| `jinji_first_use` | 是否首次使用 |

## 📝 分类体系

### 支出分类（9 类）

餐饮 🍜 · 居住 🏠 · 交通 🚗 · 服饰 👔 · 医疗 💊 · 娱乐 🎮 · 购物 🛒 · 教育 📚 · 其他 📦

### 收入分类（6 类）

工资 💰 · 奖金 🏆 · 兼职 💼 · 理财 📈 · 红包 🧧 · 其他 📦

> 用户可在「分类」页面自定义添加更多分类。

## 🔒 隐私与安全

- 所有数据仅存储在本机浏览器，不上传任何服务器
- 导出 JSON 文件可作为本地备份
- 建议定期导出备份，防止浏览器数据清理导致丢失

## 📄 License

个人项目，自由使用。
