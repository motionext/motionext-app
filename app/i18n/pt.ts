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
    friendlySubtitle:
      "Ocorreu um erro inesperado. Tente reiniciar a aplicação ou contacte o apoio se o problema persistir.",
    reset: "REINICIAR APP",
  },
  emptyStateComponent: {
    generic: {
      heading: "Está vazio... que pena",
      content:
        "Ainda não foram encontrados dados. Tente clicar no botão para atualizar ou reiniciar a aplicação.",
      button: "Tentar novamente",
    },
  },
  verifyEmailScreen: {
    title: "Verifique o seu email",
    description:
      "Enviámos um link de confirmação para o seu email. Clique no link para confirmar a sua identidade.",
    openEmail: "Abrir email",
  },
  errors: {
    title: "Algo correu mal!",
    emailAppNotFound:
      "Não foi possível abrir o email. Por favor, verifique se tem uma aplicação de email configurada.",
    emailAppError: "Ocorreu um erro ao tentar abrir o email",
    unknown: "Ocorreu um erro inesperado",
  },
  home: {
    logout: "Terminar sessão",
  },
  auth: {
    resetPassword: "Esqueceu-se da palavra-passe?",
    resetPasswordSuccessTitle: "Email enviado com sucesso!",
    resetPasswordSuccessDescription: "Verifique a sua caixa de correio.",
    errors: {
      userBanned: "Esta conta foi banida",
      invalidCredentials: "Email ou palavra-passe incorretos",
      emailNotConfirmed: "Por favor, confirme o seu email antes de iniciar sessão",
      unknown: "Ocorreu um erro inesperado",
      emailRequired: "Introduza o seu email para recuperar a palavra-passe",
      invalidEmail: "Email inválido",
      passwordRequired: "A palavra-passe é obrigatória",
      googleSignInFailed: "Falha ao iniciar sessão com o Google",
    },
    signIn: {
      title: "Iniciar sessão",
      email: "Email",
      password: "Palavra-passe",
      button: "Iniciar sessão",
      noAccount: "Não tem uma conta?",
      createAccount: "Criar conta",
    },
    signUp: {
      title: "Criar conta",
      email: "Email",
      password: "Palavra-passe",
      button: "Criar conta",
      loading: "A criar conta...",
      haveAccount: "Já tem uma conta?",
      signIn: "Iniciar sessão",
    },
    terms: {
      agreement: "Ao utilizar o Motionext, concorda com os ",
      termsOfService: "Termos de Serviço",
      and: " e ",
      privacyPolicy: "Política de Privacidade",
    },
    termsOfService: "Termos de Serviço",
    privacyPolicy: "Política de Privacidade",
  },
}

export default pt
export type Translations = typeof pt
