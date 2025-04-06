# 🧺 RoomieLists

A collaborative, privacy-conscious todo & grocery list web app — built for roommates like **Alex** and **Raine**.

---

## ✨ Features

- ✅ **Signup / Login** with email (via Supabase Auth)
- ✅ **Create, rename, delete** private or shared lists
- ✅ **Add, check off, or remove** items in each list
- ✅ **Mark lists as favorites** for quick access
- ✅ **Save lists as templates** (e.g. chores, weekly shopping)
- ✅ **Recreate lists from templates**
- ✅ **Share lists publicly** using a generated URL
- ✅ **Toggle list visibility** (private/shared/public)
- ✅ **GDPR-aware**, secure by default
- ✅ **Modular and extendable** architecture

---

## 👥 User Story

Roommates **Alex** and **Raine** use RoomieLists to:
- Collaborate on shared shopping and todo lists
- Manage personal lists independently
- Share public links for friends to help without signing up
- Create and reuse common templates for repeat tasks
- Enjoy a responsive, easy-to-use interface
- Maintain control and privacy over their data

---

## 🛡 GDPR & Security

- Uses **Supabase Auth** with **Row Level Security (RLS)** for fine-grained access control
- No cookies, tracking, or external analytics
- Public links are opt-in and revocable
- Users control the visibility of each list
- **Supabase schema and RLS policies** were configured manually to ensure secure and GDPR-compliant access control. For this coding task, migrations and database bootstrapping are not automated but could easily be added later using Supabase CLI or SQL scripts.

---

## ⚙️ Tech Stack

| Tool                  | Version    |
|-----------------------|------------|
| **Next.js**           | 15.2.4     |
| **React**             | ^18.3.1    |
| **Supabase**          | ^2.49.4    |
| **Tailwind CSS**      | ^3.4.17    |
| **ShadCN/UI**         | latest     |
| **Lucide Icons**      | ^0.486.0   |
| **Radix UI**          | used via ShadCN |
| **TypeScript**        | ^5         |

---

## 🧱 Project Structure

```
app/            # Next.js App Router structure
components/     # UI components (Button, Card, Sidebar, etc.)
contexts/       # Global context providers (e.g. UserContext)
hooks/          # Custom hooks (e.g. useToast)
lib/            # Supabase client and helpers
styles/         # Tailwind config & global styles
```

---

## 🧠 State Management

- Global user session handled using a lightweight `UserContext`:
  ```tsx
  export const useUser = () => useContext(UserContext)
  ```

- Supabase handles all backend auth + data fetching securely.

---

## 🧪 Test Login

You can explore RoomieLists using the following demo account:

```
Email: demo@roomielists.app
Password: roomie1234
```

> ✅ Feel free to sign up with your own test email if you want to test shared list functionality with multiple users. Email confirmation is disabled, so any address will work.


---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Setup environment (env.local)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run the development server
npm run dev
```

---

## 📦 Notable Dependencies

```json
{
  "@supabase/supabase-js": "^2.49.4",
  "@supabase/auth-helpers-nextjs": "^0.10.0",
  "next": "15.2.4",
  "react": "^18.3.1",
  "tailwindcss": "^3.4.17",
  "lucide-react": "^0.486.0",
  "clsx": "^2.1.1",
  "vaul": "^1.1.2"
}
```

---

## 🔮 Future Enhancements

- 🔄 Real-time list syncing (via Supabase subscriptions)
- 📱 PWA support for offline use
- 🔐 Invite-only shared lists
- 🧪 E2E testing and user onboarding
- 🧼 User profile page (edit name, delete account)

---
