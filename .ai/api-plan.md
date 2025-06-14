# REST API Plan

## 1. Resources

- **Users** (`users` table managed by Supabase Auth)
- **Flashcards** (`flashcards` table)
- **Generations** (`generations` table)
- **Generation Error Logs** (`generation_error_logs` table)

## 2. Endpoints

### 2.1 Flashcards CRUD

- **GET** `/api/flashcards`

  - Fetch a paginated list of flashcards for the authenticated user.
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 10)
    - `source`: `ai-full` | `ai-edited` | `manual` (optional)
    - `sort_by`: `created_at` | `updated_at` (default: `created_at`)
    - `order`: `asc` | `desc` (default: `desc`)
  - Response: `200 OK` `{ data: Flashcard[], pagination: { page, limit, total } }`, `401 Unauthorized`

- **GET** `/api/flashcards/{id}`

  - Fetch a single flashcard by ID.
  - Path Parameters: `id: number`
  - Response: `200 OK` `{ id, front, back, source, generation_id, created_at, updated_at }`, `404 Not Found`, `401 Unauthorized`

- **POST** `/api/flashcards`

  - Create one or more flashcards (manual or AI-generated).
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
  - Validations:
    - `front` ≤ 200 characters, `back` ≤ 500 characters, not empty.
    - `generation_id` required when `source` is `ai-full` or `ai-edited`, must be `null` for `manual` source
    - At least one flashcard in the array.
    - Maximum 100 flashcards per request.
  - Response: `201 Created` `{ data: [{ id, front, back, source, generation_id, created_at, updated_at }] }`, `400 Bad Request`, `401 Unauthorized`

- **PUT** `/api/flashcards/{id}`

  - Update an existing flashcard (manual or AI-generated).
  - Path Parameters: `id: number`
  - Request Body: `{ front?: string, back?: string }`
  - Validations: same as creation (front ≤ 200 chars, back ≤ 500 chars, not empty)
  - Note: `source` changes automatically to `ai-edited` when updating AI-generated flashcards, remains `manual` for manual flashcards
  - Response: `200 OK` `{ id, ... }`, `400 Bad Request`, `404 Not Found`, `401 Unauthorized`

- **DELETE** `/api/flashcards/{id}`
  - Delete a flashcard.
  - Path Parameters: `id: number`
  - Response: `204 No Content`, `404 Not Found`, `401 Unauthorized`

### 2.2 Generations

- **POST** `/api/generations`

  - Initiate an AI generation of flashcard proposals.
  - Request Body:
    ```json
    { "source_text": "User provided text (1000 to 10000 characters)" }
    ```
  - Validations: `source_text.length` between 1000 and 10000 characters.
  - Behavior:
    1. Create a new `generations` record.
    2. Call AI model to generate flashcard proposals.
    3. On success: update `generations.generated_count` and return flashcard proposals.
    4. On failure: log to `generation_error_logs` and return `503 Service Unavailable`.
  - Response JSON:
    ```json
    {
      "generation_id": 123,
      "flashcard_proposals": [{ "front": "Generated Question", "back": "Generated Answer", "source": "ai-full" }],
      "generated_count": 5
    }
    ```
  - Errors: `400 Bad Request`, `503 Service Unavailable`, `401 Unauthorized`

- **POST** `/api/generations/{generation_id}/flashcards`

  - Accept flashcard proposals from a generation (bulk flashcard creation).
  - Path Parameters: `generation_id: number`
  - Request Body:
    ```json
    {
      "flashcards": [
        {
          "front": "Generated Question",
          "back": "Generated Answer",
          "source": "ai-full"
        },
        {
          "front": "Edited Question",
          "back": "Edited Answer",
          "source": "ai-edited"
        }
      ]
    }
    ```
  - Validations: same as POST /api/flashcards, but source must be `ai-full` or `ai-edited`
  - Behavior: Creates flashcards and updates generation counts (`accepted_unedited_count`, `accepted_edited_count`)
  - Response: `201 Created` `{ data: [{ id, front, back, source, generation_id, created_at, updated_at }] }`, `400 Bad Request`, `404 Not Found`, `401 Unauthorized`

- **GET** `/api/generations`

  - Fetch a paginated list of past generations for the authenticated user.
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 10)
  - Response: `200 OK` `{ data: [{ id, model, generated_count, accepted_unedited_count, accepted_edited_count, created_at, updated_at }], pagination: { page, limit, total } }`, `401 Unauthorized`

- **GET** `/api/generations/{id}`
  - Fetch details of a single generation by ID.
  - Path Parameters: `id: number`
  - Response: `200 OK` `{ id, model, generated_count, accepted_unedited_count, accepted_edited_count, created_at, updated_at }`, `404 Not Found`, `401 Unauthorized`

### 2.3 Generation Error Logs

- **GET** `/api/generation_error_logs`

  - Fetch paginated generation error logs for the authenticated user.
  - Query Parameters: same as `/api/generations`.
  - Response: `200 OK` `{ data: [{ id, error_code, error_message, model, source_text_hash, source_text_length, created_at }], pagination: { page, limit, total } }`, `401 Unauthorized`

- **GET** `/api/generation_error_logs/{id}`
  - Fetch a single generation error log entry by ID.
  - Path Parameters: `id: number`
  - Response: `200 OK` `{ id, error_code, error_message, model, source_text_hash, source_text_length, created_at }`, `404 Not Found`, `401 Unauthorized`

## 3. Authentication and Authorization

- All endpoints require `Authorization: Bearer <JWT>` header (except `/auth/*`).
- Use Supabase JWT validation middleware.
- Leverage PostgreSQL RLS policies:
  - `flashcards`, `generations`, `generation_error_logs` scoped to `auth.uid() = user_id`.

## 4. Validation and Business Logic

- **Flashcards**: `front` ≤ 200 chars, `back` ≤ 500 chars.
- **Generations**: `source_text` length between 1000 and 10000 chars.
- **Endpoint differences**:
  - `POST /api/flashcards`: Creates flashcards directly (manual or from existing generations). Updates generation counters if `generation_id` provided.
  - `POST /api/generations/{generation_id}/flashcards`: Accepts AI proposals from a specific generation. Always updates generation counters.
- **Generation flow**:
  1. Create a new `generations` record.
  2. Invoke the AI model; handle timeout and errors.
  3. On error, write to `generation_error_logs`.
  4. Return generated flashcard proposals to the user.
  5. User accepts, edits, or rejects flashcard proposals via `POST /api/generations/{generation_id}/flashcards`, which inserts final flashcards and updates the generation counts.

## 5. Pagination, Filtering, and Sorting

- Use standard query parameters: `page`, `limit`, plus resource-specific filters.
- Responses include `pagination: { page, limit, total }`.
