# Schema bazy danych - 10x-cards

## 1. Tabele

### 1.1. users

This table is managed by Supabase Auth.

- id: UUID PRIMARY KEY
- email: VARCHAR(255) NOT NULL UNIQUE
- encrypted_password: VARCHAR NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- confirmed_at: TIMESTAMPTZ

### 1.2. flashcards

- id: BIGSERIAL PRIMARY KEY
- front: VARCHAR(200) NOT NULL
- back: VARCHAR(500) NOT NULL
- source: VARCHAR NOT NULL CHECK (source IN ('ai-full','ai-edited','manual'))
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- generation_id: BIGINT REFERENCES generations(id) ON DELETE SET NULL
- user_id: UUID NOT NULL REFERENCES users(id)

_Trigger: Automatically update the 'updated_at' column on record updates._

### 1.3. generations

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- model: VARCHAR(100) NOT NULL
- generated_count: INTEGER NOT NULL
- accepted_unedited_count: INTEGER NULLABLE
- accepted_edited_count: INTEGER NULLABLE
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- generation_duration: INTEGER NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at: TIMESTAMPTZ NOT NULL DEFAULT now()

### 1.4. generation_error_logs

- id: BIGSERIAL PRIMARY KEY
- user_id: UUID NOT NULL REFERENCES users(id)
- model: VARCHAR NOT NULL
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (source_text_length BETWEEN 1000 AND 10000)
- error_code: VARCHAR(100) NOT NULL
- error_message: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFAULT now()

## 2. Relacje

- 1 użytkownik → N flashcards (users.id = flashcards.user_id)
- 1 użytkownik → N generations (users.id = generations.user_id)
- 1 użytkownik → N generation_error_logs (users.id = generation_error_logs.user_id)
- 1 generacja → N flashcards (generations.id = flashcards.generation_id)

## 3. Indeksy

- flashcards(user_id)
- flashcards(generation_id)
- generations(user_id)
- generation_error_logs(user_id)

## 4. Zasady PostgreSQL (RLS)

```sql
-- Flashcards
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their flashcards" ON flashcards
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Generations
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their generations" ON generations
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Generation Error Logs
ALTER TABLE generation_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their error logs" ON generation_error_logs
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## 5. Dodatkowe uwagi

- Triggery (np. `update_updated_at()`) powinny automatycznie aktualizować kolumnę `updated_at` na każdej tabeli, w której ta kolumna występuje
