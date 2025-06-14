# API Endpoint Implementation Plan: POST /api/generations

## 1. Przegląd punktu końcowego

Ten endpoint umożliwia inicjację generowania propozycji fiszek przez AI na podstawie dostarczonego tekstu. Po utworzeniu rekordu generacji i otrzymaniu wyników od modelu AI zwraca identyfikator generacji, listę propozycji fiszek oraz całkowitą liczbę wygenerowanych fiszek.

## 2. Szczegóły żądania

- Metoda HTTP: POST
- URL: `/api/generations`
- Nagłówki:
  - `Authorization: Bearer <token>` (wymagane)
  - `Content-Type: application/json`
- Parametry:
  - Wymagane:
    - `source_text` (string) – długość między 1000 a 10000 znaków
- Request Body:
  ```json
  {
    "source_text": "User provided text (1000 to 10000 characters)"
  }
  ```
- Wykorzystywany typ: `GenerateFlashcardsCommand` (z `src/types.ts`)
- Walidacja danych wejściowych za pomocą Zod:
  ```ts
  const schema = z.object({
    source_text: z.string().min(1000).max(10000),
  });
  ```

## 3. Wykorzystywane typy

- **GenerateFlashcardsCommand**: model wejściowy zawierający pole `source_text`.
- **FlashcardProposalDto**: pojedyncza propozycja fiszki z polami `front`, `back`, `source="ai-full"`.
- **GenerationCreateResponseDto**: odpowiedź zawierająca `generation_id`, `flashcard_proposals` i `generated_count`.

## 4. Szczegóły odpowiedzi

- Status: 201 Created
- Body (`GenerationCreateResponseDto`):
  ```json
  {
    "generation_id": 123,
    "flashcard_proposals": [{ "front": "Generated Question", "back": "Generated Answer", "source": "ai-full" }],
    "generated_count": 5
  }
  ```
- Kody statusu
  - 201 Created – Pomyślne utworzenie generacji
  - 400 Bad Request – Błędne dane wejściowe (np. nieprawidłowa długość `source_text`)
  - 401 Unauthorized – Brak lub nieprawidłowy token JWT
  - 503 Service Unavailable – Błąd serwisu AI lub timeout (z logowaniem do `generation_error_logs`)
  - 500 Internal Server Error – Wewnętrzny błąd serwera lub bazy danych

## 5. Przepływ danych

1. Odbiór żądania i weryfikacja JWT za pomocą `supabase` z `context.locals`.
2. Walidacja `source_text` (Zod).
3. Wstawienie nowego rekordu do tabeli `generations` z polami:
   - `user_id`, `model`, `source_text_hash`, `source_text_length`, domyślne `generated_count = 0`, `generation_duration = 0`.
4. Wywołanie serwisu AI (`src/lib/services/generationService.ts`):
   - Pomiar czasu (start/end).
   - Przekazanie `source_text`, zapis wyników jako tablica `FlashcardProposalDto`.
5. Zaktualizowanie rekordu `generations`:
   - `generated_count`, `generation_duration`, `updated_at`.
6. Zwrócenie odpowiedzi z danymi.

## 6. Względy bezpieczeństwa

- Uwierzytelnianie: wymóg `Authorization: Bearer` (Supabase Auth).
- Autoryzacja: upewnienie się, że `user_id` z tokena odpowiada operacji.
- Ochrona przed nadmiernym payloadem: limit `source_text.length`.
- Zapobieganie XSS/SQL Injection: użycie parametrów w Supabase SDK i Zod.

## 7. Obsługa błędów

- 400 Bad Request:
  - Nieprawidłowe dane wejściowe (walidacja Zod).
  - Nieprawidłowa długość `source_text` (poza zakresem 1000-10000 znaków).
- 401 Unauthorized:
  - Brak lub nieważny token JWT.
  - Nieważna sesja użytkownika.
- 503 Service Unavailable:
  - Błąd w usłudze AI lub timeout.
  - Dodatkowo: w logach `generation_error_logs` zapisać rekord z polami:
    `user_id`, `model`, `source_text_hash`, `source_text_length`, `error_code`, `error_message`.
- 500 Internal Server Error:
  - Błąd wewnętrzny bazy danych lub serwera.
  - Zwrócenie ogólnego komunikatu, szczegóły logowane po stronie serwera.

## 8. Rozważania dotyczące wydajności

- Timeout dla wywołania AI: 60 sekund, w przeciwnym razie przerwać operację (timeout)
- Asynchroniczne przetwarzanie: rozważ użycie kolejek / background jobs
- Monitoring: zbieranie metryk (latencja, błędy) endpointu i serwisu AI
- Batch size i stronicowanie przy dużych żądaniach
- Hashowanie `source_text` w celu deduplikacji

## 9. Kroki wdrożenia

1. Utworzenie pliku `src/pages/api/generations.ts`.
2. Zdefiniowanie Zod schema i odpowiednich typów (`GenerateFlashcardsCommand`) w pliku endpointu.
3. Utworzenie serwisu `generationService` w `src/lib/services/generationService.ts`:
   - Integracja z zewnętrznym serwisem AI.
   - Utworzenie mocka serwisu AI dla developmentu/testów.
   - Logika zapisu do tabel `generations` i rejestracji błędów w `generation_error_logs`.
4. Dodanie mechanizmu uwierzytelniania przez Supabase Auth i ekstrakcja `user.id`.
5. Implementacja logiki w endpoincie, wykorzystując serwis `generationService`.
6. Dodanie szczegółowego logowania akcji oraz błędów.
