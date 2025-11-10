# 🚨 Tezkor Tuzatish Kerak Bo'lgan Muammolar

## 🔴 KRITIK (Darhol tuzatish kerak!)

### 1. Database Migration - Description Ustuni Yo'q
**Fayl:** `server/index.ts` (78-89 qatorlar)

```diff
await sql`
  CREATE TABLE IF NOT EXISTS barbershops (
    id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
+   description TEXT,
    rating REAL NOT NULL DEFAULT 0,
    address TEXT NOT NULL,
    ...
```

Va ALTER table ham qo'shish (120-qator atrofida):
```typescript
await sql`ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS description TEXT`;
```

---

### 2. Security: Telegram WebApp Validation Yo'q
**Fayl:** `server/auth.ts`

Hozir har kim istalgan Telegram ID yuborib, boshqa odam sifatida kirishingiz mumkin!

**Hal qilish:** Telegram initData ni crypto orqali validatsiya qilish kerak.

---

## 🟠 MUHIM (Tez hal qilish kerak)

### 3. NPM Security Vulnerabilities
```bash
npm audit fix
```

9 ta xavfsizlik muammosi topildi (2 ta critical)

---

### 4. Admin Panel - ownerId Set Qilinmaydi
**Fayl:** `client/src/pages/Admin.tsx` (195-203 qatorlar)

```diff
const payload = {
  name: trimmedName,
  address: trimmedAddress,
  phone: trimmedPhone,
  description: formData.description.trim() || undefined,
  services: servicesList,
  images: imagesList,
  rating: 0,
+ ownerId: backendUser?.id,
};
```

---

## Batafsil Ma'lumot

Barcha topilgan muammolar va yechimlar uchun:
📄 `FULL_PROJECT_AUDIT.md` faylini o'qing
