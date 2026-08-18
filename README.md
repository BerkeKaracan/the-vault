# The Vault

A focus-driven reading and progress terminal.

Production: [https://the-value.vercel.app](https://the-value.vercel.app)

---

## Setup & Installation

### 1. Install Dependencies

Begin by installing the required packages:

```bash
npm install
```

### 2. Environment Variables

Set up your local environment variables by copying the example file:

```bash
cp .env.example .env.local
```

- **Supabase:** Fill in your Supabase Project URL and Anon Key.
- **Google Books API:** The `GOOGLE_BOOKS_API_KEY` is **required** for catalog searches and fetching volume details. Unauthenticated requests will quickly hit the 429 rate limit quota. _(Note: This utilizes the Books API exclusively; there are no translation calls in the application)_.

### 3. Database Initialization (Supabase)

Navigate to the Supabase SQL Editor and execute the following migration files **in chronological order**:

| File                                 | Description                                                                        |
| :----------------------------------- | :--------------------------------------------------------------------------------- |
| `001_init.sql`                       | Core schema setup (`materials`, `progress_entries`).                               |
| `002_profiles.sql`                   | User profiles and the `handle_new_user` trigger.                                   |
| `003_material_details.sql`           | Book discovery fields (descriptions, publishers, categories).                      |
| `004_advanced_materials.sql`         | Metrics, tags, reading sessions, and notes.                                        |
| `005_color_scheme.sql`               | Color scheme preferences (dark/light mode).                                        |
| `006_progress_corrections.sql`       | Progress corrections (handling negative deltas).                                   |
| `007_profile_oauth_display_name.sql` | OAuth display name logic (`full_name`, `name`, `user_name`, `preferred_username`). |
| `008_collections.sql`                | Library shelving system (`collections`, `collection_items`).                       |

> **Upgrading an Existing Project?**
> If you are applying these updates to an existing database, you only need to run **`007`** and **`008`** in the SQL Editor. File `007` securely updates the trigger function via `CREATE OR REPLACE`, while `008` adds the new shelving tables. No user data will be lost.

### 4. Authentication Configuration

**A. URL Configuration**
In your Supabase dashboard, navigate to **Authentication → URL Configuration**:

- **Site URL:** `http://localhost:3000` (Use `[https://the-value.vercel.app](https://the-value.vercel.app)` for production).
- **Redirect URLs:** Add `/auth/callback` (Ensure both local and production callback URLs are listed).

**B. OAuth Providers**
Navigate to **Authentication → Providers** and enable **Google** and **GitHub**. Copy your Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`) and paste it into your Google Cloud Console and GitHub Developer (OAuth App) settings.

**C. Local Testing Credentials**
A quick-login button is available exclusively in the development environment (`npm run dev`).

- **Credentials:** `testuser@gmail.com` / `123456`.
- **Action Required:** Ensure the **Email provider** is enabled. Either disable **Confirm email**, or manually auto-confirm this test user via the _Authentication → Users_ tab in Supabase.
- _This test button is automatically hidden in the production environment._

### 5. Local Development

Start the development server:

```bash
npm run dev
```
