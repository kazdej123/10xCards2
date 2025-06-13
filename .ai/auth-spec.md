# Specyfikacja modułu autentykacji – 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony Astro
- **Strona główna** (`src/pages/index.astro`):
  - Wyświetla tytuł aplikacji "10xCards.ai"
  - Dla niezalogowanych: przyciski "Logowanie" i "Rejestracja"
  - Dla zalogowanych: główna funkcjonalność generowania fiszek + przycisk "Wyloguj"
- **Strona logowania** (`src/pages/login.astro`):
  - Formularz logowania (email, hasło)
  - Link "Zapomniałeś hasła?" do reset-password
- **Strona rejestracji** (`src/pages/register.astro`):
  - Formularz rejestracji (email, hasło, potwierdzenie hasła)
- **Strona resetowania hasła** (`src/pages/reset-password.astro`):
  - Formularz z polem email do wysłania linku resetującego

### 1.2 Komponenty React (`src/components/auth`)
- **AuthButtons.tsx**: 
  - Wyświetla przyciski "Logowanie"/"Rejestracja" dla niezalogowanych
  - Wyświetla przycisk "Wyloguj" dla zalogowanych
- **LoginForm.tsx**:
  - Pola: email, hasło
  - Link "Zapomniałeś hasła?"
  - Submit → POST `/api/auth/login`
  - Po sukcesie: redirect do `/` (zgodnie z US-002)
- **RegisterForm.tsx**:
  - Pola: email, hasło, potwierdzenie hasła
  - Walidacja: min. 8 znaków hasła, zgodność haseł, format email
  - Submit → POST `/api/auth/register`
  - Po sukcesie: automatyczne zalogowanie i redirect do `/` (zgodnie z US-001)
- **ResetPasswordForm.tsx**:
  - Pole: email
  - Submit → POST `/api/auth/reset-password`
  - Po sukcesie: komunikat "Sprawdź email"

### 1.3 Zarządzanie stanem autoryzacji
- **AuthStore** (Zustand):
  - Stan: `user: User | null`, `isLoading: boolean`
  - Akcje: `setUser`, `clearUser`, `checkAuth`
  - Inicjalizacja przy ładowaniu aplikacji przez sprawdzenie sesji Supabase

### 1.4 Walidacja i komunikaty błędów
- **Walidacja po stronie klienta**:
  - Format email, min. 8 znaków hasła, zgodność haseł
- **Komunikaty błędów z serwera**:
  - "Nieprawidłowy email lub hasło" (logowanie)
  - "Konto z tym emailem już istnieje" (rejestracja)
  - "Sprawdź email aby zresetować hasło" (reset)

## 2. LOGIKA BACKENDOWA

### 2.1 Endpointy API (`src/pages/api/auth`)
- **register.ts** - `POST /api/auth/register`
  - Input: `{ email: string, password: string, confirmPassword: string }`
  - Proces: `supabase.auth.signUp()` bez weryfikacji email (US-001)
  - Output: automatyczne zalogowanie, redirect do `/`
- **login.ts** - `POST /api/auth/login`  
  - Input: `{ email: string, password: string }`
  - Proces: `supabase.auth.signInWithPassword()`
  - Output: sesja, redirect do `/` (US-002)
- **logout.ts** - `POST /api/auth/logout`
  - Proces: `supabase.auth.signOut()`
  - Output: usunięcie sesji
- **reset-password.ts** - `POST /api/auth/reset-password`
  - Input: `{ email: string }`
  - Proces: `supabase.auth.resetPasswordForEmail()` (US-002B)
  - Output: email z linkiem ważnym 24h

### 2.2 Walidacja danych (Zod)
```typescript
// Schematy walidacji
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword)

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})
```

### 2.3 Middleware autoryzacyjne (`src/middleware/index.ts`)
- **Chronione trasy**: `/api/flashcards/*`, `/api/study-sessions/*`
- **Publiczne trasy**: `/`, `/login`, `/register`, `/reset-password`
- **Proces**: sprawdzenie sesji Supabase, redirect do `/login` jeśli brak autoryzacji

## 3. SYSTEM AUTENTYKACJI – SUPABASE AUTH

### 3.1 Konfiguracja Supabase
- **Wyłączenie weryfikacji email** (zgodnie z US-001)
- **Konfiguracja resetowania hasła**: link ważny 24h (US-002B)
- **Row Level Security (RLS)**:
  - `flashcards.user_id = auth.uid()` (US-009)
  - `study_sessions.user_id = auth.uid()` (US-009)

### 3.2 Metody autentykacji
- **Rejestracja**: `supabase.auth.signUp()` - natychmiastowa aktywacja
- **Logowanie**: `supabase.auth.signInWithPassword()`
- **Wylogowanie**: `supabase.auth.signOut()`
- **Reset hasła**: `supabase.auth.resetPasswordForEmail()`

### 3.3 Integracja z aplikacją
- **SSR**: sprawdzenie sesji w `index.astro` przed renderowaniem
- **CSR**: AuthStore synchronizowany z sesjami Supabase
- **Automatyczne przekierowania**: nieautoryzowani → `/login`

## 4. BEZPIECZEŃSTWO I ZABEZPIECZENIA

### 4.1 Implementacja US-009 (Bezpieczny dostęp)
- **RLS w Supabase**: automatyczne filtrowanie danych po `user_id`
- **Middleware**: weryfikacja sesji przed dostępem do chronionych zasobów
- **Brak współdzielenia**: użytkownik widzi tylko swoje fiszki

### 4.2 Zabezpieczenia
- **HTTPS**: wszystkie operacje po bezpiecznym połączeniu
- **JWT**: automatyczne zarządzanie tokenami przez Supabase
- **Walidacja**: server-side walidacja wszystkich inputów
- **Error handling**: spójne komunikaty błędów bez ujawniania szczegółów technicznych


**Tech stack**: Astro 5, React 19, TypeScript 5, Tailwind 4, Supabase Auth, Zustand