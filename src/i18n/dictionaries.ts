import type { Locale } from "./config";

const tr = {
  brand: "The Vault",
  meta: {
    description: "Odak odaklı okuma ve ilerleme terminali",
  },
  nav: {
    desk: "Desk",
    vault: "Vault",
    add: "Ekle",
    signOut: "Çıkış",
  },
  login: {
    title: "Odak terminali",
    subtitle: "Sosyal gürültü yok. Sadece masan ve ilerlemen.",
    tabLogin: "Giriş",
    tabSignup: "Kayıt",
    email: "E-posta",
    password: "Şifre",
    submitLogin: "Giriş yap",
    submitSignup: "Hesap oluştur",
    signupSuccess: "Hesap oluşturuldu. Giriş yapabilirsiniz.",
  },
  desk: {
    title: "Active Desk",
    subtitle: "Şu an masanda · {count}/3",
    empty: "Masa boş.",
    addMaterial: "Materyal ekle",
    pageOnly: "Sayfa {page}",
    pageOf: "{current} / {total}",
    consistency: "İstikrar",
    consistencyHint: "Günlük disiplin — masaya oturduğun günler.",
    pageInput: "Ulaşılan sayfa",
    updateProgress: "Güncelle",
    markCompleted: "Manuel Bitir",
    shelve: "Vault’a kaldır",
    heatmapStats: "{days} aktif gün",
  },
  vault: {
    title: "The Vault",
    subtitle: "Arşiv ve bekleyenler · {count}",
    empty: "Kütüphane henüz boş.",
    add: "Ekle",
    activate: "Masaya al",
    statusShelved: "Bekliyor",
    statusCompleted: "Tamamlandı",
  },
  add: {
    title: "Materyal ekle",
    subtitle: "Google Books’tan bul veya kendi kaynağını elle gir.",
    tabSearch: "Google Books",
    tabManual: "Manuel",
    searchPlaceholder: "Kitap, yazar, konu…",
    search: "Ara",
    searching: "…",
    searchFailed: "Arama başarısız.",
    noResults: "Sonuç bulunamadı.",
    noAuthor: "Yazar yok",
    pages: "{count} sayfa",
    pagesUnknown: "Sayfa ?",
    addToDesk: "Masaya ekle",
    addToVault: "Vault’a koy",
    addedToDesk: '"{title}" masaya eklendi.',
    addedToVault: '"{title}" Vault’a koyuldu.',
    added: '"{title}" eklendi.',
    titleLabel: "Başlık",
    authorLabel: "Yazar",
    totalPagesLabel: "Toplam sayfa (opsiyonel)",
    statusActive: "Active Desk",
    statusVault: "Vault",
    submit: "Ekle",
  },
  errors: {
    deskFull:
      "Masanız dolu. Yeni bir materyal eklemek için önce bir kitabı Vault'a kaldırın.",
    titleRequired: "Başlık zorunlu.",
    authRequired: "Oturum gerekli.",
    invalidPage: "Yeni sayfa, mevcut sayfadan büyük olmalı.",
    notFound: "Materyal bulunamadı.",
    generic: "Bir hata oluştu.",
    queryTooShort: "En az 2 karakter girin.",
    booksRateLimit:
      "Google Books kota limiti aşıldı. Birkaç dakika sonra tekrar dene veya API anahtarını kontrol et.",
    booksKeyRejected:
      "Google Books anahtarı reddedildi. Cloud Console’da Books API’yi aç ve anahtarı kontrol et.",
    booksFailed: "Kitap araması başarısız oldu.",
    booksFailedStatus: "Kitap araması başarısız oldu ({status}).",
    booksUnavailable:
      "Google Books şu an yanıt vermiyor. Biraz sonra tekrar dene.",
  },
  setup: {
    title: "Ortam değişkenleri eksik",
    body: "Uygulama Supabase olmadan açılamaz. Proje kökünde .env.local oluşturup anahtarları doldur, sonra npm run dev sunucusunu yeniden başlat.",
    step1: ".env.example dosyasını .env.local olarak kopyala",
    step2:
      "Supabase → Project Settings → API’den Project URL ve anon public key’i yapıştır",
    step3: "SQL Editor’de supabase/migrations/001_init.sql çalıştır",
    step4: "Auth → Redirect URLs: http://localhost:3000/auth/callback",
  },
  language: {
    label: "Dil",
    tr: "TR",
    en: "EN",
  },
} as const;

const en = {
  brand: "The Vault",
  meta: {
    description: "Focus-first reading and progress terminal",
  },
  nav: {
    desk: "Desk",
    vault: "Vault",
    add: "Add",
    signOut: "Sign out",
  },
  login: {
    title: "Focus terminal",
    subtitle: "No social noise. Just your desk and your progress.",
    tabLogin: "Sign in",
    tabSignup: "Sign up",
    email: "Email",
    password: "Password",
    submitLogin: "Sign in",
    submitSignup: "Create account",
    signupSuccess: "Account created. You can sign in now.",
  },
  desk: {
    title: "Active Desk",
    subtitle: "On your desk · {count}/3",
    empty: "Desk is empty.",
    addMaterial: "Add material",
    pageOnly: "Page {page}",
    pageOf: "{current} / {total}",
    consistency: "Consistency",
    consistencyHint: "Daily discipline — days you sat at the desk.",
    pageInput: "Page reached",
    updateProgress: "Update",
    markCompleted: "Mark completed",
    shelve: "Move to Vault",
    heatmapStats: "{days} active days",
  },
  vault: {
    title: "The Vault",
    subtitle: "Archive and waiting · {count}",
    empty: "Library is still empty.",
    add: "Add",
    activate: "Activate",
    statusShelved: "Shelved",
    statusCompleted: "Completed",
  },
  add: {
    title: "Add material",
    subtitle: "Find it on Google Books or enter your own source.",
    tabSearch: "Google Books",
    tabManual: "Manual",
    searchPlaceholder: "Book, author, topic…",
    search: "Search",
    searching: "…",
    searchFailed: "Search failed.",
    noResults: "No results found.",
    noAuthor: "No author",
    pages: "{count} pages",
    pagesUnknown: "Pages ?",
    addToDesk: "Add to desk",
    addToVault: "Send to Vault",
    addedToDesk: '"{title}" added to desk.',
    addedToVault: '"{title}" sent to Vault.',
    added: '"{title}" added.',
    titleLabel: "Title",
    authorLabel: "Author",
    totalPagesLabel: "Total pages (optional)",
    statusActive: "Active Desk",
    statusVault: "Vault",
    submit: "Add",
  },
  errors: {
    deskFull:
      "Your desk is full. Move a book to the Vault before activating another.",
    titleRequired: "Title is required.",
    authRequired: "Sign in required.",
    invalidPage: "New page must be greater than the current page.",
    notFound: "Material not found.",
    generic: "Something went wrong.",
    queryTooShort: "Enter at least 2 characters.",
    booksRateLimit:
      "Google Books rate limit hit. Try again in a few minutes or check your API key.",
    booksKeyRejected:
      "Google Books key was rejected. Enable Books API in Cloud Console and verify the key.",
    booksFailed: "Book search failed.",
    booksFailedStatus: "Book search failed ({status}).",
    booksUnavailable:
      "Google Books is temporarily unavailable. Try again in a moment.",
  },
  setup: {
    title: "Environment variables missing",
    body: "The app cannot start without Supabase. Create .env.local in the project root, fill the keys, then restart npm run dev.",
    step1: "Copy .env.example to .env.local",
    step2:
      "Paste Project URL and anon public key from Supabase → Project Settings → API",
    step3: "Run supabase/migrations/001_init.sql in the SQL Editor",
    step4: "Auth → Redirect URLs: http://localhost:3000/auth/callback",
  },
  language: {
    label: "Language",
    tr: "TR",
    en: "EN",
  },
} as const;

export type Dictionary = {
  brand: string;
  meta: { description: string };
  nav: {
    desk: string;
    vault: string;
    add: string;
    signOut: string;
  };
  login: {
    title: string;
    subtitle: string;
    tabLogin: string;
    tabSignup: string;
    email: string;
    password: string;
    submitLogin: string;
    submitSignup: string;
    signupSuccess: string;
  };
  desk: {
    title: string;
    subtitle: string;
    empty: string;
    addMaterial: string;
    pageOnly: string;
    pageOf: string;
    consistency: string;
    consistencyHint: string;
    pageInput: string;
    updateProgress: string;
    markCompleted: string;
    shelve: string;
    heatmapStats: string;
  };
  vault: {
    title: string;
    subtitle: string;
    empty: string;
    add: string;
    activate: string;
    statusShelved: string;
    statusCompleted: string;
  };
  add: {
    title: string;
    subtitle: string;
    tabSearch: string;
    tabManual: string;
    searchPlaceholder: string;
    search: string;
    searching: string;
    searchFailed: string;
    noResults: string;
    noAuthor: string;
    pages: string;
    pagesUnknown: string;
    addToDesk: string;
    addToVault: string;
    addedToDesk: string;
    addedToVault: string;
    added: string;
    titleLabel: string;
    authorLabel: string;
    totalPagesLabel: string;
    statusActive: string;
    statusVault: string;
    submit: string;
  };
  errors: {
    deskFull: string;
    titleRequired: string;
    authRequired: string;
    invalidPage: string;
    notFound: string;
    generic: string;
    queryTooShort: string;
    booksRateLimit: string;
    booksKeyRejected: string;
    booksFailed: string;
    booksFailedStatus: string;
    booksUnavailable: string;
  };
  setup: {
    title: string;
    body: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  language: {
    label: string;
    tr: string;
    en: string;
  };
};

export type ErrorKey = keyof Dictionary["errors"];

export const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en,
};
