import { runWithModelFallback } from "../src/agents/model-fallback.js";
import { loadConfig } from "../src/config/config.js";

async function testGeminiIntegration() {
    console.log("🚀 Iniciando teste de integração Gemini...");

    const config = loadConfig();

    try {
        const result = await runWithModelFallback({
            cfg: config,
            provider: "google",
            model: "gemini-1.5-flash",
            run: async (provider, model) => {
                console.log(`📡 Tentando chamada com ${provider}/${model}...`);
                // Aqui simulamos uma chamada real ou usamos o provider real se configurado
                return `Sucesso com ${provider}/${model}`;
            },
            onError: (attempt) => {
                console.warn(`⚠️ Falha na tentativa ${attempt.attempt}/${attempt.total} com ${attempt.provider}/${attempt.model}`);
            }
        });

        console.log("✅ Resultado:", result.result);
        console.log("🔄 Tentativas realizadas:", result.attempts);
    } catch (error) {
        console.error("❌ Erro crítico no teste:", error);
    }
}

testGeminiIntegration();
