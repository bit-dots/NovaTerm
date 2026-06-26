<p align="center">
  <img src="https://img.shields.io/badge/status-developing-orange?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/license-GPL%20v3-blue?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/tauri-v2-24c8a8?style=flat-square" alt="Tauri v2">
  <img src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square" alt="Platform">
</p>

# NovaTerm

<p align="center">
  <b>极致轻量、高性能、高颜值的跨平台串口调试工具</b>
</p>

NovaTerm 是一款面向嵌入式软件开发者的终端与硬件调试工作台，基于 Tauri v2 + Rust 构建，追求极致轻量与底层性能。一期聚焦串口（Serial/UART）调试场景，后续逐步扩展 SSH / Telnet 等网络协议。

---

## ✨ 特性

- **串口自动探测** — 自动扫描系统串口，支持热插拔实时刷新
- **高性能收发** — 无锁环形缓冲区，高波特率（最高 921600）不丢包、不卡死
- **ASCII / Hex 独立切换** — 发送和接收各自独立切换，互不影响
- **双栏 Hex 显示** — 左侧十六进制 + 右侧 ASCII 对照，一目了然
- **循环发送** — 可自定义间隔自动发送，适合压力测试
- **发送历史** — 历史记录回填，避免重复输入
- **时间戳** — 每条数据前标注精确接收时间
- **日志导出** — 接收区数据可导出为 `.txt` / `.log` 文件
- **命令面板** — `Ctrl+Shift+P` 唤起，一键发送预设调试指令
- **暗黑 / 亮色双主题** — VSCode 风格四区布局，支持一键切换
- **跨平台** — Windows、macOS（Intel / Apple Silicon）、Linux 表现一致

## 🛠 技术栈

| 层级     | 技术                                            |
| -------- | ----------------------------------------------- |
| 桌面框架 | Tauri v2                                        |
| 前端 UI  | Vite + React 18 + TypeScript + Tailwind CSS v4  |
| 后端核心 | Rust（stable channel）+ tokio                   |
| 串口通信 | Rust `serialport`（自研封装，不依赖第三方插件） |
| 图标     | Lucide React                                    |

## 📦 安装

> 一期 MVP 开发中，暂未发布安装包。敬请期待。

安装包格式（后续发布）：

| 平台    | 格式                          |
| ------- | ----------------------------- |
| Windows | `.msi` / `.exe`               |
| macOS   | `.dmg`                        |
| Linux   | `.deb` / `.rpm` / `.AppImage` |

## 🚀 本地开发

### 环境要求

| 工具     | 版本              | 安装方式                                                          |
| :------- | :---------------- | :---------------------------------------------------------------- |
| Node.js  | >= 18             | [nodejs.org](https://nodejs.org/)                                 |
| Rust     | >= 1.75（stable） | `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \| sh` |
| 系统依赖 | —                 | [Tauri 前置依赖](https://v2.tauri.app/start/prerequisites/)       |

### 如何构建

```bash
# 1. 克隆仓库
git clone https://github.com/bit-dots/NovaTerm.git
cd nova-term

# 2. 安装前端依赖（~180 MB）
npm install

# 3. 启动开发环境（首次编译 Rust 后端约 5-10 分钟，仅此一次）
npm run tauri dev
```

> **注意**：首次运行 `npm run tauri dev` 会下载并编译 Rust 依赖（~2 GB 中间产物），后续增量编译仅需几秒。这些编译产物不会被提交到 Git。

### 构建安装包

```bash
npm run tauri build
```

构建产物位于 `src-tauri/target/release/bundle/`：

| 平台    | 产物                          |
| :------ | :---------------------------- |
| macOS   | `.dmg`                        |
| Windows | `.msi` / `.exe`               |
| Linux   | `.deb` / `.rpm` / `.AppImage` |

## 📁 项目结构

```
nova-term/
├── src/                    # 前端源码（React）
│   ├── components/         # UI 组件
│   ├── hooks/              # 自定义 Hooks
│   ├── i18n/               # 国际化（中文 / 英文）
│   ├── store/              # 状态管理
│   └── styles/             # 全局样式
├── src-tauri/              # 后端源码（Rust）
│   └── src/
│       ├── serial/         # 串口通信模块
│       ├── commands/       # Tauri Command
│       └── events/         # Tauri Event
├── PRD.md                  # 产品需求文档
├── DEVELOPMENT_PLAN.md     # 开发计划
└── README.md
```

## 🗺 路线图

- [x] 需求文档 & 技术方案
- [ ] 项目初始化 & UI 骨架
- [ ] 后端串口核心
- [ ] 前端功能联调
- [ ] 一期 MVP 发布
- [ ] SSH / Telnet / 数据可视化（二期）

## 📄 许可证

[GPL v3](./LICENSE)
