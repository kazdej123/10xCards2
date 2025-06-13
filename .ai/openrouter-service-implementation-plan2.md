# Plan implementacji usługi OpenRouter

## 1. Opis usługi
`OpenRouterService` to usługowa klasa w TypeScript, pełniąca rolę warstwy pośredniej między aplikacją (Astro/React) a API OpenRouter. Jej zadaniem jest:
- Przyjmować sekwencje wiadomości czatu (systemowych, użytkownika).  
- Komponować zapytania HTTP do OpenRouter z odpowiednimi nagłówkami, parametrami modelu i ustawieniami `response_format`.  
- Parsować i walidować odpowiedzi (weryfikacja zgodności ze schematem JSON).  
- Elastycznie obsługiwać błędy i zwracać ustrukturyzowane wyjątki.

## 2. Opis konstruktora

### Sygnatura
```ts
constructor(config: OpenRouterConfig)
```

### Pola konfiguracyjne (`OpenRouterConfig`)
- `apiKey: string` – klucz API z OpenRouter (przechowywany w `.env`).  
- `endpoint?: string` – URL endpointa (domyślnie `https://openrouter.ai/v1/chat/completions`).  
- `defaultModel?: string` – nazwa modelu (np. `gpt-4o-mini`).  
- `defaultParams?: ModelParams` – domyślne parametry (temperatura, top_p, max_tokens).  

Konstruktor:
- Waliduje obecność `apiKey` (guard clause).  
- Inicjalizuje prywatne pola serwisu.

## 3. Publiczne metody i pola

### Pola
- `apiKey: string`  
- `endpoint: string`  
- `defaultModel: string`  
- `defaultParams: ModelParams`

### Metody
```ts
public async sendChat(
  messages: ChatMessage[],
  options?: ChatOptions
): Promise<ChatResponse>
```
- Przyjmuje tablicę `ChatMessage` (role: `system`|`user`|`assistant`).  
- Opcjonalnie nadpisuje `model`, `params`, `response_format`.  
- Zwraca `Promise<ChatResponse>` – ustrukturyzowany wynik po walidacji.

```ts
public setLogger(logger: Logger): void
```  
Ustawia zewnętrzny logger do rejestrowania zapytań i odpowiedzi.

## 4. Prywatne metody i pola

### Pola prywatne
- `_apiKey`, `_endpoint`, `_defaultModel`, `_defaultParams`  
- `_logger?: Logger`

### Metody prywatne
```ts
private _buildPayload(
  messages: ChatMessage[],
  options?: ChatOptions
): RequestPayload
```
- Łączy `messages` z `options`.  
- Ustala `model`, `parameters`, `response_format`.

```ts
private async _dispatch(
  payload: RequestPayload
): Promise<any>
```
- Wysyła zapytanie przy użyciu `fetch`.  
- Ustawia nagłówki `Authorization: Bearer ${apiKey}`, `Content-Type: application/json`.

```ts
private _handleResponse(
  raw: any
): ChatResponse
```
- Parsuje JSON.  
- Jeżeli skonfigurowano `response_format`, waliduje przy pomocy AJV.  
- Zwraca `ChatResponse`.

```ts
private _log(
  level: LogLevel,
  message: string,
  meta?: Record<string, any>
): void
```
- Loguje jeśli `_logger` jest dostępny.

## 5. Obsługa błędów
1. Brak `apiKey` – `ConfigError`  
2. Błąd sieci (timeout, DNS) – `NetworkError`  
3. HTTP status !== 200 – `ApiError` (zawiera `status`, `body`)  
4. Nieprawidłowe JSON – `ParseError`  
5. Niezgodność ze schematem (`response_format`) – `SchemaValidationError`  
6. Osiągnięcie limitu (429) – `RateLimitError`

## 6. Kwestie bezpieczeństwa
- Przechowywać `apiKey` w `.env` i nigdy nie commitować do repo.  
- Użyć HTTPS do wszystkich wywołań.  
- Nie logować pełnych treści wiadomości ani odpowiedzi użytkownika.  
- W razie potrzeby maskować dane w logach.  
- Stosować rate limiting i circuit breaker by chronić przed nadużyciami.

## 7. Plan wdrożenia krok po kroku

1. **Instalacja zależności**  
   ```bash
   npm install ajv
   ```

2. **Konfiguracja środowiska**  
   - Utwórz plik `.env` w katalogu głównym:  
     ```dotenv
     OPENROUTER_API_KEY=twój_klucz
     ```

3. **Typy i interfejsy**  
   - W `src/types.ts` dodaj:
     ```ts
     export interface ChatMessage {
       role: 'system' | 'user' | 'assistant';
       content: string;
     }

     export interface ModelParams {
       temperature?: number;
       top_p?: number;
       max_tokens?: number;
     }

     export interface OpenRouterConfig {
       apiKey: string;
       endpoint?: string;
       defaultModel?: string;
       defaultParams?: ModelParams;
     }

     export interface ChatOptions {
       model?: string;
       parameters?: ModelParams;
       response_format?: ResponseFormat;
     }

     export interface ResponseFormat {
       type: 'json_schema';
       json_schema: {
         name: string;
         strict: boolean;
         schema: Record<string, any>;
       };
     }

     export interface ChatResponse { /* ... */ }
     ```

4. **Implementacja klasy**  
   - W `src/lib/services/openRouterService.ts`:
     - Zaimportuj `fetch`, `ajv`, typy.  
     - Zaimplementuj konstruktor i metody wg specyfikacji.

5. **Przykłady użycia**  
   ```ts
   import { OpenRouterService, ChatMessage } from 'src/lib/services/openRouterService';

   const service = new OpenRouterService({
     apiKey: process.env.OPENROUTER_API_KEY!,
     defaultModel: 'gpt-4o-mini',
     defaultParams: { temperature: 0.7, max_tokens: 500 }
   });

   const messages: ChatMessage[] = [
     { role: 'system', content: 'You are a helpful assistant.' },
     { role: 'user', content: 'Opowiedz mi dowcip.' }
   ];

   const response = await service.sendChat(messages, {
     response_format: {
       type: 'json_schema',
       json_schema: {
         name: 'jokeResponse',
         strict: true,
         schema: {
           type: 'object',
           properties: { joke: { type: 'string' } },
           required: ['joke']
         }
       }
     }
   });
   console.log(response.joke);
   ```

6. **Testowanie**  
   - Dodaj jednostkowe testy w `src/tests/openRouterService.test.ts`:
     - Sytuacje pozytywne i negatywne.  
     - Mock `fetch` zwracający poprawne i niepoprawne odpowiedzi.

7. **Integracja w API**  
   - W `src/pages/api/chat.ts` (Astro endpoint):
     ```ts
     import { OpenRouterService } from 'src/lib/services/openRouterService';
     export async function post({ request }) {
       const { messages } = await request.json();
       const service = new OpenRouterService({ apiKey: process.env.OPENROUTER_API_KEY! });
       const result = await service.sendChat(messages);
       return new Response(JSON.stringify(result));
     }
     ```

8. **Deployment**  
   - Upewnij się, że zmienne środowiskowe są skonfigurowane w środowisku produkcyjnym.  
   - Przebuduj projekt: `npm run build` i wdroż na DigitalOcean.

---

### Przykłady kluczowych elementów
1. **System message**:
   ```ts
   { role: 'system', content: 'You are a knowledgeable assistant.' }
   ```
2. **User message**:
   ```ts
   { role: 'user', content: 'Jakie jest dziś miasto?' }
   ```
3. **Response format**:
   ```ts
   {
     type: 'json_schema',
     json_schema: {
       name: 'weatherResponse',
       strict: true,
       schema: {
         type: 'object',
         properties: {
           city: { type: 'string' },
           temperature: { type: 'number' }
         },
         required: ['city', 'temperature']
       }
     }
   }
   ```
4. **Model name**: `'gpt-4o-mini'`  
5. **Parametry modelu**: `{ temperature: 0.8, top_p: 0.9, max_tokens: 300 }` 