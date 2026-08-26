export type AuthCopyMode = "signin" | "signup" | "forgot" | "update";
export type AuthCopyLocale = "en" | "tr";

const availableModeCopy: Record<AuthCopyLocale, Record<AuthCopyMode, { title: string; description: string }>> = {
  en: {
    signin: {
      title: "Welcome back",
      description: "Continue with Google or your account email to join source-linked discussion.",
    },
    signup: {
      title: "Create your account",
      description: "Create a verified account to join source-linked discussion.",
    },
    forgot: {
      title: "Reset your password",
      description: "We’ll email a secure recovery link to your account address.",
    },
    update: {
      title: "Choose a new password",
      description: "Use at least eight characters you don’t use anywhere else.",
    },
  },
  tr: {
    signin: {
      title: "Tekrar hoş geldin",
      description: "Kaynak bağlantılı tartışmaya katılmak için Google veya hesap e-postanla devam et.",
    },
    signup: {
      title: "Hesabını oluştur",
      description: "Kaynak bağlantılı tartışmaya katılmak için doğrulanmış bir hesap oluştur.",
    },
    forgot: {
      title: "Parolanı sıfırla",
      description: "Hesap adresine güvenli bir kurtarma bağlantısı göndereceğiz.",
    },
    update: {
      title: "Yeni bir parola seç",
      description: "Başka bir yerde kullanmadığın en az sekiz karakter kullan.",
    },
  },
};

const unavailableModeCopy: Record<AuthCopyLocale, Record<AuthCopyMode, { title: string; description: string }>> = {
  en: {
    signin: {
      title: "Welcome back",
      description: "Account access will resume after the production data connection is configured.",
    },
    signup: {
      title: "Create your account",
      description: "Account creation is not available on this deployment yet.",
    },
    forgot: availableModeCopy.en.forgot,
    update: availableModeCopy.en.update,
  },
  tr: {
    signin: {
      title: "Tekrar hoş geldin",
      description: "Üretim veri bağlantısı yapılandırıldığında hesap erişimi yeniden açılacak.",
    },
    signup: {
      title: "Hesabını oluştur",
      description: "Bu dağıtımda hesap oluşturma henüz kullanılamıyor.",
    },
    forgot: availableModeCopy.tr.forgot,
    update: availableModeCopy.tr.update,
  },
};

export function getAuthModeCopy(mode: AuthCopyMode, locale: AuthCopyLocale, isConfigured: boolean) {
  return (isConfigured ? availableModeCopy : unavailableModeCopy)[locale][mode];
}

export function getAuthAvailabilityCopy(locale: AuthCopyLocale, isConfigured: boolean) {
  if (locale === "tr") {
    return isConfigured
      ? {
          description: "Kaynak bağlantılı tartışmalar için doğrulanmış bir hesap kullan. Açık notlar hesaba bağlı kalır.",
          status: "Üretim durumu: Google ile oturum açma bağlı.",
          footer: "Google ile oturum açma kullanılabilir",
        }
      : {
          description: "Hesap kimliği ve trend tartışmaları hazırlandı, ancak üretim verisi ve kimlik doğrulama hizmetleri bağlanana kadar kullanılamıyor.",
          status: "Üretim durumu: hesap erişimi kullanılamıyor. Bu sayfaya girilen hiçbir kimlik bilgisi gönderilmez.",
          footer: "Kimlik doğrulama şu anda kullanılamıyor",
        };
  }

  return isConfigured
    ? {
        description: "Use a verified account for source-linked discussion. Public notes stay attributable.",
        status: "Production status: Google sign-in is connected.",
        footer: "Google sign-in is available",
      }
    : {
        description: "Account identity and trend discussion are designed, but unavailable until the production data and authentication services are connected.",
        status: "Production status: account access unavailable. No credentials entered on this page are submitted.",
        footer: "Authentication is currently unavailable",
      };
}
