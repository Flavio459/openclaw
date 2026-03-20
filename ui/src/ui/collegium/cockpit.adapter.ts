import type { PresenceEntry } from "../types.ts";
import type { RuntimeSignals } from "./runtime-signals.ts";
import type { CockpitContract } from "./cockpit.contract.ts";

export type CockpitRuntimeInput = {
  runtimeSignals: RuntimeSignals;
  presenceEntries: PresenceEntry[];
  sessionsCount: number | null;
};

const baselineStaticFields = {
  networkPosition:
    "A posição de rede permanece apenas contratual nesta fase; nenhuma árvore viva de indicação, linhagem ou grafo de alavancagem do piloto é exposto ainda.",
  upState:
    "UP permanece visível apenas como linguagem de estado do protocolo. Nenhum payout, remuneração ou execução de incentivo ao vivo está vinculado aqui.",
  rankState:
    "A patente permanece como leitura de progressão em etapas. Nenhum motor vivo de qualificação ou desbloqueio econômico está vinculado na superfície atual.",
};

export function buildCockpitRuntimeContract(input: CockpitRuntimeInput): CockpitContract {
  const { runtimeSignals, presenceEntries, sessionsCount } = input;
  const presenceCount = presenceEntries.length;
  const authorityCount = runtimeSignals.authorityPressure.counts?.approvals ?? 0;

  const baseSources = [
    ...runtimeSignals.runtimeContinuity.sourceIds,
    ...runtimeSignals.sessionContinuity.sourceIds,
    ...runtimeSignals.authorityPressure.sourceIds,
  ].filter((value, index, array) => value && array.indexOf(value) === index);

  if (runtimeSignals.runtimeContinuity.status === "blocked") {
    return {
      identityAndActivation:
        "O trilho de ativação do piloto está visível, mas a ativação interna está bloqueada porque o runtime está estruturalmente interrompido.",
      cityReadiness:
        "A prontidão da cidade não pode avançar enquanto o trilho de continuidade do runtime estiver bloqueado; a superfície deve ser lida como indisponível, não como demanda latente.",
      turnState:
        "O estado de turno não está aberto. A leitura atual apenas confirma um bloqueio estrutural do runtime e não pode sugerir cadência, demanda ou payout.",
      alerts: [
        "O bloqueio do runtime impede que a ativação voltada ao piloto seja tratada como pronta.",
        "A superfície deve permanecer procedural até que a continuidade do runtime seja restaurada.",
      ],
      complianceNotices: [
        "Nenhum desbloqueio econômico ou operacional é válido enquanto o trilho do runtime estiver bloqueado.",
        "Escalone a interrupção estrutural não resolvida antes de qualquer passo de liberação voltado ao piloto.",
      ],
      bindingState: "placeholder",
      bindingSources: baseSources.length > 0 ? baseSources : ["runtime:error"],
      ...baselineStaticFields,
    };
  }

  if (
    runtimeSignals.runtimeContinuity.status === "waiting" ||
    runtimeSignals.runtimeContinuity.status === "degraded" ||
    runtimeSignals.sessionContinuity.status === "waiting" ||
    runtimeSignals.sessionContinuity.status === "degraded"
  ) {
    return {
      identityAndActivation:
        "O trilho de ativação do piloto está preparado para revisão interna, mas a superfície ainda não tem continuidade de runtime suficiente para tratar a ativação como plenamente pronta.",
      cityReadiness:
        "A prontidão da cidade continua pendente de continuidade operacional explícita. O estado atual é de espera, não de demanda adormecida nem de readiness de lançamento.",
      turnState:
        "O estado de turno permanece em espera. A superfície pode reconhecer intenção viva de runtime, mas ainda não uma janela operacional sustentada para o piloto.",
      alerts: [
        `Apenas ${presenceCount} instância(s) de presença viva estão visíveis, com a continuidade de sessões ainda abaixo da confiança de liberação.`,
        "A superfície permanece honesta sobre a continuidade ausente em vez de sugerir um turno de mercado ao vivo.",
      ],
      complianceNotices: [
        "A prontidão operacional deve permanecer explícita e baseada em evidência antes de a linguagem de ativação ficar mais forte.",
        "The Cockpit não pode sugerir resultado econômico enquanto o runtime ou a continuidade de sessões ainda estiverem incompletos.",
      ],
      bindingState: "placeholder",
      bindingSources: baseSources.length > 0 ? baseSources : ["runtime:waiting"],
      ...baselineStaticFields,
    };
  }

  const sessionLine =
    sessionsCount == null
      ? "A continuidade de sessões está visível, mas a contagem exata de sessões ainda não está vinculada."
      : `${sessionsCount} sessão(ões) ativa(s) sustentam a leitura atual de continuidade.`;
  const authorityLine =
    authorityCount > 0
      ? `${authorityCount} solicitação(ões) de autoridade ainda estão pendentes, então a superfície deve permanecer proceduralmente restringida.`
      : "Nenhuma solicitação de autoridade pendente está segurando o trilho de ativação.";

  return {
    identityAndActivation:
      "O trilho de ativação do piloto é internamente observável: a continuidade do runtime está nominal e a superfície pode ler a ativação como faseada, supervisionada e ancorada operacionalmente.",
    cityReadiness:
      authorityCount > 0
        ? "A prontidão da cidade está visível, mas mantida em readiness controlada enquanto a pressão de autoridade permanecer aberta."
        : "A prontidão da cidade é internamente legível a partir da continuidade do runtime e da continuidade de sessões, sem transformar essa leitura em promessa de demanda ou payout.",
    turnState: `${sessionLine} ${authorityLine} A leitura de turno permanece apenas operacional e não sugere ganhos, volume de viagens ou fluxo garantido.`,
    alerts:
      authorityCount > 0
        ? [
            `${authorityCount} solicitação(ões) de autoridade ainda restringem a liberação da ativação.`,
            "Mantenha a superfície em readiness supervisionada até o trilho de autoridade ser liberado.",
          ]
        : [
            "A continuidade operacional está viva o bastante para uma leitura interna do piloto.",
            "Nenhuma execução econômica ou voltada ao passageiro é sugerida por este estado.",
          ],
    complianceNotices: [
      "A execução econômica permanece fora de escopo até que CFO e Legal validem explicitamente o contrato.",
      "The Cockpit continua separado de Cortex Praetorium em nome, UX e responsabilidade operacional.",
    ],
    bindingState: "observed",
    bindingSources: baseSources.length > 0 ? baseSources : ["runtime:nominal"],
    ...baselineStaticFields,
  };
}
