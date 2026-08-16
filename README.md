# The Vault

Odak odaklı okuma ve ilerleme terminali.

Production: [https://the-value.vercel.app](https://the-value.vercel.app)

## Setup

1. Bağımlılıklar:

```bash
npm install
```

2. Env:

```bash
cp .env.example .env.local
```

Supabase proje URL + anon key’i doldur. `GOOGLE_BOOKS_API_KEY` katalog araması ve cilt detayı için **gerekli** (anahtarsız istekler kota/429’a düşer). Bu Books anahtarı Translate API değildir; çeviri çağrısı yok.

3. Veritabanı:

Supabase SQL Editor’de migration dosyalarını **sırayla** çalıştır:

| Dosya | Ne işe yarar |
| --- | --- |
| [`001_init.sql`](supabase/migrations/001_init.sql) | Temel şema: materials, progress_entries |
| [`002_profiles.sql`](supabase/migrations/002_profiles.sql) | Profiller ve `handle_new_user` tetikleyicisi |
| [`003_material_details.sql`](supabase/migrations/003_material_details.sql) | Kitap keşif alanları (açıklama, yayınevi, kategoriler) |
| [`004_advanced_materials.sql`](supabase/migrations/004_advanced_materials.sql) | Metrik, etiket, okuma oturumu, notlar |
| [`005_color_scheme.sql`](supabase/migrations/005_color_scheme.sql) | Renk şeması (dark / light) |
| [`006_progress_corrections.sql`](supabase/migrations/006_progress_corrections.sql) | İlerleme düzeltmeleri (negatif delta) |
| [`007_profile_oauth_display_name.sql`](supabase/migrations/007_profile_oauth_display_name.sql) | OAuth görünen ad (`full_name` / `name` / `user_name` / `preferred_username`) |

Mevcut bir projeye geçiyorsan **007’yi SQL Editor’de çalıştırman gerekir.** Tetikleyici fonksiyonu `CREATE OR REPLACE` ile günceller; kullanıcı verisi silinmez. 007 olmadan yeni kullanıcıların görünen adı yalnızca e-posta öneki olur.

Auth → URL Configuration:

- Site URL: `http://localhost:3000` (production’da `https://the-value.vercel.app`)
- Redirect URLs: `/auth/callback` (local + production)

Auth → Providers: **Google** ve **GitHub**. Callback URL olarak Supabase’in verdiği `https://<project>.supabase.co/auth/v1/callback` adresini Google Cloud / GitHub OAuth app’e ekle.

Yerel test girişi yalnızca `npm run dev` login butonunda görünür (`testuser@gmail.com` / `123456`). Email provider açık olsun; Confirm email kapalı olsun veya Authentication → Users’tan bu kullanıcıyı Auto Confirm ile ekle. Production’da bu buton yok.

4. Geliştirme:

```bash
npm run dev
```
