# REST API Plan

## 1. Resources
- **Users** (`users` table managed by Supabase Auth)
- **Flashcards** (`flashcards` table)
- **Generations** (`generations` table)
- **Generation Error Logs** (`generation_error_logs` table)

## 2. Endpoints

### 2.2 Flashcards CRUD

- **GET** `/api/flashcards`
  - Fetch a paginated list of flashcards for the authenticated user.
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 10)
    - `source`: `ai-full` | `ai-edited` | `manual` (optional)
    - `sortBy`: `created_at` | `updated_at` (default: `created_at`)
    - `order`: `asc` | `desc` (default: `desc`)
  - Response: `200 OK` `{ data: Flashcard[], meta: { page, limit, total } }`

- **GET** `/api/flashcards/{id}`
  - Fetch a single flashcard by ID.
  - Path Parameters: `id: bigint`
  - Response: `200 OK` `{ id, front, back, source, created_at, updated_at }`, `404 Not Found`

- **POST** `/api/flashcards`
  - Create one or more flashcards (manual or AI-generated).
  - Request Body:
    ```json
    {
      "flashcards": [{
        "front": string,
        "back": string,
        "source": "manual" | "ai-full" | "ai-edited",
        "generation_id"?: number
      }]
    }
    ```
  - Validations:
    - `front` ≤ 200 chars, `back` ≤ 500 chars, not empty for each flashcard
    - `generation_id` required when `source` is `ai-full` or `ai-edited`, must be null for `manual` source
    - At least one flashcard in the array
  - Response: `201 Created` `{ data: { id, front, back, source, generation_id, created_at, updated_at }[] }`, `400 Bad Request`

- **PUT** `/api/flashcards/{id}`
  - Update an existing flashcard (manual or AI-generated).
  - Path Parameters: `id: bigint`
  - Request Body: `{ front?: string, back?: string }`
  - Validations: same as creation; additionaly `source` must be `ai-edited` or `manual`
  - Response: `200 OK` `{ id, ... }`, `400 Bad Request`, `404 Not Found`

- **DELETE** `/api/flashcards/{id}`
  - Delete a flashcard.
  - Path Parameters: `id: bigint`
  - Response: `204 No Content`, `404 Not Found`

### 2.3 Generations

- **POST** `/api/generations`
  - Initiate an AI generation of flashcard proposals.
  - Request Body: `{ sourceText: string }`
  - Validations: `sourceText.length` between 1000 and 10000 characters.
  - Behavior:
    1. Create a new `generations` record with status `pending`.
    2. Call AI model.
    3. On success: return proposals and update `generations.generated_count`.
    4. On failure: log to `generation_error_logs` and return `503 Service Unavailable`.
  - Response: `200 OK` `{ generationId, proposals: { front, back }[], generatedCount }`

- **POST** `/api/generations/{generationId}/flashcards`
  - Accept or edit proposals to persist as actual flashcards.
  - Path Parameters: `generationId: bigint`
  - Request Body:
    ```json
    {
      "accepted": [{ "front": string, "back": string }],
      "rejectedIds": [number],
      "edited": [{ "proposalId": number, "front": string, "back": string }]
    }
    ```
  - Behavior:
    1. Insert accepted and edited flashcards into `flashcards` with `generation_id`.
    2. Update `generations.accepted_unedited_count` and `accepted_edited_count`.
  - Response: `201 Created` `{ flashcards: Flashcard[] }`, `400 Bad Request`, `404 Not Found`

- **GET** `/api/generations`
  - Fetch paginated list of past generations.
  - Query Parameters: same pagination as flashcards.
  - Response: `200 OK` `{ data: Generation[], meta }`

- **GET** `/api/generations/{id}`
  - Fetch details of a single generation.
  - Includes counts and timestamps.
  - Response: `200 OK` `{ id, model, generated_count, accepted_unedited_count, accepted_edited_count, created_at, updated_at }`, `404 Not Found`

### 2.4 Generation Error Logs

- **GET** `/api/generations/errors`
  - Fetch paginated error logs for the user.
  - Query Parameters: same pagination.
  - Response: `200 OK` `{ data: GenerationErrorLog[], meta }`

- **GET** `/api/generations/errors/{id}`
  - Fetch a single error log entry.
  - Response: `200 OK` `{ id, error_code, error_message, created_at }`, `404 Not Found`

## 3. Authentication and Authorization
- All endpoints require `Authorization: Bearer <JWT>` header (except `/auth/*`).
- Use Supabase JWT validation middleware.
- Leverage PostgreSQL RLS policies:
  - `flashcards`, `generations`, `generation_error_logs` scoped to `auth.uid() = user_id`.

## 4. Validation and Business Logic
- **Flashcards**: `front` ≤ 200 chars, `back` ≤ 500 chars.
- **Generations**: `sourceText` length between 1000 and 10000 chars.
- **Generation flow**:
  1. Create generation record.
  2. Invoke AI; handle timeout and errors.
  3. On error, write to `generation_error_logs`.
  4. Return proposals for user review.
  5. On acceptance, insert into `flashcards` and update `generations` counts.

## 5. Pagination, Filtering, and Sorting
- Use standard query parameters: `page`, `limit`, plus resource-specific filters.
- Responses include `meta: { page, limit, total }`.