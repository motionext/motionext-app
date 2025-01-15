const pt = {
  common: {
    ok: "OK",
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
  verifyEmailScreen: {
    title: "Verifique o seu email",
    description:
      "Enviamos um link de confirmação para o seu email. Clique no link para confirmar sua identidade.",
    openEmail: "Abrir email",
  },
  errors: {
    title: "Erro",
    emailAppNotFound:
      "Não foi possível abrir o email. Por favor, verifique se há um app de email configurado.",
    emailAppError: "Ocorreu um erro ao tentar abrir o email",
  },
}

export default pt
export type Translations = typeof pt
