/**
 * 配置服务模块
 *
 * 负责应用配置的加载、保存、迁移和规范化
 * 支持配置版本升级和模型列表的自动更新
 *
 * @module services/config
 */

import { AppConfig, CONFIG_KEYS, defaultConfig } from '../config';
import { localStore } from './store';

/**
 * 获取固定的提供商 API 格式
 * 某些提供商强制使用特定的 API 格式
 *
 * @param providerKey - 提供商标识
 * @returns 固定的 API 格式或 null
 */
const getFixedProviderApiFormat = (providerKey: string): 'anthropic' | 'openai' | null => {
  if (providerKey === 'openai' || providerKey === 'gemini' || providerKey === 'stepfun' || providerKey === 'youdaozhiyun') {
    return 'openai';
  }
  if (providerKey === 'anthropic') {
    return 'anthropic';
  }
  return null;
};

const normalizeProviderBaseUrl = (providerKey: string, baseUrl: unknown): string => {
  if (typeof baseUrl !== 'string') {
    return '';
  }

  const normalized = baseUrl.trim().replace(/\/+$/, '');
  if (providerKey !== 'gemini') {
    return normalized;
  }

  if (!normalized || !normalized.includes('generativelanguage.googleapis.com')) {
    return normalized;
  }

  if (normalized.endsWith('/v1beta/openai') || normalized.endsWith('/v1/openai')) {
    return normalized;
  }
  if (normalized.endsWith('/v1beta')) {
    return `${normalized}/openai`;
  }
  if (normalized.endsWith('/v1')) {
    return `${normalized.slice(0, -3)}v1beta/openai`;
  }

  return 'https://generativelanguage.googleapis.com/v1beta/openai';
};

/**
 * 规范化提供商 API 格式
 *
 * @param providerKey - 提供商标识
 * @param apiFormat - 原始 API 格式
 * @returns 规范化后的 API 格式
 */
const normalizeProviderApiFormat = (providerKey: string, apiFormat: unknown): 'anthropic' | 'openai' => {
  const fixed = getFixedProviderApiFormat(providerKey);
  if (fixed) {
    return fixed;
  }
  if (apiFormat === 'openai') {
    return 'openai';
  }
  return 'anthropic';
};

/**
 * 规范化所有提供商配置
 * 统一处理 baseUrl 和 apiFormat
 *
 * @param providers - 提供商配置对象
 * @returns 规范化后的配置
 */
const normalizeProvidersConfig = (providers: AppConfig['providers']): AppConfig['providers'] => {
  if (!providers) {
    return providers;
  }

  return Object.fromEntries(
    Object.entries(providers).map(([providerKey, providerConfig]) => [
      providerKey,
      {
        ...providerConfig,
        baseUrl: normalizeProviderBaseUrl(providerKey, providerConfig.baseUrl),
        apiFormat: normalizeProviderApiFormat(providerKey, providerConfig.apiFormat),
      },
    ])
  ) as AppConfig['providers'];
};

/**
 * 已从特定提供商移除的模型 ID
 * 在配置迁移时会被过滤掉
 */
const REMOVED_PROVIDER_MODELS: Record<string, string[]> = {
  deepseek: ['deepseek-chat'],
};

/**
 * 需要注入到现有保存配置中的模型
 * 每次启动时如果存储的配置中缺少这些模型，会自动添加
 * 注意：用户无法永久删除这些模型，它们会在下次启动时重新注入
 * 一旦所有用户都升级完成，应该移除这里的条目
 * position: 'start' 插入到开头，'end' 追加到末尾
 */
const ADDED_PROVIDER_MODELS: Record<string, { models: Array<{ id: string; name: string; supportsImage?: boolean }>; position: 'start' | 'end' }> = {
  minimax: {
    models: [
      { id: 'MiniMax-M2.7', name: 'MiniMax M2.7', supportsImage: false },
    ],
    position: 'start',
  },
};

/**
 * 配置服务类
 * 负责应用配置的加载、保存和迁移
 *
 * @class ConfigService
 *
 * @remarks
 * - 支持配置版本迁移
 * - 自动注入新增模型
 * - 过滤已移除的模型
 * - 规范化提供商配置
 */
class ConfigService {
  private config: AppConfig = defaultConfig;

  /**
   * 初始化配置服务
   * 从本地存储加载配置并进行迁移
   */
  async init() {
    try {
      const storedConfig = await localStore.getItem<AppConfig>(CONFIG_KEYS.APP_CONFIG);
      if (storedConfig) {
        // 合并默认配置和存储的配置，处理模型列表的增删
        const mergedProviders = storedConfig.providers
          ? Object.fromEntries(
              Object.entries({
                ...(defaultConfig.providers ?? {}),
                ...storedConfig.providers,
              }).map(([providerKey, providerConfig]) => [
                providerKey,
                (() => {
                  const mergedProvider = {
                    ...(defaultConfig.providers as Record<string, any>)?.[providerKey],
                    ...providerConfig,
                  };
                  // 过滤已移除的模型
                  const removedIds = REMOVED_PROVIDER_MODELS[providerKey];
                  if (removedIds && mergedProvider.models) {
                    mergedProvider.models = mergedProvider.models.filter(
                      (m: { id: string }) => !removedIds.includes(m.id)
                    );
                  }
                  // 注入新增的模型（针对已有保存配置的用户）
                  const addedConfig = ADDED_PROVIDER_MODELS[providerKey];
                  if (addedConfig && mergedProvider.models) {
                    const existingIds = new Set(mergedProvider.models.map((m: { id: string }) => m.id));
                    const newModels = addedConfig.models.filter(m => !existingIds.has(m.id));
                    if (newModels.length > 0) {
                      mergedProvider.models = addedConfig.position === 'start'
                        ? [...newModels, ...mergedProvider.models]
                        : [...mergedProvider.models, ...newModels];
                    }
                  }
                  return {
                    ...mergedProvider,
                    baseUrl: normalizeProviderBaseUrl(providerKey, mergedProvider.baseUrl),
                    apiFormat: normalizeProviderApiFormat(providerKey, mergedProvider.apiFormat),
                  };
                })(),
              ])
            )
          : defaultConfig.providers;

        // 迁移默认模型（如果被移除则恢复为默认值）
        const allRemovedIds = Object.values(REMOVED_PROVIDER_MODELS).flat();
        const migratedModel = { ...defaultConfig.model, ...storedConfig.model };
        if (allRemovedIds.includes(migratedModel.defaultModel)) {
          migratedModel.defaultModel = defaultConfig.model.defaultModel;
        }
        if (migratedModel.availableModels) {
          migratedModel.availableModels = migratedModel.availableModels.filter(
            (m: { id: string }) => !allRemovedIds.includes(m.id)
          );
        }

        this.config = {
          ...defaultConfig,
          ...storedConfig,
          api: {
            ...defaultConfig.api,
            ...storedConfig.api,
          },
          model: migratedModel,
          app: {
            ...defaultConfig.app,
            ...storedConfig.app,
          },
          shortcuts: {
            ...defaultConfig.shortcuts!,
            ...(storedConfig.shortcuts ?? {}),
          } as AppConfig['shortcuts'],
          providers: mergedProviders as AppConfig['providers'],
        };
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  getConfig(): AppConfig {
    return this.config;
  }

  async updateConfig(newConfig: Partial<AppConfig>) {
    const normalizedProviders = normalizeProvidersConfig(newConfig.providers as AppConfig['providers'] | undefined);
    this.config = {
      ...this.config,
      ...newConfig,
      ...(normalizedProviders ? { providers: normalizedProviders } : {}),
    };
    await localStore.setItem(CONFIG_KEYS.APP_CONFIG, this.config);
  }

  getApiConfig() {
    return {
      apiKey: this.config.api.key,
      baseUrl: this.config.api.baseUrl,
    };
  }
}

export const configService = new ConfigService(); 
