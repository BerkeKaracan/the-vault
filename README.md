# The Vault

Odak odaklı okuma ve ilerleme terminali.

## Setup

1. Bağımlılıklar:

```bash
npm install
```

2. Env:

```bash
cp .env.example .env.local
```

Supabase proje URL + anon key’i doldur. Google Books anahtarı sonraki sprintte arama için gerekir.

3. Veritabanı:

Supabase SQL Editor’de [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql) dosyasını çalıştır.

Auth → URL Configuration’da Site URL ve Redirect URLs’e `http://localhost:3000` ve `http://localhost:3000/auth/callback` ekle.

4. Geliştirme:

```bash
npm run dev
```
