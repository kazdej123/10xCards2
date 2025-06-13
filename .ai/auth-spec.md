# Specyfikacja modułu autentykacji – 10x-cards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1 Strony Astro i layouty
- Nowe strony w `src/pages`:
  - `src/pages/register.astro` – strona rejestracji.
  - `src/pages/login.astro` – strona logowania.
  - `src/pages/forgot-password.astro` – strona odzyskiwania hasła.
  - `src/pages/reset-password.astro` – strona ustawienia nowego hasła (odbiera `access_token` w query).
- Layouty:
  - `src/layouts/AuthLayout.astro` – dedykowany layout dla stron autoryzacji z minimalnym nagłówkiem i formularzem.
  - Modyfikacja istniejących layoutów:
    - Główny layout aplikacji z integracją stanu autoryzacji.

### 1.2 Struktura interfejsu i relacje komponentów
- **Strona główna** (`src/pages/index.astro`):
  - **Layout**: Utrzymuje spójny wygląd aplikacji, w tym tło, nagłówek i stopkę.
  - **Topbar** (komponent nawigacyjny):
    - Wyświetla logo, tytuł aplikacji oraz akcje użytkownika.
    - Rozszerzony o przyciski autoryzacyjne ("Logowanie", "Rejestracja") – przy niezalogowanym użytkowniku.
    - Po zalogowaniu przycisk "Wyloguj" pojawia się w miejscu opcji logowania.
    - Otrzymuje zalogowanego użytkownika jako props, który jest przekazywany do aplikacji React w celu inicjalizacji globalnego store (np. `authStore` z Zustand).
  - **Główna zawartość aplikacji**:
    - Dostęp do funkcjonalności generowania fiszek wymaga autoryzacji.
    - **Dostęp do pełnych funkcjonalności wymaga autoryzacji**. W przypadku braku logowania:
      - Aplikacja może wyświetlić komunikat typu "Zaloguj się, aby rozpocząć generowanie fiszek" lub żądać ograniczony widok demonstracyjny.

### 1.3 Komponenty React (`src/components/auth`)
- `RegisterForm.tsx`:
  - Pola: email, hasło, potwierdzenie hasła.
  - Walidacja w locie (min. długość hasła 8, zgodność haseł, poprawny format email).
  - Walidacja zgodności pola "hasło" z "potwierdzeniem hasła" przed wysłaniem.
  - Fetch POST do `/api/auth/register`.
- `LoginForm.tsx`:
  - Pola: email, hasło.
  - Link "Zapomniałeś hasła?" prowadzący do `/forgot-password`.
  - Walidacja (wymagane, format email).
  - Fetch POST do `/api/auth/login`.
- `ForgotPasswordForm.tsx`:
  - Pole: email.
  - Wywołuje POST `/api/auth/forgot-password`, po sukcesie wyświetla komunikat "Sprawdź skrzynkę pocztową".
  - Implementuje proces odzyskiwania hasła zgodnie z US-002B.
- `ResetPasswordForm.tsx`:
  - Pola: nowe hasło, potwierdzenie hasła.
  - Walidacja jak w rejestracji (min. 8 znaków, zgodność haseł).
  - Fetch POST do `/api/auth/reset-password` z tokenem z query.
  - Link resetowania hasła ważny przez ograniczony czas (24 godziny zgodnie z US-002B).
- `UserMenu.tsx`:
  - Wyświetla email użytkownika i przycisk "Wyloguj się" → wywołanie POST `/api/auth/logout`.

### 1.4 Globalne zarządzanie stanem autoryzacji
- **AuthStore** (Zustand):
  - Stan: `user`, `isAuthenticated`, `isLoading`.
  - Akcje: `login`, `logout`, `register`, `updateUser`.
  - Inicjalizacja na podstawie danych sesji z Supabase.
  - Automatyczna aktualizacja stanu po akcjach autoryzacyjnych.
  - Implementuje bezpieczny dostęp zgodnie z US-009 (tylko zalogowany użytkownik ma dostęp do swoich fiszek).

### 1.5 Oddzielenie odpowiedzialności
- Strony Astro: ładowanie odpowiedniego layoutu, przekazanie parametrów z URL do props komponentu React oraz SSR (ograniczony do pobrania tokena z query i sprawdzenia sesji).
- Komponenty React: logika formularzy, walidacja klienta, wywołania fetch, obsługa odpowiedzi, zarządzanie stanem (np. React Hook Form, useState).
- AuthStore: centralne zarządzanie stanem autoryzacji w całej aplikacji.

### 1.6 Walidacja i komunikaty błędów
- **Po stronie klienta**:
  - Przed wysłaniem formularza weryfikowane są:
    - Niepusty i poprawny format adresu email.
    - Minimalna długość hasła.
    - Zgodność hasła z potwierdzeniem.
  - W przypadku błędnych danych wyświetlane są komunikaty, np.:
    - "Nieprawidłowy adres email"
    - "Hasło musi zawierać co najmniej 8 znaków"
    - "Hasła nie są zgodne"
- **Po stronie serwera**:
  - Weryfikacja unikalności adresu email – komunikat błędu np. "Konto z tym adresem email już istnieje".
  - W przypadku nieprawidłowej próby logowania – komunikat "Nieprawidłowy email lub hasło".
- **Komunikaty błędów prezentowane są w zgodzie z design systemem** (Tailwind CSS, dark mode, Fluent 2.0).

### 1.7 Kluczowe scenariusze
1. **Rejestracja** → po sukcesie automatyczne zalogowanie i redirect do strony głównej z dostępem do generowania fiszek.
2. **Logowanie** → redirect do strony głównej, przy błędzie komunikat.
3. **Wylogowanie** → usunięcie sesji i redirect do `/login`.
4. **Odzyskiwanie hasła** → wysłanie maila, komunikat i pozostanie na stronie forgot-password.
5. **Reset hasła przez link z maila** → pobranie tokena (ważny 24h), ustawienie nowego hasła i redirect do `/login`.
6. **Bezpieczny dostęp (US-009)** → tylko zalogowany użytkownik może wyświetlać, edytować i usuwać swoje fiszki.

## 2. LOGIKA BACKENDOWA

### 2.1 Struktura endpointów (`src/pages/api/auth`)
- `register.ts`        – `POST /api/auth/register`
- `login.ts`           – `POST /api/auth/login`
- `logout.ts`          – `POST /api/auth/logout`
- `forgot-password.ts` – `POST /api/auth/forgot-password`
- `reset-password.ts`  – `POST /api/auth/reset-password`

#### Kontrakty i schematy:
- register: `{ email: string; password: string; confirmPassword: string }`
- login: `{ email: string; password: string }`
- forgot-password: `{ email: string }`
- reset-password: `{ access_token: string; password: string; confirmPassword: string }`

### 2.2 Modele danych
- **Supabase Auth**:
  - Główne dane użytkownika (email, hasło, id) są obsługiwane przez Supabase Auth.
  - Dodatkowe dane użytkownika mogą być przechowywane w tabeli `profiles` połączonej z `auth.users`.

### 2.3 Walidacja danych wejściowych
- Wykorzystanie biblioteki walidacyjnej (np. Zod) do:
  - Weryfikacji formatu email.
  - Sprawdzenia minimalnej długości hasła.
  - Weryfikacji zgodności pola "hasło" z "potwierdzeniem hasła" podczas rejestracji.
- Walidacja na poziomie API zwraca odpowiednie status HTTP (np. 400 dla błędnych danych) wraz z jasnym komunikatem w strukturze JSON.

### 2.4 Obsługa wyjątków
- Logika endpointów zabezpieczona jest za pomocą bloków try-catch.
- Wszelkie nieprzewidziane błędy są logowane na serwerze.
- Klient otrzymuje spójną strukturę błędu (np. kod statusu, wiadomość błędu), co umożliwia poprawne wyświetlenie informacji w interfejsie użytkownika.

## 3. SYSTEM AUTENTYKACJI – SUPABASE AUTH

### 3.1 Wykorzystanie Supabase Auth
- **Rejestracja**:
  - Metoda: `supabase.auth.signUp`
  - Proces: Użytkownik podaje email i hasło. Po rejestracji opcjonalnie wysłany jest mail weryfikacyjny.
- **Logowanie**:
  - Metoda: `supabase.auth.signInWithPassword`
  - Proces: Przekazanie emaila oraz hasła. W przypadku niepowodzenia zwracany jest błąd autentykacji.
- **Wylogowanie**:
  - Metoda: `supabase.auth.signOut`
  - Proces: Użytkownik kończy sesję, a globalny stan (np. `authStore`) jest aktualizowany.
- **Odzyskiwanie hasła**:
  - Metoda: `supabase.auth.resetPasswordForEmail`
  - Proces: Użytkownik inicjuje proces resetowania hasła poprzez wpisanie adresu email, co skutkuje wysłaniem instrukcji resetowania hasła.

### 3.2 Integracja z Astro i zarządzanie stanem
- **Przekazywanie użytkownika jako props**:
  - Strona główna (`src/pages/index.astro`) pobiera dane zalogowanego użytkownika (np. z sesji Supabase) przed renderowaniem.
  - Dane użytkownika przekazywane są jako props do głównych komponentów React oraz do inicjalizacji `authStore` w Zustand.
- **Middleware**:
  - Aktualizacja middleware w `src/middleware/index.ts` w celu zabezpieczenia endpointów i stron wymagających autoryzacji, np. poprzez sprawdzenie obecności ważnego tokenu JWT.
- **Zarządzanie stanem**:
  - Użycie Zustand (np. `authStore`) do przechowywania i aktualizacji stanu użytkownika (dane sesji, token, informacje o zalogowaniu).
  - Dynamiczna modyfikacja interfejsu (Topbar, CollectionsSidebar) w zależności od stanu autoryzacji.

### 3.3 Bezpieczeństwo
- Wszystkie operacje autoryzacyjne odbywają się po stronie backendu w bezpiecznym środowisku (HTTPS).
- Używanie ciasteczek do przechowywania tokenów JWT w sposób bezpieczny (np. HttpOnly, Secure).
- Stosowanie ochrony przed atakami CSRF i XSS.
- Brak wykorzystania zewnętrznych serwisów logowania (zgodnie z wymaganiami PRD sekcja 3.3).
- Implementacja wymagań US-009: zabezpieczenie dostępu do danych użytkownika - tylko zalogowany użytkownik może wyświetlać, edytować i usuwać swoje fiszki.
- Brak dostępu do fiszek innych użytkowników ani możliwości współdzielenia (US-009).

---

**Podsumowanie**: Przedstawiona specyfikacja zapewnia kompleksową integrację modułu rejestracji i logowania użytkowników, spójną z istniejącą architekturą aplikacji opartą na Astro, React, Supabase Auth, Tailwind CSS oraz Zustand. System gwarantuje przejrzystą walidację danych, obsługę wyjątków oraz bezpieczne zarządzanie sesjami przez przekazywanie danych sesji jako props do klienta, umożliwiając dostęp do chronionych funkcjonalności (np. kolekcje reguł).

*Specyfikacja przygotowana w oparciu o PRD (US-001, US-002, US-002B, US-009) oraz tech stack: Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui, Supabase Auth.* 