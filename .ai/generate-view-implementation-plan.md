# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd

Widok umożliwia użytkownikom wprowadzenie tekstu (1000-10000 znaków) i wysłanie go do API w celu wygenerowania propozycji fiszek przez AI. Następnie użytkownik może przeglądać propozycje, zatwierdzać, edytować lub odrzucać pojedyncze fiszki. Na koniec może wysłać wybrane fiszki do zapisania w bazie danych. Celem widoku jest zautomatyzowanie i przyspieszenie procesu tworzenia materiałów do nauki.

## 2. Routing widoku

Widok będzie dostępny pod następującą ścieżką:

- `/generate`

## 3. Struktura komponentów

Komponenty będą zorganizowane w następującej hierarchii:

- GeneratePage (src/pages/generate.astro)
  - FlashcardGenerationView (React Client Component)
    - TextInputArea
    - GenerateButton
    - SkeletonLoader
    - ErrorNotification
    - FlashcardList
      - FlashcardListItem
      - FlashcardListItem
      - ...
    - BulkSaveButton

## 4. Szczegóły komponentów

### FlashcardGenerationView

- **Opis**: Główny widok, który integruje wszystkie komponenty niezbędne do generowania i przeglądu fiszek.
- **Elementy**: Pole tekstowe, przycisk generowania, lista fiszek, loader i komunikaty o błędach.
- **Obsługiwane zdarzenia**:
  - Zmiana wartości w polu tekstowym
  - Kliknięcie przycisku generowania
  - Obsługa akcji na pojedynczych fiszkach (zatwierdź, edytuj, odrzuć)
  - Zapis wybranych fiszek do bazy danych
- **Warunki walidacji**: Tekst musi mieć długość od 1000 do 10000 znaków
- **Typy**: Wykorzystuje typy z `src/types.ts`
- **Propsy**: Brak - główny komponent widoku.

### TextInputArea

- **Opis**: Komponent umożliwiający wprowadzenie tekstu przez użytkownika.
- **Elementy**: Pole tekstowe (textarea) z placeholderem i etykietą.
- **Obsługiwane zdarzenia**:
  - `onChange`: Aktualizuje wartość w polu tekstowym
- **Warunki walidacji**: Sprawdzenie długości tekstu (1000 — 10000 znaków) na bieżąco
- **Typy**: Lokalny string state, typ `GenerateFlashcardsCommand` przy wysyłaniu
- **Propsy**:
  - `value: string`
  - `onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void`
  - `placeholder: string`

### GenerateButton

- **Opis**: Przycisk inicjujący proces generowania fiszek.
- **Elementy**: Przycisk HTML z etykietą "Generuj fiszki".
- **Obsługiwane zdarzenia**: `onClick`: Wywołuje funkcję wysyłającą żądanie do API
- **Warunki walidacji**: Aktywowany tylko przy poprawnym walidowanym tekście
- **Typy**: Funkcja callback na click
- **Propsy**:
  - `onClick: () => void`
  - `disabled: boolean`

### FlashcardList

- **Opis**: Komponent wyświetlający listę propozycji fiszek otrzymanych z API.
- **Elementy**: Lista (np. ul/li lub komponenty grid) zawierająca wiele `FlashcardListItem`
- **Obsługiwane zdarzenia**: Przekazywanie zdarzeń do poszczególnych kart (akceptacja, edycja, odrzucenie)
- **Warunki walidacji**: Brak — dane przychodzące z API są już zwalidowane
- **Typy**: Tablica obiektów typu `FlashcardProposalViewModel`
- **Propsy**:
  - `flashcards: FlashcardProposalViewModel[]`
  - `onAccept: (id: string) => void`
  - `onEdit: (id: string, newFront: string, newBack: string) => void`
  - `onReject: (id: string) => void`

### FlashcardListItem

- **Opis**: Pojedynczy element listy reprezentujący jedną propozycję fiszki.
- **Elementy**: Wyświetlenie tekstu dla przodu i tyłu fiszki oraz trzy przyciski: "Zatwierdź", "Edytuj", "Odrzuć"
- **Obsługiwane zdarzenia**: `onClick` dla każdego przycisku, który modyfikuje stan danej fiszki (np. oznaczenie jako zaakceptowana, otwarcie trybu edycji, usunięcie z listy)
- **Warunki walidacji**: Jeśli edycja jest aktywna, wprowadzone dane muszą spełniać warunki: front ≤ 200 znaków, back ≤ 500 znaków
- **Typy**: Rozszerzony typ `FlashcardProposalViewModel`, lokalny model stanu, np. z flagą accepted/edited
- **Propsy**:
  - `flashcard: FlashcardProposalViewModel`
  - `onAccept: (id: string) => void`
  - `onEdit: (id: string, newFront: string, newBack: string) => void`
  - `onReject: (id: string) => void`

### SkeletonLoader

- **Opis**: Komponent wizualizacji ładowania danych (skeleton).
- **Elementy**: Szablon UI (skeleton) imitujący strukturę kart, które będą wyświetlone
- **Obsługiwane zdarzenia**: Brak interakcji użytkownika
- **Warunki walidacji**: Nie dotyczy
- **Typy**: Stateless
- **Propsy**: Może przyjmować opcjonalne parametry stylizacyjne

### ErrorNotification

- **Opis**: Komponent wyświetlający komunikaty o błędach (np. błędy API lub walidacji formularza).
- **Elementy**: Komunikat tekstowy, ikona błędu
- **Obsługiwane zdarzenia**: Brak — komponent informacyjny
- **Warunki walidacji**: Przekazany komunikat nie powinien być pusty
- **Typy**: String (wiadomość błędu)
- **Propsy**:
  - `message: string`
  - `eventualnie typ błędu`

### BulkSaveButton

- **Opis**: Komponent zawiera przyciski umożliwiające zbiorcze wysłanie wybranych fiszek do zapisania w bazie.
- **Elementy**: Dwa przyciski: "Zapisz wszystkie" oraz "Zapisz zaakceptowane"
- **Obsługiwane zdarzenia**: `onClick` dla każdego przycisku wywołujący odpowiednią funkcję zapisywania
- **Warunki walidacji**: Aktywowany jedynie gdy istnieją fiszki do zapisu; dane fiszek muszą spełniać walidację (front ≤ 200 znaków, back ≤ 500 znaków)
- **Typy**: Wykorzystuje typ `FlashcardsCreateCommand` (bazujący na `FlashcardCreateDto`)
- **Propsy**:
  - `onSaveAll: () => void`
  - `onSaveAccepted: () => void`
  - `disabled: boolean`

## 5. Typy

### GenerateFlashcardsCommand

Typ wysyłany do endpointu `/api/generations`:

```typescript
interface GenerateFlashcardsCommand {
  source_text: string;
}
```

### GenerationCreateResponseDto

Struktura odpowiedzi z API:

```typescript
interface GenerationCreateResponseDto {
  generation_id: number;
  flashcard_proposals: FlashcardProposalDto[];
  generated_count: number;
}
```

### FlashcardProposalDto

Pojedyncza propozycja fiszki:

```typescript
interface FlashcardProposalDto {
  front: string;
  back: string;
  source: "ai-full";
}
```

### FlashcardProposalViewModel

Rozszerzony typ `FlashcardProposalDto` z dodatkowym ID i statusem dla zarządzania stanem po stronie klienta:

```typescript
interface FlashcardProposalViewModel extends FlashcardProposalDto {
  id: string; // UUID wygenerowane po stronie klienta
  status: "pending" | "accepted" | "rejected" | "edited";
  isEditing?: boolean;
}
```

### FlashcardsCreateCommand

Typ wysyłany do endpointu `/api/flashcards` zawierający tablicę fiszek do zapisania:

```typescript
interface FlashcardsCreateCommand {
  flashcards: FlashcardCreateDto[];
}
```

### FlashcardCreateDto

Pojedyncza fiszka do zapisania:

```typescript
type FlashcardCreateDto = {
  front: string;
  back: string;
  source: "ai-full" | "ai-edited" | "manual";
  generation_id: number | null;
};
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany za pomocą hooków React (`useState`, `useEffect`). Kluczowe stany:

- Wartość pola tekstowego (`textValue`)
- Stan ładowania (`isLoading`) dla wywołania API
- Stan błędów (`errorMessage`) dla komunikatów o błędach
- Lista propozycji fiszek (`flashcards`), wraz z ich lokalnymi flagami stanu
- Opcjonalny stan dla trybu edycji fiszki

Możliwe jest utworzenie customowego hooka (np. `useGenerateFlashcards`) do obsługi logiki API i zarządzania stanem.

## 7. Integracja API

### POST /api/generations

- **Opis**: Wysłanie obiektu `{ source_text }` i otrzymanie `generation_id`, `flashcard_proposals` oraz `generated_count`
- **Typ żądania**: `GenerateFlashcardsCommand`
- **Typ odpowiedzi**: `GenerationCreateResponseDto`
- **Obsługa błędów**: 400 Bad Request (nieprawidłowa długość tekstu), 503 Service Unavailable (błąd AI), 401 Unauthorized

### POST /api/flashcards

- **Opis**: Po zaznaczeniu fiszek do zapisu, wysłanie żądania POST /api/flashcards z obiektem `FlashcardsCreateCommand` zawierającym tablicę obiektów fiszek (każda fiszka musi mieć front ≤200 znaków, back ≤500 znaków, odpowiedni source oraz generation_id) i umożliwia zapisanie danych do bazy
- **Typ żądania**: `FlashcardsCreateCommand`
- **Typ odpowiedzi**: `CreateFlashcardsResponseDto`
- **Walidacja odpowiedzi**: sprawdzenie statusu HTTP, obsługa błędów 400 (walidacja) oraz 500 (błąd serwera)

## 8. Interakcje użytkownika

- Użytkownik wkleja tekst do pola tekstowego
- Po kliknięciu przycisku "Generuj fiszki":
  - Rozpoczyna się walidacja długości tekstu
  - Jeśli walidacja przejdzie, wysłane jest żądanie do API
  - Podczas oczekiwania wyświetlany jest SkeletonLoader oraz przycisk jest dezaktywowany
- Po otrzymaniu odpowiedzi wyświetlona jest lista FlashcardListItem
- Każda karta umożliwia:
  - Zatwierdzenie propozycji, która oznacza fiszkę do zapisu
  - Edycję — otwarcie trybu edycji z możliwością korekty tekstu z walidacją
  - Odrzucenie — usunięcie propozycji z listy
- Komponent `BulkSaveButton` umożliwi wysłanie wybranych fiszek do zapisania w bazie (wywołanie API POST /api/flashcards)

## 9. Warunki i walidacja

- **Pole tekstowe**: długość tekstu musi wynosić od 1000 do 10000 znaków
- **Podczas edycji fiszki**: front ≤ 200 znaków, back ≤ 500 znaków
- **Przycisk generowania**: aktywowany tylko przy poprawnym walidowanym tekście
- **Walidacja odpowiedzi API**: komunikaty błędów wyświetlane w ErrorNotification

## 10. Obsługa błędów

- Wyświetlanie komunikatów o błędach w przypadku niepowodzenia walidacji formularza
- Obsługa błędów API (status 400, 500) — komunikaty błędów wyświetlane w ErrorNotification
- W przypadku niepowodzenia zapisu fiszek, stan ładowania jest resetowany, a użytkownik informowany o błędzie

## 11. Kroki implementacji

1. Utworzenie nowej strony widoku `/generate` w strukturze Astro
2. Implementacja głównego komponentu `FlashcardGenerationView`
3. Stworzenie komponentu `TextInputArea` z walidacją długości tekstu
4. Stworzenie komponentu `GenerateButton` i podpięcie akcji wysyłania żądania do POST /api/generations
5. Implementacja hooka (np. useGenerateFlashcards) do obsługi logiki API i zarządzania stanem
6. Utworzenie komponentu `SkeletonLoader` do wizualizacji ładowania podczas oczekiwania na odpowiedź API
7. Stworzenie komponentów `FlashcardList` i `FlashcardListItem` z obsługą akcji (zatwierdź, edytuj, odrzuć)
8. Integracja wyświetlania komunikatów błędów przez `ErrorNotification`
9. Implementacja komponentu `BulkSaveButton`, który będzie zbiorco wysyłał żądanie do endpointu POST /api/flashcards, korzystając z typu `FlashcardsCreateCommand`
10. Testowanie interakcji użytkownika oraz walidacji (scenariusze poprawne i błędne)
11. Dostrojenie responsywności i poprawienie aspektów dostępności
12. Code review i refaktoryzacja przed wdrożeniem
