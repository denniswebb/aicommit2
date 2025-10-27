import { RequestType } from '../utils/ai-log.js';
import { BUILTIN_SERVICES, BuiltinService, ModelName, RawConfig, ValidConfig } from '../utils/config.js';

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const hasConfiguredModels = (value: RawConfig): boolean => {
    const models = Array.isArray(value.model)
        ? (value.model as string[])
        : isNonEmptyString(value.model)
          ? [(value.model as string).trim()]
          : [];
    return models.length > 0;
};

const hasBedrockAccess = (value: RawConfig): boolean => {
    const runtimeMode = isNonEmptyString(value.runtimeMode)
        ? ((value.runtimeMode as string).toLowerCase() as 'foundation' | 'application')
        : 'foundation';

    const hasApiKey = isNonEmptyString(value.key as string);
    const hasRegion = isNonEmptyString(value.region as string);
    const hasProfile = isNonEmptyString(value.profile as string);
    const hasAccessKeys = isNonEmptyString(value.accessKeyId as string) && isNonEmptyString(value.secretAccessKey as string);

    const hasIam = runtimeMode !== 'application' && hasRegion && (hasProfile || hasAccessKeys);
    const hasApplicationEndpointConfig =
        runtimeMode === 'application' &&
        (isNonEmptyString(value.applicationBaseUrl as string) ||
            isNonEmptyString(value.applicationEndpointId as string) ||
            isNonEmptyString(value.applicationInferenceProfileArn as string));

    return hasApiKey || hasIam || hasApplicationEndpointConfig;
};

export const getAvailableAIs = (config: ValidConfig, requestType: RequestType): ModelName[] => {
    return Object.entries(config)
        .map(([key, value]) => [key, value] as [ModelName, RawConfig])
        .filter(([key, value]) => !value.disabled)
        .filter(([key, value]) => BUILTIN_SERVICES.includes(key as BuiltinService) || value.compatible === true)
        .filter(([key, value]) => {
            switch (requestType) {
                case 'commit':
                    if (key === 'OLLAMA') {
                        return !!value && hasConfiguredModels(value);
                    }
                    if (key === 'HUGGINGFACE') {
                        return !!value && !!value.cookie;
                    }
                    if (key === 'BEDROCK') {
                        return hasConfiguredModels(value) && hasBedrockAccess(value);
                    }
                    return !!value.key && value.key.length > 0;
                case 'review':
                    const codeReview = config.codeReview || value.codeReview;
                    if (key === 'OLLAMA') {
                        return !!value && hasConfiguredModels(value) && codeReview;
                    }
                    if (key === 'HUGGINGFACE') {
                        return !!value && !!value.cookie && codeReview;
                    }
                    if (key === 'BEDROCK') {
                        return hasConfiguredModels(value) && hasBedrockAccess(value) && codeReview;
                    }
                    return !!value.key && value.key.length > 0 && codeReview;
            }
        })
        .map(([key]) => key);
};

export { hasBedrockAccess, hasConfiguredModels };
