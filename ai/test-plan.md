# Plan Testów Projektu 10xCards2

## 1. Wprowadzenie i cele testowania
Celem testowania jest zapewnienie wysokiej jakości i niezawodności aplikacji 10xCards2 poprzez weryfikację poprawności działania funkcjonalności, stabilności systemu oraz spełnienia wymagań biznesowych.

## 2. Zakres testów
- Interfejs użytkownika (strony Astro + komponenty React)
- Logika biznesowa (usługi generacji fiszek, integracja z OpenRouter)
- Endpoints API (`/api/auth`, `/api/flashcards`, `/api/generations`)
- Integracja z bazą danych Supabase
- Mechanizmy uwierzytelniania i autoryzacji
- Obsługa błędów i walidacja danych
- Wydajność oraz bezpieczeństwo krytycznych ścieżek

## 3. Typy testów do przeprowadzenia
- Testy jednostkowe (TypeScript/Vitest, React Testing Library)
- Testy integracyjne (usługi, warstwa API, bazy danych z Supabase emulator)
- Testy end-to-end (Playwright lub Cypress)
- Testy regresyjne UI (visual regression)
- Testy wydajnościowe (Lighthouse, k6)
- Testy bezpieczeństwa (skanery OWASP, ręczne próby ataków)
- Testy dostępności (axe-core, Lighthouse a11y)

## 4. Scenariusze testowe dla kluczowych funkcjonalności

### 4.1 Autentykacja
- Rejestracja nowego użytkownika (pola wymagane, walidacja, obsługa błędów)
- Logowanie (poprawne dane, niepoprawne dane, blokada po X nieudanych próbach)
- Resetowanie hasła (wysyłka maila, zmiana hasła)

### 4.2 Generacja fiszek
- Inicjacja żądania generacji (walidacja pól tekstowych)
- Obsługa statusów (loading, błędy, timeout)
- Otrzymanie i poprawne wyświetlenie wyników

### 4.3 Zarządzanie fiszkami
- Wyświetlanie listy fiszek (pobieranie z API, paginacja)
- Zapisanie fiszek do bazy (BulkSaveButton)
- Edycja i usuwanie pojedynczej fiszki (FlashcardListItem)

### 4.4 Endpoints API
- `GET /api/flashcards` – autoryzacja, zwracane dane, kody odpowiedzi
- `POST /api/flashcards` – walidacja payload, wstawianie do DB
- `POST /api/generations` – komunikacja z OpenRouter, obsługa błędów zewnętrznych
- Ścieżki auth: rejestracja, login, logout, refresh token

## 5. Środowisko testowe
- Lokalny: Node.js 18+, emulator Supabase, mock OpenRouter (nock)
- CI: GitHub Actions z uruchomieniem testów w kontenerze Docker
- Staging: testowa instancja Supabase, rzeczywiste OpenRouter z kluczem testowym

## 6. Narzędzia do testowania
- Vitest / Jest + React Testing Library
- Playwright (E2E)
- Postman / Insomnia (testy manualne API)
- k6 (wydajność)
- axe-core / Lighthouse (dostępność)
- ESLint, Prettier, TailwindCSS Linter
- Sentry (monitoring błędów)

## 7. Harmonogram testów
| Faza                             | Czas trwania   |
|----------------------------------|----------------|
| Przygotowanie środowiska         | 1 dzień        |
| Testy jednostkowe                | 2 dni          |
| Testy integracyjne               | 2 dni          |
| Testy E2E                        | 2 dni          |
| Testy wydajności i bezpieczeństwa| 1 dzień        |
| Raportowanie i zamknięcie         | 1 dzień        |

## 8. Kryteria akceptacji testów
- Pokrycie testami jednostkowymi ≥ 90%
- 100% scenariuszy E2E wykonanych pomyślnie
- Brak krytycznych i poważnych defektów
- Brak regresji wydajnościowej i dostępnościowej

## 9. Role i odpowiedzialności
- QA Lead: planowanie i nadzór nad testami
- QA Engineer: pisanie i wykonywanie testów
- Developer: naprawa zgłoszonych błędów, dostarczanie poprawionych buildów
- Product Owner: priorytetyzacja defektów, akceptacja wyników testów

## 10. Procedury raportowania błędów
1. Zgłoszenie błędu na GitHub Issues z etykietą `bug` i priorytetem
2. Wypełnienie szablonu: opis, kroki reprodukcji, oczekiwany vs rzeczywisty rezultat, zrzuty ekranu/logi
3. Klasyfikacja: blocker, critical, major, minor, trivial
4. Eskalacja krytycznych defektów do QA Lead i Product Ownera

---
*Dokument wygenerowany automatycznie przez zespół QA.* 