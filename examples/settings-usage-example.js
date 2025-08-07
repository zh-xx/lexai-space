/**
 * 设置系统使用示例
 * 展示如何使用模块化的设置系统
 */

// 使用示例
async function settingsUsageExample() {
    console.log('=== 设置系统使用示例 ===');

    // 1. 初始化设置管理器
    const settingsManager = new SettingsManager();
    await settingsManager.init();

    // 2. 获取各个管理器
    const modelConfigManager = settingsManager.getModelConfigManager();
    const apiKeyManager = settingsManager.getApiKeyManager();
    const toolModelManager = settingsManager.getToolModelManager();
    const modelManager = settingsManager.getModelManager();

    console.log('✅ 设置管理器初始化完成');

    // 3. 查看所有可用的模型
    console.log('\n📋 所有可用模型:');
    const allModels = modelConfigManager.getAllModels();
    allModels.forEach(model => {
        console.log(`  - ${model.name} (${model.id}) - ${model.provider}`);
    });

    // 4. 查看所有提供商
    console.log('\n🔑 所有提供商:');
    const allProviders = modelConfigManager.getAllProviders();
    allProviders.forEach(provider => {
        console.log(`  - ${provider.name} (${provider.id})`);
    });

    // 5. 查看所有工具
    console.log('\n🛠️ 所有工具:');
    const allTools = modelConfigManager.getAllTools();
    allTools.forEach(tool => {
        console.log(`  - ${tool.name} (${tool.id})`);
    });

    // 6. 设置API密钥示例
    console.log('\n🔐 设置API密钥示例:');
    apiKeyManager.setApiKey('google', 'your-google-api-key-here');
    apiKeyManager.setApiKey('deepseek', 'your-deepseek-api-key-here');
    apiKeyManager.setApiKey('coze', 'your-coze-api-key-here');
    console.log('  - Google API密钥已设置');
    console.log('  - DeepSeek API密钥已设置');
    console.log('  - Coze API密钥已设置');

    // 7. 设置工具模型示例
    console.log('\n🤖 设置工具模型示例:');
    toolModelManager.setToolModel('ai-chat', 'gemini-2.5-pro');
    toolModelManager.setToolModel('document-gen', 'deepseek-chat');
    console.log('  - AI对话工具设置为 Gemini 2.5 Pro');
    console.log('  - 合同生成工具设置为 DeepSeek Chat');

    // 8. 设置工作流配置示例
    console.log('\n🔄 设置工作流配置示例:');
    toolModelManager.setWorkflowId('review-workflow-id', 'your-review-workflow-id');
    toolModelManager.setWorkflowId('parse-workflow-id', 'your-parse-workflow-id');
    console.log('  - 合同审核工作流ID已设置');
    console.log('  - 合同解析工作流ID已设置');

    // 9. 查看当前设置状态
    console.log('\n📊 当前设置状态:');
    const status = settingsManager.getAllSettingsStatus();
    console.log('  API密钥状态:', status.apiKeys);
    console.log('  工具模型状态:', status.toolModels);

    // 10. 验证设置
    console.log('\n✅ 验证设置:');
    const validation = settingsManager.validateAllSettings();
    console.log('  错误:', validation.errors);
    console.log('  警告:', validation.warnings);

    // 11. 获取设置摘要
    console.log('\n📈 设置摘要:');
    const summary = settingsManager.getSettingsSummary();
    console.log('  已配置提供商:', summary.configuredProviders.length, '/', summary.totalProviders);
    console.log('  已配置工具:', summary.configuredTools.length, '/', summary.totalTools);

    // 12. 检查设置完整性
    console.log('\n🎯 设置完整性:');
    const completeness = settingsManager.checkSettingsCompleteness();
    console.log('  提供商完整性:', Math.round(completeness.completeness.providers * 100) + '%');
    console.log('  工具完整性:', Math.round(completeness.completeness.tools * 100) + '%');
    console.log('  总体完整性:', Math.round(completeness.completeness.overall * 100) + '%');

    // 13. 导出设置
    console.log('\n💾 导出设置:');
    const exportedSettings = settingsManager.exportAllSettings();
    console.log('  导出的设置:', exportedSettings);

    // 14. 同步设置到工具
    console.log('\n🔄 同步设置到工具:');
    settingsManager.syncSettingsToTools();
    console.log('  设置已同步到各个工具');

    console.log('\n=== 示例完成 ===');
}

// 高级使用示例
function advancedSettingsExample() {
    console.log('\n=== 高级设置使用示例 ===');

    // 1. 动态添加新的模型配置
    function addNewModel(modelId, modelConfig) {
        const modelConfigManager = window.settingsManager.getModelConfigManager();
        if (modelConfigManager.config && modelConfigManager.config.models) {
            modelConfigManager.config.models[modelId] = modelConfig;
            console.log(`✅ 新模型 ${modelId} 已添加`);
        }
    }

    // 2. 批量设置API密钥
    function batchSetApiKeys(apiKeys) {
        const apiKeyManager = window.settingsManager.getApiKeyManager();
        Object.keys(apiKeys).forEach(provider => {
            apiKeyManager.setApiKey(provider, apiKeys[provider]);
        });
        console.log('✅ 批量API密钥设置完成');
    }

    // 3. 获取特定工具的模型选项
    function getToolModelOptions(toolId) {
        const toolModelManager = window.settingsManager.getToolModelManager();
        const options = toolModelManager.getSupportedModelOptions(toolId);
        console.log(`${toolId} 支持的模型选项:`, options);
        return options;
    }

    // 4. 验证特定API密钥
    function validateSpecificApiKey(provider, apiKey) {
        const apiKeyManager = window.settingsManager.getApiKeyManager();
        const result = apiKeyManager.validateApiKey(provider, apiKey);
        console.log(`${provider} API密钥验证结果:`, result);
        return result;
    }

    // 5. 重置特定工具模型
    function resetToolModel(toolId) {
        const toolModelManager = window.settingsManager.getToolModelManager();
        const success = toolModelManager.resetToolModel(toolId);
        console.log(`${toolId} 模型重置${success ? '成功' : '失败'}`);
        return success;
    }

    // 6. 设置工作流配置
    function setWorkflowConfig(workflowType, config) {
        const toolModelManager = window.settingsManager.getToolModelManager();
        Object.keys(config).forEach(key => {
            toolModelManager.setWorkflowId(key, config[key]);
        });
        console.log(`✅ ${workflowType} 工作流配置已设置`);
    }

    // 7. 测试工作流连接
    async function testWorkflowConnection(workflowUrl) {
        try {
            const response = await fetch(`${workflowUrl}/health`);
            const isHealthy = response.ok;
            console.log(`工作流连接测试: ${isHealthy ? '成功' : '失败'}`);
            return isHealthy;
        } catch (error) {
            console.log(`工作流连接测试失败: ${error.message}`);
            return false;
        }
    }

    // 示例调用
    console.log('高级功能已加载，可通过以下函数使用:');
    console.log('  - addNewModel(modelId, modelConfig)');
    console.log('  - batchSetApiKeys(apiKeys)');
    console.log('  - getToolModelOptions(toolId)');
    console.log('  - validateSpecificApiKey(provider, apiKey)');
    console.log('  - resetToolModel(toolId)');
    console.log('  - setWorkflowConfig(workflowType, config)');
    console.log('  - testWorkflowConnection(workflowUrl)');

    // 将函数暴露到全局作用域
    window.addNewModel = addNewModel;
    window.batchSetApiKeys = batchSetApiKeys;
    window.getToolModelOptions = getToolModelOptions;
    window.validateSpecificApiKey = validateSpecificApiKey;
    window.resetToolModel = resetToolModel;
    window.setWorkflowConfig = setWorkflowConfig;
    window.testWorkflowConnection = testWorkflowConnection;
}

// 初始化示例
document.addEventListener('DOMContentLoaded', async () => {
    // 等待设置管理器初始化
    window.settingsManager = new SettingsManager();
    await window.settingsManager.init();

    // 运行基础示例
    await settingsUsageExample();

    // 运行高级示例
    advancedSettingsExample();

    console.log('\n🎉 设置系统示例加载完成！');
    console.log('可以通过 window.settingsManager 访问设置管理器');
});

// 导出示例函数
window.settingsUsageExample = settingsUsageExample;
window.advancedSettingsExample = advancedSettingsExample; 