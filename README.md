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

Auth → URL Configuration:

- Site URL: `http://localhost:3000` (production’da `https://the-value.vercel.app`)
- Redirect URLs: `/auth/callback` (local + production)

Auth → Providers: Google ve GitHub’ı aç. Callback URL olarak Supabase’in verdiği `https://<project>.supabase.co/auth/v1/callback` adresini Google Cloud / GitHub OAuth app’e ekle. Email+şifre kapalı kalabilir.

4. Geliştirme:

```bash
npm run dev
```
