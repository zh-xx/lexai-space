/**
 * 设置管理器
 * 统一管理所有设置相关的功能，协调各个模块
 */
class SettingsManager {
    constructor() {
        this.modelConfigManager = null;
        this.apiKeyManager = null;
        this.toolModelManager = null;
        this.settingsModal = null;
        this.modelManager = null;
        this.init();
    }

    async init() {
        try {
            // 初始化各个管理器
            this.modelConfigManager = new ModelConfigManager();
            await this.modelConfigManager.init();

            this.apiKeyManager = new ApiKeyManager();
            this.toolModelManager = new ToolModelManager(this.modelConfigManager);

            // 初始化模型管理器（用于API调用）
            this.modelManager = new ModelManager();

            console.log('设置管理器初始化完成');
        } catch (error) {
            console.error('设置管理器初始化失败:', error);
        }
    }

    // 获取模型管理器（用于API调用）
    getModelManager() {
        return this.modelManager;
    }

    // 获取API密钥管理器
    getApiKeyManager() {
        return this.apiKeyManager;
    }

    // 获取工具模型管理器
    getToolModelManager() {
        return this.toolModelManager;
    }

    // 获取模型配置管理器
    getModelConfigManager() {
        return this.modelConfigManager;
    }



    // 获取当前工具模型
    getCurrentToolModel(toolId) {
        return this.toolModelManager.getCurrentModel(toolId);
    }

    // 设置工具模型
    setToolModel(toolId, modelId) {
        return this.toolModelManager.setToolModel(toolId, modelId);
    }

    // 获取API密钥
    getApiKey(provider) {
        return this.apiKeyManager.getApiKey(provider);
    }

    // 设置API密钥
    setApiKey(provider, apiKey) {
        this.apiKeyManager.setApiKey(provider, apiKey);
    }

    // 检查API密钥是否已配置
    isApiKeyConfigured(provider) {
        return this.apiKeyManager.isApiKeyConfigured(provider);
    }

    // 获取所有设置状态
    getAllSettingsStatus() {
        return {
            apiKeys: this.apiKeyManager.getApiKeyStatus(),
            toolModels: this.toolModelManager.getToolModelStatus(),
            config: this.modelConfigManager.getAllTools()
        };
    }

    // 导出所有设置
    exportAllSettings() {
        return {
            apiKeys: this.apiKeyManager.exportConfig(),
            toolModels: this.toolModelManager.exportConfig(),
            modelConfig: this.modelConfigManager.config
        };
    }

    // 导入所有设置
    importAllSettings(config) {
        if (config.apiKeys) {
            this.apiKeyManager.importConfig(config.apiKeys);
        }
        if (config.toolModels) {
            this.toolModelManager.importConfig(config.toolModels);
        }
    }

    // 重置所有设置
    resetAllSettings() {
        this.apiKeyManager.clearAllApiKeys();
        this.toolModelManager.resetAllToolModels();
        alert('所有设置已重置为默认值');
    }

    // 验证所有设置
    validateAllSettings() {
        const errors = [];
        const warnings = [];

        // 验证API密钥
        const providers = this.modelConfigManager.getAllProviders();
        providers.forEach(provider => {
            if (provider.id === 'coze-local') {
                // 本地coze需要URL配置，API密钥是可选的
                const localConfig = this.apiKeyManager.getLocalConfig(provider.id);
                if (!localConfig?.url) {
                    warnings.push(`${provider.id}: 未配置服务地址`);
                }
            } else {
                const apiKey = this.apiKeyManager.getApiKey(provider.id);
                if (apiKey) {
                    const validation = this.apiKeyManager.validateApiKey(provider.id, apiKey);
                    if (!validation.valid) {
                        errors.push(`${provider.id}: ${validation.message}`);
                    }
                } else {
                    warnings.push(`${provider.id}: 未配置API密钥`);
                }
            }
        });

        // 验证工具模型配置
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            const currentModel = this.toolModelManager.getCurrentModel(tool.id);
            const validation = this.toolModelManager.validateModelConfig(tool.id, currentModel);
            if (!validation.valid) {
                errors.push(`${tool.id}: ${validation.message}`);
            }
        });

        return { errors, warnings };
    }

    // 同步设置到各个工具
    syncSettingsToTools() {
        // 同步API密钥到各个工具
        const providers = this.modelConfigManager.getAllProviders();
        providers.forEach(provider => {
            if (provider.id === 'coze-local') {
                // 本地coze同步URL和可选的API密钥
                const localConfig = this.apiKeyManager.getLocalConfig(provider.id);
                const apiKey = this.apiKeyManager.getApiKey(provider.id);
                if (localConfig?.url) {
                    localStorage.setItem('coze_local_base_url', localConfig.url);
                }
                if (apiKey) {
                    localStorage.setItem('coze_local_api_key', apiKey);
                }
            } else {
                const apiKey = this.apiKeyManager.getApiKey(provider.id);
                if (apiKey) {
                    // 根据提供商设置不同的localStorage键名
                    switch (provider.id) {
                        case 'google':
                            localStorage.setItem('geminiApiKey', apiKey);
                            break;
                        case 'coze':
                            localStorage.setItem('cozeApiKey', apiKey);
                            localStorage.setItem('contract-parse-api-key', apiKey);
                            break;
                        case 'deepseek':
                            localStorage.setItem('deepseekApiKey', apiKey);
                            break;
                    }
                }
            }
        });

        // 同步工具模型配置
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            const model = this.toolModelManager.getCurrentModel(tool.id);
            if (model) {
                localStorage.setItem(`${tool.id}_model`, model);
                // 兼容旧的键名
                if (tool.id === 'ai-chat' || tool.id === 'document-gen') {
                    localStorage.setItem('geminiModel', model);
                }
            }
        });

        // 同步工作流ID
        const workflowKeys = ['review-workflow-id', 'parse-workflow-id', 'review-local-workflow-id', 'parse-local-workflow-id'];
        workflowKeys.forEach(key => {
            const value = this.toolModelManager.getWorkflowId(key);
            if (value) {
                const storageKey = key.replace('-', '_');
                localStorage.setItem(storageKey, value);
                
                // 兼容旧的键名
                if (key === 'review-workflow-id') {
                    localStorage.setItem('workflowId', value);
                } else if (key === 'parse-workflow-id') {
                    localStorage.setItem('contract-parse-workflow-id', value);
                }
            }
        });
    }

    // 获取设置摘要
    getSettingsSummary() {
        const summary = {
            configuredProviders: [],
            configuredTools: [],
            totalProviders: 0,
            totalTools: 0
        };

        // 统计提供商配置
        const providers = this.modelConfigManager.getAllProviders();
        summary.totalProviders = providers.length;
        providers.forEach(provider => {
            if (this.apiKeyManager.isApiKeyConfigured(provider.id)) {
                summary.configuredProviders.push(provider.id);
            }
        });

        // 统计工具配置
        const tools = this.modelConfigManager.getAllTools();
        summary.totalTools = tools.length;
        tools.forEach(tool => {
            const currentModel = this.toolModelManager.getCurrentModel(tool.id);
            if (currentModel) {
                summary.configuredTools.push({
                    tool: tool.id,
                    model: currentModel
                });
            }
        });

        return summary;
    }

    // 检查设置完整性
    checkSettingsCompleteness() {
        const summary = this.getSettingsSummary();
        const completeness = {
            providers: summary.configuredProviders.length / summary.totalProviders,
            tools: summary.configuredTools.length / summary.totalTools,
            overall: (summary.configuredProviders.length + summary.configuredTools.length) / 
                    (summary.totalProviders + summary.totalTools)
        };

        return {
            summary,
            completeness,
            isComplete: completeness.overall >= 0.5 // 至少50%的配置完成
        };
    }
}

// 导出设置管理器
window.SettingsManager = SettingsManager; 