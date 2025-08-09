### 新增 LLM 工具指南

本指南说明如何在本项目中新增“LLM 工具”（直接调用各家 LLM 提供商 API，如 Google、DeepSeek、Kimi、Qwen、OpenRouter、Ollama 等），与“工作流工具”不同，LLM 工具不依赖 Coze 工作流的 `stream_run`。

适用：你的新工具想要直接与某个或多个 LLM 交互（对话、内容生成等），并复用 `tools/llm-settings.html` 中的模型与 API Key 管理能力。

---

### 步骤一：在配置中注册你的工具

1) 在 `config/models.json` 的 `tools` 节点下添加你的工具条目（示例）：

```json
{
  "tools": {
    "my-llm-tool": {
      "name": "我的LLM工具",
      "default_model": "", // 建议留空，由 llm-settings 验证通过后填入
      "supported_models": [], // 由 llm-settings 验证通过的模型动态决定
      "description": "直接调用LLM的XX功能"
    }
  }
}
```

说明：
- LLM 工具通常不预设具体模型，而是依赖 `llm-settings.html` 完成模型验证后填充；
- 若你的工具只支持部分提供商，也可以静态给出候选模型列表。

2) 在 `index.html` 的 `ToolManager` 注册工具入口（示意，添加到 `this.tools`）：

```javascript
'my-llm-tool': {
  name: '我的LLM工具',
  url: 'tools/my-llm-tool.html',
  icon: 'fa-brain',
  description: '直接调用LLM的XX功能',
  status: 'available'
}
```

---

### 步骤二：创建工具页面

在 `tools/` 下新建 `my-llm-tool.html`，可参考 `tools/homepage.html`（AI 对话）或 `tools/document-gen.html`（合同生成）。核心是使用 `ModelManager.callModel(modelId, messages, options)` 直接调用所选 LLM 模型。

最小化调用示例：

```html
<script src="../config/model-manager.js"></script>
<script>
  // 1. 选择当前模型：从 llm-settings 验证通过的模型中读取
  function getCurrentModel() {
    // 方案A：读取你的工具默认模型（由 llm-settings 写入 localStorage）
    const model = localStorage.getItem('my-llm-tool_model');
    if (!model) throw new Error('请先在 LLM 模型设置中选择并验证模型');
    return model;
  }

  // 2. 拼装标准 messages
  function buildMessages(userInput) {
    return [{ role: 'user', content: userInput }];
  }

  async function callLLM(userInput) {
    const modelManager = new ModelManager();
    const modelId = getCurrentModel();
    const messages = buildMessages(userInput);

    // 关键：直接调用 LLM（由 modelId 的 provider 路由至对应实现，如 Google/DeepSeek/Kimi/Qwen/OpenRouter/Ollama）
    const result = await modelManager.callModel(modelId, messages, {
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    });
    return result; // 字符串结果
  }
</script>
```

说明：
- `ModelManager.callModel` 会根据 `modelId` 路由到 `callGoogleAPI`、`callDeepSeekAPI`、`callKimiAPI`、`callQwenAPI`、`callOpenRouterAPI`、`callOllamaAPI` 等实现；
- 如果需要流式输出，传 `stream: true`，并在各提供商实现中确认已支持（目前 Google/DeepSeek/OpenRouter/Qwen/Kimi 采用兼容 OpenAI 风格；Ollama 走本地 `api/chat`）。

---

### 步骤三：在设置页对接（llm-settings）

打开 `tools/llm-settings.html`：
- 确保你的工具出现在“工具模型配置”区域；
- 通过该页面选择并验证模型后，写入 `localStorage`，常见约定如下：
  - `my-llm-tool_model`：当前选中的模型 ID；
  - `<provider>_api_key`：由设置页统一管理（例如 `google_api_key`、`deepseek_api_key`、`kimi_api_key`、`qwen_api_key`、`openrouter_api_key`）。

补充（与工作流工具的区别）：
- LLM 工具可在工具页展示或切换模型（由 `llm-settings.html` 验证结果决定）；
- 工作流工具不在工具页展示任何连接项/模型，全部在 `workflow-settings.html` 统一维护。

如设置页是静态卡片：复制一张现有 LLM 工具卡片（如 AI 对话/合同生成），替换工具 ID、显示名和读写键名。

---

### 步骤四：联调与测试

检查清单：
- 在 llm-settings 中完成各目标提供商的 API Key 配置；
- 选定并“验证”模型，确认写入 `localStorage`；
- 工具页面能正确读取 `my-llm-tool_model` 并完成一次 `callModel`；
- 如开启流式：前端渲染是否按 token 追加显示；
- 常见错误能被捕获并展示（如 401 未授权、429 速率限制、供应商报错消息等）。

---

### 可选：限制支持的提供商/模型

如果你的工具只希望支持部分提供商，可以在 `config/models.json` 为该工具预置 `supported_models`；也可以在工具页面内做白名单校验，或在 `ModelManager` 层添加更细粒度的校验逻辑。

---

### 常见问题

- “不支持的提供商”错误：`ModelManager.callModel` 的 `switch(provider)` 未覆盖你的目标提供商；
- 模型验证失败：先在 llm-settings 完成 API Key 配置与“测试/验证”；
- 响应为空：检查 `messages` 结构是否符合各 API 期望；
- 跨域问题：浏览器下直连三方 API 可能有 CORS 限制，必要时通过自有后端转发。


