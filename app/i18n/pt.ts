const pt = {
  common: {
    ok: "OK",
    google: "Google",
  },
  landingScreen: {
    continueWithMail: "Continuar com o email",
    or: "ou continue com",
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
  home: {
    logout: "Terminar sessão",
  },
}

export default pt
export type Translations = typeof pt
