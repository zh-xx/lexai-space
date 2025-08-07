/**
 * 模型配置管理器
 * 负责管理模型配置、提供商配置和工具配置
 */
class ModelConfigManager {
    constructor() {
        this.config = null;
        this.init();
    }

    async init() {
        try {
            // 加载模型配置
            const response = await fetch('../config/models.json');
            this.config = await response.json();
            console.log('模型配置管理器初始化完成');
        } catch (error) {
            console.error('模型配置管理器初始化失败:', error);
        }
    }

    // 获取所有模型
    getAllModels() {
        return Object.keys(this.config.models).map(modelId => ({
            id: modelId,
            ...this.getModelInfo(modelId)
        }));
    }

    // 获取模型信息
    getModelInfo(modelId) {
        const modelConfig = this.config.models[modelId];
        if (!modelConfig) return null;
        
        return {
            name: modelConfig.name,
            provider: modelConfig.provider,
            description: modelConfig.description,
            capabilities: modelConfig.capabilities,
            max_tokens: modelConfig.max_tokens,
            supports_streaming: modelConfig.supports_streaming
        };
    }

    // 获取所有提供商
    getAllProviders() {
        return Object.keys(this.config.providers).map(providerId => ({
            id: providerId,
            ...this.getProviderInfo(providerId)
        }));
    }

    // 获取提供商信息
    getProviderInfo(providerId) {
        const providerConfig = this.config.providers[providerId];
        if (!providerConfig) return null;
        
        return {
            name: providerConfig.name,
            api_key_help: providerConfig.api_key_help,
            api_key_url: providerConfig.api_key_url
        };
    }

    // 获取所有工具
    getAllTools() {
        return Object.keys(this.config.tools).map(toolId => ({
            id: toolId,
            ...this.getToolInfo(toolId)
        }));
    }

    // 获取工具信息
    getToolInfo(toolId) {
        const toolConfig = this.config.tools[toolId];
        if (!toolConfig) return null;
        
        return {
            name: toolConfig.name,
            default_model: toolConfig.default_model,
            supported_models: toolConfig.supported_models,
            description: toolConfig.description
        };
    }

    // 获取工具支持的模型
    getSupportedModels(toolId) {
        const toolConfig = this.getToolInfo(toolId);
        return toolConfig ? toolConfig.supported_models : [];
    }

    // 获取工具的默认模型
    getDefaultModel(toolId) {
        const toolConfig = this.getToolInfo(toolId);
        return toolConfig ? toolConfig.default_model : null;
    }

    // 检查模型是否支持某个工具
    isModelSupported(toolId, modelId) {
        const supportedModels = this.getSupportedModels(toolId);
        return supportedModels.includes(modelId);
    }

    // 按提供商获取模型
    getModelsByProvider(providerId) {
        return this.getAllModels().filter(model => model.provider === providerId);
    }

    // 获取需要API密钥的提供商
    getProvidersRequiringApiKey() {
        return this.getAllProviders().filter(provider => {
            // 所有提供商都可能需要API密钥
            return true;
        });
    }

    // 获取本地部署的提供商
    getLocalProviders() {
        return this.getAllProviders().filter(provider => {
            return ['coze-local'].includes(provider.id);
        });
    }
}

// 导出模型配置管理器
window.ModelConfigManager = ModelConfigManager; 