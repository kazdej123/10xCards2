# Plan Testów Projektu 10xCards2

## 1. Wprowadzenie i cele testowania

### 1.1 Wprowadzenie
Niniejszy dokument przedstawia plan testów dla aplikacji internetowej 10xCards2. Aplikacja ta umożliwia użytkownikom generowanie, zarządzanie i udostępnianie zestawów fiszek edukacyjnych z wykorzystaniem technologii AI w oparciu o wybrany stos technologiczny. Projekt wykorzystuje technologie takie jak Astro, React, TypeScript, Zustand, Tailwind CSS oraz Supabase do autentykacji.

### 1.2 Cele testowania
Głównymi celami testowania projektu 10xCards2 są:
- Weryfikacja zgodności funkcjonalnej aplikacji z jej przeznaczeniem (generowanie fiszek, zarządzanie kolekcjami, autentykacja, integracja z AI)
- Zapewnienie wysokiej jakości i niezawodności aplikacji
- Identyfikacja i raportowanie defektów w celu ich naprawy przed wdrożeniem
- Ocena użyteczności i doświadczenia użytkownika (UX)
- Weryfikacja poprawności działania aplikacji na różnych przeglądarkach i urządzeniach
- Zapewnienie bezpieczeństwa danych użytkowników i procesów autentykacji
- Weryfikacja poprawności integracji z usługami zewnętrznymi (Supabase, OpenRouter)
- Potwierdzenie poprawności generowanych fiszek dla różnych środowisk AI

## 2. Zakres testów

### 2.1 Funkcjonalności objęte testami:
- **Moduł Generacji Fiszek (AI Generation)**:
  - Interfejs wprowadzania tekstu źródłowego
  - Działanie mechanizmu generacji AI
  - Wizualizacja wybranych elementów i ich liczników
  - Funkcjonalność wyszukiwania, filtrowania, sortowania i obsługi stanu "brak wyników"
  - Wyświetlanie wybranych fiszek w sekcji "Generated Flashcards"
  - Funkcjonalność pojedynczych fiszek z sekcji "Generated Flashcards"
  - Usuwanie pojedynczych fiszek z sekcji "Generated Flashcards"
  - Funkcjonalność "Clear All"
  - Poprawność wyświetlania tłumaczeń (i18n)
  - Dostępność (nawigacja klawiaturą, czytniki ekranu)

- **Moduł Zarządzania Fiszkami (Flashcard Management)**:
  - Wyświetlanie listy fiszek użytkownika
  - Rozwijanie i zwijanie paska bocznego
  - Wyświetlanie listy kolekcji użytkownika
  - Sortowanie i filtrowanie kolekcji, podczas pobierania kolekcji
  - Wyświetlanie informacji o konieczności zalogowania dla niezalogowanych użytkowników
  - Tworzenie nowej kolekcji (dialog, walidacja, zapis przez API)
  - Edycja nazwy/opisu kolekcji (dialog, zapis przez API, aktualizacja listy)
  - Usuwanie kolekcji (dialog potwierdzający, usuwanie przez API, aktualizacja listy)
  - Wybranie istniejącej kolekcji (ładowanie odpowiednich bibliotek do RuleBuilder, aktualizacja techStackStore)
  - Edycja nazwy i opisu kolekcji (dialog, zapis przez API)
  - Usuwanie kolekcji (dialog potwierdzający, usuwanie przez API, aktualizacja listy)
  - Wylogowanie czysty listę kolekcji i resetuje stan original Libraries
  - Obsługa dialogu niezapisanych zmian przy próbie przełączenia kolekcji lub tworzenia nowej

- **Moduł Autentykacji**:
  - Formularz logowania (walidacja pól, proces logowania przez API, obsługa błędów, przekierowanie)
  - Formularz rejestracji (walidacja pól, proces rejestracji, obsługa błędów)
  - Formularz resetowania hasła (walidacja email, komunikat po wysłaniu)
  - Proces wylogowania (przez API, aktualizacja stanu authStore, przekierowanie)
  - Ochrona tras - próba dostępu do /auth bez logowania przekierowuje na /auth/login
  - Zalogowany użytkownik próbujący wejść na /auth/login jest przekierowywany na /
  - Poprawne wyświetlanie informacji o użytkowniku (email) w Topbar
  - Zarządzanie sesją użytkownika (ciasteczka Supabase)

- **Moduł Responsywności i UI**:
  - Responsywność interfejsu użytkownika (Mobile, Tablet, Desktop)
  - Wizualna integracja (Tailwind CSS, theming)
  - Poprawność działania komponentów UI (Accordion, ConfirmDialog)
  - Integracja z Supabase (Auth, Database API)
  - Obsługa błędów API i wyświetlanie komunikatów użytkownikom
  - Dostępność (WCAG)
  - Podstawowe testy bezpieczeństwa

## 3. Typy testów do przeprowadzenia
W ramach projektu zostaną przeprowadzone następujące typy testów:

- **Testy jednostkowe (Unit Tests)**:
  - Cel: Weryfikacja poprawności działania izolowanych jednostek kodu (funkcje pomocnicze, logika store'ów Zustand, komponenty React z prostą logiką, logika parsowania zależności)
  - Narzędzia: Vitest, React Testing Library

- **Testy integracyjne (Integration Tests)**:
  - Cel: Weryfikacja współpracy między różnymi modułami i komponentami (np. RuleBuilder <-> RulePreview, komponenty UI <-> Store'y Zustand, komponenty <-> API Astro, API Astro <-> Supabase)
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
- **TC-GEN-08**: Bulk save wybranych fiszek do kolekcji

### 4.2 Zarządzanie fiszkami:

- **TC-FLASH-01**: Wyświetlanie listy fiszek użytkownika z paginacją
- **TC-FLASH-02**: Ręczne tworzenie nowej fiszki (formularz przód/tył)
- **TC-FLASH-03**: Edycja istniejącej fiszki z walidacją formularza
- **TC-FLASH-04**: Usuwanie pojedynczej fiszki z potwierdzeniem
- **TC-FLASH-05**: Bulk operations - masowe operacje na fiszkach
- **TC-FLASH-06**: Wyszukiwanie fiszek po zawartości
- **TC-FLASH-07**: Organizacja fiszek w kolekcje

### 4.3 Kolekcje (Zarządzanie kolekcjami):

- **TC-COL-01**: Niezalogowany użytkownik widzi komunikat o konieczności logowania w pasku kolekcji
- **TC-COL-02**: Zalogowany użytkownik widzi listę swoich kolekcji
- **TC-COL-03**: Utworzenie nowej kolekcji (walidacja nazwy/opisu, zapis, pojawienie się na liście, automatyczne wybranie)
- **TC-COL-04**: Wybranie istniejącej kolekcji ładuje jej biblioteki do RuleBuilder
- **TC-COL-05**: Edycja nazwy/opisu kolekcji zapisuje zmiany i aktualizuje widok
- **TC-COL-06**: Usunięcie kolekcji (potwierdzenie) usuwa ją z listy i resetuje selekcję wyboru
- **TC-COL-07**: Modyfikacja wybranej kolekcji (dodanie/usunięcie bibliotek) aktywuje przycisk "Zapisz zmiany"
- **TC-COL-08**: Zapisanie zmian aktualizuje kolekcję i resetuje stan "dirty"
- **TC-COL-09**: Próba przełączenia na inną kolekcję przy niezapisanych zmianach wyświetla dialog (test opcji Zapisz/Porzuć/Anuluj)
- **TC-COL-10**: Wylogowanie czyści listę kolekcji i resetuje stan

### 4.4 Autentykacja:

- **TC-AUTH-01**: Pomyślne logowanie z poprawnymi danymi
- **TC-AUTH-02**: Nieudane logowanie z błędnymi danymi (poprawny komunikat błędu)
- **TC-AUTH-03**: Pomyślna rejestracja nowego użytkownika
- **TC-AUTH-04**: Nieudana rejestracja (np. email zajęty, słabe hasło)
- **TC-AUTH-05**: Pomyślne wylogowanie
- **TC-AUTH-06**: Ochrona tras - próba dostępu do chronionych zasobów bez logowania przekierowuje na /auth/login
- **TC-AUTH-07**: Ochrona API - próba dostępu do /api/collections bez logowania zwraca 401
- **TC-AUTH-08**: Zalogowany użytkownik próbujący wejść na /auth/login jest przekierowywany na /
- **TC-AUTH-09**: Reset hasła - wysyłka emaila i proces zmiany hasła
- **TC-AUTH-10**: Weryfikacja Row Level Security w Supabase

### 4.5 Responsywność i cross-browser:

- **TC-RESP-01**: Aplikacja działa poprawnie na różnych rozdzielczościach (Mobile, Tablet, Desktop)
- **TC-RESP-02**: Testowanie w różnych przeglądarkach (Chrome, Firefox, Safari, Edge)
- **TC-RESP-03**: Komponenty UI adaptują się do różnych rozmiarów ekranu
- **TC-RESP-04**: Navigation i interakcje touch działają na urządzeniach mobilnych
- **TC-RESP-05**: Performance na urządzeniach o niższej wydajności

### 4.6 API Endpoints:

- **TC-API-01**: `GET /api/flashcards` – autoryzacja, zwracane dane, kody odpowiedzi
- **TC-API-02**: `POST /api/flashcards` – walidacja payload, wstawianie do DB
- **TC-API-03**: `POST /api/generations` – komunikacja z OpenRouter, obsługa błędów zewnętrznych
- **TC-API-04**: Ścieżki auth: rejestracja, login, logout, refresh token
- **TC-API-05**: Rate limiting i throttling API endpoints
- **TC-API-06**: Error handling i response codes

### 4.7 Metryki i analityka:

- **TC-METR-01**: Śledzenie współczynnika akceptacji AI-generowanych fiszek (cel: 75%)
- **TC-METR-02**: Zliczanie stosunku fiszek AI vs. ręcznych (cel: 75% AI)
- **TC-METR-03**: Monitorowanie wydajności generacji fiszek
- **TC-METR-04**: Analiza jakości odpowiedzi AI różnych modeli
- **TC-METR-05**: Tracking user engagement i retention

## 5. Środowisko testowe

### Środowiska:
- **Lokalne (Developerskie)**: Używane przez deweloperów do testów jednostkowych i integracyjnych podczas rozwoju
- **Testowe/Staging**: Dedykowane środowisko QA, odzwierciedlające środowisko produkcyjne. Powinno zawierać osobną instancję Supabase (lub dane testowe w głównej instancji oddzielone np. przez RLS). Używane do testów integracyjnych, E2E, manualnych, UAT
- **Produkcyjne**: Środowisko live. Ograniczone testy (smoke tests) po wdrożeniu

### Przeglądarki:
- Google Chrome (najnowsza wersja)
- Mozilla Firefox (najnowsza wersja)  
- Apple Safari (najnowsza wersja)

### Urządzenia:
- Desktop (Windows, macOS)
- Symulacja urządzeń mobilnych (Chrome DevTools) dla testów responsywności. W miarę możliwości testy na fizycznych urządzeniach (iOS, Android)

### Dane testowe:
- Konta użytkowników testowych (różne role, jeśli dotyczy)
- Przykładowe kolekcje fiszek
- Przykładowe pliki dependencies (package.json, requirements.txt) z różnymi zestawami bibliotek, w tym rzadkimi i nieobsługiwanymi

## 6. Narzędzia do testowania

- **Vitest** + **React Testing Library** (testy jednostkowe)
- **Playwright** (testy E2E) 
- **MSW (Mock Service Worker)** (mockowanie API)
- **Supertest** (automatyczne testy API)
- **Artillery** + **Lighthouse** (wydajność)
- **Chromatic/Percy** (visual regression)
- **axe-core** + **Lighthouse** (dostępność)
- **ESLint**, **Prettier**, **TailwindCSS Linter**
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
| Faza                             | Czas trwania   | Odpowiedzialny |
|----------------------------------|----------------|----------------|
| Przygotowanie środowiska i setup narzędzi | 1.5 dnia | QA Engineer + DevOps |
| Testy jednostkowe                | 2 dni          | Developers |
| Testy integracyjne               | 2 dni          | QA Engineer |
| Testy E2E i cross-browser        | 2.5 dnia       | QA Engineer |
| Testy eksploracyjne i manualne   | 1.5 dnia       | QA Engineer |
| Testy wydajności i bezpieczeństwa| 1 dzień        | QA Lead + DevOps |
| Visual regression i accessibility| 1 dzień        | QA Engineer |
| Testy UAT                        | 1 dzień        | Product Owner |
| Raportowanie i zamknięcie        | 1 dzień        | QA Lead |
| **RAZEM**                        | **13 dni**     | |

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
- **Astro Islands**: Szczególna uwaga na testowanie partial hydration i interakcji między wyspami
- **Supabase RLS**: Weryfikacja Row Level Security dla każdego endpoint'u  
- **OpenRouter**: Testowanie różnych modeli AI i ich responsów, handling quota limits
- **Performance**: Monitorowanie Core Web Vitals, szczególnie dla generacji fiszek
- **Security**: OWASP Top 10, sanityzacja input'ów, CSRF protection
- **Cross-browser compatibility**: Szczególna uwaga na Safari i jego specyficzne zachowania
- **Mobile performance**: Testowanie na urządzeniach o ograniczonej mocy obliczeniowej

---
*Dokument zaktualizowany z uwzględnieniem najlepszych praktyk testowania opartych na wzorcu 10xRules.ai oraz nowoczesnych technologii Astro/React.*