const pt = {
  common: {
    ok: "OK!",
    cancel: "Cancelar",
    back: "Voltar",
  },
  welcomeScreen: {
    postscript: "Este é o ecrã de boas-vindas!",
    title: "Isto é o Motionext!",
    slogan: "Mais saudável, mais conectado.",
  },
  errorScreen: {
    title: "Algo correu mal!",
    friendlySubtitle:
      "Ocorreu um erro inesperado. Tente reiniciar a aplicação ou contacte o suporte se o problema persistir.",
    reset: "REINICIAR APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "Tão vazio... tão triste",
      content:
        "Ainda não foram encontrados dados. Tente clicar no botão para atualizar ou reiniciar a aplicação.",
      button: "Vamos tentar novamente",
    },
  },
}

export default pt
export type Translations = typeof pt
