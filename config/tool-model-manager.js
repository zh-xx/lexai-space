/**
 * 工具模型管理器
 * 负责管理每个工具的模型选择和配置
 */
class ToolModelManager {
    constructor(modelConfigManager) {
        this.modelConfigManager = modelConfigManager;
        this.toolModels = {};
        this.workflowIds = {};
        this.init();
    }

    init() {
        this.loadToolModels();
        this.loadWorkflowIds();
    }

    // 加载工具模型配置
    loadToolModels() {
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            const savedModel = localStorage.getItem(`${tool.id}_model`);
            this.toolModels[tool.id] = savedModel || tool.default_model;
        });
    }

    // 加载工作流ID
    loadWorkflowIds() {
        this.workflowIds = {
            'review-workflow-id': localStorage.getItem('review_workflow_id') || '',
            'parse-workflow-id': localStorage.getItem('parse_workflow_id') || '',
            'review-local-workflow-id': localStorage.getItem('review_local_workflow_id') || '',
            'parse-local-workflow-id': localStorage.getItem('parse_local_workflow_id') || ''
        };
    }

    // 保存工具模型配置
    saveToolModels() {
        Object.keys(this.toolModels).forEach(toolId => {
            if (this.toolModels[toolId]) {
                localStorage.setItem(`${toolId}_model`, this.toolModels[toolId]);
            }
        });
    }

    // 保存工作流ID
    saveWorkflowIds() {
        Object.keys(this.workflowIds).forEach(key => {
            if (this.workflowIds[key]) {
                localStorage.setItem(key.replace('-', '_'), this.workflowIds[key]);
            }
        });
    }

    // 获取工具的当前模型
    getCurrentModel(toolId) {
        return this.toolModels[toolId] || this.modelConfigManager.getDefaultModel(toolId);
    }

    // 设置工具的模型
    setToolModel(toolId, modelId) {
        if (this.modelConfigManager.isModelSupported(toolId, modelId)) {
            this.toolModels[toolId] = modelId;
            this.saveToolModels();
            return true;
        }
        return false;
    }

    // 获取工具支持的模型列表
    getSupportedModels(toolId) {
        return this.modelConfigManager.getSupportedModels(toolId);
    }

    // 获取工具支持的模型选项（用于下拉菜单）
    getSupportedModelOptions(toolId) {
        const supportedModels = this.getSupportedModels(toolId);
        return supportedModels.map(modelId => {
            const modelInfo = this.modelConfigManager.getModelInfo(modelId);
            return {
                value: modelId,
                text: modelInfo ? modelInfo.name : modelId
            };
        });
    }

    // 获取工作流ID
    getWorkflowId(key) {
        return this.workflowIds[key] || '';
    }

    // 设置工作流ID
    setWorkflowId(key, value) {
        this.workflowIds[key] = value;
        this.saveWorkflowIds();
    }

    // 获取所有工具的状态
    getToolModelStatus() {
        const status = {};
        const tools = this.modelConfigManager.getAllTools();
        
        tools.forEach(tool => {
            const currentModel = this.getCurrentModel(tool.id);
            const modelInfo = this.modelConfigManager.getModelInfo(currentModel);
            
            status[tool.id] = {
                currentModel: currentModel,
                modelName: modelInfo ? modelInfo.name : currentModel,
                provider: modelInfo ? modelInfo.provider : null,
                configured: !!currentModel
            };
        });

        return status;
    }

    // 验证模型配置
    validateModelConfig(toolId, modelId) {
        if (!this.modelConfigManager.isModelSupported(toolId, modelId)) {
            return { valid: false, message: '该模型不支持此工具' };
        }

        const modelInfo = this.modelConfigManager.getModelInfo(modelId);
        if (!modelInfo) {
            return { valid: false, message: '模型配置不存在' };
        }

        return { valid: true, message: '配置有效' };
    }

    // 重置工具模型为默认值
    resetToolModel(toolId) {
        const defaultModel = this.modelConfigManager.getDefaultModel(toolId);
        if (defaultModel) {
            this.setToolModel(toolId, defaultModel);
            return true;
        }
        return false;
    }

    // 重置所有工具模型为默认值
    resetAllToolModels() {
        const tools = this.modelConfigManager.getAllTools();
        tools.forEach(tool => {
            this.resetToolModel(tool.id);
        });
    }

    // 导出工具模型配置
    exportConfig() {
        return {
            toolModels: { ...this.toolModels },
            workflowIds: { ...this.workflowIds }
        };
    }

    // 导入工具模型配置
    importConfig(config) {
        if (config.toolModels) {
            this.toolModels = { ...config.toolModels };
            this.saveToolModels();
        }
        if (config.workflowIds) {
            this.workflowIds = { ...config.workflowIds };
            this.saveWorkflowIds();
        }
    }

    // 获取工具配置摘要
    getToolConfigSummary() {
        const summary = {};
        const tools = this.modelConfigManager.getAllTools();
        
        tools.forEach(tool => {
            const currentModel = this.getCurrentModel(tool.id);
            const modelInfo = this.modelConfigManager.getModelInfo(currentModel);
            
            summary[tool.id] = {
                toolName: tool.name,
                currentModel: currentModel,
                modelName: modelInfo ? modelInfo.name : currentModel,
                provider: modelInfo ? modelInfo.provider : null
            };
        });

        return summary;
    }
}

// 导出工具模型管理器
window.ToolModelManager = ToolModelManager; 