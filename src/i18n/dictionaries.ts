import type { Locale } from "./config";

const tr = {
  brand: "The Vault",
  busy: "…",
  meta: {
    description: "Odak odaklı okuma ve ilerleme terminali",
  },
  landing: {
    eyebrow: "Sıfır sosyal gürültü",
    headlineLine1: "Okumak gösteri değil.",
    headlineLine2: "Mesaidir.",
    sub: "Masandaki kitap, soru ve dokümanları takip eden sessiz bir ilerleme terminali. Feed yok, beğeni yok — sadece mesain.",
    ctaPrimary: "Giriş yap",
    ctaSecondary: "Nasıl çalışıyor",
    statDeskLabel: "masa limiti",
    statNoiseLabel: "sosyal gürültü",
    statDailyLabel: "günlük kutu",
    kindBook: "Kitap",
    kindBookHint: "Roman, deneme, el kitabı.",
    kindSet: "Soru",
    kindSetHint: "Set, çalışma, deneme.",
    kindDocs: "Doküman",
    kindDocsHint: "Not, referans, PDF.",
    manifestoTitle: "Az yüzey. Gerçek mesai.",
    manifestoBody:
      "Kitap takibi; sahte incelemeler ve gösteriş raflarıyla dolu bir sosyal ağa dönüştü. The Vault tersini yapıyor: her şeyi söküp geriye yalnızca ölçülebilir mesaiyi bırakıyor.",
    removedTitle: "Çıkarıldı",
    removed: [
      "Haber kaynağı",
      "Beğeni ve yorum",
      "Arkadaş listesi",
      "Yıldızlı incelemeler",
      "Rozetler ve reklamlar",
    ],
    keptTitle: "Kaldı",
    kept: ["Masandaki üç materyal", "Girdiğin her sayfa", "Bugünün kutusu"],
    deskTitle: "Active Desk",
    deskBody:
      "Aynı anda en fazla üç materyal. Dördüncüyü eklemek istersen önce birini Library’ye kaldırırsın — sınırın kendisi odaktır.",
    deskMockLabel: "Active Desk",
    heatTitle: "İstikrar haritası",
    heatBody:
      "“Yılda 50 kitap” gibi yapay hedefler yok. Tek soru: bugün masaya oturdun mu. Girdiğin her sayfa o günün kutusunu yakar.",
    heatMockLabel: "Son 6 ay",
    heatMockLabelYear: "Son 12 ay",
    vaultTitle: "Library",
    vaultBody:
      "Biten ve sırada bekleyen her şey, alt alta listeler yerine kapaklardan oluşan bir ızgarada durur. Kapağı olmayan materyal tipografik kapak alır.",
    vaultMockLabel: "Arşiv",
    tourTitle: "Dört yüzey. Sosyal yok.",
    tourDesk: "Masa",
    tourDeskHint: "Aynı anda üç materyal.",
    tourLibrary: "Library",
    tourLibraryHint: "Raflar, bekleyenler, bitenler.",
    tourDiscover: "Discover",
    tourDiscoverHint: "Vitrinden kapak seç.",
    tourLog: "Log",
    tourLogHint: "Gün gün ne okudun.",
    shelvesPitchTitle: "Raflar.",
    shelvesPitchBody:
      "Bekleyenler ayrı, bitenler ayrı. İsimli raflarla kendi düzenini kur — feed yok.",
    navHow: "Nasıl",
    navLibrary: "Library",
    navLog: "Log",
    footerNoSocial: "Sosyal yok. Sadece mesai.",
    closingTitle: "Masana dön.",
    closingBody: "Hesabını aç, ilk materyalini ekle, bugünün kutusunu yak.",
    closingCta: "Başla",
    closingNote: "Google veya GitHub yeter. Kart yok, reklam yok.",
    footerNote: "Zihinsel mesai için yapıldı.",
    mockSample: "Örnek",
    mockLimit: "Limit",
    mockBookTitle: "Cilt I",
    mockBookMeta: "Roman",
    mockSetTitle: "Soru seti",
    mockSetMeta: "Bölüm 4",
    mockDocsTitle: "Referans",
    mockDocsMeta: "Notlar",
    mockCoverA: "Cilt II",
    mockCoverB: "Deneme",
    mockCoverC: "El kitabı",
    mockCoverD: "Makale",
    mockCoverE: "Çalışma",
    mockCoverF: "Arşiv notu",
  },
  nav: {
    desk: "Desk",
    library: "Library",
    discover: "Discover",
    log: "Log",
    stats: "Stats",
    vault: "Vault",
    add: "Ekle",
    menu: "Menü",
    close: "Kapat",
    settings: "Ayarlar",
    signOut: "Çıkış",
    focus: "Odak",
  },
  login: {
    title: "Odak terminali",
    subtitle: "Sosyal gürültü yok. Sadece masan ve ilerlemen.",
    google: "Google ile devam et",
    github: "GitHub ile devam et",
    dev: "Yerel test · testuser@gmail.com",
    failed: "Giriş tamamlanamadı. Tekrar dene.",
  },
  desk: {
    emptyTitle: "Masana bir şey koy.",
    emptyBody:
      "Aynı anda en fazla üç materyal. Kitap, soru seti veya doküman — ilkini ekle, bugünün kutusunu yak.",
    emptyCta: "Vitrine git",
    emptySlot: "Boş yer",
    openLog: "Log’a git",
    pageOnly: "{page} {unit}",
    pageOf: "{current} / {total}",
    consistency: "İstikrar",
    pageInput: "Ulaşılan {unit}",
    updateProgress: "Kaydet",
    markCompleted: "Bitir",
    shelve: "Library’ye kaldır",
    heatmapStats: "{days} aktif gün",
    heatmapEmptyCaption: "Bugünü yakmak için bir sayfa kaydet.",
    heatmapLess: "Az",
    heatmapMore: "Çok",
    heatmapCell: "{date}: {count} kayıt",
    heatmapCellEmpty: "{date}: kayıt yok",
    heatmapCellGoal: "{date}: {count} kayıt · {goal}",
    heatmapCellFuture: "{date}: henüz değil",
    heatmapEntry: "{count} {unit} {title}",
    remainingPages: "{count} {unit} kaldı",
    slotLabel: "Yer {n}",
    quickAdd: "+{n}",
    quickSub: "-{n}",
    timerStart: "Başlat",
    timerStop: "Durdur",
    timerReset: "Sıfırla",
    pace: "{rate}/{unit} · saat",
    goalMet: "Hedef",
    todayGoal: "{today} / {goal}",
    todayGoalCaption: "bugün / hedef",
  },
  vault: {
    title: "Library",
    subtitle: "Kütüphane · {count}",
    emptyTitle: "Kütüphane henüz boş.",
    emptyBody:
      "Bitirdiklerin, bekleyenler ve masadakiler burada durur. İlk kapağı ekle.",
    emptyCta: "Vitrine git",
    add: "Ekle",
    activate: "Masaya al",
    statusActive: "Masada",
    statusShelved: "Bekliyor",
    statusCompleted: "Tamamlandı",
    filterAll: "Tümü",
    sortUpdated: "Son güncelleme",
    sortTitle: "Başlık",
    sortProgress: "İlerleme",
    searchPlaceholder: "Başlık veya yazar…",
    shelvesTitle: "Raflar",
    shelfCreate: "Raf oluştur",
    shelfName: "Raf adı",
    shelfEmpty: "Bu raf boş.",
    shelfDelete: "Rafı sil",
    shelfDeleteConfirm:
      "“{name}” rafı silinsin mi? Raftaki materyaller kütüphanende kalır.",
    shelfAdd: "Rafa ekle",
    noResults: "Aramanla eşleşen materyal yok.",
  },
  add: {
    title: "Discover",
    subtitle: "Vitrinden bir kapak seç, ara veya kendi kaynağını elle gir.",
    tabSearch: "Google Books",
    tabManual: "Manuel",
    searchPlaceholder: "Kitap, yazar, konu…",
    search: "Ara",
    searching: "…",
    searchFailed: "Arama başarısız.",
    noResults: "Sonuç bulunamadı.",
    loadMore: "Daha fazla",
    noAuthor: "Yazar yok",
    pages: "{count} sayfa",
    pagesUnknown: "Sayfa ?",
    addToDesk: "Masaya ekle",
    addToVault: "Library’ye koy",
    addedToDesk: '"{title}" masaya eklendi.',
    addedToVault: '"{title}" Library’ye koyuldu.',
    added: '"{title}" eklendi.',
    titleLabel: "Başlık",
    authorLabel: "Yazar",
    totalPagesLabel: "Toplam (opsiyonel)",
    descriptionLabel: "Açıklama (opsiyonel)",
    statusActive: "Active Desk",
    statusVault: "Library",
    submit: "Ekle",
    openDetails: "İncele",
    metricLabel: "Ölçüm",
    metricPages: "Sayfa",
    metricQuestions: "Soru",
    metricChapters: "Bölüm",
    tagsLabel: "Etiketler",
    tagsPlaceholder: "Yazılım, Sınav, Edebiyat",
    shelves: {
      all: "Kurgu vitrini",
      fiction: "Kurgu",
      history: "Tarih",
      science: "Bilim",
      philosophy: "Felsefe",
      psychology: "Psikoloji",
      business: "İş",
      computers: "Yazılım",
      poetry: "Şiir",
      biography: "Biyografi",
    },
  },
  book: {
    about: "Hakkında",
    noDescription: "Bu kitap için açıklama yok.",
    openInVault: "Library’de aç",
    backToAdd: "Vitrine dön",
    backToDesk: "Masaya dön",
    backToVault: "Library’ye dön",
    onDesk: "Masada",
    notes: "Notlar",
    notesHint: "Markdown: **kalın**, *italik*, listeler.",
    notesSave: "Notu kaydet",
    notesSaved: "Kaydedildi.",
    notesPlaceholder: "Formül, soru no, alıntı…",
    notesPreview: "Önizle",
    notesEdit: "Düzenle",
    edit: "Düzenle",
    save: "Kaydet",
    saved: "Kaydedildi.",
    delete: "Sil",
    deleteConfirm:
      "Bu materyali silmek istediğine emin misin? Bu işlem geri alınamaz.",
  },
  log: {
    title: "Log",
    subtitle: "Girdiğin her gün. Kutuya tıkla.",
    empty: "Bu ay henüz kayıt yok.",
    emptyDay: "Bu günde kayıt yok.",
    prev: "Önceki ay",
    next: "Sonraki ay",
    today: "Bugün",
    dayCount: "{count} kayıt",
  },
  stats: {
    title: "Stats",
    subtitle: "Ölçülebilir mesai.",
    thisMonth: "Bu ay",
    thisYear: "Bu yıl",
    thisWeek: "Bu hafta",
    activeDays: "Aktif gün",
    pages: "Sayfa",
    questions: "Soru",
    chapters: "Bölüm",
    completed: "Biten",
    streak: "En uzun seri",
    currentStreak: "Mevcut seri",
    daysUnit: "{count} gün",
    weekChart: "Son 12 hafta",
    weekChartAria: "Son 12 haftanın sayfa toplamları",
    loadError: "Sayılar yüklenemedi. Sayfayı yenile.",
    emptyTitle: "Henüz sayılacak mesai yok.",
    emptyBody:
      "İlk sayfanı kaydettiğinde bu sayılar dolmaya başlar. Masana bir materyal koy.",
  },
  metric: {
    page: "sayfa",
    pages: "sayfa",
    question: "soru",
    questions: "soru",
    chapter: "bölüm",
    chapters: "bölüm",
  },
  errors: {
    deskFull:
      "Masanız dolu. Yeni bir materyal eklemek için önce bir kitabı Library’ye kaldırın.",
    titleRequired: "Başlık zorunlu.",
    authRequired: "Oturum gerekli.",
    invalidPage: "Değer 0 veya üzeri olmalı.",
    notFound: "Materyal bulunamadı.",
    alreadyOwned: "Bu kitap zaten masanda veya Library’de.",
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
  errorPage: {
    title: "Bu yüzey açılamadı.",
    body: "Beklenmedik bir hata oldu. Tekrar deneyebilir veya masana dönebilirsin.",
    retry: "Tekrar dene",
    backToDesk: "Masaya dön",
  },
  setup: {
    title: "Ortam değişkenleri eksik",
    body: "Uygulama Supabase olmadan açılamaz. Proje kökünde .env.local oluşturup anahtarları doldur, sonra npm run dev sunucusunu yeniden başlat.",
    step1: ".env.example dosyasını .env.local olarak kopyala",
    step2:
      "Supabase → Project Settings → API’den Project URL ve anon public key’i yapıştır",
    step3:
      "SQL Editor’de supabase/migrations içindeki .sql dosyalarını sırayla çalıştır",
    step4: "Auth → Redirect URLs: http://localhost:3000/auth/callback",
  },
  language: {
    label: "Dil",
    tr: "TR",
    en: "EN",
  },
  cookies: {
    title: "Çerezler",
    body: "Oturum ve dil için zorunlu çerezler kullanılır. İsteğe bağlı tercih çerezlerini kabul edebilir veya yalnızca zorunluları bırakabilirsin.",
    necessary: "Yalnızca zorunlu",
    acceptAll: "Tümünü kabul et",
  },
  settings: {
    title: "Ayarlar",
    profileTitle: "Profil",
    generalTitle: "Genel",
    displayName: "Görünen ad",
    email: "E-posta",
    weekStart: "Haftanın ilk günü",
    weekMonday: "Pazartesi",
    weekSunday: "Pazar",
    cookiePref: "Çerezler",
    cookieNecessary: "Yalnızca zorunlu",
    cookieAll: "Tümü",
    save: "Kaydet",
    saved: "Kaydedildi.",
    appearanceTitle: "Görünüm",
    theme: "Tema",
    themeDark: "Koyu",
    themeLight: "Açık",
    accent: "Vurgu rengi",
    accentEmerald: "Neon yeşil",
    accentBlue: "Mavi",
    accentAmber: "Vault amber",
    dailyGoal: "Günlük hedef",
    dailyGoalHint:
      "Boş = hedef yok. Sayfa cinsinden. Heatmap’te hedefi geçen günler işaretlenir.",
    focusMode: "Gizlilik / odak",
    focusModeHint: "İsimleri ve sayıları bulanıklaştırır.",
  },
  reminders: {
    label: "Hedef hatırlatmaları",
    hint: "Hedefin varsa ve bugün tutmadıysan, gün bitmeden 12 ve 3 saat kala işletim sistemi bildirimi gelir. Tarayıcı izni gerekir.",
    denied: "Bildirim izni kapalı. Tarayıcı ayarlarından açabilirsin.",
    unsupported: "Bu tarayıcı OS bildirimi desteklemiyor.",
    noonTitle: "Günün yarısı.",
    noonBody:
      "Hedefin {goal} sayfa, bugün {today}. Öğleden sonra masaya otur, kutuyu yak.",
    eveningTitle: "Güne 3 saat.",
    eveningBody:
      "Hedefe {left} sayfa kaldı. Bitirmeden gün kapanmasın — masana dön.",
    actionDesk: "Masaya git",
    test: "Test bildirimi",
    testTitle: "The Vault",
    testBody:
      "Hedef hatırlatması böyle görünür. Masana dön, bugünün kutusunu yak.",
  },
} as const;

const en = {
  brand: "The Vault",
  busy: "…",
  meta: {
    description: "Focus-first reading and progress terminal",
  },
  landing: {
    eyebrow: "Zero social noise",
    headlineLine1: "Reading isn’t a performance.",
    headlineLine2: "It’s a shift.",
    sub: "A quiet progress terminal for the books, sets and docs on your desk. No feed, no likes — just the work.",
    ctaPrimary: "Sign in",
    ctaSecondary: "How it works",
    statDeskLabel: "desk limit",
    statNoiseLabel: "social noise",
    statDailyLabel: "daily cell",
    kindBook: "Book",
    kindBookHint: "Novel, essay, handbook.",
    kindSet: "Set",
    kindSetHint: "Problems, drills, papers.",
    kindDocs: "Docs",
    kindDocsHint: "Notes, reference, PDF.",
    manifestoTitle: "Less surface. Real work.",
    manifestoBody:
      "Book tracking turned into a social network of fake reviews and display shelves. The Vault does the opposite: strip everything out and leave only measurable hours.",
    removedTitle: "Removed",
    removed: [
      "The feed",
      "Likes and comments",
      "Friend lists",
      "Star reviews",
      "Badges and ads",
    ],
    keptTitle: "Kept",
    kept: ["Three materials on the desk", "Every page you log", "Today’s cell"],
    deskTitle: "Active Desk",
    deskBody:
      "Three materials at most. To add a fourth you move one to the Library first — the limit is the focus.",
    deskMockLabel: "Active Desk",
    heatTitle: "Consistency map",
    heatBody:
      "No artificial “50 books a year” targets. One question: did you sit down today. Every page you log lights that day’s cell.",
    heatMockLabel: "Last 6 months",
    heatMockLabelYear: "Last 12 months",
    vaultTitle: "Library",
    vaultBody:
      "Everything finished or waiting lives in a cover-first grid instead of a flat list. Materials without art get a typographic cover.",
    vaultMockLabel: "Archive",
    tourTitle: "Four surfaces. No social.",
    tourDesk: "Desk",
    tourDeskHint: "Three materials at once.",
    tourLibrary: "Library",
    tourLibraryHint: "Shelves, waiting, done.",
    tourDiscover: "Discover",
    tourDiscoverHint: "Pick a cover from the shelf.",
    tourLog: "Log",
    tourLogHint: "What you read, day by day.",
    shelvesPitchTitle: "Shelves.",
    shelvesPitchBody:
      "Waiting apart from finished. Named shelves for your own order — no feed.",
    navHow: "How",
    navLibrary: "Library",
    navLog: "Log",
    footerNoSocial: "No social. Just the work.",
    closingTitle: "Back to the desk.",
    closingBody:
      "Create an account, add your first material, light today’s cell.",
    closingCta: "Get started",
    closingNote: "Google or GitHub is enough. No card, no ads.",
    footerNote: "Built for deep work.",
    mockSample: "Sample",
    mockLimit: "Limit",
    mockBookTitle: "Volume I",
    mockBookMeta: "Novel",
    mockSetTitle: "Problem set",
    mockSetMeta: "Chapter 4",
    mockDocsTitle: "Reference",
    mockDocsMeta: "Notes",
    mockCoverA: "Volume II",
    mockCoverB: "Essay",
    mockCoverC: "Handbook",
    mockCoverD: "Paper",
    mockCoverE: "Workbook",
    mockCoverF: "Archive note",
  },
  nav: {
    desk: "Desk",
    library: "Library",
    discover: "Discover",
    log: "Log",
    stats: "Stats",
    vault: "Vault",
    add: "Add",
    menu: "Menu",
    close: "Close",
    settings: "Settings",
    signOut: "Sign out",
    focus: "Focus",
  },
  login: {
    title: "Focus terminal",
    subtitle: "No social noise. Just your desk and your progress.",
    google: "Continue with Google",
    github: "Continue with GitHub",
    dev: "Local test · testuser@gmail.com",
    failed: "Sign-in didn’t finish. Try again.",
  },
  desk: {
    emptyTitle: "Put something on the desk.",
    emptyBody:
      "Three materials at most. A book, a set, or a doc — add the first one and light today’s cell.",
    emptyCta: "Open Discover",
    emptySlot: "Open slot",
    openLog: "Open Log",
    pageOnly: "{page} {unit}",
    pageOf: "{current} / {total}",
    consistency: "Consistency",
    pageInput: "Reached {unit}",
    updateProgress: "Log",
    markCompleted: "Complete",
    shelve: "Move to Library",
    heatmapStats: "{days} active days",
    heatmapEmptyCaption: "Log a page to light today.",
    heatmapLess: "Less",
    heatmapMore: "More",
    heatmapCell: "{count} logged on {date}",
    heatmapCellEmpty: "No activity on {date}",
    heatmapCellGoal: "{count} logged on {date} · {goal}",
    heatmapCellFuture: "Not yet · {date}",
    heatmapEntry: "{count} {unit} {title}",
    remainingPages: "{count} {unit} left",
    slotLabel: "Slot {n}",
    quickAdd: "+{n}",
    quickSub: "-{n}",
    timerStart: "Start",
    timerStop: "Stop",
    timerReset: "Reset",
    pace: "{rate}/{unit} · hour",
    goalMet: "Goal",
    todayGoal: "{today} / {goal}",
    todayGoalCaption: "today / goal",
  },
  vault: {
    title: "Library",
    subtitle: "Library · {count}",
    emptyTitle: "The library is still empty.",
    emptyBody:
      "Finished, waiting, and desk materials live here. Add a cover to start.",
    emptyCta: "Open Discover",
    add: "Add",
    activate: "Activate",
    statusActive: "On desk",
    statusShelved: "Shelved",
    statusCompleted: "Completed",
    filterAll: "All",
    sortUpdated: "Last updated",
    sortTitle: "Title",
    sortProgress: "Progress",
    searchPlaceholder: "Title or author…",
    shelvesTitle: "Shelves",
    shelfCreate: "New shelf",
    shelfName: "Shelf name",
    shelfEmpty: "This shelf is empty.",
    shelfDelete: "Delete shelf",
    shelfDeleteConfirm:
      "Delete the “{name}” shelf? The materials on it stay in your library.",
    shelfAdd: "Add to shelf",
    noResults: "No material matches your search.",
  },
  add: {
    title: "Discover",
    subtitle: "Pick a cover from the shelf, search, or enter your own source.",
    tabSearch: "Google Books",
    tabManual: "Manual",
    searchPlaceholder: "Book, author, topic…",
    search: "Search",
    searching: "…",
    searchFailed: "Search failed.",
    noResults: "No results found.",
    loadMore: "Load more",
    noAuthor: "No author",
    pages: "{count} pages",
    pagesUnknown: "Pages ?",
    addToDesk: "Add to desk",
    addToVault: "Send to Library",
    addedToDesk: '"{title}" added to desk.',
    addedToVault: '"{title}" sent to Library.',
    added: '"{title}" added.',
    titleLabel: "Title",
    authorLabel: "Author",
    totalPagesLabel: "Total (optional)",
    descriptionLabel: "Description (optional)",
    statusActive: "Active Desk",
    statusVault: "Library",
    submit: "Add",
    openDetails: "View",
    metricLabel: "Metric",
    metricPages: "Pages",
    metricQuestions: "Questions",
    metricChapters: "Chapters",
    tagsLabel: "Tags",
    tagsPlaceholder: "Software, Exam, Literature",
    shelves: {
      all: "Fiction shelf",
      fiction: "Fiction",
      history: "History",
      science: "Science",
      philosophy: "Philosophy",
      psychology: "Psychology",
      business: "Business",
      computers: "Computers",
      poetry: "Poetry",
      biography: "Biography",
    },
  },
  book: {
    about: "About",
    noDescription: "No description for this book.",
    openInVault: "Open in Library",
    backToAdd: "Back to Discover",
    backToDesk: "Back to desk",
    backToVault: "Back to Library",
    onDesk: "On desk",
    notes: "Notes",
    notesHint: "Markdown: **bold**, *italic*, lists.",
    notesSave: "Save note",
    notesSaved: "Saved.",
    notesPlaceholder: "Formula, question no, quote…",
    notesPreview: "Preview",
    notesEdit: "Edit",
    edit: "Edit",
    save: "Save",
    saved: "Saved.",
    delete: "Delete",
    deleteConfirm: "Delete this material? This cannot be undone.",
  },
  log: {
    title: "Log",
    subtitle: "Every day you sat down. Tap a cell.",
    empty: "Nothing logged this month.",
    emptyDay: "Nothing logged this day.",
    prev: "Previous month",
    next: "Next month",
    today: "Today",
    dayCount: "{count} logged",
  },
  stats: {
    title: "Stats",
    subtitle: "Measurable hours.",
    thisMonth: "This month",
    thisYear: "This year",
    thisWeek: "This week",
    activeDays: "Active days",
    pages: "Pages",
    questions: "Questions",
    chapters: "Chapters",
    completed: "Finished",
    streak: "Longest streak",
    currentStreak: "Current streak",
    daysUnit: "{count} days",
    weekChart: "Last 12 weeks",
    weekChartAria: "Page totals for the last 12 weeks",
    loadError: "Could not load these counts. Refresh the page.",
    emptyTitle: "Nothing to count yet.",
    emptyBody:
      "These numbers fill up once you log your first page. Put a material on the desk.",
  },
  metric: {
    page: "page",
    pages: "pages",
    question: "question",
    questions: "questions",
    chapter: "chapter",
    chapters: "chapters",
  },
  errors: {
    deskFull:
      "Your desk is full. Move a book to the Library before activating another.",
    titleRequired: "Title is required.",
    authRequired: "Sign in required.",
    invalidPage: "Value must be 0 or greater.",
    notFound: "Material not found.",
    alreadyOwned: "This book is already on your desk or in the Library.",
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
  errorPage: {
    title: "This surface failed to load.",
    body: "Something unexpected broke. Try again, or head back to your desk.",
    retry: "Try again",
    backToDesk: "Back to desk",
  },
  setup: {
    title: "Environment variables missing",
    body: "The app cannot start without Supabase. Create .env.local in the project root, fill the keys, then restart npm run dev.",
    step1: "Copy .env.example to .env.local",
    step2:
      "Paste Project URL and anon public key from Supabase → Project Settings → API",
    step3:
      "Run the SQL files in supabase/migrations (in order) in the SQL Editor",
    step4: "Auth → Redirect URLs: http://localhost:3000/auth/callback",
  },
  language: {
    label: "Language",
    tr: "TR",
    en: "EN",
  },
  cookies: {
    title: "Cookies",
    body: "Necessary cookies keep your session and language. You can accept optional preference cookies or keep necessary only.",
    necessary: "Necessary only",
    acceptAll: "Accept all",
  },
  settings: {
    title: "Settings",
    profileTitle: "Profile",
    generalTitle: "General",
    displayName: "Display name",
    email: "Email",
    weekStart: "First day of week",
    weekMonday: "Monday",
    weekSunday: "Sunday",
    cookiePref: "Cookies",
    cookieNecessary: "Necessary only",
    cookieAll: "All",
    save: "Save",
    saved: "Saved.",
    appearanceTitle: "Appearance",
    theme: "Theme",
    themeDark: "Dark",
    themeLight: "Light",
    accent: "Accent color",
    accentEmerald: "Neon green",
    accentBlue: "Blue",
    accentAmber: "Vault amber",
    dailyGoal: "Daily goal",
    dailyGoalHint:
      "Leave empty for no goal. Counted in pages. Days that beat it get a mark on the heatmap.",
    focusMode: "Privacy / focus",
    focusModeHint: "Blurs titles and numbers.",
  },
  reminders: {
    label: "Goal reminders",
    hint: "If you set a daily goal and haven’t hit it, you get an OS notification 12 hours and 3 hours before the day ends. Browser permission required.",
    denied:
      "Notifications are blocked. You can enable them in the browser settings.",
    unsupported: "This browser can’t show OS notifications.",
    noonTitle: "Halfway through the day.",
    noonBody:
      "Goal {goal} pages, today {today}. Sit down this afternoon and light the cell.",
    eveningTitle: "Three hours left.",
    eveningBody:
      "{left} pages left. Finish before the day closes — back to the desk.",
    actionDesk: "Open desk",
    test: "Test notification",
    testTitle: "The Vault",
    testBody:
      "Goal reminders look like this. Back to the desk, light today’s cell.",
  },
} as const;

export type Dictionary = {
  brand: string;
  busy: string;
  meta: { description: string };
  landing: {
    eyebrow: string;
    headlineLine1: string;
    headlineLine2: string;
    sub: string;
    ctaPrimary: string;
    ctaSecondary: string;
    statDeskLabel: string;
    statNoiseLabel: string;
    statDailyLabel: string;
    kindBook: string;
    kindBookHint: string;
    kindSet: string;
    kindSetHint: string;
    kindDocs: string;
    kindDocsHint: string;
    manifestoTitle: string;
    manifestoBody: string;
    removedTitle: string;
    removed: readonly string[];
    keptTitle: string;
    kept: readonly string[];
    deskTitle: string;
    deskBody: string;
    deskMockLabel: string;
    heatTitle: string;
    heatBody: string;
    heatMockLabel: string;
    heatMockLabelYear: string;
    vaultTitle: string;
    vaultBody: string;
    vaultMockLabel: string;
    tourTitle: string;
    tourDesk: string;
    tourDeskHint: string;
    tourLibrary: string;
    tourLibraryHint: string;
    tourDiscover: string;
    tourDiscoverHint: string;
    tourLog: string;
    tourLogHint: string;
    shelvesPitchTitle: string;
    shelvesPitchBody: string;
    navHow: string;
    navLibrary: string;
    navLog: string;
    footerNoSocial: string;
    closingTitle: string;
    closingBody: string;
    closingCta: string;
    closingNote: string;
    footerNote: string;
    mockSample: string;
    mockLimit: string;
    mockBookTitle: string;
    mockBookMeta: string;
    mockSetTitle: string;
    mockSetMeta: string;
    mockDocsTitle: string;
    mockDocsMeta: string;
    mockCoverA: string;
    mockCoverB: string;
    mockCoverC: string;
    mockCoverD: string;
    mockCoverE: string;
    mockCoverF: string;
  };
  nav: {
    desk: string;
    library: string;
    discover: string;
    log: string;
    stats: string;
    vault: string;
    add: string;
    menu: string;
    close: string;
    settings: string;
    signOut: string;
    focus: string;
  };
  login: {
    title: string;
    subtitle: string;
    google: string;
    github: string;
    dev: string;
    failed: string;
  };
  desk: {
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    emptySlot: string;
    openLog: string;
    pageOnly: string;
    pageOf: string;
    consistency: string;
    pageInput: string;
    updateProgress: string;
    markCompleted: string;
    shelve: string;
    heatmapStats: string;
    heatmapEmptyCaption: string;
    heatmapLess: string;
    heatmapMore: string;
    heatmapCell: string;
    heatmapCellEmpty: string;
    heatmapCellGoal: string;
    heatmapCellFuture: string;
    heatmapEntry: string;
    remainingPages: string;
    slotLabel: string;
    quickAdd: string;
    quickSub: string;
    timerStart: string;
    timerStop: string;
    timerReset: string;
    pace: string;
    goalMet: string;
    todayGoal: string;
    todayGoalCaption: string;
  };
  vault: {
    title: string;
    subtitle: string;
    emptyTitle: string;
    emptyBody: string;
    emptyCta: string;
    add: string;
    activate: string;
    statusActive: string;
    statusShelved: string;
    statusCompleted: string;
    filterAll: string;
    sortUpdated: string;
    sortTitle: string;
    sortProgress: string;
    searchPlaceholder: string;
    shelvesTitle: string;
    shelfCreate: string;
    shelfName: string;
    shelfEmpty: string;
    shelfDelete: string;
    shelfDeleteConfirm: string;
    shelfAdd: string;
    noResults: string;
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
    loadMore: string;
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
    descriptionLabel: string;
    statusActive: string;
    statusVault: string;
    submit: string;
    openDetails: string;
    metricLabel: string;
    metricPages: string;
    metricQuestions: string;
    metricChapters: string;
    tagsLabel: string;
    tagsPlaceholder: string;
    shelves: {
      all: string;
      fiction: string;
      history: string;
      science: string;
      philosophy: string;
      psychology: string;
      business: string;
      computers: string;
      poetry: string;
      biography: string;
    };
  };
  book: {
    about: string;
    noDescription: string;
    openInVault: string;
    backToAdd: string;
    backToDesk: string;
    backToVault: string;
    onDesk: string;
    notes: string;
    notesHint: string;
    notesSave: string;
    notesSaved: string;
    notesPlaceholder: string;
    notesPreview: string;
    notesEdit: string;
    edit: string;
    save: string;
    saved: string;
    delete: string;
    deleteConfirm: string;
  };
  log: {
    title: string;
    subtitle: string;
    empty: string;
    emptyDay: string;
    prev: string;
    next: string;
    today: string;
    dayCount: string;
  };
  stats: {
    title: string;
    subtitle: string;
    thisMonth: string;
    thisYear: string;
    thisWeek: string;
    activeDays: string;
    pages: string;
    questions: string;
    chapters: string;
    completed: string;
    streak: string;
    currentStreak: string;
    daysUnit: string;
    weekChart: string;
    weekChartAria: string;
    loadError: string;
    emptyTitle: string;
    emptyBody: string;
  };
  metric: {
    page: string;
    pages: string;
    question: string;
    questions: string;
    chapter: string;
    chapters: string;
  };
  errors: {
    deskFull: string;
    titleRequired: string;
    authRequired: string;
    invalidPage: string;
    notFound: string;
    alreadyOwned: string;
    generic: string;
    queryTooShort: string;
    booksRateLimit: string;
    booksKeyRejected: string;
    booksFailed: string;
    booksFailedStatus: string;
    booksUnavailable: string;
  };
  errorPage: {
    title: string;
    body: string;
    retry: string;
    backToDesk: string;
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
  cookies: {
    title: string;
    body: string;
    necessary: string;
    acceptAll: string;
  };
  settings: {
    title: string;
    profileTitle: string;
    generalTitle: string;
    displayName: string;
    email: string;
    weekStart: string;
    weekMonday: string;
    weekSunday: string;
    cookiePref: string;
    cookieNecessary: string;
    cookieAll: string;
    save: string;
    saved: string;
    appearanceTitle: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    accent: string;
    accentEmerald: string;
    accentBlue: string;
    accentAmber: string;
    dailyGoal: string;
    dailyGoalHint: string;
    focusMode: string;
    focusModeHint: string;
  };
  reminders: {
    label: string;
    hint: string;
    denied: string;
    unsupported: string;
    noonTitle: string;
    noonBody: string;
    eveningTitle: string;
    eveningBody: string;
    actionDesk: string;
    test: string;
    testTitle: string;
    testBody: string;
  };
};

export type ErrorKey = keyof Dictionary["errors"];

export const dictionaries: Record<Locale, Dictionary> = {
  tr,
  en,
};
