# 添加新LLM服务商指南

## 概述

本项目支持两种添加LLM服务商的方式：
1. **硬编码方式**（推荐）：直接在代码中添加API调用逻辑，支持动态模型
2. **配置方式**：在 `config/models.json` 中配置模型和服务商

本文档记录**硬编码方式**的实现步骤，这种方式与现有的Google和DeepSeek实现保持一致。

## 实现步骤

### 1. 修改 `config/model-manager.js`

#### 1.1 在 `loadApiKeys()` 方法中添加新服务商的API密钥加载

```javascript
loadApiKeys() {
    this.apiKeys = {
        google: localStorage.getItem('google_api_key') || '',
        coze: localStorage.getItem('coze_api_key') || '',
        'coze-local': localStorage.getItem('coze_local_api_key') || '',
        deepseek: localStorage.getItem('deepseek_api_key') || '',
        'your-provider': localStorage.getItem('your_provider_api_key') || '' // 新增
    };
}
```

#### 1.2 在 `callModel()` 方法的 switch 语句中添加新服务商

```javascript
switch (provider) {
    case 'google':
        return await this.callGoogleAPI(modelId, messages, options);
    case 'coze':
        return await this.callCozeAPI(modelId, messages, options);
    case 'deepseek':
        return await this.callDeepSeekAPI(modelId, messages, options);
    case 'coze-local':
        return await this.callCozeLocalAPI(modelId, messages, options);
    case 'your-provider': // 新增
        return await this.callYourProviderAPI(modelId, messages, options);
    default:
        throw new Error(`不支持的提供商: ${provider}`);
}
```

#### 1.3 添加新服务商的API调用方法

```javascript
async callYourProviderAPI(modelId, messages, options) {
    const apiKey = this.getApiKey('your-provider');
    
    // 根据服务商的API格式设置URL
    const url = 'https://api.your-provider.com/v1/chat/completions';
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            stream: options.stream || false,
            max_tokens: options.max_tokens || 4096
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Your Provider API调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
```

### 2. 修改 `config/api-key-manager.js`

#### 2.1 在 `loadApiKeys()` 方法中添加新服务商

```javascript
loadApiKeys() {
    this.apiKeys = {
        google: localStorage.getItem('google_api_key') || '',
        coze: localStorage.getItem('coze_api_key') || '',
        'coze-local': localStorage.getItem('coze_local_api_key') || '',
        deepseek: localStorage.getItem('deepseek_api_key') || '',
        'your-provider': localStorage.getItem('your_provider_api_key') || '' // 新增
    };
}
```

#### 2.2 在 `getApiKeyStatus()` 方法中添加新服务商

```javascript
// 检查需要API密钥的提供商
['google', 'coze', 'deepseek', 'coze-local', 'your-provider'].forEach(provider => {
    // ... 现有代码
});
```

#### 2.3 在 `validateApiKey()` 方法中添加验证逻辑

```javascript
switch (provider) {
    case 'google':
        return this.validateGoogleApiKey(apiKey);
    case 'coze':
        return this.validateCozeApiKey(apiKey);
    case 'deepseek':
        return this.validateDeepSeekApiKey(apiKey);
    case 'coze-local':
        return this.validateCozeLocalApiKey(apiKey);
    case 'your-provider': // 新增
        return this.validateYourProviderApiKey(apiKey);
    default:
        return { valid: false, message: '不支持的提供商' };
}
```

#### 2.4 添加API密钥验证方法

```javascript
// 验证Your Provider API密钥
validateYourProviderApiKey(apiKey) {
    if (!apiKey || apiKey.length < 10) {
        return { valid: false, message: 'Your Provider API密钥格式不正确' };
    }
    return { valid: true, message: 'API密钥格式正确' };
}
```

### 3. 修改工具页面

#### 3.1 修改 `tools/homepage.html`（AI对话工具）

在 `callAIAPI` 函数中添加新服务商支持：

```javascript
// 根据提供商调用对应的API
switch (verifiedModel.provider) {
    case 'deepseek':
        return await callDeepSeekAPI(messages, verifiedModel.modelName, verifiedModel.apiKey);
    case 'gemini':
        return await callGoogleAPI(messages, verifiedModel.modelName, verifiedModel.apiKey);
    case 'your-provider': // 新增
        return await callYourProviderAPI(messages, verifiedModel.modelName, verifiedModel.apiKey);
    default:
        throw new Error(`不支持的提供商: ${verifiedModel.provider}`);
}
```

#### 3.2 修改 `tools/document-gen.html`（合同生成工具）

同样在 `callAIAPI` 函数中添加新服务商支持。

#### 3.3 修改其他LLM API工具页面（如果有新增）

**重要**：只需要修改在 `llm-settings.html` 中有模型配置的工具页面。

对于 `tools/` 目录下的工具页面，需要区分处理：

1. **检查工具类型**：
   - 在 `llm-settings.html` 的"工具模型配置"部分有配置的工具 → 需要修改
   - 在 `workflow-settings.html` 的"工具模型配置"部分有配置的工具 → 不需要修改

2. **对于需要修改的LLM API工具**：
   - 找到 `callAIAPI` 函数
   - 在验证模型处理的switch语句中添加新case
   - 添加对应的API调用方法

例如，如果有新的LLM API工具 `tools/new-llm-tool.html`，需要：

```javascript
// 在 callAIAPI 函数的验证模型处理中添加
switch (verifiedModel.provider) {
    case 'deepseek':
        return await callDeepSeekAPI(messages, verifiedModel.modelName, verifiedModel.apiKey);
    case 'gemini':
        return await callGoogleAPI(messages, verifiedModel.modelName, verifiedModel.apiKey);
    case 'your-provider': // 新增
        return await callYourProviderAPI(messages, verifiedModel.modelName, verifiedModel.apiKey);
    default:
        throw new Error(`不支持的提供商: ${verifiedModel.provider}`);
}
```

**注意**：工作流工具（如合同审核、合同解析）不需要修改，因为它们不直接调用LLM API。

#### 3.4 添加API调用方法

在工具页面中添加新服务商的API调用方法：

```javascript
async function callYourProviderAPI(messages, model, apiKey) {
    const url = 'https://api.your-provider.com/v1/chat/completions';
    
    const yourProviderMessages = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.parts[0].text
    }));

    const response = await fetch(url, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: yourProviderMessages,
            max_tokens: 4000
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Your Provider API请求失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
```

### 4. 修改设置页面 `tools/llm-settings.html`

#### 4.1 添加HTML配置卡片

```html
<!-- Your Provider API -->
<div class="config-card">
    <div class="config-header">
        <div class="config-info">
            <h4>Your Provider API</h4>
            <p>支持 Your Provider 系列模型</p>
        </div>
        <div class="status-indicator" id="your-provider-status"></div>
    </div>
    
    <div class="form-group">
        <label class="form-label">API 密钥</label>
        <input type="password" class="form-input" id="your-provider-api-key" 
               placeholder="请输入您的 Your Provider API 密钥">
        <div class="help-text">
            <a href="https://your-provider.com/" target="_blank">获取 Your Provider API 密钥</a>
        </div>
    </div>

    <div class="form-group">
        <label class="form-label">模型名称</label>
        <input type="text" class="form-input" id="your-provider-model-name" 
               placeholder="例如：your-model-name">
        <div class="help-text">输入您要使用的模型名称</div>
    </div>

    <div class="form-group">
        <button class="btn btn-secondary" id="test-your-provider-btn">
            <i class="fa-solid fa-vial"></i> 验证 API
        </button>
        <span class="validation-status" id="your-provider-validation-status"></span>
    </div>
</div>
```

#### 4.2 添加CSS样式

```css
.model-tag.your-provider {
    background: #your-color;
}
```

#### 4.3 添加JavaScript逻辑

在 `loadSettings()` 方法中添加：

```javascript
document.getElementById('your-provider-api-key').value = localStorage.getItem('your_provider_api_key') || '';
document.getElementById('your-provider-model-name').value = localStorage.getItem('your_provider_model_name') || '';
```

在 `bindEvents()` 方法中添加：

```javascript
// Your Provider验证按钮
const testYourProviderBtn = document.getElementById('test-your-provider-btn');
if (testYourProviderBtn) {
    testYourProviderBtn.addEventListener('click', () => this.testYourProviderApi());
    console.log('Your Provider验证按钮事件绑定成功');
}
```

在 `saveSettings()` 方法中添加：

```javascript
const yourProviderApiKey = document.getElementById('your-provider-api-key').value.trim();
const yourProviderModelName = document.getElementById('your-provider-model-name').value.trim();

if (yourProviderApiKey) localStorage.setItem('your_provider_api_key', yourProviderApiKey);
if (yourProviderModelName) localStorage.setItem('your_provider_model_name', yourProviderModelName);
```

在 `updateStatus()` 方法中添加：

```javascript
const yourProviderApiKey = localStorage.getItem('your_provider_api_key');
const yourProviderStatus = document.getElementById('your-provider-status');
if (yourProviderStatus) {
    yourProviderStatus.className = `status-indicator ${yourProviderApiKey ? 'connected' : ''}`;
}
```

#### 4.4 添加API测试方法

```javascript
// 测试Your Provider API
async testYourProviderApi() {
    const apiKey = document.getElementById('your-provider-api-key').value.trim();
    const modelName = document.getElementById('your-provider-model-name').value.trim();
    const statusElement = document.getElementById('your-provider-validation-status');
    const testBtn = document.getElementById('test-your-provider-btn');

    if (!apiKey || !modelName) {
        statusElement.textContent = '请先输入API密钥和模型名称';
        statusElement.className = 'validation-status warning';
        return;
    }

    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 验证中...';
    statusElement.textContent = '正在验证...';
    statusElement.className = 'validation-status warning';

    try {
        const response = await fetch('https://api.your-provider.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'user', content: 'Hello, Your Provider!' }],
                max_tokens: 100
            })
        });

        if (response.ok) {
            statusElement.textContent = '验证成功！';
            statusElement.className = 'validation-status success';
            this.addVerifiedModel('your-provider', modelName, apiKey);
        } else {
            statusElement.textContent = `验证失败: ${response.status} ${response.statusText}`;
            statusElement.className = 'validation-status error';
        }
    } catch (error) {
        statusElement.textContent = `验证失败: ${error.message}`;
        statusElement.className = 'validation-status error';
    } finally {
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fa-solid fa-vial"></i> 验证 API';
    }
}
```

#### 4.5 更新已验证模型列表显示

在 `updateVerifiedModelsList()` 方法中添加：

```javascript
} else if (model.provider === 'your-provider') {
    providerIcon = 'fa-solid fa-your-icon';
    providerClass = 'your-provider';
}
```

#### 4.6 在批量测试中添加

在 `testAllApis()` 方法中添加：

```javascript
// 测试Your Provider API
const yourProviderApiKey = localStorage.getItem('your_provider_api_key');
const yourProviderModelName = document.getElementById('your-provider-model-name').value.trim();
if (yourProviderApiKey && yourProviderModelName) {
    try {
        const response = await fetch('https://api.your-provider.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${yourProviderApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: yourProviderModelName,
                messages: [{ role: 'user', content: 'Hello, Your Provider!' }],
                max_tokens: 100
            })
        });
        if (response.ok) {
            results.push({ type: 'success', message: `Your Provider API: 验证成功 (${yourProviderModelName})` });
        } else {
            results.push({ type: 'error', message: `Your Provider API: 验证失败 (${yourProviderModelName}, ${response.status} ${response.statusText})` });
        }
    } catch (e) {
        results.push({ type: 'error', message: `Your Provider API: 连接失败 (${yourProviderModelName})` });
    }
} else {
    results.push({ type: 'warning', message: 'Your Provider API: API密钥或模型名称未配置' });
}
```

## 示例：添加Kimi服务商

### 1. 修改 `config/model-manager.js`

```javascript
// 在 loadApiKeys() 中添加
kimi: localStorage.getItem('kimi_api_key') || ''

// 在 callModel() 的 switch 中添加
case 'kimi':
    return await this.callKimiAPI(modelId, messages, options);

// 添加API调用方法
async callKimiAPI(modelId, messages, options) {
    const apiKey = this.getApiKey('kimi');
    
    // Kimi使用Moonshot API，base_url为https://api.moonshot.cn/v1
    const url = 'https://api.moonshot.cn/v1/chat/completions';
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId || 'kimi-k2-0711-preview', // 默认使用kimi-k2-0711-preview模型
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            temperature: options.temperature || 0.6, // Kimi推荐的默认temperature
            stream: options.stream || false,
            max_tokens: options.max_tokens || 4096
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Kimi API调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
```

### 2. 修改 `config/api-key-manager.js`

```javascript
// 在 loadApiKeys() 中添加
kimi: localStorage.getItem('kimi_api_key') || ''

// 在 validateApiKey() 中添加
case 'kimi':
    return this.validateKimiApiKey(apiKey);

// 添加验证方法
validateKimiApiKey(apiKey) {
    if (!apiKey || apiKey.length < 10) {
        return { valid: false, message: 'Kimi API密钥格式不正确' };
    }
    return { valid: true, message: 'API密钥格式正确' };
}
```

### 3. Kimi服务商特点

- **API端点**: `https://api.moonshot.cn/v1/chat/completions`
- **默认模型**: `kimi-k2-0711-preview`
- **推荐temperature**: 0.6
- **认证方式**: Bearer Token
- **支持流式响应**: 是

## 示例：添加OpenAI兼容服务商

### 1. 修改 `config/model-manager.js`

```javascript
// 在 loadApiKeys() 中添加
'openai-compatible': localStorage.getItem('openai_compatible_api_key') || ''

// 在 callModel() 的 switch 中添加
case 'openai-compatible':
    return await this.callOpenAICompatibleAPI(modelId, messages, options);

// 添加API调用方法
async callOpenAICompatibleAPI(modelId, messages, options) {
    const apiKey = this.getApiKey('openai-compatible');
    const baseUrl = localStorage.getItem('openai_compatible_base_url') || 'https://api.openai.com/v1';
    
    const url = `${baseUrl}/chat/completions`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: modelId,
            messages: messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            stream: options.stream || false,
            max_tokens: options.max_tokens || 4096
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'OpenAI兼容API调用失败');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}
```

### 2. 修改 `config/api-key-manager.js`

```javascript
// 在 loadApiKeys() 中添加
'openai-compatible': localStorage.getItem('openai_compatible_api_key') || ''

// 在 validateApiKey() 中添加
case 'openai-compatible':
    return this.validateOpenAICompatibleApiKey(apiKey);

// 添加验证方法
validateOpenAICompatibleApiKey(apiKey) {
    if (!apiKey || apiKey.length < 10) {
        return { valid: false, message: 'OpenAI兼容API密钥格式不正确' };
    }
    return { valid: true, message: 'API密钥格式正确' };
}
```

## 注意事项

1. **API密钥存储**：使用 `your_provider_api_key` 格式存储在localStorage中
2. **错误处理**：确保API调用失败时有适当的错误信息
3. **流式响应**：如果服务商支持流式响应，需要实现相应的处理逻辑
4. **模型验证**：某些服务商可能需要验证模型名称的有效性
5. **速率限制**：考虑添加请求频率限制和重试机制

## 测试

添加新服务商后，建议进行以下测试：

1. **API密钥验证**：测试API密钥格式验证
2. **模型调用**：测试实际的API调用
3. **错误处理**：测试各种错误情况
4. **集成测试**：在具体工具中测试新服务商

## 总结

这种硬编码方式允许：
- 支持任何符合标准API格式的服务商
- 动态支持服务商的所有模型
- 与现有Google和DeepSeek实现保持一致
- 无需修改配置文件即可添加新服务商

## 📋 完整步骤总结

### 第一步：核心配置
1. **修改 `config/model-manager.js`**
   - 添加API密钥加载
   - 添加switch语句支持
   - 添加API调用方法

2. **修改 `config/api-key-manager.js`**
   - 添加API密钥管理
   - 添加验证逻辑
   - 添加状态检查

### 第二步：工具页面支持

**重要说明**：项目中的工具分为两类，需要不同的处理方式：

#### 2.1 LLM API工具（在 `llm-settings.html` 中配置）
这些工具直接调用LLM API，需要添加新服务商支持：

3. **修改 `tools/homepage.html`（AI对话工具）**
   - 在验证模型处理中添加新服务商支持
   - 添加API调用方法

4. **修改 `tools/document-gen.html`（合同生成工具）**
   - 在验证模型处理中添加新服务商支持
   - 添加API调用方法

5. **修改其他LLM API工具页面（如果有新增）**
   - 检查 `tools/` 目录下的所有工具页面
   - 识别哪些工具在 `llm-settings.html` 中有模型配置
   - 在这些工具的 `callAIAPI` 函数中添加新服务商支持
   - 添加对应的API调用方法

#### 2.2 工作流工具（在 `workflow-settings.html` 中配置）
这些工具调用工作流，不需要添加新服务商支持：

- **合同审核工具**：使用工作流，不需要修改
- **合同解析工具**：使用工作流，不需要修改
- **其他工作流工具**：不需要修改

**如何区分**：
- 在 `tools/llm-settings.html` 的"工具模型配置"部分有配置的工具 → LLM API工具
- 在 `tools/workflow-settings.html` 的"工具模型配置"部分有配置的工具 → 工作流工具

### 第三步：设置页面集成
5. **修改 `tools/llm-settings.html`**
   - 添加HTML配置卡片
   - 添加CSS样式
   - 添加JavaScript逻辑
   - 添加API测试方法
   - 更新模型列表显示
   - 添加批量测试支持

### 第四步：测试验证
6. **功能测试**
   - 验证API密钥格式
   - 测试API连接
   - 测试模型调用
   - 测试工具集成

## 🎯 关键要点

- **API密钥存储**：使用 `your_provider_api_key` 格式
- **模型名称**：确保模型名称以服务商前缀开头（如 `kimi-`）
- **错误处理**：提供友好的错误信息
- **状态同步**：确保所有组件状态一致
- **测试覆盖**：包括单个API测试和批量测试
- **工具页面检查**：确保 `tools/` 目录下的LLM API工具都支持新服务商（工作流工具无需修改）

## 🚀 快速添加新服务商

按照这个指南，您可以轻松添加任何新的LLM服务商到项目中。整个过程大约需要修改5-6个文件，添加约50-100行代码，即可完成完整的功能集成。

**重要提醒**：
- 每次添加新服务商时，请检查 `tools/` 目录下的LLM API工具页面
- 区分工具类型：LLM API工具需要修改，工作流工具不需要修改
- 确保所有LLM API工具都支持新服务商，避免出现"不支持的提供商"错误
- 可以参考Kimi的实际实现作为模板，快速复制和修改相关代码

## 📋 工具页面检查清单

添加新服务商后，请检查以下工具页面是否都已更新：

### LLM API工具（需要修改）：
- [ ] `tools/homepage.html`（AI对话工具）
- [ ] `tools/document-gen.html`（合同生成工具）
- [ ] 其他在 `llm-settings.html` 中有模型配置的工具...

### 工作流工具（不需要修改）：
- [ ] `tools/contract-review.html`（合同审核工具）- 使用工作流，无需修改
- [ ] `tools/contract-parse.html`（合同解析工具）- 使用工作流，无需修改
- [ ] 其他在 `workflow-settings.html` 中有配置的工具...

**检查方法**：
1. **区分工具类型**：
   - 检查工具是否在 `llm-settings.html` 的"工具模型配置"部分有配置
   - 如果有配置 → 需要修改
   - 如果没有配置 → 检查是否在 `workflow-settings.html` 中有配置

2. **对于需要修改的LLM API工具**：
   - 搜索 `callAIAPI` 函数
   - 找到验证模型处理的switch语句
   - 确认已添加新服务商的case
   - 确认已添加对应的API调用方法

3. **对于工作流工具**：
   - 无需修改，因为它们不直接调用LLM API
