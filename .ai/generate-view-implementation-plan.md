# Plan implementacji widoku Generowania Fiszek

## 1. Przegląd
Widok umożliwia użytkownikom wprowadzenie tekstu (1000-10000 znaków) i wysłanie go do API w celu wygenerowania propozycji fiszek przez AI. Na koniec można przeglądać propozycje, zatwierdzeć do bazy danych wszystkie użyteczne fiszki. Na końcu możę pozostać do bazy danych tylko te zaakceptowane fiszki. Nastąpuje automatyczne przekierowanie po zapisaniu i umożliwia zarządzanie propozycjami przed ich finalnym zapisaniem w swoim zestawie. Celem widoku jest zautomatyzowanie i przyspieszenie procesu tworzenia materiałów do nauki.

## 2. Routing widoku
Widok będzie dostępny pod następującą ścieżką:
- `/generate`

## 3. Struktura komponentów
Komponenty będą zorganizowane w następującej hierarchii:

```
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
```

## 4. Szczegóły komponentów

### FlashcardGenerationView
- **Opis komponentu**: Główny widok, który integruje wszystkie komponenty niezbędne do generowania i przeglądu fiszek.
- **Główne elementy**: Pole tekstowe, przycisk generowania, lista fiszek, loader i komunikaty o błędach.
- **Obsługiwane interakcje**:
  - Zmiana wartości w polu tekstowym.
  - Kliknięcie przycisku generowania.
  - Obsługa akcji na pojedynczych fiszkach (zatwierdź, edytuj, odrzuć).
  - Zapis wybranych fiszek do bazy danych.
- **Obsługiwana walidacja**: Koordynuje walidację z komponentów podrzędnych.
- **Typy**: Wykorzystuje typy zdefiniowane w `types.ts`, w tym interfejs `GenerateFlashcardsCommand` (bazujący na `FlashcardCreateDto`).
- **Propsy**: Brak - główny komponent widoku.

### TextInputArea
- **Opis komponentu**: Komponent umożliwiający wprowadzenie tekstu przez użytkownika.
- **Główne elementy**: Pole tekstowe (textarea) z placeholderem i etykietą.
- **Obsługiwane interakcje**: 
  - `onChange`: Aktualizuje wartość w polu tekstowym.
- **Obsługiwana walidacja**: Sprawdzenie długości tekstu (1000 — 10000 znaków) na bieżąco.
- **Typy**: Lokalny string state, typ `GenerateFlashcardsCommand` przy wysyłaniu.
- **Propsy**:
  - `value: string`
  - `onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void`
  - `placeholder: string`

### GenerateButton
- **Opis komponentu**: Przycisk inicjujący proces generowania fiszek.
- **Główne elementy**: Przycisk HTML z etykietą "Generuj fiszki".
- **Obsługiwane interakcje**: `onClick`: Wywołuje funkcję wysyłającą żądanie do API.
- **Obsługiwana walidacja**: Aktywowany tylko przy poprawnym walidowanym tekście.
- **Typy**: Funkcja callback na click.
- **Propsy**:
  - `onClick: () => void`
  - `disabled: boolean`

### FlashcardList
- **Opis komponentu**: Komponent wyświetlający listę propozycji fiszek otrzymanych z API.
- **Główne elementy**: Lista (np. ul/li lub komponenty grid) zawierająca wiele `FlashcardListItem`.
- **Obsługiwane interakcje**: Przekazywanie zdarzeń do poszczególnych kart (akceptacja, edycja, odrzucenie).
- **Obsługiwana walidacja**: Brak — dane przychodzące z API są już zwalidowane.
- **Typy**: Tablica obiektów typu `FlashcardProposalViewModelType`.
- **Propsy**:
  - `flashcards: FlashcardProposalViewModelType[]`
  - `onAccept: (id: string) => void`
  - `onEdit: (id: string, newFront: string, newBack: string) => void`
  - `onReject: (id: string) => void`

### FlashcardListItem
- **Opis komponentu**: Pojedynczy element listy reprezentujący jedną propozycję fiszki.
- **Główne elementy**: Wyświetlenie tekstu dla przodu i tyłu fiszki oraz trzy przyciski: "Zatwierdź", "Edytuj", "Odrzuć".
- **Obsługiwane interakcje**: `onClick` dla każdego przycisku, który modyfikuje stan danej fiszki (np. oznaczenie jako zaakceptowana, otwarcie trybu edycji, usunięcie z listy).
- **Obsługiwana walidacja**: Jeśli edycja jest aktywna, wprowadzone dane muszą spełniać warunki: front ≤ 200 znaków, back ≤ 500 znaków.
- **Typy**: Rozszerzony typ `FlashcardProposalViewModel`, lokalny model stanu, np. z flagą `accepted/edited`.
- **Propsy**:
  - `flashcard: FlashcardProposalViewModelType`
  - `onAccept: (id: string) => void`
  - `onEdit: (id: string, newFront: string, newBack: string) => void`
  - `onReject: (id: string) => void`

### SkeletonLoader
- **Opis komponentu**: Komponent wizualizacji ładowania danych (skeleton).
- **Główne elementy**: Szablon UI (skeleton) imitujący strukturę kart, które będą wyświetlone.
- **Obsługiwane interakcje**: Brak interakcji użytkownika.
- **Obsługiwana walidacja**: Nie dotyczy.
- **Typy**: Stateless, może przyjmować opcjonalne parametry stylizacyjne.
- **Propsy**: Może przyjmować opcjonalne parametry stylizacyjne.

### ErrorNotification
- **Opis komponentu**: Komponent do wyświetlania komunikatów o błędach (np. błędy API lub walidacji formularza).
- **Główne elementy**: Komunikat tekstowy, ikona błędu.
- **Obsługiwane interakcje**: Brak — komponent informacyjny.
- **Obsługiwana walidacja**: Przekazany komunikat nie powinien być pusty.
- **Typy**: String (wiadomość błędu).
- **Propsy**:
  - `message: string`
  - `eventualnie typ błędu`

### BulkSaveButton
- **Opis komponentu**: Komponent zawiera przyciski umożliwiające zbiorcze wysłanie wybranych fiszek do zapisania w bazie.
- **Główne elementy**: Przycisk "Zapisz wszystkie" oraz "Zapisz zaakceptowane".
- **Obsługiwane interakcje**: `onClick` na każdy przycisk wywołujący odpowiednią funkcję zapisywania.
- **Obsługiwana walidacja**: Aktywowany jedynie gdy istnieją fiszki do zapisu.
- **Typy**: Wykorzystuje typy zdefiniowane w `types.ts`, w tym interfejs `FlashcardsCreateCommand` (bazujący na `FlashcardCreateDto`).
- **Propsy**:
  - `onSaveAll: () => void`
  - `onSaveAccepted: () => void`
  - `disabled: boolean`

## 5. Typy

### GenerateFlashcardsCommand
Typ wysyłany do endpointu `/generations`:
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
  flashcards_proposals: FlashcardProposalDto[];
  generated_count: number;
}
```

### FlashcardProposalDto
Pojedyncza propozycja fiszki:
```typescript
interface FlashcardProposalDto {
  front: string;
  back: string;
  source: 'ai-full';
}
```

### FlashcardProposalViewModel
Rozszerzony typ `FlashcardProposalDto`, lokalny model stanu, np. z flagą `accepted/edited`:
```typescript
interface FlashcardProposalViewModel {
  front: string;
  back: string;
  source: 'ai-full' | 'ai-edited';
  accepted: boolean;
  edited: boolean;
}
```

## 6. Zarządzanie stanem
Stan widoku będzie zarządzany za pomocą hooków React (`useState`, `useEffect`). Kluczowe stany:
- Wartość pola tekstowego (`textValue`)
- Stan ładowania (`isLoading`) dla wywołania API
- Stan błędów (`errorMessage`) dla komunikatów o błędach
- Lista propozycji fiszek (`flashcards`), wraz z ich lokalnym flagami stanu
- Opcjonalny stan dla trybu edycji fiszki

Może być utworzenie customowego hooka (np. `useGenerateFlashcards`) do obsługi logiki API i zarządzania stanem.

## 7. Integracja API

Integracja z endpointem:

### 1. POST /generations
- **Opis**: Wysłanie obiektu `{ source_text }` i otrzymanie `generation_id`, `flashcards_proposals` oraz `generated_count`.
- **Typ żądania**: `GenerateFlashcardsCommand`
- **Typ odpowiedzi**: `GenerationCreateResponseDto`

### 2. POST /flashcards
- **Opis**: Po zaznaczeniu fiszek do zapisu, wysłanie żądania POST /flashcards z obiekt `FlashcardsCreateCommand` zawierający tablicę obiektów fiszek (każda fiszka musi mieć front ≤200 znaków, back ≤500 znaków, odpowiedni source oraz generation_id) i umożliwia zapisanie danych do bazy.
- **Walidacja odpowiedzi**: sprawdzenie statusu HTTP, obsługa błędów 400 (walidacja) oraz 500 (błąd serwera).

## 8. Interakcje użytkownika
- Użytkownik wkleja tekst do pola tekstowego.
- Po kliknięciu przycisku "Generuj fiszki":
  - Rozpoczyna się walidacja długości tekstu.
  - Jeśli walidacja przejdzie, wysłane jest żądanie do API.
  - Podczas oczekiwania wyświetlany jest SkeletonLoader oraz przycisk jest dezaktywowany.
- Po otrzymaniu odpowiedzi wyświetlona jest lista FlashcardListItem.
- Każda karta umożliwia:
  - Zatwierdzenie propozycji, która oznacza fiszkę do zapisu.
  - Edycję — otwarcie trybu edycji z możliwością korekty tekstu z walidacją.
  - Odrzucenie — usunięcie propozycji z listy.
- Komponent `BulkSaveButton` umożliwi wysłanie wybranych fiszek do zapisania w bazie (wywołanie API POST /flashcards).

## 9. Warunki i walidacja
- **Pole tekstowe**: długość tekstu musi wynosić od 1000 do 10000 znaków.
- **Podczas edycji fiszki**: front ≤ 200 znaków, back ≤ 500 znaków.
- **Przycisk generowania**: aktywowany tylko przy poprawnym walidowanym tekście.
- **Walidacja odpowiedzi API**: komunikaty błędów wyświetlane w ErrorNotification.

## 10. Obsługa błędów
- Wyświetlanie komunikatów o błędach w przypadku niepowodzenia walidacji formularza.
- Obsługa błędów API (status 400, 500) — komunikaty błędów wyświetlane w ErrorNotification.
- W przypadku niepowodzenia zapisu fiszek, stan ładowania jest resetowany, a użytkownik informowany o błędzie.

## 11. Kroki implementacji
1. Utworzenie nowej strony widoku `/generate` w strukturze Astro.
2. Implementacja głównego komponentu `FlashcardGenerationView`.
3. Stworzenie komponentu `TextInputArea` z walidacją długości tekstu.
4. Stworzenie komponentu `GenerateButton` i podpięcie akcji wysyłania żądania do POST /generations.
5. Implementacja hooka (np. useGenerateFlashcards) do obsługi logiki API i zarządzania stanem.
6. Utworzenie komponentu `SkeletonLoader` do wizualizacji ładowania podczas oczekiwania na odpowiedź API.
7. Stworzenie komponentów `FlashcardList` i `FlashcardListItem` z obsługą akcji (zatwierdź, edytuj, odrzuć).
8. Integracja wyświetlania komunikatów błędów przez `ErrorNotification`.
9. Implementacja komponentu `BulkSaveButton`, który będzie zbiorco wysyłał żądanie do endpointu POST /flashcards, korzystając z typu `FlashcardsCreateCommand` (bazujący na `FlashcardCreateDto`).
10. Testowanie interakcji użytkownika oraz walidacji (scenariusze poprawne i błędne).
11. Dostrojenie responsywności i poprawienie aspektów dostępności.
12. Finalny code review i refaktoryzacja przed wdrożeniem. 