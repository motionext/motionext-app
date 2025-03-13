const pt = {
  common: {
    ok: "OK",
    google: "Google",
    connectedToInternet: "Conectado à internet",
    noInternetConnection: "Sem conexão com a internet",
  },
  onboarding: {
    overview: {
      title: "Bem-vindo ao Motionext!",
      description:
        "Desliza para conhecer todas as funcionalidades que vão transformar a tua saúde e bem-estar.",
    },
    meal_plan: {
      title: "Alimenta-te de forma inteligente!",
      description: "Planeia as tuas refeições e mantém uma dieta equilibrada.",
    },
    workout_plan: {
      title: "O teu treino, o teu ritmo!",
      description: "Segue planos personalizados para atingir os teus objetivos.",
    },
    liquid_intake: {
      title: "Mantém-te hidratado!",
      description: "Regista a tua ingestão de líquidos e melhora o teu desempenho.",
    },
    intermittent_fasting: {
      title: "Controla o teu jejum!",
      description: "Define horários e acompanha os teus progressos.",
    },
    mental_health: {
      title: "Mente sã, corpo são!",
      description: "Exercícios e práticas para reduzir o stress e melhorar o teu bem-estar.",
    },
    cardiology: {
      title: "Mantém o coração sob controlo!",
      description: "Regista a tua pressão arterial e monitoriza a tua saúde cardíaca.",
    },
    medication: {
      title: "Nunca te esqueças dos teus medicamentos!",
      description: "Define lembretes e mantém o teu tratamento em dia.",
    },
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
    settings: "Configurações",
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
      passwordRequired: "Palavra-passe obrigatória",
      googleSignInFailed: "Falha ao iniciar sessão com o Google",
      firstNameRequired: "Nome obrigatório",
      lastNameRequired: "Apelido obrigatório",
      firstNameTooLong: "Máximo de 50 caracteres",
      lastNameTooLong: "Máximo de 50 caracteres",
      invalidFirstName: "Nome inválido",
      invalidLastName: "Apelido inválido",
      emailTooLong: "Email máximo de 100 caracteres",
      passwordTooShort: "Senha mínima de 8 caracteres",
      passwordTooLong: "Senha máxima de 100 caracteres",
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
      firstName: "Nome",
      lastName: "Apelido",
      email: "Email",
      password: "Palavra-passe",
      button: "Criar conta",
      haveAccount: "Já tem uma conta?",
      signIn: "Iniciar sessão",
    },
    terms: {
      agreement: "Ao utilizar o Motionext, concorda com os ",
      termsOfService: "Termos de Serviço",
      and: " e ",
      privacyPolicy: "Política de Privacidade",
    },
  },
  passwordStrength: {
    veryWeak: "Muito fraca",
    weak: "Fraca",
    medium: "Média",
    strong: "Forte",
    veryStrong: "Muito forte",
    empty: "A sua senha está vazia 👀",
    requirements: {
      minLength: "Mínimo de 8 caracteres",
      lowercase: "Adicione uma letra minúscula",
      uppercase: "Adicione uma letra maiúscula",
      number: "Adicione um número",
      perfect: "Senha excelente! 🔒",
    },
  },
  settings: {
    title: "Configurações",
    themeSelector: {
      title: "Tema da Aplicação",
      light: "Claro",
      dark: "Escuro",
      auto: "Sistema",
    },
    languageSelector: {
      title: "Idioma da Aplicação",
      en: "Inglês",
      pt: "Português",
    },
    dataModal: {
      title: "Dados Armazenados",
      emptyState: "Sem dados armazenados",
    },
    clearAllData: {
      buttonText: "Limpar Todos os Dados",
      title: "Confirmação",
      message: "Tem certeza que deseja limpar todos os dados?",
      deleteButton: "Apagar",
      successTitle: "Sucesso",
      successMessage: "Todos os dados foram apagados",
      cancelButton: "Cancelar",
    },
    data: "Dados",
    viewAllData: "Ver Todos os Dados",
  },
}

export default pt
export type Translations = typeof pt
