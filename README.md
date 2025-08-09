# 法律AI工作台（LexAI Space）

一个集成多种法律 AI 工具的统一工作平台，为律师和法务人员提供高效、专业的智能化辅助。

- 品牌/域名：`lexai.space`（见 `CNAME`）
- 仓库/目录名：`lexai-space`

## 🚀 功能特性

- **AI 对话（LLM API 工具）**：多提供商直连（Gemini / DeepSeek / Kimi / Qwen / OpenRouter / Ollama 等），支持对话历史（IndexedDB）、Markdown 渲染与文件附件（图片/PDF/文档）。
- **合同审核（工作流工具）**：.docx 上传解析，多维度风险分析（主体/基础/业务/法律），可视化图表（ECharts）、PDF 导出（html2pdf.js），进度与错误提示。
- **合同生成（LLM API 工具）**：表单化信息采集，AI 优化按钮，Markdown 结果预览/复制/下载。
- **合同解析（工作流工具）**：上传合同并提取要点，结构化结果展示，Mermaid 流程图渲染。
- **批量文书（工作流工具）**：上传样本合同（.docx）+ 批量数据（.xls/.xlsx）并生成 Markdown 文书。
- **统一工作台**：侧边栏导航、搜索、移动端自适应、平滑动画，工具以 iframe 独立运行。

提示：工具分为两类，配置来源不同。
- LLM API 工具：AI 对话（`homepage.html`）、合同生成（`document-gen.html`）→ 依赖“LLM 模型设置”
- 工作流工具：合同审核、合同解析、批量文书 → 依赖“工作流设置”

## 🛠️ 技术架构

### 前端技术
- HTML5 + CSS3 + JavaScript (ES6+)
- Font Awesome、Google Fonts

### 核心库
- mammoth.js（.docx 解析，合同审核）
- ECharts（可视化图表，合同审核）
- html2pdf.js（报告导出，合同审核）
- marked.js（Markdown 渲染，AI 对话/合同生成/合同解析/批量文书）
- mermaid.js（流程图渲染，合同解析）

### 管理与存储
- `ModelManager`：统一调用与路由（Google/DeepSeek/Kimi/Qwen/OpenRouter/Ollama/Coze 工作流）
- `ApiKeyManager`：API Key 与本地服务 URL 管理（localStorage）
- `ToolModelManager`：工具与模型/工作流 ID 的关联（localStorage）
- `SettingsManager`（可选）：设置聚合
- 本地存储：localStorage（配置/选择），IndexedDB（AI 对话历史）
- 事件联动：工具页监听 `llm_settings_updated`、`workflow_settings_updated`

## 📁 项目结构

```
lexai-space/
├── index.html                    # 主框架页面（统一工作台）
├── tools/
│   ├── homepage.html             # AI 对话（LLM API）
│   ├── contract-review.html      # 合同审核（工作流）
│   ├── document-gen.html         # 合同生成（LLM API）
│   ├── contract-parse.html       # 合同解析（工作流）
│   ├── batch-docs.html           # 批量文书（工作流）
│   ├── llm-settings.html         # LLM 模型设置（API Key、模型验证、默认模型）
│   └── workflow-settings.html    # 工作流设置（Coze 在线/本地、URL 与 ID）
├── components/
│   └── settings-modal.js         # 旧版设置模态（可选/兼容）
├── config/
│   ├── models.json               # 工具/模型/提供商配置（含 Coze 工作流）
│   ├── model-manager.js          # 模型/工作流统一调用与路由
│   ├── api-key-manager.js        # API Key 管理
│   ├── tool-model-manager.js     # 工具-模型关联管理
│   └── settings-manager.js       # 设置聚合器（可选）
└── docs/
    ├── adding-new-llm-provider.md
    ├── adding-new-llm-tool.md
    └── adding-new-workflow-tool.md
```

## 🔧 首次配置

1) 打开“LLM 模型设置”（`tools/llm-settings.html`）
- 填入目标提供商的 API Key，可点击“验证 API”将模型加入“已验证模型”。
- 在“工具模型配置”中为“AI 对话”“合同生成”选择默认模型。

2) 打开“工作流设置”（`tools/workflow-settings.html`）
- 选择 Coze 在线/本地，填写 Upload 与 stream_run URL。
- 为合同审核/合同解析/批量文书分别填写 Workflow ID，支持一键连接测试。

3) 统一设置
- 首次进入主框架会写入 `use_unified_settings=true`，工具默认读取“统一设置”。

## 🚀 快速开始

```bash
# 进入项目目录
cd lexai-space

# 启动本地服务器（2 选 1）
python3 -m http.server 8000
npx http-server -p 8000
```

打开浏览器访问：`http://localhost:8000/index.html`

## 🎯 工具介绍

### AI 对话（LLM API 工具）
- 支持对话历史（IndexedDB）、附件上传、Markdown 渲染
- 多提供商直连；默认模型从“LLM 模型设置”读取

### 合同审核（工作流工具）
- .docx 上传、风险识别、多维度分析、ECharts 可视化、PDF 导出
- 依赖“工作流设置”（在线/本地、URL、Workflow ID）

### 合同生成（LLM API 工具）
- 表单化收集关键信息，AI 优化字段，生成 Markdown 合同
- 依赖“LLM 模型设置”（默认模型与 API Key）

### 合同解析（工作流工具）
- 上传合同文件，输出结构化要点与图示
- 依赖“工作流设置”（在线/本地、URL、Workflow ID）

### 批量文书（工作流工具）
- 样本合同（.docx）+ 批量数据（.xls/.xlsx）驱动批量生成 Markdown
- 依赖“工作流设置”（在线/本地、URL、Workflow ID）

## 🧩 扩展/二次开发

- 新增 LLM 服务商：见 `docs/adding-new-llm-provider.md`
- 新增 LLM 工具：见 `docs/adding-new-llm-tool.md`
- 新增 工作流 工具：见 `docs/adding-new-workflow-tool.md`

## ⚠️ 注意事项

- CORS/网络：浏览器直连第三方 API/工作流需确保跨域与鉴权（必要时通过自有后端转发）。
- Coze 本地部署：API Key 可选（视服务端配置）；URL/健康检测请按服务端实际情况设置。
- 安全：API Key 存储于浏览器 `localStorage`，请在可信环境下使用。
- 数据：AI 对话历史保存在浏览器 IndexedDB，本地清理会导致数据丢失。

## 📈 项目状态

- [x] AI 对话（对话历史/附件/多提供商）
- [x] 合同审核（工作流 + 可视化 + 导出）
- [x] 合同生成（LLM API + Markdown）
- [x] 合同解析（工作流 + 结构化展示）
- [x] 批量文书（工作流）
- [x] LLM 模型设置（模型验证/默认模型/Ollama/OpenRouter）
- [x] 工作流设置（在线/本地、URL、ID、连接测试）
- [x] 统一工作台与移动端适配

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

开发环境：现代浏览器、本地静态服务器、ES6+。
代码规范：语义化 HTML、模块化 JS、样式尽量保持一致性。

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议：
- 提交 GitHub Issue
- 发送邮件至项目维护者

—— 法律AI工作台 · 让法律工作更智能、更高效！