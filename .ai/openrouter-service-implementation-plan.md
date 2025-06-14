# Plan implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter integruje komunikację z modelem LLM poprzez API OpenRouter. Głównym celem tej usługi jest umożliwienie automatycznego generowania odpowiedzi na podstawie kombinacji komunikatów systemowych oraz użytkownika, przy jednoczesnym przetwarzaniu strukturalnych odpowiedzi w formacie JSON.

## 2. Opis konstruktora

Konstruktor usługi powinien:

- Inicjować konfigurację API (API key, baza URL, itp.).
- Ustawiać domyślne parametry modelu (temperature, top_p, frequency_penalty, presence_penalty).
- Umożliwiać konfigurację komunikatu systemowego (role: "system") oraz użytkownika (role: "user").
- Akceptować opcjonalne parametry inicjalizacyjne (np. timeout, retries).

## 3. Publiczne metody i pola

Główne elementy interfejsu publicznego:

- **`sendChatMessage(userMessage: string): Promise<ResponseType>`**

  - Wysyła komunikat użytkownika do API, uwzględniając wcześniej ustawiony komunikat systemowy oraz konfigurację modelu.

- **`setSystemMessage(message: string): void`**

  - Umożliwia ustawienie komunikatu systemowego.

- **`setUserMessage(message: string): void`**

  - Umożliwia ustawienie komunikatu użytkownika.

- **`setResponseFormat(schema: JSONSchema): void`**

  - Konfiguruje schemat JSON dla strukturalnych odpowiedzi (response_format).

- **`setModel(name: string, parameters: ModelParameters): void`**

  - Pozwala na wybór modelu (model: [model-name]) oraz ustawienie jego parametrów (temperature, top_p, frequency_penalty, presence_penalty).

- Publiczne pola konfiguracyjne, takie jak `apiUrl` i domyślne ustawienia modelu.

## 4. Prywatne metody i pola

Kluczowe komponenty wewnętrzne:

- **`executeRequest(requestPayload: RequestPayload): Promise<ApiResponse>`**

  - Realizuje wywołanie HTTP do API OpenRouter, zarządza retry oraz parsowaniem odpowiedzi.

- **`buildRequestPayload(): RequestPayload`**

  - Buduje ładunek żądania zawierający:
    - Komunikat systemowy, np.:
      ```json
      { "role": "system", "content": "[system-message]" }
      ```
    - Komunikat użytkownika, np.:
      ```json
      { "role": "user", "content": "[user-message]" }
      ```
    - Structured output wykorzystujący response_format (JSON schema).
    - Nazwę modelu i parametry modelu.

- Prywatne pola przechowujące bieżącą konfigurację:
  - `currentSystemMessage`
  - `currentUserMessage`
  - `currentResponseFormat`
  - `currentModelName`
  - `currentModelParameters`

## 5. Obsługa błędów

Obsługa błędów powinna obejmować:

- Walidację odpowiedzi API – sprawdzanie zgodności otrzymanego JSON z oczekiwanym schematem.
- Obsługę błędów sieciowych (np. timeout, brak połączenia) oraz wdrożenie mechanizmu retry z backoff.
- Rzucanie specyficznych wyjątków dla przypadków błędów autentykacji (np. niepoprawny API key) oraz przekroczenia limitów API.
- Logowanie błędów z zachowaniem zasad bezpieczeństwa (bez rejestrowania poufnych danych).

## 6. Względy bezpieczeństwa

W aspekcie bezpieczeństwa należy zwrócić uwagę na:

- Przechowywanie klucza API w zmiennych środowiskowych lub poprzez bezpieczne menedżery sekretów.
- Ograniczenie logowania danych wrażliwych – unikanie zapisywania pełnych żądań zawierających klucze API.

## 7. Plan implementacji krok po kroku

1. **Analiza wymagań i konfiguracja projektu**

   - Zapoznać się z dokumentacją API OpenRouter.
   - Upewnić się, że wszystkie zależności (Astro, TypeScript, React, Tailwind, Shadcn/ui) są poprawnie skonfigurowane.

2. **Implementacja modułu klienta API**

   - Utworzyć moduł (np. `src/lib/openrouter.ts`) dedykowany do komunikacji z API OpenRouter.
   - Zaimplementować funkcje do ustawiania komunikatów systemowego i użytkownika oraz konfiguracji parametrów modelu.
   - Wdrożyć metodę `executeRequest()` obsługującą wywołania HTTP z mechanizmem retry i backoff.

3. **Implementacja warstwy logiki czatu**

   - Utworzyć interfejs publiczny do wysyłania wiadomości czatowych, konsolidujący konfigurację komunikatów i parametrów modelu.
   - Umożliwić dynamiczną modyfikację konfiguracji (np. zmiana komunikatu systemowego w czasie rzeczywistym).

4. **Obsługa strukturalnych odpowiedzi API**

   - Zaimplementować metodę `buildRequestPayload()`, która tworzy odpowiedni ładunek z komunikatem systemowym, użytkownika oraz określa schemat odpowiedzi (response_format).
   - Zaimplementować funkcje walidujące i parsujące odpowiedzi z API.

5. **Implementacja obsługi błędów i logowania**
   - Zaimplementować szczegółową obsługę wyjątków dla różnych scenariuszy (błąd sieciowy, błąd autentykacji, niepoprawna struktura odpowiedzi).
   - Dodać mechanizm logowania błędów, pamiętając o zasadach bezpieczeństwa i nie rejestrowaniu danych wrażliwych.
