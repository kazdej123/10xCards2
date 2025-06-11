# API Endpoint Implementation Plan: POST /api/flashcards

## 1. Przegląd punktu końcowego
Celem endpointu jest masowe tworzenie fiszek (zarówno manualnych, jak i wygenerowanych przez AI) przypisanych do zalogowanego użytkownika.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- URL: `/api/flashcards`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagane)
  - `Content-Type: application/json`
- Request Body:
  ```json
  {
    "flashcards": [
      {
        "front": "Question 1",
        "back": "Answer 1",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "Question 2",
        "back": "Answer 2",
        "source": "ai-full",
        "generation_id": 123
      }
    ]
  }
  ```
- Walidacja (Zod):
  - Obiekt musi zawierać klucz `flashcards` będący tablicą długości minimum 1.
  - Dla każdego elementu:
    - `front`: string, niepusty, maksymalnie 200 znaków.
    - `back`: string, niepusty, maksymalnie 500 znaków.
    - `source`: enum `"ai-full" | "ai-edited" | "manual"`.
    - Jeśli `source` w (`"ai-full"`, `"ai-edited"`), `generation_id`: wymagane, number.
    - Jeśli `source` === `"manual"`, `generation_id` musi być `null`.
- Wykorzystywane typy:
  - `FlashcardsCreateCommand` (DTO dla tablicy fiszek).
  - `FlashcardCreateDto` (pojedyncza fiszka wejściowa).

## 3. Szczegóły odpowiedzi
- Kod statusu: 201 Created
- Format odpowiedzi:
  ```json
  {
    "data": [
      {
        "id": 1,
        "front": "Question 1",
        "back": "Answer 1",
        "source": "manual",
        "generation_id": null,
        "created_at": "2025-06-11T12:34:56Z",
        "updated_at": "2025-06-11T12:34:56Z"
      },
      ...
    ]
  }
  ```
- Używany typ: `CreateFlashcardsResponseDto` zawierający `data: FlashcardDto[]`.

## 4. Przepływ danych
1. Ekstrakcja instancji Supabase z `context.locals.supabase` w handlerze Astro.
2. Weryfikacja sesji użytkownika; jeśli brak lub nieważny, zwróć 401 Unauthorized.
3. Parsowanie i walidacja ciała żądania schematem Zod.
4. Weryfikacja własności `generation_id` dla fiszek AI-generowanych:
   - Zbierz wszystkie unikalne `generation_id` z fiszek o `source` w (`"ai-full"`, `"ai-edited"`).
   - Zapytanie do tabeli `generations` filtrowane po `user_id` i `id IN (generation_ids)`.
   - Jeśli któryś `generation_id` nie istnieje lub nie należy do użytkownika, zwróć 400 Bad Request.
5. Przygotowanie tablicy rekordów przez dodanie `user_id` do każdego obiektu.
6. Batch insert: `supabase.from('flashcards').insert(records).select('*')`.
7. Aktualizacja liczników w tabeli `generations` dla fiszek AI-generowanych:
   - Policz `accepted_unedited_count` (source="ai-full") i `accepted_edited_count` (source="ai-edited") dla każdego `generation_id`.
   - Zaktualizuj odpowiednie rekordy w tabeli `generations` zwiększając liczniki.
8. Zwrócenie wstawionych rekordów jako odpowiedź.

## 5. Względy bezpieczeństwa
- Uwierzytelnianie: wymaganie JWT z Supabase Auth.
- Autoryzacja: przypisanie fiszek do `user_id` z tokena oraz weryfikacja własności `generation_id`.
- Ochrona przed zbyt dużymi payloadami: limit wielkości tablicy (np. max 100 fiszek).
- Użycie parametrów w Supabase SDK zapobiega SQL Injection.

## 6. Obsługa błędów
- 400 Bad Request:
  - Nieprawidłowy JSON lub nieprzechodzący walidacji Zod.
  - Niespójność `source` i `generation_id` (wymagane dla AI, null dla manual).
  - `generation_id` nie istnieje lub nie należy do użytkownika.
  - Pusta tablica fiszek lub przekroczenie limitu (max 100 fiszek).
- 401 Unauthorized:
  - Brak lub nieważny token JWT.
  - Nieważna sesja użytkownika.
- 500 Internal Server Error:
  - Błędy bazy danych lub nieoczekiwane wyjątki.
  - Zwrócenie ogólnego komunikatu, szczegóły logowane po stronie serwera.

## 7. Rozważania dotyczące wydajności
- Batch insert zamiast wielu pojedynczych zapytań.
- Indeks na kolumnie `generation_id` w tabeli `flashcards`.
- Ograniczenie maksymalnej liczby fiszek na jedno żądanie (max 100).
- Monitoring latencji i liczby błędów endpointu.

## 8. Kroki wdrożenia
1. Utworzyć plik `src/pages/api/flashcards.ts`.
2. Zaimportować:
   - `z` z `zod`.
   - `FlashcardsCreateCommand`, `FlashcardCreateDto`, `CreateFlashcardsResponseDto` z `src/types.ts`.
   - instancję Supabase z `context.locals.supabase`.
3. Zdefiniować schemat Zod dla `FlashcardsCreateCommand` z refinementem walidującym spójność `source` i `generation_id`.
4. W handlerze:
   - Ekstrakcja sesji i `user.id`.
   - Parsowanie i walidacja ciała żądania.
   - Weryfikacja własności `generation_id` dla fiszek AI-generowanych.
   - Przygotowanie rekordów z `user_id`.
   - Wywołanie `supabase.from('flashcards').insert(...).select('*')`.
   - Obsługa zwróconych danych i błędów.
5. (Opcjonalnie) Wyodrębnić logikę do `src/lib/services/flashcardService.ts` z metodą `createFlashcards(...)`.
6. Napisać testy jednostkowe i integracyjne (można mockować Supabase).
7. Dodać dokumentację w repozytorium (README lub `docs/endpoints.md`).
8. Przeprowadzić code review, zmergować i wdrożyć przez CI/CD. 