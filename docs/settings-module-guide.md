# 设置模块使用指南

## 概述

法律AI工作台包含两个主要的设置模块：

1. **工作流设置** (`workflow-settings.html`) - 配置Coze工作流API和工具模型
2. **LLM设置** (`llm-settings.html`) - 配置AI模型和工具默认模型

## 工作流设置

### 功能说明

工作流设置用于配置Coze平台的在线和本地工作流服务，主要用于：

- 合同审核工作流
- 合同解析工作流
- 工作流API连接测试

### 配置项

#### Coze 在线版
- **API密钥**: Coze平台的API密钥
- **工作流API地址**: 工作流执行接口地址
- **合同审核工作流ID**: 在Coze平台创建的合同审核工作流ID
- **合同解析工作流ID**: 在Coze平台创建的合同解析工作流ID

#### Coze 本地版
- **服务地址**: 本地部署的Coze服务地址
- **工作流API地址**: 本地工作流执行接口地址
- **合同审核工作流ID**: 本地部署的合同审核工作流ID
- **合同解析工作流ID**: 本地部署的合同解析工作流ID

### 使用方法

1. 打开工作流设置页面
2. 配置Coze在线版或本地版的API密钥和服务地址
3. 设置相应的工作流ID
4. 选择工具使用的工作流类型
5. 点击"保存设置"保存配置

## LLM设置

### 功能说明

LLM设置用于配置各种AI模型的API密钥和工具默认模型，支持：

- Google Gemini 系列模型
- DeepSeek Chat/Coder 模型
- Coze 工作流模型

### 配置项

#### API 密钥配置
- **Google API**: 支持 Gemini 1.5/2.0/2.5 Pro 模型
- **DeepSeek API**: 支持 DeepSeek Chat 和 Coder 模型
- **Coze API**: 支持 Coze 工作流模型
- **Coze 本地部署**: 本地部署的Coze服务地址

#### 工具模型配置
- **AI 对话**: 与AI进行智能对话
- **合同生成**: 智能生成合同文档
- **文档生成**: 智能生成各类法律文档

#### 工作流配置
- **合同审核工作流**: 智能审核合同条款的工作流
- **合同解析工作流**: 智能解析合同内容的工作流

### 使用方法

1. 打开LLM设置页面
2. 配置相应提供商的API密钥
3. 选择各工具的默认模型
4. 配置工作流ID（如需要）
5. 点击"保存设置"保存配置

## 设置同步机制

### 消息传递

设置页面通过 `postMessage` 向父窗口发送设置更新消息：

```javascript
// 工作流设置更新
{
    type: 'workflow_settings_updated',
    data: {
        // 设置数据
    }
}

// LLM设置更新
{
    type: 'llm_settings_updated',
    data: {
        // 设置数据
    }
}
```

### 工具监听

各个工具页面监听设置更新消息：

```javascript
// 监听工作流设置更新
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'workflow_settings_updated') {
        console.log('收到工作流设置更新消息:', event.data);
        // 处理设置更新
    }
});

// 监听LLM设置更新
window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'llm_settings_updated') {
        console.log('收到LLM设置更新消息:', event.data);
        // 处理设置更新
    }
});
```

## 设置管理器

### 核心类

- `SettingsManager`: 统一管理所有设置
- `ModelConfigManager`: 管理模型配置
- `ApiKeyManager`: 管理API密钥
- `ToolModelManager`: 管理工具模型
- `ModelManager`: 管理模型API调用

### 主要方法

```javascript
// 初始化设置管理器
const settingsManager = new SettingsManager();
await settingsManager.init();

// 获取设置状态
const status = settingsManager.getAllSettingsStatus();

// 验证设置
const validation = settingsManager.validateAllSettings();

// 导出设置
const exportedSettings = settingsManager.exportAllSettings();

// 同步设置到工具
settingsManager.syncSettingsToTools();
```

## 最佳实践

### 1. 设置验证

在保存设置前，建议进行验证：

```javascript
const validation = settingsManager.validateAllSettings();
if (validation.errors.length > 0) {
    console.error('设置验证失败:', validation.errors);
    return;
}
```

### 2. 设置备份

定期导出设置配置：

```javascript
const settings = settingsManager.exportAllSettings();
localStorage.setItem('settings_backup', JSON.stringify(settings));
```

### 3. 错误处理

在设置操作中添加错误处理：

```javascript
try {
    settingsManager.saveSettings();
    console.log('设置保存成功');
} catch (error) {
    console.error('设置保存失败:', error);
}
```

### 4. 状态监控

监控设置状态变化：

```javascript
// 监听设置变化
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // 设置发生变化，更新UI
            updateSettingsUI();
        }
    });
});
```

## 故障排除

### 常见问题

1. **API密钥无效**
   - 检查API密钥是否正确
   - 确认API密钥是否已过期
   - 验证API密钥权限

2. **工作流连接失败**
   - 检查网络连接
   - 验证工作流服务是否正常运行
   - 确认工作流ID是否正确

3. **设置同步失败**
   - 检查浏览器控制台错误信息
   - 确认iframe通信是否正常
   - 验证消息格式是否正确

### 调试方法

1. 启用详细日志：
```javascript
localStorage.setItem('debug_settings', 'true');
```

2. 检查设置状态：
```javascript
console.log('当前设置状态:', settingsManager.getAllSettingsStatus());
```

3. 验证API连接：
```javascript
settingsManager.testAllApis();
```

## 更新日志

### v1.0.0
- 初始版本
- 支持工作流设置和LLM设置
- 实现设置同步机制
- 添加设置验证和错误处理 