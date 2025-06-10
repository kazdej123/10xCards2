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
  - Path Parameters: `id: bigint`
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
  - Response: `201 Created` `{ data: [{ id, front, back, source, generation_id, created_at, updated_at }] }`, `400 Bad Request`, `401 Unauthorized`

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
      "flashcard_proposals": [
        { "id": 1, "front": "Generated Question", "back": "Generated Answer", "source": "ai-full" }
      ],
      "generated_count": 5
    }
    ```
  - Errors: `400 Bad Request`, `503 Service Unavailable`, `401 Unauthorized`

- **GET** `/api/generations`
  - Fetch a paginated list of past generations for the authenticated user.
  - Query Parameters:
    - `page`: number (default: 1)
    - `limit`: number (default: 10)
  - Response: `200 OK` `{ data: [{ id, model, generated_count, accepted_unedited_count, accepted_edited_count, created_at, updated_at }], pagination: { page, limit, total } }`, `401 Unauthorized`

- **GET** `/api/generations/{id}`
  - Fetch details of a single generation by ID.
  - Path Parameters: `id: bigint`
  - Response: `200 OK` `{ id, model, generated_count, accepted_unedited_count, accepted_edited_count, created_at, updated_at }`, `404 Not Found`, `401 Unauthorized`

- **POST** `/api/generations/{generation_id}/flashcards`
  - Create flashcards based on a specific generation and update accepted counts.
  - Path Parameters: `generation_id: bigint`
  - Request Body:
    ```json
    {
      "flashcards": [
        {
          "front": "Question",
          "back": "Answer",
          "source": "ai-full" | "ai-edited"
        }
      ]
    }
    ```
  - Validations: same as `POST /api/flashcards`.
  - Behavior:
    1. Insert provided flashcards linked to `generation_id` and the authenticated `user_id`.
    2. Update `generations.accepted_unedited_count` or `accepted_edited_count` based on `source`.
  - Response: `201 Created` `{ data: Flashcard[] }`, `400 Bad Request`, `404 Not Found`, `401 Unauthorized`

### 2.3 Generation Error Logs

- **GET** `/api/generation_error_logs`
  - Fetch paginated generation error logs for the authenticated user.
  - Query Parameters: same as `/api/generations`.
  - Response: `200 OK` `{ data: [{ id, error_code, error_message, created_at }], pagination: { page, limit, total } }`, `401 Unauthorized`

- **GET** `/api/generation_error_logs/{id}`
  - Fetch a single generation error log entry by ID.
  - Path Parameters: `id: bigint`
  - Response: `200 OK` `{ id, error_code, error_message, created_at }`, `404 Not Found`, `401 Unauthorized`

## 3. Authentication and Authorization
- All endpoints require `Authorization: Bearer <JWT>` header (except `/auth/*`).
- Use Supabase JWT validation middleware.
- Leverage PostgreSQL RLS policies:
  - `flashcards`, `generations`, `generation_error_logs` scoped to `auth.uid() = user_id`.

## 4. Validation and Business Logic
- **Flashcards**: `front` ≤ 200 chars, `back` ≤ 500 chars.
- **Generations**: `source_text` length between 1000 and 10000 chars.
- **Generation flow**:
  1. Create a new `generations` record.
  2. Invoke the AI model; handle timeout and errors.
  3. On error, write to `generation_error_logs`.
  4. Return generated flashcard proposals to the user.
  5. User accepts, edits, or rejects flashcard proposals via `POST /api/generations/{generation_id}/flashcards`, which inserts final flashcards and updates the generation counts.

## 5. Pagination, Filtering, and Sorting
- Use standard query parameters: `page`, `limit`, plus resource-specific filters.
- Responses include `pagination: { page, limit, total }`.