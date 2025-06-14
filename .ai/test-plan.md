# Plan Testów Projektu 10xCards2

## 1. Wprowadzenie i cele testowania

### 1.1 Wprowadzenie

Niniejszy dokument przedstawia plan testów dla aplikacji internetowej 10xCards2. Aplikacja ta umożliwia użytkownikom generowanie, zarządzanie zestawów fiszek edukacyjnych z wykorzystaniem technologii AI w oparciu o wybrany stos technologiczny. Projekt wykorzystuje technologie takie jak Astro 5, React 19, TypeScript 5, Tailwind 4, Shadcn/ui oraz Supabase do autentykacji i bazy danych.

### 1.2 Cele testowania

Głównymi celami testowania projektu 10xCards2 są:

- Weryfikacja zgodności funkcjonalnej aplikacji z jej przeznaczeniem (generowanie fiszek przez AI, ręczne zarządzanie fiszkami, autentykacja)
- Zapewnienie wysokiej jakości i niezawodności aplikacji
- Identyfikacja i raportowanie defektów w celu ich naprawy przed wdrożeniem
- Ocena użyteczności i doświadczenia użytkownika (UX)
- Weryfikacja poprawności działania aplikacji na różnych przeglądarkach i urządzeniach
- Zapewnienie bezpieczeństwa danych użytkowników i procesów autentykacji
- Weryfikacja poprawności integracji z usługami zewnętrznymi (Supabase, OpenRouter)
- Potwierdzenie poprawności generowanych fiszek przez AI
- Weryfikacja metryk sukcesu (75% akceptacji AI-generowanych fiszek, 75% użycia AI)

## 2. Zakres testów

### 2.1 Funkcjonalności objęte testami:

- **Moduł Generacji Fiszek (AI Generation)**:

  - Interfejs wprowadzania tekstu źródłowego
  - Działanie mechanizmu generacji AI
  - Wyświetlanie wygenerowanych propozycji fiszek
  - Funkcjonalność akceptacji, edycji i odrzucania pojedynczych fiszek
  - Bulk save wybranych fiszek
  - Obsługa błędów API i walidacji
  - Dostępność (nawigacja klawiaturą, czytniki ekranu)

- **Moduł Zarządzania Fiszkami (Flashcard Management)**:

  - Wyświetlanie listy fiszek użytkownika z paginacją
  - Ręczne tworzenie nowych fiszek (formularz przód/tył)
  - Edycja istniejących fiszek (formularz z walidacją)
  - Usuwanie pojedynczych fiszek (z potwierdzeniem)
  - Wyszukiwanie fiszek po zawartości
  - Sortowanie i filtrowanie fiszek
  - Wyświetlanie informacji o konieczności zalogowania dla niezalogowanych użytkowników

- **Moduł Autentykacji**:

  - Formularz logowania (walidacja pól, proces logowania przez API, obsługa błędów, przekierowanie)
  - Formularz rejestracji (walidacja pól, proces rejestracji, obsługa błędów)
  - Formularz resetowania hasła (walidacja email, komunikat po wysłaniu)
  - Proces wylogowania (przez API, aktualizacja stanu authStore, przekierowanie)
  - Ochrona tras - próba dostępu do chronionych tras bez logowania przekierowuje na /login
  - Zalogowany użytkownik próbujący wejść na /login jest przekierowywany na /
  - Poprawne wyświetlanie informacji o użytkowniku (email) w Topbar
  - Zarządzanie sesją użytkownika (ciasteczka Supabase)

- **Moduł Responsywności i UI**:
  - Responsywność interfejsu użytkownika (Mobile, Tablet, Desktop)
  - Wizualna integracja (Tailwind 4, theming)
  - Poprawność działania komponentów Shadcn/ui (Button, Dialog, Form, Input, Textarea)
  - Integracja z Supabase (Auth, Database API)
  - Obsługa błędów API i wyświetlanie komunikatów użytkownikom
  - Dostępność (WCAG AA)
  - Podstawowe testy bezpieczeństwa (OWASP Top 10)

## 3. Typy testów do przeprowadzenia

W ramach projektu zostaną przeprowadzone następujące typy testów:

- **Testy jednostkowe (Unit Tests)**:

  - Cel: Weryfikacja poprawności działania izolowanych jednostek kodu (funkcje pomocnicze, komponenty React z prostą logiką, walidatory formularzy, utility functions)
  - Narzędzia: Vitest, React Testing Library

- **Testy integracyjne (Integration Tests)**:

  - Cel: Weryfikacja współpracy między różnymi modułami i komponentami (komponenty React <-> API Astro, API Astro <-> Supabase, API Astro <-> OpenRouter, komponenty UI flow)
  - Narzędzia: Vitest, React Testing Library, Mock Service Worker (MSW) do mockowania API

- **Testy End-to-End (E2E Tests)**:

  - Cel: Weryfikacja kompletnych przepływów użytkownika z perspektywy przeglądarki, symulując realne interakcje
  - Narzędzia: Playwright

- **Testy wizualne (Visual Regression Tests)**:

  - Cel: Wykrywanie niezamierzonych zmian w interfejsie użytkownika poprzez porównywanie zrzutów ekranu
  - Narzędzia: Chromatic/Percy (dedykowane narzędzie jak Storybook będzie używany szerzej)

- **Testy dostępności (Accessibility Tests)**:

  - Cel: Zapewnienie zgodności z wytycznymi WCAG (np. AA)
  - Narzędzia: axe-core (automatyczna), manualna weryfikacja (nawigacja klawiaturą, czytniki ekranu)

- **Testy manualne eksploracyjne (Manual Exploratory Tests)**:

  - Cel: Eksploracja aplikacji w celu znalezienia nieoczywistych błędów, ocena UX/UI

- **Testy akceptacyjne użytkownika (UAT)**:
  - Cel: Potwierdzenie przez interesariuszy, że aplikacja spełnia wymagania biznesowe

## 4. Scenariusze testowe (Kluczowe funkcjonalności)

Poniżej przedstawiono przykładowe, wysokopoziomowe scenariusze testowe. Szczegółowe przypadki testowe zostaną opracowane oddzielnie.

### 4.1 Generacja fiszek:

- **TC-GEN-01**: Walidacja długości tekstu wejściowego (1000-10000 znaków zgodnie z PRD)
- **TC-GEN-02**: Inicjacja żądania generacji z prawidłowym tekstem aktualizuje stan loading
- **TC-GEN-03**: Komunikacja z OpenRouter - obsługa różnych modeli AI i rate limiting
- **TC-GEN-04**: Otrzymanie i poprawne wyświetlenie wygenerowanych fiszek
- **TC-GEN-05**: Obsługa błędów zewnętrznych (OpenRouter downtime, quota exceeded)
- **TC-GEN-06**: Filtrowanie i sortowanie wygenerowanych fiszek
- **TC-GEN-07**: Selekcja pojedynczych fiszek do akceptacji
- **TC-GEN-08**: Bulk save wybranych fiszek

### 4.2 Zarządzanie fiszkami:

- **TC-FLASH-01**: Wyświetlanie listy fiszek użytkownika z paginacją
- **TC-FLASH-02**: Ręczne tworzenie nowej fiszki (formularz przód/tył)
- **TC-FLASH-03**: Edycja istniejącej fiszki z walidacją formularza
- **TC-FLASH-04**: Usuwanie pojedynczej fiszki z potwierdzeniem
- **TC-FLASH-05**: Wyszukiwanie fiszek po zawartości

### 4.3 Autentykacja:

- **TC-AUTH-01**: Pomyślne logowanie z poprawnymi danymi
- **TC-AUTH-02**: Nieudane logowanie z błędnymi danymi (poprawny komunikat błędu)
- **TC-AUTH-03**: Pomyślna rejestracja nowego użytkownika
- **TC-AUTH-04**: Nieudana rejestracja (np. email zajęty, słabe hasło)
- **TC-AUTH-05**: Pomyślne wylogowanie
- **TC-AUTH-06**: Ochrona tras - próba dostępu do chronionych zasobów bez logowania przekierowuje na /login
- **TC-AUTH-07**: Ochrona API - próba dostępu do /api/flashcards bez logowania zwraca 401
- **TC-AUTH-08**: Zalogowany użytkownik próbujący wejść na /login jest przekierowywany na /
- **TC-AUTH-09**: Reset hasła - wysyłka emaila i proces zmiany hasła
- **TC-AUTH-10**: Weryfikacja Row Level Security w Supabase

### 4.4 Responsywność i cross-browser:

- **TC-RESP-01**: Aplikacja działa poprawnie na różnych rozdzielczościach (Mobile, Tablet, Desktop)
- **TC-RESP-02**: Testowanie w różnych przeglądarkach (Chrome, Firefox, Safari, Edge)
- **TC-RESP-03**: Komponenty UI adaptują się do różnych rozmiarów ekranu
- **TC-RESP-04**: Navigation i interakcje touch działają na urządzeniach mobilnych
- **TC-RESP-05**: Performance na urządzeniach o niższej wydajności

### 4.5 API Endpoints:

- **TC-API-01**: `GET /api/flashcards` – autoryzacja, zwracane dane, kody odpowiedzi
- **TC-API-02**: `POST /api/flashcards` – walidacja payload, wstawianie do DB
- **TC-API-03**: `POST /api/generations` – komunikacja z OpenRouter, obsługa błędów zewnętrznych
- **TC-API-04**: Ścieżki auth: rejestracja, login, logout, refresh token
- **TC-API-05**: Rate limiting i throttling API endpoints
- **TC-API-06**: Error handling i response codes

### 4.6 Metryki i analityka:

- **TC-METR-01**: Śledzenie współczynnika akceptacji AI-generowanych fiszek (cel: 75%)
- **TC-METR-02**: Zliczanie stosunku fiszek AI vs. ręcznych (cel: 75% AI)
- **TC-METR-03**: Monitorowanie wydajności generacji fiszek
- **TC-METR-04**: Analiza jakości odpowiedzi AI różnych modeli
- **TC-METR-05**: Tracking user engagement i retention

## 5. Środowisko testowe

### Środowiska:

- **Lokalne (Developerskie)**: Używane przez deweloperów do testów jednostkowych i integracyjnych podczas rozwoju
- **Testowe/Staging**: Dedykowane środowisko QA, odzwierciedlające środowisko produkcyjne. Zalecane użycie jednej instancji Supabase z oddzieleniem danych testowych przez Row Level Security (RLS). Używane do testów integracyjnych, E2E, manualnych, UAT
- **Produkcyjne**: Środowisko live. Ograniczone testy (smoke tests) po wdrożeniu

### Przeglądarki:

- Google Chrome (najnowsza wersja)
- Mozilla Firefox (najnowsza wersja)
- Apple Safari (najnowsza wersja)

### Urządzenia:

- Desktop (Windows, macOS)
- Symulacja urządzeń mobilnych (Chrome DevTools) dla testów responsywności. W miarę możliwości testy na fizycznych urządzeniach (iOS, Android)

### Dane testowe:

- Konta użytkowników testowych
- Przykładowe teksty do generacji fiszek (różne długości, języki, złożoność)
- Przykładowe fiszki utworzone ręcznie i przez AI

## 6. Narzędzia do testowania

- **Vitest** + **React Testing Library** (testy jednostkowe)
- **Playwright** (testy E2E)
- **MSW (Mock Service Worker)** (mockowanie API)
- **Lighthouse** (wydajność i dostępność)
- **axe-core** (dostępność)
- **ESLint**, **Prettier** (jakość kodu)
- **Sentry** (monitoring błędów)
- **Supabase CLI** (emulator lokalny)

### Narzędzia QA:

- **GitHub Issues** (wskazać narzędzie, np. Jira, GitHub Issues)
- **Format zgłoszenia**: Każdy zgłoszony błąd powinien zawierać:
  - **Tytuł**: Krótki, zwięzły opis problemu
  - **Środowisko**: Gdzie błąd został zaobserwowany (np. Testowe, Produkcyjne, przeglądarka, wersja)
  - **Kroki do reprodukcji**: Szczegółowa lista kroków odtwarzających błąd
  - **Wynik oczekiwany**: Jak system powinien się zachować
  - **Wynik rzeczywisty**: Jak system się zachował
  - **Priorytet/Waga**: (np. Krytyczny, Wysoki, Średni, Niski) - ocena wpływu błędu
  - **Załączniki**: Zrzuty ekranu, nagrania wideo, logi konsoli (jeśli relevantne)
  - **Przypisanie**: (Opcjonalnie) Sugerowany developer lub zespół

### Cykl życia błędu:

- **Nowy** -> **W analizie** -> **Do naprawy** -> **W trakcie naprawy** -> **Do weryfikacji** -> **Zamknięty/Odrzucony/Ponownie otwarty**

## 7. Harmonogram testów (Przykładowy)

| Faza                                      | Czas trwania | Odpowiedzialny       |
| ----------------------------------------- | ------------ | -------------------- |
| Przygotowanie środowiska i setup narzędzi | 1.5 dnia     | QA Engineer + DevOps |
| Testy jednostkowe                         | 2 dni        | Developers           |
| Testy integracyjne                        | 2 dni        | QA Engineer          |
| Testy E2E i cross-browser                 | 2.5 dnia     | QA Engineer          |
| Testy eksploracyjne i manualne            | 1.5 dnia     | QA Engineer          |
| Testy wydajności i bezpieczeństwa         | 1 dzień      | QA Lead + DevOps     |
| Visual regression i accessibility         | 1 dzień      | QA Engineer          |
| **Pierwszy cykl napraw**                  | **2 dni**    | **Developers**       |
| **Retesty po naprawach**                  | **1.5 dnia** | **QA Engineer**      |
| Testy UAT                                 | 1 dzień      | Product Owner        |
| **Drugi cykl napraw (opcjonalny)**        | **1 dzień**  | **Developers**       |
| Raportowanie i zamknięcie                 | 1 dzień      | QA Lead              |
| **RAZEM**                                 | **18 dni**   |                      |

## 8. Kryteria akceptacji testów

- Pokrycie testami jednostkowymi ≥ 90%
- 100% kluczowych scenariuszy E2E wykonanych pomyślnie
- Brak krytycznych i blokujących defektów
- Maksymalnie 2 defekty wysokiej wagi (major)
- Brak regresji wydajnościowej i dostępnościowej
- Weryfikacja metryk biznesowych (75% akceptacji AI, 75% użycia AI)
- Wszystkie testy cross-browser przechodzą pomyślnie
- Zero błędów dostępności na poziomie AA WCAG
- Zakończone testy UAT z akceptacją Product Ownera

## 9. Role i odpowiedzialności

### QA/Testerzy:

- **QA Lead**: Planowanie i nadzór nad testami, analiza metryk
- **QA Engineer**: Pisanie i wykonywanie testów, setup narzędzi
- Raportowanie i śledzenie błędów
- Komunikacja z zespołem developerskim i Product Ownerem na temat jakości
- Utrzymanie środowiska testowego (współnie z DevOps/Developerami)

### Developerzy:

- Pisanie testów jednostkowych i podstawowych integracyjnych
- Naprawa zgłoszonych błędów
- Code reviews pod kątem jakości i testowalności
- Wsparcie w diagnozowaniu problemów znalezionych przez QA

### Product Owner/Manager:

- Definiowanie wymagań i kryteriów akceptacji
- Priorytetyzacja błędów
- Przeprowadzanie testów UAT
- Podejmowanie decyzji o wydaniu produktu

### DevOps:

- Konfiguracja środowisk CI/CD, monitoring
- Utrzymanie środowiska testowego (współnie z DevOps/Developerami)

## 10. Procedury raportowania błędów

### Narzędzia: GitHub Issues

### Format zgłoszenia:

Każdy zgłoszony błąd powinien zawierać:

- **Tytuł**: Krótki, zwięzły opis problemu
- **Środowisko**: Gdzie błąd został zaobserwowany (np. Testowe, Produkcyjne, przeglądarka, wersja)
- **Kroki do reprodukcji**: Szczegółowa lista kroków odtwarzających błąd
- **Wynik oczekiwany**: Jak system powinien się zachować
- **Wynik rzeczywisty**: Jak system się zachował
- **Priorytet/Waga**: (np. Krytyczny, Wysoki, Średni, Niski) - ocena wpływu błędu
- **Załączniki**: Zrzuty ekranu, nagrania wideo, logi konsoli (jeśli relevantne)
- **Przypisanie**: (Opcjonalnie) Sugerowany developer lub zespół

### Cykl życia błędu:

**Nowy** -> **W analizie** -> **Do naprawy** -> **W trakcie naprawy** -> **Do weryfikacji** -> **Zamknięty/Odrzucony/Ponownie otwarty**

### Komunikacja:

Regularne przeglądy błędów (Bug Triage) w celu priorytetyzacji i omówienia statusu

1. Zgłoszenie błędu na GitHub Issues z etykietami: `bug`, priorytet, oraz kategoria (frontend/backend/integration)
2. Wypełnienie szablonu zgodnie z formatem powyżej
3. Klasyfikacja: blocker, critical, major, minor, trivial
4. Eskalacja krytycznych defektów do QA Lead i Product Ownera w ciągu 2h
5. Tracking metryk jakości i postępów w naprawie
6. Regularne review i aktualizacja statusów

## 11. Specjalne uwagi techniczne

- **Astro 5 Islands**: Szczególna uwaga na testowanie partial hydration i interakcji między wyspami React
- **Supabase RLS**: Weryfikacja Row Level Security dla endpoint'ów fiszek użytkowników
- **OpenRouter**: Testowanie różnych modeli AI, handling quota limits, rate limiting, timeout handling
- **Performance**: Monitorowanie Core Web Vitals, szczególnie dla generacji fiszek i ładowania list
  - Target metrics: LCP < 2.5s, FID < 100ms, CLS < 0.1
  - Generacja fiszek AI: timeout 60s, target response time < 30s
  - Ładowanie listy fiszek: target < 1s dla 100 elementów
- **Security**: OWASP Top 10, sanityzacja input'ów generacji AI, walidacja długości tekstu (1000-10000 znaków)
  - Input validation: XSS prevention, SQL injection protection
  - Authentication: JWT token validation, session management
  - Authorization: RLS policies verification, API endpoint protection
  - Data privacy: User data isolation, secure data transmission (HTTPS)
- **Cross-browser compatibility**: Szczególna uwaga na Safari i jego specyficzne zachowania z Astro
- **Mobile performance**: Testowanie na urządzeniach o ograniczonej mocy obliczeniowej
- **Shadcn/ui**: Testowanie komponentów UI pod kątem dostępności i responsywności
- **TypeScript 5**: Weryfikacja typów i zgodności z nowymi funkcjonalnościami
- **React 19**: Testowanie nowych hook'ów i concurrent features

## 12. Strategia testowania AI (AI Testing Strategy)

### Mockowanie vs rzeczywiste API:

- **Testy jednostkowe i integracyjne**: Mockowanie OpenRouter API za pomocą MSW (Mock Service Worker)
- **Testy E2E**: Użycie rzeczywistego OpenRouter API z ograniczonym budżetem testowym
- **Development**: Kombinacja mock'ów i rzeczywistego API w zależności od potrzeb

### Testowanie różnych scenariuszy AI:

- **Timeout handling**: Testowanie zachowania przy przekroczeniu 60-sekundowego limitu
- **Rate limiting**: Obsługa błędów quota exceeded i rate limit
- **Error codes**: Testowanie różnych kodów błędów OpenRouter (400, 429, 503)
- **Model availability**: Testowanie zachowania przy niedostępności wybranego modelu AI
- **Response validation**: Weryfikacja struktury i jakości odpowiedzi AI

### Dane testowe dla AI:

- Przygotowanie zestawu tekstów testowych różnej długości (1000-10000 znaków)
- Teksty w różnych językach i domenach (nauka, historia, nauki ścisłe)
- Edge cases: teksty z specjalnymi znakami, formatowaniem, długie akapity

### Metryki jakości AI:

- Monitoring czasu odpowiedzi generacji fiszek
- Śledzenie współczynnika sukcesu wywołań API
- Analiza jakości generowanych fiszek (czy są sensowne jako pytania/odpowiedzi)

---

_Dokument zaktualizowany zgodnie z aktualnym MVP, PRD i tech-stack projektu 10xCards2._
