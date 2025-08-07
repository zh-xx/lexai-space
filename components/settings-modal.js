/**
 * 设置界面组件
 * 负责渲染和管理设置模态框
 */
class SettingsModal {
    constructor(modelConfigManager, apiKeyManager, toolModelManager) {
        this.modelConfigManager = modelConfigManager;
        this.apiKeyManager = apiKeyManager;
        this.toolModelManager = toolModelManager;
        this.modal = null;
        this.init();
    }

    init() {
        this.createModal();
        this.bindEvents();
        this.render();
    }

    // 创建设置模态框
    createModal() {
        const modalHtml = `
            <div class="settings-modal" id="settings-modal">
                <div class="settings-content">
                    <div class="settings-header">
                        <h2 class="settings-title">模型设置</h2>
                        <button class="close-settings" id="close-settings">&times;</button>
                    </div>
                    
                    <!-- API 密钥配置 -->
                    <div class="settings-section">
                        <h3 class="section-title">
                            <i class="fa-solid fa-key"></i>
                            API 密钥配置
                        </h3>
                        <div id="api-keys-container">
                            <!-- API密钥配置将在这里动态生成 -->
                        </div>
                    </div>

                    <!-- 工具模型配置 -->
                    <div class="settings-section">
                        <h3 class="section-title">
                            <i class="fa-solid fa-tools"></i>
                            工具模型配置
                        </h3>
                        <div id="tool-models-container">
                            <!-- 工具模型配置将在这里动态生成 -->
                        </div>
                    </div>

                    <div class="settings-actions">
                        <button class="btn btn-secondary" id="test-all-apis">测试所有 API</button>
                        <button class="btn btn-primary" id="save-settings">保存设置</button>
                    </div>
                </div>
            </div>
        `;

        // 将模态框添加到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        this.modal = document.getElementById('settings-modal');
    }

    // 绑定事件
    bindEvents() {
        // 关闭按钮事件
        const closeBtn = document.getElementById('close-settings');
        closeBtn.addEventListener('click', () => this.close());

        // 点击模态框外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });

        // 保存设置按钮
        const saveBtn = document.getElementById('save-settings');
        saveBtn.addEventListener('click', () => this.saveSettings());

        // 测试API按钮
        const testBtn = document.getElementById('test-all-apis');
        testBtn.addEventListener('click', () => this.testAllApis());
    }

    // 渲染设置界面
    render() {
        this.renderApiKeys();
        this.renderToolModels();
        this.updateStatus();
    }

    // 渲染API密钥配置
    renderApiKeys() {
        const container = document.getElementById('api-keys-container');
        const providers = this.modelConfigManager.getAllProviders();
        
        let html = '';
        
        providers.forEach(provider => {
            const providerInfo = this.modelConfigManager.getProviderInfo(provider.id);
            const isConfigured = this.apiKeyManager.isApiKeyConfigured(provider.id);
            
            if (provider.id === 'coze-local') {
                // 本地部署提供商
                html += this.renderLocalProviderConfig(provider, providerInfo, isConfigured);
            } else {
                // 需要API密钥的提供商
                html += this.renderApiKeyProviderConfig(provider, providerInfo, isConfigured);
            }
        });
        
        container.innerHTML = html;
    }

    // 渲染API密钥提供商配置
    renderApiKeyProviderConfig(provider, providerInfo, isConfigured) {
        return `
            <div class="provider-config">
                <div class="provider-header">
                    <div class="provider-info">
                        <h4>${providerInfo.name}</h4>
                        <p>${this.getProviderDescription(provider.id)}</p>
                    </div>
                    <div class="api-status">
                        <div class="status-indicator ${isConfigured ? 'connected' : ''}" id="${provider.id}-status"></div>
                        <span id="${provider.id}-status-text">${isConfigured ? '已配置' : '未配置'}</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">API 密钥</label>
                    <input type="password" class="form-input" id="${provider.id}-api-key" 
                           placeholder="请输入您的 ${providerInfo.name} API 密钥">
                    <div class="help-text">
                        <a href="${providerInfo.api_key_url}" target="_blank">获取 API 密钥</a>
                    </div>
                </div>
                ${this.renderWorkflowConfig(provider.id)}
            </div>
        `;
    }

    // 渲染本地部署提供商配置
    renderLocalProviderConfig(provider, providerInfo, isConfigured) {
        return `
            <div class="provider-config">
                <div class="provider-header">
                    <div class="provider-info">
                        <h4>${providerInfo.name}</h4>
                        <p>${providerInfo.api_key_help}</p>
                    </div>
                    <div class="api-status">
                        <div class="status-indicator ${isConfigured ? 'connected' : ''}" id="${provider.id}-status"></div>
                        <span id="${provider.id}-status-text">${isConfigured ? '已配置' : '未配置'}</span>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">服务地址</label>
                    <input type="text" class="form-input" id="${provider.id}-url" 
                           placeholder="http://localhost:8080" value="http://localhost:8080">
                    <div class="help-text">
                        <a href="${providerInfo.api_key_url}" target="_blank">本地部署指南</a>
                    </div>
                </div>
                ${this.renderWorkflowConfig(provider.id)}
            </div>
        `;
    }

    // 渲染工作流配置
    renderWorkflowConfig(providerId) {
        if (providerId === 'coze' || providerId === 'coze-local') {
            const prefix = providerId === 'coze-local' ? 'local-' : '';
            return `
                <div class="form-group">
                    <label class="form-label">合同审核工作流 ID</label>
                    <input type="text" class="form-input" id="review-${prefix}workflow-id" 
                           placeholder="请输入${providerId === 'coze-local' ? '本地' : ''}合同审核工作流的 ID">
                </div>
                <div class="form-group">
                    <label class="form-label">合同解析工作流 ID</label>
                    <input type="text" class="form-input" id="parse-${prefix}workflow-id" 
                           placeholder="请输入${providerId === 'coze-local' ? '本地' : ''}合同解析工作流的 ID">
                </div>
            `;
        }
        return '';
    }

    // 渲染工具模型配置
    renderToolModels() {
        const container = document.getElementById('tool-models-container');
        const tools = this.modelConfigManager.getAllTools();
        
        let html = '';
        
        tools.forEach(tool => {
            const currentModel = this.toolModelManager.getCurrentModel(tool.id);
            const modelOptions = this.toolModelManager.getSupportedModelOptions(tool.id);
            
            html += `
                <div class="tool-config">
                    <div class="tool-header">
                        <div class="tool-info">
                            <h4>${tool.name}</h4>
                            <p>${tool.description}</p>
                        </div>
                        <div class="model-status">
                            <span id="${tool.id}-model-status">${this.getModelDisplayName(currentModel)}</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">默认模型</label>
                        <select class="form-select" id="${tool.id}-model">
                            ${modelOptions.map(option => 
                                `<option value="${option.value}" ${option.value === currentModel ? 'selected' : ''}>
                                    ${option.text}
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }

    // 获取提供商描述
    getProviderDescription(providerId) {
        const descriptions = {
            'google': '支持 Gemini 1.5/2.0/2.5 Pro 模型',
            'coze': '支持自定义工作流',
            'coze-local': '本地部署的工作流，数据本地处理',
            'deepseek': '支持 DeepSeek Chat 和 Coder 模型'
        };
        return descriptions[providerId] || '';
    }

    // 获取模型显示名称
    getModelDisplayName(modelId) {
        const modelInfo = this.modelConfigManager.getModelInfo(modelId);
        return modelInfo ? modelInfo.name : modelId;
    }

    // 更新状态显示
    updateStatus() {
        // 更新API密钥状态
        const providers = this.modelConfigManager.getAllProviders();
        providers.forEach(provider => {
            const statusEl = document.getElementById(`${provider.id}-status`);
            const statusTextEl = document.getElementById(`${provider.id}-status-text`);
            
            if (statusEl && statusTextEl) {
                const isConfigured = this.apiKeyManager.isApiKeyConfigured(provider.id);
                statusEl.className = `status-indicator ${isConfigured ? 'connected' : ''}`;
                statusTextEl.textContent = isConfigured ? '已配置' : '未配置';
            }
        });

        // 更新工具模型状态
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            const currentModel = this.toolModelManager.getCurrentModel(tool.id);
            const statusEl = document.getElementById(`${tool.id}-model-status`);
            
            if (statusEl) {
                statusEl.textContent = this.getModelDisplayName(currentModel);
            }
        });
    }

    // 加载设置
    loadSettings() {
        // 加载API密钥
        const providers = this.modelConfigManager.getAllProviders();
        providers.forEach(provider => {
            if (provider.id === 'coze-local') {
                const urlInput = document.getElementById(`${provider.id}-url`);
                if (urlInput) {
                    const config = this.apiKeyManager.getLocalConfig(provider.id);
                    urlInput.value = config?.url || 'http://localhost:8080';
                }
            } else {
                const apiKeyInput = document.getElementById(`${provider.id}-api-key`);
                if (apiKeyInput) {
                    apiKeyInput.value = this.apiKeyManager.getApiKey(provider.id) || '';
                }
            }
        });

        // 加载工作流ID
        const workflowKeys = ['review-workflow-id', 'parse-workflow-id', 'review-local-workflow-id', 'parse-local-workflow-id'];
        workflowKeys.forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = this.toolModelManager.getWorkflowId(key) || '';
            }
        });

        // 加载工具模型配置
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            const select = document.getElementById(`${tool.id}-model`);
            if (select) {
                select.value = this.toolModelManager.getCurrentModel(tool.id);
            }
        });

        this.updateStatus();
    }

    // 保存设置
    saveSettings() {
        // 保存API密钥
        const providers = this.modelConfigManager.getAllProviders();
        providers.forEach(provider => {
            if (provider.id === 'coze-local') {
                const urlInput = document.getElementById(`${provider.id}-url`);
                if (urlInput && urlInput.value.trim()) {
                    this.apiKeyManager.setLocalConfig(provider.id, { url: urlInput.value.trim() });
                }
            } else {
                const apiKeyInput = document.getElementById(`${provider.id}-api-key`);
                if (apiKeyInput && apiKeyInput.value.trim()) {
                    this.apiKeyManager.setApiKey(provider.id, apiKeyInput.value.trim());
                }
            }
        });

        // 保存工作流ID
        const workflowKeys = ['review-workflow-id', 'parse-workflow-id', 'review-local-workflow-id', 'parse-local-workflow-id'];
        workflowKeys.forEach(key => {
            const input = document.getElementById(key);
            if (input && input.value.trim()) {
                this.toolModelManager.setWorkflowId(key, input.value.trim());
            }
        });

        // 保存工具模型配置
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            const select = document.getElementById(`${tool.id}-model`);
            if (select) {
                this.toolModelManager.setToolModel(tool.id, select.value);
            }
        });

        // 设置统一设置标志
        localStorage.setItem('use_unified_settings', 'true');

        alert('设置已保存！');
        this.updateStatus();
    }

    // 测试所有API
    async testAllApis() {
        const testBtn = document.getElementById('test-all-apis');
        const originalText = testBtn.textContent;
        testBtn.textContent = '测试中...';
        testBtn.disabled = true;

        try {
            const results = [];
            const providers = this.modelConfigManager.getAllProviders();

            for (const provider of providers) {
                if (provider.id === 'coze-local') {
                    const config = this.apiKeyManager.getLocalConfig(provider.id);
                    if (config?.url) {
                        try {
                            const success = await this.testCozeLocalConnection(config.url);
                            results.push(`${provider.id}: ${success ? '成功' : '失败'}`);
                        } catch (error) {
                            results.push(`${provider.id}: 失败 - ${error.message}`);
                        }
                    } else {
                        results.push(`${provider.id}: 未配置`);
                    }
                } else {
                    const apiKey = this.apiKeyManager.getApiKey(provider.id);
                    if (apiKey) {
                        try {
                            const success = await this.testProvider(provider.id);
                            results.push(`${provider.id}: ${success ? '成功' : '失败'}`);
                        } catch (error) {
                            results.push(`${provider.id}: 失败 - ${error.message}`);
                        }
                    } else {
                        results.push(`${provider.id}: 未配置`);
                    }
                }
            }

            alert(`API测试结果:\n${results.join('\n')}`);
        } catch (error) {
            alert(`API测试失败: ${error.message}`);
        } finally {
            testBtn.textContent = originalText;
            testBtn.disabled = false;
        }
    }

    // 测试提供商连接
    async testProvider(providerId) {
        // 这里可以调用ModelManager的testProvider方法
        // 暂时返回true作为示例
        return true;
    }

    // 测试Coze本地连接
    async testCozeLocalConnection(url) {
        try {
            const response = await fetch(`${url}/api/v1/health`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return true;
        } catch (error) {
            console.error('Coze本地连接测试失败:', error);
            return false;
        }
    }

    // 打开设置模态框
    open() {
        this.loadSettings();
        this.modal.style.display = 'flex';
    }

    // 关闭设置模态框
    close() {
        this.modal.style.display = 'none';
    }
}

// 导出设置界面组件
window.SettingsModal = SettingsModal; 