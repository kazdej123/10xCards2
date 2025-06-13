# Specyfikacja modułu autentykacji – 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony Astro i layouty
- Nowe strony w `src/pages`:
  - `src/pages/register.astro` – strona rejestracji.
  - `src/pages/login.astro` – strona logowania.
  - `src/pages/forgot-password.astro` – strona odzyskiwania hasła.
  - `src/pages/reset-password.astro` – strona ustawienia nowego hasła (odbiera `access_token` w query).
- Layouty:
  - `src/layouts/PublicLayout.astro` – wspólny layout dla stron dostępnych bez logowania.
  - `src/layouts/AuthLayout.astro` – layout z minimalnym nagłówkiem i formularzem.
  - Modyfikacja `src/layouts/MainLayout.astro` (lub `DefaultLayout.astro`):
    - Jeżeli użytkownik niezalogowany → przyciski "Zaloguj się" oraz "Zarejestruj się".
    - Jeżeli użytkownik zalogowany → wyświetlana nazwa/email i przycisk "Wyloguj się".

### 1.2 Komponenty React (`src/components/auth`)
- `RegisterForm.tsx`:
  - Pola: email, hasło, potwierdzenie hasła.
  - Walidacja w locie (min. długość hasła 8, zgodność haseł, poprawny format email).
  - Fetch POST do `/api/auth/register`.
- `LoginForm.tsx`:
  - Pola: email, hasło.
  - Walidacja (wymagane, format email).
  - Fetch POST do `/api/auth/login`.
- `ForgotPasswordForm.tsx`:
  - Pole: email.
  - Wywołuje POST `/api/auth/forgot-password`, po sukcesie wyświetla komunikat "Sprawdź skrzynkę pocztową".
- `ResetPasswordForm.tsx`:
  - Pola: nowe hasło, potwierdzenie hasła.
  - Walidacja jak w rejestracji.
  - Fetch POST do `/api/auth/reset-password` z tokenem z query.
- `UserMenu.tsx`:
  - Wyświetla email użytkownika i przycisk "Wyloguj się" → wywołanie POST `/api/auth/logout`.

### 1.3 Oddzielenie odpowiedzialności
- Strony Astro: ładowanie odpowiedniego layoutu, przekazanie parametrów z URL do props komponentu React oraz SSR (ograniczony do pobrania tokena z query).
- Komponenty React: logika formularzy, walidacja klienta, wywołania fetch, obsługa odpowiedzi, zarządzanie stanem (np. React Hook Form, useState).

### 1.4 Walidacja i komunikaty błędów
- Pola wymagane: podświetlenie na czerwono + opis "To pole jest wymagane".
- Błędny format email: "Nieprawidłowy format adresu e-mail".
- Hasło za krótkie: "Hasło musi mieć co najmniej 8 znaków".
- Niezgodność haseł: "Hasła nie są zgodne".
- Globalne alerty dla odpowiedzi z API (np. "Rejestracja powiodła się, nastąpi przekierowanie...", "Błąd logowania: nieprawidłowe dane").
- Obsługa stanów ładowania i disabled przycisku, aby zapobiegać wielokrotnemu submicie.

### 1.5 Kluczowe scenariusze
1. Rejestracja → po sukcesie automatyczne zalogowanie i redirect do `/generate`.
2. Logowanie → redirect do `/generate`, przy błędzie komunikat.
3. Wylogowanie → usunięcie sesji i redirect do `/login`.
4. Odzyskiwanie hasła → wysłanie maila, komunikat i redirect do `/login`.
5. Reset hasła przez link z maila → pobranie tokena, ustawienie nowego hasła i redirect do `/login`.

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów (`src/pages/api/auth`)
- `register.ts`      – `POST /api/auth/register`
- `login.ts`         – `POST /api/auth/login`
- `logout.ts`        – `POST /api/auth/logout`
- `forgot-password.ts` – `POST /api/auth/forgot-password`
- `reset-password.ts`  – `POST /api/auth/reset-password`

#### Kontrakty i schematy:
- register: `{ email: string; password: string; confirmPassword: string }`
- login: `{ email: string; password: string }`
- forgot-password: `{ email: string }`
- reset-password: `{ access_token: string; password: string; confirmPassword: string }`

### 2.2 Walidacja danych wejściowych
- Użyć biblioteki Zod do zdefiniowania schematów (email, password, confirmPassword).
- Early-return w przypadku błędów walidacji: status 400 + JSON `{ error: true, message: string, details?: Record }`.

### 2.3 Obsługa wyjątków
- Każdy endpoint w `try/catch`:
  - Logowanie błędu (console lub dedykowany logger).
  - Odpowiedź 500 + ustandaryzowany komunikat "Wystąpił błąd wewnętrzny".
- Dla błędów Supabase Auth zwrócić 4xx z komunikatem z supabase.

## 3. SYSTEM AUTENTYKACJI – SUPABASE AUTH

### 3.1 Konfiguracja klienta
- `src/db/supabaseClient.ts`:
  - Inicjalizacja `createClient` z URL i Kluczem z ENV.
  - Eksport instancji do użycia w API i client-side.

### 3.2 Rejestracja i logowanie
- Rejestracja: `supabase.auth.signUp({ email, password })`.
- Logowanie: `supabase.auth.signInWithPassword({ email, password })`.
- Po sukcesie użyć `setAuthCookie` (Astro) lub ustawić HttpOnly cookie z tokenem i refresh token.

### 3.3 Wylogowywanie
- `supabase.auth.signOut()` na serwerze → usunięcie cookie.

### 3.4 Odzyskiwanie hasła
- Endpoint wysyła maila z linkiem: `supabase.auth.resetPasswordForEmail(email, { redirectTo: process.env.SITE_URL + '/reset-password' })`.
- Link: `/reset-password?access_token=…`.
- Na stronie resetu: odczyt `access_token` z query i przekazanie do komponentu React.
- Zmiana hasła: `supabase.auth.updateUser({ password }, { accessToken: token })`.

### 3.5 Ścieżki chronione i middleware
- W `src/middleware/index.ts`:
  - Funkcja `protectRoute(request, response)`:
    - Odczyt HttpOnly cookie z request.
    - `supabase.auth.getUser()` lub weryfikacja JWT.
    - Jeżeli brak sesji → redirect do `/login`.
  - Zastosować middleware do ścieżek takich jak `/generate`, `/cards`, `/profile`.

### 3.6 Przepływ danych i sesji
- Sesje przechowywane w HttpOnly cookie, CSRF-safe.
- Po każdej akcji auth automatycznie odświeżać tokeny.
- W client-side używać `supabase.auth.getSession()` do sprawdzenia stanu zalogowania.

---

*Specyfikacja przygotowana w oparciu o PRD (US-001, US-002) oraz tech stack: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui, Supabase Auth.* 