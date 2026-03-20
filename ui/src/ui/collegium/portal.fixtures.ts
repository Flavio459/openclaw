import type { PortalFirstBlockAdapterInput } from "./portal.adapter.ts";

export const portalDefaultFixture: PortalFirstBlockAdapterInput = {
  state: "portal-default",
  contextLine: "Leitura curta do turno atual",
  primaryHeadline: "Veja onde o turno perdeu clareza antes da próxima corrida.",
  supportingSubheadline:
    "Receba uma leitura operacional do ponto de vazamento e do próximo ajuste sem cadastro pesado na primeira dobra.",
  primaryCtaLabel: "Ler meu turno agora",
  primaryCtaHref: "/portal/read-shift",
  signalPanel: {
    compressedMargin: "Margem comprimida nas duas últimas horas.",
    leakPoint: "Vazamento principal: tempo improdutivo entre corridas.",
    nextAdjustment: "Próximo ajuste: reduzir espera fora de zonas de saída.",
    dataState: "observed",
  },
  secondaryCtaLabel: "Entender como a leitura funciona",
  secondaryCtaHref: "/portal/method",
};

export const portalHighTensionFixture: PortalFirstBlockAdapterInput = {
  ...portalDefaultFixture,
  state: "portal-high-tension",
  signalPanel: {
    compressedMargin: "Pressão alta nas últimas corridas do turno.",
    leakPoint: "Vazamento principal: deslocamento vazio acima do esperado.",
    nextAdjustment: "Próximo ajuste: encurtar reposicionamento entre chamadas.",
    dataState: "observed",
  },
};

export const portalLowSignalFixture: PortalFirstBlockAdapterInput = {
  ...portalDefaultFixture,
  state: "portal-low-signal",
  signalPanel: {
    compressedMargin: "Leitura parcial ainda em consolidação.",
    leakPoint: "Ponto de vazamento ainda sendo confirmado.",
    nextAdjustment: "Próximo ajuste sugerido será refinado com mais sinais.",
    dataState: "placeholder",
  },
};

export const portalMobileCompactFixture: PortalFirstBlockAdapterInput = {
  ...portalDefaultFixture,
  state: "portal-mobile-compact",
  supportingSubheadline:
    "Leitura curta do vazamento e do próximo ajuste ainda na primeira área útil da tela.",
  signalPanel: {
    compressedMargin: "Resumo curto para tela compacta.",
    leakPoint: "Vazamento principal visível sem aprofundamento longo.",
    nextAdjustment: "Próximo ajuste mantido em leitura curta.",
    dataState: "observed",
  },
};

export const portalMobileContinuityFixture: PortalFirstBlockAdapterInput = {
  ...portalDefaultFixture,
  state: "portal-mobile-continuity",
  secondaryCtaLabel: "Ver o método por trás da leitura",
  signalPanel: {
    compressedMargin: "Resumo contínuo para navegação móvel.",
    leakPoint: "Vazamento principal mantido em evidência curta.",
    nextAdjustment: "Próximo ajuste continua abaixo da ação principal.",
    dataState: "observed",
  },
};
