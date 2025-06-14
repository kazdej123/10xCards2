# Plan Testów Projektu 10xCards2

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie wysokiej jakości i niezawodności aplikacji 10xCards2 poprzez weryfikację poprawności działania funkcjonalności, stabilności systemu oraz spełnienia wymagań biznesowych. Plan uwzględnia specyfikę architektury Astro z React oraz integrację z zewnętrznymi usługami (Supabase, OpenRouter).

## 2. Zakres testów
- Interfejs użytkownika (strony Astro + komponenty React)
- Architektura Astro (islands, SSR, hydration)
- Logika biznesowa (usługi generacji fiszek, integracja z OpenRouter)
- Endpoints API (`/api/auth`, `/api/flashcards`, `/api/generations`)
- Integracja z bazą danych Supabase (Row Level Security, real-time)
- Mechanizmy uwierzytelniania i autoryzacji
- Obsługa błędów i walidacja danych
- Wydajność oraz bezpieczeństwo krytycznych ścieżek
- Metryki biznesowe i statystyki użytkowania

## 3. Typy testów do przeprowadzenia
- Testy jednostkowe (Vitest + React Testing Library)
- Testy integracyjne (usługi, warstwa API, bazy danych z Supabase emulator)
- Testy end-to-end (Playwright)
- Testy regresyjne UI (Chromatic/Percy visual regression)
- Testy wydajnościowe (Lighthouse, Artillery)
- Testy bezpieczeństwa (skanery OWASP, ręczne próby ataków)
- Testy dostępności (axe-core, Lighthouse a11y)
- Testy architektury Astro (SSR, islands, hydration)

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autentykacja
- Rejestracja nowego użytkownika (pola wymagane, walidacja, obsługa błędów)
- Logowanie (poprawne dane, niepoprawne dane, blokada po X nieudanych próbach)
- Resetowanie hasła (wysyłka maila, zmiana hasła, ważność linku)
- Autoryzacja dostępu do chronionych zasobów
- Testowanie Row Level Security w Supabase

### 4.2 Generacja fiszek
- Walidacja długości tekstu wejściowego (1000-10000 znaków zgodnie z PRD)
- Inicjacja żądania generacji (walidacja pól tekstowych)
- Obsługa statusów (loading, błędy, timeout)
- Komunikacja z OpenRouter (rate limiting, różne modele AI)
- Otrzymanie i poprawne wyświetlenie wyników
- Obsługa błędów zewnętrznych (OpenRouter downtime, quota exceeded)

### 4.3 Zarządzanie fiszkami
- Wyświetlanie listy fiszek (pobieranie z API, paginacja)
- Ręczne tworzenie fiszek (formularz przód/tył)
- Zapisanie fiszek do bazy (bulk operations)
- Edycja i usuwanie pojedynczej fiszki
- Walidacja formularzy tworzenia i edycji

### 4.4 Endpoints API
- `GET /api/flashcards` – autoryzacja, zwracane dane, kody odpowiedzi
- `POST /api/flashcards` – walidacja payload, wstawianie do DB
- `POST /api/generations` – komunikacja z OpenRouter, obsługa błędów zewnętrznych
- Ścieżki auth: rejestracja, login, logout, refresh token
- Testowanie limitów i throttling

### 4.5 Walidacja i ograniczenia
- Walidacja długości tekstu wejściowego (1000-10000 znaków)
- Obsługa błędów przy przekroczeniu limitów OpenRouter
- Walidacja formularzy (rejestracja, logowanie, tworzenie fiszek)
- Sanityzacja danych wejściowych
- Testowanie edge cases (bardzo długie teksty, znaki specjalne)

### 4.6 Metryki i analityka
- Śledzenie współczynnika akceptacji AI-generowanych fiszek (cel: 75%)
- Zliczanie stosunku fiszek AI vs. ręcznych (cel: 75% AI)
- Testy raportowania metryk dla celów biznesowych
- Monitorowanie wydajności generacji fiszek
- Analiza jakości odpowiedzi AI

### 4.7 Architektura Astro
- Testowanie server-side rendering (SSR)
- Weryfikacja poprawnej hydration komponentów React
- Testowanie Astro islands (partial hydration)
- Wydajność ładowania stron (Time to Interactive)
- SEO i meta tags

## 5. Środowisko testowe
- Lokalny: Node.js 20+, emulator Supabase, mock OpenRouter (MSW)
- CI: GitHub Actions z uruchomieniem testów w kontenerze Docker
- Staging: testowa instancja Supabase, rzeczywiste OpenRouter z kluczem testowym i limitami

## 6. Narzędzia do testowania
- **Vitest** + React Testing Library (testy jednostkowe)
- **Playwright** (testy E2E)
- **MSW (Mock Service Worker)** (mockowanie API)
- **Supertest** (automatyczne testy API)
- **Artillery** + Lighthouse (wydajność)
- **Chromatic/Percy** (visual regression)
- **axe-core** + Lighthouse (dostępność)
- **ESLint**, **Prettier**, **TailwindCSS Linter**
- **Sentry** (monitoring błędów)
- **Supabase CLI** (emulator lokalny)

## 7. Harmonogram testów
| Faza                             | Czas trwania   |
|----------------------------------|----------------|
| Przygotowanie środowiska i setup MSW/Playwright | 1.5 dnia |
| Testy jednostkowe                | 2 dni          |
| Testy integracyjne               | 2 dni          |
| Testy E2E i Astro architecture   | 2.5 dnia       |
| Testy wydajności i bezpieczeństwa| 1 dzień        |
| Visual regression i accessibility| 1 dzień        |
| Raportowanie i zamknięcie         | 1 dzień        |

## 8. Kryteria akceptacji testów
- Pokrycie testami jednostkowymi ≥ 90%
- 100% scenariuszy E2E wykonanych pomyślnie
- Brak krytycznych i poważnych defektów
- Brak regresji wydajnościowej i dostępnościowej
- Weryfikacja metryk biznesowych (75% akceptacji AI, 75% użycia AI)
- Wszystkie testy Astro architecture przechodzą pomyślnie
- Zero błędów dostępności na poziomie AA

## 9. Role i odpowiedzialności
- **QA Lead**: planowanie i nadzór nad testami, analiza metryk
- **QA Engineer**: pisanie i wykonywanie testów, setup narzędzi
- **Developer**: naprawa zgłoszonych błędów, dostarczanie poprawionych buildów
- **Product Owner**: priorytetyzacja defektów, akceptacja wyników testów
- **DevOps**: konfiguracja środowisk CI/CD, monitoring

## 10. Procedury raportowania błędów
1. Zgłoszenie błędu na GitHub Issues z etykietami: `bug`, priorytet, oraz kategoria (frontend/backend/integration)
2. Wypełnienie szablonu: opis, kroki reprodukcji, oczekiwany vs rzeczywisty rezultat, zrzuty ekranu/logi, informacje o środowisku
3. Klasyfikacja: blocker, critical, major, minor, trivial
4. Eskalacja krytycznych defektów do QA Lead i Product Ownera w ciągu 2h
5. Tracking metryk jakości i postępów w naprawie

## 11. Specjalne uwagi techniczne
- **Astro Islands**: Szczególna uwaga na testowanie partial hydration i interakcji między wyspami
- **Supabase RLS**: Weryfikacja Row Level Security dla każdego endpoint'u
- **OpenRouter**: Testowanie różnych modeli AI i ich responsów, handling quota limits
- **Performance**: Monitorowanie Core Web Vitals, szczególnie dla generacji fiszek
- **Security**: OWASP Top 10, sanityzacja input'ów, CSRF protection

---
*Dokument zaktualizowany z uwzględnieniem najlepszych praktyk testowania aplikacji Astro/React z integracją zewnętrznych usług.*