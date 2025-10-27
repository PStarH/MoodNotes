# 晨暮日记 MoodNotes · v1.0.0

简体中文 | [English](./README.en.md)

让日常的光影与心绪，有一处可以安放的地方。

![Stars](https://img.shields.io/github/stars/PStarH/MoodNotes?style=social)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue)

晨暮日记是一款基于 Vue 3 + Vite 与 Electron 打造的本地优先日记应用。它把「写下来」这件事变得温柔、顺手而有力量：从每日小结、灵感速记，到情绪趋势、习惯打卡与可视化洞察；从离线保存到一键备份/导入，重要的不是功能本身，而是你与生活之间更真诚的对话。

—— 写给认真生活的人。

## 目录

- [亮点功能](#亮点功能)
- [安装与运行](#安装与运行)
- [打包与测试](#打包与测试)
- [数据与隐私](#数据与隐私)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [常见问题](#常见问题)
- [参与贡献](#参与贡献)
- [许可证](#许可证)
- [更新日志](#更新日志)

## 亮点功能

- 写作体验
  - 每日总结：支持富文本编辑（基于 Quill），气象与心情标注、标签与自定义小节、舒适区条目
  - 灵感 Spark：灵光一现，随手一记；更快、更轻、更贴身
  - 媒体库：图片 / 视频 / 音频 本地保存与读取
  - 导出：支持 JSON / CSV / Markdown；PDF 计划中

- 时间与视图
  - 日历视图：一眼看见当日心情、待办与每日名言
  - 去年今日：同一天的前一年，你在做什么

- 数据洞察与习惯
  - 情绪趋势、能量与压力曲线、月度字数统计（Chart.js 可视化）
  - 习惯打卡与趋势洞察、今日习惯完成度

- 本地优先与备份
  - 日志数据存储于本地 IndexedDB（LocalForage），离线可用
  - 一键导出/导入，内置版本迁移与冲突预检（预览、合并、替换）

- 体验与可及性
  - 快捷键体系（可扩展），虚拟列表与懒加载优化，深浅色主题
  - 更友好的可访问性：焦点陷阱、键盘可达、语义化 aria 标签

## 安装与运行

环境要求
- macOS / Windows / Linux
- Node.js 18+（推荐）

本地开发
1. 安装依赖
   ```bash
   npm install
   ```
2. 启动开发（同时开启 Vite 与 Electron）
   ```bash
   npm run dev
   ```
   默认会在浏览器开发服务器与 Electron 主进程之间建立热重载开发环境。

预览前端构建产物
```bash
npm run preview
```

## 打包与测试

- 生产构建（前端 + Electron TS 编译）
  ```bash
  npm run build
  ```
  说明：当前仓库未集成安装包打包工具（如 electron-builder），上面的命令会构建前端并编译 Electron TS。若需生成 .app/.exe 安装包，可在后续版本接入打包流程或提交 PR。

- 测试
  ```bash
  npm run test       # 运行单测（Vitest）
  npm run test:ui    # 以交互式 UI 运行
  npm run test:coverage
  ```

## 数据与隐私

- 本地数据存储
  - 结构化数据（每日总结、任务、习惯、灵感、日历条目）持久化于 IndexedDB（通过 LocalForage 实现）
  - 备份导出文件包含版本号与导出时间戳，支持 JSON/CSV/Markdown

- 媒体文件存储（Electron）
  - 存放路径：系统用户数据目录下的 `media`（`app.getPath('userData')/media`）
  - 文件限制：单文件 ≤ 10MB，总占用 ≤ 100MB；支持的后缀包含 `.jpg/.jpeg/.png/.gif/.webp/.mp4/.webm/.ogg/.mp3/.wav`

- 备份与迁移
  - 导入前会进行结构校验与冲突预检，可选择「合并」「替换」「跳过」等策略
  - 备份文件包含内置格式版本控制（当前备份格式版本为 2.0.0），旧格式会在导入时自动迁移

我们尽可能将一切留在本地，并提供可理解、可掌控的导出方式。

## 技术栈

- 前端：Vue 3、TypeScript、Vite、Tailwind CSS、Vue Router、Vuex 4、Vue I18n
- 可视化：Chart.js、chartjs-plugin-zoom、vue-chartjs
- 编辑与富文本：Quill、DOMPurify（内容安全）
- 数据：LocalForage（IndexedDB 持久化）
- 桌面端：Electron 33（安全上下文隔离、预加载桥）
- 其他：vue-virtual-scroller、jspdf（预留 PDF 支持）

## 项目结构

```
.
├── electron/                # Electron 主进程与预加载脚本
│   ├── main.ts              # BrowserWindow、媒体 IPC、存储限制等
│   ├── preload.ts           # 安全暴露 API 到渲染进程
│   └── package.json         # Electron 构建脚本
├── src/
│   ├── App.vue
│   ├── main.ts              # Vite 入口
│   ├── components/          # 组件（备份、趋势、图表、主题、虚拟列表等）
│   ├── composables/         # 组合式工具（备份、迁移、快捷键、性能等）
│   ├── i18n/                # 多语言（zh / en）
│   ├── router/              # 路由
│   ├── store/               # Vuex 与类型守卫
│   ├── utils/               # 工具方法（格式化、性能监测、错误处理）
│   └── views/               # 页面（首页、设置、分析、当日摘要等）
├── public/
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.js
└── package.json
```

## 常见问题

- 无法生成安装包？
  - 当前版本尚未集成安装包打包工具。可直接 `npm run dev` 在 Electron 中开发运行，或基于 electron-builder/forge 提交 PR 完善打包流程。

- 导入备份失败或部分条目丢弃？
  - 导入前会进行结构校验与类型守卫过滤（无效条目会被跳过）。可先使用「预览」查看冲突与数据质量，再选择合适的合并策略。

- 媒体文件超限？
  - 单文件上限 10MB、总占用上限 100MB。建议定期导出备份并清理不再需要的媒体资源。

## 参与贡献

欢迎任何形式的贡献，包括文案、设计、性能、可用性、国际化等。

1. Fork 本仓库
2. 创建分支
   ```bash
   git checkout -b feature/your-feature
   ```
3. 提交变更
   ```bash
   git commit -m "feat: your message"
   ```
4. 推送与发起 PR
   ```bash
   git push origin feature/your-feature
   ```

## 许可证

本项目采用 AGPL-3.0 许可证发布。详见 [LICENSE](./LICENSE)。

## 更新日志

- v1.0.0（首个公开版本）
  - 核心日记/灵感/媒体/日历体验
  - 图表分析：心情趋势、能量/压力、字数统计
  - 习惯打卡与趋势洞察
  - 备份导出/导入（含版本迁移与冲突预检）
  - 本地优先、离线可用；多语言（中 / 英）与深浅色主题

—— 由 [PStarH](https://github.com/PStarH) 与贡献者们用心打磨。
