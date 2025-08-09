### 新增工作流工具指南

本指南说明如何在本项目中新增“工作流工具”（通过 Coze 在线/本地工作流接口调用，而非直接调用通用 LLM 的 chat/completions）。

适用：你的新工具希望复用工作流引擎（如复杂流程、文件处理、结构化输出等），并通过 `.../workflow/stream_run` 发起流式调用。

先决条件：
- 已在 `tools/workflow-settings.html` 中配置好 Coze 在线/本地的 Base URL、API Key、Workflow ID 等；
- Coze 本地部署（`coze-local`）在多数情况下可选配 API Key（参见 `config/model-manager.js` 中 `providersDoNotRequireApiKey` 包含 `coze-local`）。

---

### 步骤一：在配置中注册你的工具

1) 在 `config/models.json` 的 `tools` 节点下添加你的工具条目（示例）：

```json
{
  "tools": {
    "my-workflow-tool": {
      "name": "我的工作流工具",
      "default_model": "coze-workflow",
      "supported_models": ["coze-workflow", "coze-local-workflow"],
      "description": "基于工作流引擎的XX功能"
    }
  }
}
```

说明：
- 工作流工具应将 `default_model` 设为 `coze-workflow`，并在 `supported_models` 中包含 `coze-workflow` 与 `coze-local-workflow`（两者均已在 `models` 节点预定义）。

2) 在 `index.html` 的 `ToolManager` 注册工具入口（示意，添加到 `this.tools`）：

```javascript
'my-workflow-tool': {
  name: '我的工作流工具',
  url: 'tools/my-workflow-tool.html',
  icon: 'fa-diagram-project',
  description: '基于工作流引擎的XX功能',
  status: 'available'
}
```

---

### 步骤二：创建工具页面

在 `tools/` 下新建 `my-workflow-tool.html`，可参考 `tools/contract-review.html` 或 `tools/contract-parse.html`。核心是从设置中读取 Workflow ID 与接口地址，然后发起 `stream_run` 调用并渲染流式响应。

最小化调用示例（建议复用 `ModelManager` 的流式处理）：

```html
<script src="../config/model-manager.js"></script>
<script>
  // 1. 选择当前模型（在线/本地工作流）
  function getCurrentModel() {
    // 若集成自己的设置开关，返回 'coze-workflow' 或 'coze-local-workflow'
    const workflow = localStorage.getItem('my_workflow_tool_workflow') || 'coze-online';
    return workflow === 'coze-local' ? 'coze-local-workflow' : 'coze-workflow';
  }

  // 2. 读取 Workflow ID 与可选参数
  function getWorkflowConfig() {
    const isUnified = localStorage.getItem('use_unified_settings') === 'true';
    const current = localStorage.getItem('my_workflow_tool_workflow') || 'coze-online';
    const workflowId = isUnified
      ? (current === 'coze-local'
          ? localStorage.getItem('coze_local_my_workflow_tool_workflow_id')
          : localStorage.getItem('coze_online_my_workflow_tool_workflow_id'))
      : localStorage.getItem('my-workflow-tool-workflow-id');
    return { workflowId, parameters: {} };
  }

  async function runWorkflow(userInput) {
    const modelManager = new ModelManager();
    const modelId = getCurrentModel();
    const { workflowId, parameters } = getWorkflowConfig();
    if (!workflowId) throw new Error('请先在工作流设置中配置 Workflow ID');

    const messages = [{ role: 'user', content: userInput }];

    // 关键：通过 ModelManager 统一发起工作流流式请求
    const result = await modelManager.callModel(modelId, messages, {
      workflowId,
      parameters
    });
    return result; // 字符串累积的流式结果
  }
</script>
```

说明：
- `callModel` 会根据模型提供商路由到 `callCozeAPI` 或 `callCozeLocalAPI`，并统一处理 `text/event-stream`。
- 若你的工具需先上传文件，可仿照 `tools/contract-review.html`/`tools/contract-parse.html` 先调用 `.../files/upload`，获得 `file_id` 后再随 `parameters` 提交给 `stream_run`。

---

### 步骤三：在设置页对接（workflow-settings）

- 打开 `tools/workflow-settings.html`，确认“工具模型配置”区域能显示你的新工具。
  - 若页面是动态读取 `config/models.json` 中的 `tools`，只需完成步骤一即可自动出现；
  - 若该区域为静态卡片，请参考现有“合同审核/合同解析”的卡片复制一份，替换为你的工具 ID 与本地存储键名。

建议本地存储键名约定（可按需调整）：
- `my_workflow_tool_workflow`: `coze-online` 或 `coze-local`
- 统一设置下：
  - `coze_online_my_workflow_tool_workflow_id`
  - `coze_local_my_workflow_tool_workflow_id`
- 独立设置下：
  - `my-workflow-tool-workflow-id`

---

### 步骤四：联调与测试

检查清单：
- workflow-settings 中已正确保存在线/本地模式、Base URL、API Key、Workflow ID；
- `index.html` 的工具入口可打开页面；
- 工具页面调用 `modelManager.callModel('coze-...workflow', ... , { workflowId, parameters })` 并正常返回流式内容；
- 如涉及文件上传：`/files/upload` 成功，`file_id` 进入 `parameters`；
- 在线模式需要 `coze_api_key`；本地模式可选 `coze_local_api_key`（如本地服务开启鉴权则必填）。

---

### 常见问题

- 无 API Key 报错：在线 Coze 必须配置 `coze_api_key`；本地 `coze-local` 视服务端配置而定。
- 404 或 CORS：检查 Base URL、端点是否为 `/workflow/stream_run`，以及本地服务 CORS 设置。
- 无流式内容：确认请求头 `Accept: text/event-stream`、服务支持流式，并检查 `ModelManager.handleStreamResponse` 是否被复用。

---

### 基于“批量文书”实践的补充建议（重要）

1) 连接设置“只在工作流设置页”维护，工具页不再承载任何 API/ID 输入
- 工具页面应完全依赖 `tools/workflow-settings.html` 的统一配置（在线/本地、Upload URL、Workflow URL、Workflow ID、API Key 等）。
- 工具 UI 不展示“当前工作流/模型”等连接信息，避免重复配置与信息噪音。

2) 工作流工具新增时需要在工作流设置页增加对应的键位
- 在线 ID：`coze_online_<tool>_workflow_id`（例如：`coze_online_batch_docs_workflow_id`）
- 本地 ID：`coze_local_<tool>_workflow_id`（例如：`coze_local_batch_docs_workflow_id`）
- 工具工作流选择：`<tool>_workflow`，取值 `coze-online` 或 `coze-local`（例如：`batch_docs_workflow`）
- 如页面是静态卡片，需要新增一张卡片（参照“合同审核/合同解析”），并在保存/加载/状态同步逻辑中纳入以上键位
- 同步消息（给父窗口）建议在 `workflow_settings_updated` 的 `data.tools` 中加入对应字段，便于其它页面联动（可选）

3) SSE 结果解析的兼容性处理
- 流式响应常见形态：
  - `event: Message` + `data: { content: "{\"output\":...}" }`（content 内层是字符串化 JSON）
  - `event: Message` + `data: "{ \"output\": ... }"`（data 直接是字符串化 JSON）
  - `type: "workflow_finished"` + `output: { output: "..." }`（结构化完成事件）
- 建议解析策略：
  - 优先判断 `workflow_finished`，从 `output.output` 或 `output.result` 提取
  - 对 `Message`：尝试将 `content` 或 `data` 解析为 JSON，再从 `output`/`data.output` 提取
  - 如果是纯文本日志，适当做兜底（例如提取 URL），在 `Done` 事件或流结束时统一渲染

4) 文件上传参数规范
- 对于工作流的文件输入变量，按照 Coze 规范传递：`{"file_id": "..."}`，并与工作流节点变量名一一对应（示例：`input_doc`、`input_excel`）。


