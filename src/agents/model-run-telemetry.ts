export type ModelFallbackAttemptTelemetry = {
  provider: string;
  model: string;
  error: string;
  reason?: string;
  status?: number;
  code?: string;
};

export type RunModelTelemetry = {
  configuredModel: string;
  effectiveProvider: string;
  effectiveModel: string;
  effectiveModelRef: string;
  didFallback: boolean;
  fallbackReason?: string;
  attemptedModels: string[];
  attempts: ModelFallbackAttemptTelemetry[];
};

export function buildRunModelTelemetry(params: {
  configuredProvider: string;
  configuredModel: string;
  effectiveProvider: string;
  effectiveModel: string;
  attempts: ModelFallbackAttemptTelemetry[];
}): RunModelTelemetry {
  const configuredModelRef = `${params.configuredProvider}/${params.configuredModel}`;
  const effectiveModelRef = `${params.effectiveProvider}/${params.effectiveModel}`;
  const attemptedModels = Array.from(
    new Set(
      [
        ...params.attempts.map((attempt) => `${attempt.provider}/${attempt.model}`),
        effectiveModelRef,
      ].filter(Boolean),
    ),
  );
  const fallbackReason = params.attempts.find((attempt) => attempt.reason)?.reason;
  const didFallback =
    params.attempts.length > 0 ||
    params.configuredProvider !== params.effectiveProvider ||
    params.configuredModel !== params.effectiveModel;

  return {
    configuredModel: configuredModelRef,
    effectiveProvider: params.effectiveProvider,
    effectiveModel: params.effectiveModel,
    effectiveModelRef,
    didFallback,
    fallbackReason,
    attemptedModels,
    attempts: params.attempts,
  };
}

export function extractRunModelTelemetry(result: unknown): RunModelTelemetry | undefined {
  const meta = (result as { meta?: { modelTelemetry?: unknown } } | null)?.meta;
  const telemetry = meta && typeof meta === "object" ? meta.modelTelemetry : undefined;
  if (!telemetry || typeof telemetry !== "object") {
    return undefined;
  }
  const value = telemetry as Partial<RunModelTelemetry>;
  if (
    typeof value.configuredModel !== "string" ||
    typeof value.effectiveProvider !== "string" ||
    typeof value.effectiveModel !== "string" ||
    typeof value.effectiveModelRef !== "string"
  ) {
    return undefined;
  }
  return {
    configuredModel: value.configuredModel,
    effectiveProvider: value.effectiveProvider,
    effectiveModel: value.effectiveModel,
    effectiveModelRef: value.effectiveModelRef,
    didFallback: value.didFallback === true,
    fallbackReason: typeof value.fallbackReason === "string" ? value.fallbackReason : undefined,
    attemptedModels: Array.isArray(value.attemptedModels)
      ? value.attemptedModels.filter((entry): entry is string => typeof entry === "string")
      : [value.effectiveModelRef],
    attempts: Array.isArray(value.attempts)
      ? value.attempts.filter(
          (entry): entry is ModelFallbackAttemptTelemetry =>
            !!entry &&
            typeof entry === "object" &&
            typeof (entry as { provider?: unknown }).provider === "string" &&
            typeof (entry as { model?: unknown }).model === "string" &&
            typeof (entry as { error?: unknown }).error === "string",
        )
      : [],
  };
}

export function resolveResultEffectiveModelRef(
  result: unknown,
  fallbackModelRef: string,
): string {
  return extractRunModelTelemetry(result)?.effectiveModelRef ?? fallbackModelRef;
}
