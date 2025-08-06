/**
 * 模型管理器
 * 负责管理多个AI模型的配置和API调用
 */
class ModelManager {
    constructor() {
        this.config = null;
        this.apiKeys = {};
        this.toolModels = {};
        this.init();
    }

    async init() {
        try {
            // 加载模型配置
            const response = await fetch('config/models.json');
            this.config = await response.json();
            
            // 加载本地存储的API密钥
            this.loadApiKeys();
            
            // 加载工具模型配置
            this.loadToolModels();
            
            console.log('模型管理器初始化完成');
        } catch (error) {
            console.error('模型管理器初始化失败:', error);
        }
    }

    loadApiKeys() {
        // 从localStorage加载API密钥
        this.apiKeys = {
            google: localStorage.getItem('google_api_key') || '',
            openai: localStorage.getItem('openai_api_key') || '',
            anthropic: localStorage.getItem('anthropic_api_key') || '',
            coze: localStorage.getItem('coze_api_key') || '',
            'coze-local': '', // Coze 本地部署不需要 API 密钥
            deepseek: localStorage.getItem('deepseek_api_key') || '',
            qwen: localStorage.getItem('qwen_api_key') || '',
            kimi: localStorage.getItem('kimi_api_key') || '',
            chatglm: localStorage.getItem('chatglm_api_key') || '',
            ollama: '' // Ollama 不需要 API 密钥
        };
    }

    loadToolModels() {
        // 从localStorage加载工具模型配置
        this.toolModels = {
            'ai-chat': localStorage.getItem('ai-chat_model') || this.config.tools['ai-chat'].default_model,
            'document-gen': localStorage.getItem('document-gen_model') || this.config.tools['document-gen'].default_model,
            'contract-review': localStorage.getItem('contract-review_model') || this.config.tools['contract-review'].default_model,
            'contract-parse': localStorage.getItem('contract-parse_model') || this.config.tools['contract-parse'].default_model
        };
    }

    saveApiKeys() {
        // 保存API密钥到localStorage
        Object.keys(this.apiKeys).forEach(provider => {
            if (this.apiKeys[provider]) {
                localStorage.setItem(`${provider}_api_key`, this.apiKeys[provider]);
            }
        });
    }

    saveToolModels() {
        // 保存工具模型配置到localStorage
        Object.keys(this.toolModels).forEach(tool => {
            if (this.toolModels[tool]) {
                localStorage.setItem(`${tool}_model`, this.toolModels[tool]);
            }
        });
    }

    getModelConfig(modelId) {
        return this.config.models[modelId];
    }

    getToolConfig(toolId) {
        return this.config.tools[toolId];
    }

    getProviderConfig(providerId) {
        return this.config.providers[providerId];
    }

    getSupportedModels(toolId) {
        const toolConfig = this.getToolConfig(toolId);
        return toolConfig ? toolConfig.supported_models : [];
    }

    getCurrentModel(toolId) {
        return this.toolModels[toolId] || this.getToolConfig(toolId)?.default_model;
    }

    setToolModel(toolId, modelId) {
        if (this.isModelSupported(toolId, modelId)) {
            this.toolModels[toolId] = modelId;
            this.saveToolModels();
            return true;
        }
        return false;
    }

    isModelSupported(toolId, modelId) {
        const supportedModels = this.getSupportedModels(toolId);
        return supportedModels.includes(modelId);
    }

    setApiKey(provider, apiKey) {
        this.apiKeys[provider] = apiKey;
        this.saveApiKeys();
    }

    getApiKey(provider) {
        return this.apiKeys[provider];
    }

    async callModel(modelId, messages, options = {}) {
        const modelConfig = this.getModelConfig(modelId);
        if (!modelConfig) {
            throw new Error(`模型 ${modelId} 不存在`);
        }

        const provider = modelConfig.provider;
        const apiKey = this.getApiKey(provider);
        if (!apiKey) {
            throw new Error(`${provider} API密钥未配置`);
        }

        switch (provider) {
            case 'google':
                return await this.callGoogleAPI(modelId, messages, options);
            case 'openai':
                return await this.callOpenAIAPI(modelId, messages, options);
            case 'anthropic':
                return await this.callAnthropicAPI(modelId, messages, options);
            case 'coze':
                return await this.callCozeAPI(modelId, messages, options);
            case 'deepseek':
                return await this.callDeepSeekAPI(modelId, messages, options);
            case 'qwen':
                return await this.callQwenAPI(modelId, messages, options);
            case 'kimi':
                return await this.callKimiAPI(modelId, messages, options);
            case 'chatglm':
                return await this.callChatGLMAPI(modelId, messages, options);
            case 'ollama':
                return await this.callOllamaAPI(modelId, messages, options);
            case 'coze-local':
                return await this.callCozeLocalAPI(modelId, messages, options);
            default:
                throw new Error(`不支持的提供商: ${provider}`);
        }
    }

    async callGoogleAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('google');
        
        const url = `${modelConfig.api_base}/models/${modelId}:generateContent?key=${apiKey}`;
        
        // 转换消息格式为Gemini格式
        const contents = messages.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Google API调用失败');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async callOpenAIAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('openai');
        
        const url = `${modelConfig.api_base}/chat/completions`;
        
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
                stream: options.stream || false
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'OpenAI API调用失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callAnthropicAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('anthropic');
        
        const url = `${modelConfig.api_base}/messages`;
        
        // 转换消息格式为Claude格式
        const systemMessage = messages.find(msg => msg.role === 'system');
        const userMessages = messages.filter(msg => msg.role !== 'system');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: modelId,
                max_tokens: options.max_tokens || 4096,
                messages: userMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                system: systemMessage?.content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Anthropic API调用失败');
        }

        const data = await response.json();
        return data.content[0].text;
    }

    async callCozeAPI(modelId, messages, options) {
        const apiKey = this.getApiKey('coze');
        const workflowId = options.workflowId;
        
        if (!workflowId) {
            throw new Error('Coze工作流需要指定workflowId');
        }

        const url = 'https://api.coze.cn/v1/workflow/stream_run';
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                workflow_id: workflowId,
                parameters: options.parameters || {}
            })
        });

        if (!response.ok) {
            throw new Error(`Coze API调用失败: ${response.status}`);
        }

        // 处理流式响应
        return await this.handleStreamResponse(response);
    }

    async handleStreamResponse(response) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let result = '';
        
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') {
                        return result;
                    }
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) {
                            result += parsed.content;
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
        }
        
        return result;
    }

    async callDeepSeekAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('deepseek');
        
        const url = `${modelConfig.api_base}/chat/completions`;
        
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
            throw new Error(errorData.error?.message || 'DeepSeek API调用失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callQwenAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('qwen');
        
        const url = `${modelConfig.api_base}/services/aigc/text-generation/generation`;
        
        // 转换消息格式为Qwen格式
        const input = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelId,
                input: {
                    messages: input
                },
                parameters: {
                    max_tokens: options.max_tokens || 4096,
                    temperature: options.temperature || 0.7
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Qwen API调用失败');
        }

        const data = await response.json();
        return data.output.text;
    }

    async callKimiAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('kimi');
        
        const url = `${modelConfig.api_base}/chat/completions`;
        
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
            throw new Error(errorData.error?.message || 'Kimi API调用失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callChatGLMAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const apiKey = this.getApiKey('chatglm');
        
        const url = `${modelConfig.api_base}/chat/completions`;
        
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
            throw new Error(errorData.error?.message || 'ChatGLM API调用失败');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callOllamaAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        
        const url = `${modelConfig.api_base}/api/chat`;
        
        // 转换消息格式为 Ollama 格式
        const ollamaMessages = messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelId,
                messages: ollamaMessages,
                stream: options.stream || false,
                options: {
                    temperature: options.temperature || 0.7,
                    top_p: options.top_p || 0.9,
                    num_predict: options.max_tokens || 4096
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ollama API调用失败');
        }

        const data = await response.json();
        return data.message.content;
    }

    async callCozeLocalAPI(modelId, messages, options) {
        const modelConfig = this.getModelConfig(modelId);
        const cozeLocalUrl = localStorage.getItem('coze_local_url') || 'http://localhost:8080';
        
        const url = `${cozeLocalUrl}/api/v1/workflow/stream_run`;
        
        // 构建请求参数
        const workflowId = options.workflowId;
        if (!workflowId) {
            throw new Error('Coze 本地工作流需要指定 workflowId');
        }

        // 构建消息内容
        const content = messages.map(msg => msg.content).join('\n');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                workflow_id: workflowId,
                parameters: {
                    ...options.parameters,
                    message: content
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Coze 本地 API 调用失败: ${response.status}`);
        }

        // 处理流式响应
        return await this.handleStreamResponse(response);
    }

    async testModel(modelId) {
        try {
            const testMessages = [
                { role: 'user', content: 'Hello, this is a test message.' }
            ];
            
            await this.callModel(modelId, testMessages);
            return true;
        } catch (error) {
            console.error(`模型 ${modelId} 测试失败:`, error);
            return false;
        }
    }

    async testProvider(provider) {
        const models = Object.keys(this.config.models).filter(
            modelId => this.config.models[modelId].provider === provider
        );
        
        for (const modelId of models) {
            if (await this.testModel(modelId)) {
                return true;
            }
        }
        
        return false;
    }

    getModelInfo(modelId) {
        const modelConfig = this.getModelConfig(modelId);
        if (!modelConfig) return null;
        
        return {
            id: modelId,
            name: modelConfig.name,
            provider: modelConfig.provider,
            description: modelConfig.description,
            capabilities: modelConfig.capabilities,
            max_tokens: modelConfig.max_tokens
        };
    }

    getAllModels() {
        return Object.keys(this.config.models).map(modelId => ({
            id: modelId,
            ...this.getModelInfo(modelId)
        }));
    }

    getModelsByProvider(provider) {
        return this.getAllModels().filter(model => model.provider === provider);
    }
}

// 导出模型管理器
window.ModelManager = ModelManager; 