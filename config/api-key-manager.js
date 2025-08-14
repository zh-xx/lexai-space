/**
 * API密钥管理器
 * 负责管理所有API密钥的存储、验证和状态检查
 */
class ApiKeyManager {
    constructor() {
        this.apiKeys = {};
        this.localConfigs = {};
        this.init();
    }

    init() {
        this.loadApiKeys();
        this.loadLocalConfigs();
    }

    // 加载API密钥
    loadApiKeys() {
        this.apiKeys = {
            google: localStorage.getItem('google_api_key') || '',
            coze: localStorage.getItem('coze_api_key') || '',
            'coze-local': localStorage.getItem('coze_local_api_key') || '',
            deepseek: localStorage.getItem('deepseek_api_key') || '',
            kimi: localStorage.getItem('kimi_api_key') || '', // 新增Kimi API密钥
            qwen: localStorage.getItem('qwen_api_key') || '', // 新增Qwen API密钥
            openrouter: localStorage.getItem('openrouter_api_key') || '', // 新增OpenRouter API密钥
            qianfan: localStorage.getItem('qianfan_api_key') || '' // 新增Qianfan API密钥
        };
    }

    // 加载本地配置
    loadLocalConfigs() {
        this.localConfigs = {
            'coze-local': {
                url: localStorage.getItem('coze_local_base_url') || 'http://localhost:8080'
            },
            'ollama': {
                url: localStorage.getItem('ollama_url') || 'http://localhost:11434'
            }
        };
    }

    // 保存API密钥
    saveApiKeys() {
        Object.keys(this.apiKeys).forEach(provider => {
            if (this.apiKeys[provider]) {
                localStorage.setItem(`${provider}_api_key`, this.apiKeys[provider]);
            }
        });
    }

    // 保存本地配置
    saveLocalConfigs() {
        Object.keys(this.localConfigs).forEach(provider => {
            const config = this.localConfigs[provider];
            if (config.url) {
                localStorage.setItem(`${provider.replace('-', '_')}_base_url`, config.url);
            }
        });
    }

    // 设置API密钥
    setApiKey(provider, apiKey) {
        this.apiKeys[provider] = apiKey;
        this.saveApiKeys();
    }

    // 获取API密钥
    getApiKey(provider) {
        return this.apiKeys[provider];
    }

    // 设置本地配置
    setLocalConfig(provider, config) {
        this.localConfigs[provider] = { ...this.localConfigs[provider], ...config };
        this.saveLocalConfigs();
    }

    // 获取本地配置
    getLocalConfig(provider) {
        return this.localConfigs[provider];
    }

    // 检查API密钥是否已配置
    isApiKeyConfigured(provider) {
        if (provider === 'coze-local' || provider === 'ollama') {
            // 本地服务需要URL配置，API密钥是可选的或不需要
            return !!this.getLocalConfig(provider)?.url;
        }
        return !!this.getApiKey(provider);
    }

    // 获取所有需要API密钥的提供商状态
    getApiKeyStatus() {
        const status = {};
        
        // 检查提供商配置（包含本地提供商）
        ['google', 'coze', 'deepseek', 'coze-local', 'kimi', 'qwen', 'openrouter', 'ollama', 'qianfan'].forEach(provider => {
            status[provider] = {
                configured: this.isApiKeyConfigured(provider),
                hasKey: !!this.getApiKey(provider),
                hasUrl: (provider === 'coze-local' || provider === 'ollama') ? !!this.getLocalConfig(provider)?.url : null
            };
        });

        return status;
    }

    // 验证API密钥格式
    validateApiKey(provider, apiKey) {
        if (!apiKey) return { valid: false, message: 'API密钥不能为空' };

        switch (provider) {
            case 'google':
                return this.validateGoogleApiKey(apiKey);
            case 'coze':
                return this.validateCozeApiKey(apiKey);
            case 'deepseek':
                return this.validateDeepSeekApiKey(apiKey);
            case 'kimi':
                return this.validateKimiApiKey(apiKey);
            case 'qwen':
                return this.validateQwenApiKey(apiKey);
            case 'openrouter':
                return this.validateOpenRouterApiKey(apiKey);
            case 'qianfan':
                return this.validateQianfanApiKey(apiKey);
            default:
                return { valid: true, message: '格式正确' };
        }
    }

    // 验证Google API密钥
    validateGoogleApiKey(apiKey) {
        if (apiKey.length < 20) {
            return { valid: false, message: 'Google API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 验证Coze API密钥
    validateCozeApiKey(apiKey) {
        if (apiKey.length < 10) {
            return { valid: false, message: 'Coze API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 验证DeepSeek API密钥
    validateDeepSeekApiKey(apiKey) {
        if (apiKey.length < 10) {
            return { valid: false, message: 'DeepSeek API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 验证Kimi API密钥
    validateKimiApiKey(apiKey) {
        if (apiKey.length < 10) {
            return { valid: false, message: 'Kimi API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 验证Qwen API密钥
    validateQwenApiKey(apiKey) {
        if (apiKey.length < 10) {
            return { valid: false, message: 'Qwen API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 验证OpenRouter API密钥
    validateOpenRouterApiKey(apiKey) {
        if (apiKey.length < 10) {
            return { valid: false, message: 'OpenRouter API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 验证Qianfan API密钥
    validateQianfanApiKey(apiKey) {
        if (!apiKey || apiKey.length < 10) {
            return { valid: false, message: 'Qianfan API密钥格式不正确' };
        }
        return { valid: true, message: '格式正确' };
    }

    // 清除所有API密钥
    clearAllApiKeys() {
        this.apiKeys = {};
        this.saveApiKeys();
    }

    // 导出API密钥配置
    exportConfig() {
        return {
            apiKeys: { ...this.apiKeys },
            localConfigs: { ...this.localConfigs }
        };
    }

    // 导入API密钥配置
    importConfig(config) {
        if (config.apiKeys) {
            this.apiKeys = { ...config.apiKeys };
            this.saveApiKeys();
        }
        if (config.localConfigs) {
            this.localConfigs = { ...config.localConfigs };
            this.saveLocalConfigs();
        }
    }
}

// 导出API密钥管理器
window.ApiKeyManager = ApiKeyManager; 