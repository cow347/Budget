# 金金计较 — 记账本

## 技术栈
**Vite + Vanilla JS + Tailwind CSS + localStorage**

- 前端：纯 HTML/CSS/JS（ES Module），无框架
- 样式：Tailwind CSS 3.x，自定义 Tailwind 组件类
- 构建：Vite 6.x，`npm run dev` / `npm run build`
- 存储：localStorage，离线可用
- 分类：支出 9 类（餐饮/居住/交通/服饰/医疗/娱乐/购物/教育/其他），收入 6 类（工资/奖金/兼职/理财/红包/其他）

## 项目结构
```
src/
  app.js       — 主应用逻辑（路由、渲染、弹窗、表单）
  data.js      — 数据层（CRUD、统计、导出/导入、主题）
  index.css    — Tailwind + 自定义组件样式
index.html
package.json
vite.config.ts
```

## 运行方式
```bash
npm run dev      # 开发模式，http://localhost:5173
npm run build    # 生产构建，输出到 dist/
npm run preview  # 预览构建结果
```
