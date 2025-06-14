# Diagram Architektury UI - Moduł Autentykacji 10xCards

## Analiza Architektury

Na podstawie analizy specyfikacji modułu logowania i rejestracji z plików referencyjnych oraz przeszukania codebase, zidentyfikowałem następujące komponenty:

### Komponenty wymienione w specyfikacji:

**Strony Astro:**

- `src/pages/index.astro` (częściowo istnieje - wyświetla Welcome component)
- `src/pages/login.astro` (do implementacji)
- `src/pages/register.astro` (do implementacji)
- `src/pages/reset-password.astro` (do implementacji)

**Komponenty React (src/components/auth):**

- `AuthButtons.tsx` (do implementacji)
- `LoginForm.tsx` (do implementacji)
- `RegisterForm.tsx` (do implementacji)
- `ResetPasswordForm.tsx` (do implementacji)

**Endpointy API (src/pages/api/auth):**

- `register.ts` (do implementacji)
- `login.ts` (do implementacji)
- `logout.ts` (do implementacji)
- `reset-password.ts` (do implementacji)

**Store i middleware:**

- `AuthStore` (Zustand) (do implementacji)
- `src/middleware/index.ts` (istnieje, ale wymaga rozszerzenia o autoryzację)

**Istniejące komponenty:**

- Podstawowy klient Supabase (`src/db/supabase.client.ts`)
- Komponenty UI z Shadcn/ui (`src/components/ui/`)
- Komponenty dla generowania fiszek

### Przepływ danych między komponentami:

- AuthButtons → formularze logowania/rejestracji
- Formularze → endpointy API → Supabase Auth
- AuthStore ↔ komponenty (zarządzanie stanem użytkownika)
- Middleware → weryfikacja sesji → przekierowania

### Funkcjonalność każdego komponentu:

- **AuthButtons**: Wyświetlanie odpowiednich przycisków w zależności od stanu autoryzacji
- **LoginForm/RegisterForm**: Walidacja i przesyłanie danych autentykacji
- **ResetPasswordForm**: Resetowanie hasła przez email
- **Endpointy API**: Komunikacja z Supabase Auth
- **AuthStore**: Globalny stan użytkownika
- **Middleware**: Ochrona tras i weryfikacja sesji

## Diagram Architektury UI

```mermaid
flowchart TD
    subgraph "Warstwa Prezentacji - Astro Pages"
        A["index.astro<br/>Strona Główna"]
        B["login.astro<br/>Strona Logowania"]
        C["register.astro<br/>Strona Rejestracji"]
        D["reset-password.astro<br/>Reset Hasła"]
        E["generate.astro<br/>Generowanie Fiszek"]
    end

    subgraph "Komponenty Autentykacji - React"
        F["AuthButtons.tsx<br/>Przyciski Auth"]
        G["LoginForm.tsx<br/>Formularz Logowania"]
        H["RegisterForm.tsx<br/>Formularz Rejestracji"]
        I["ResetPasswordForm.tsx<br/>Reset Hasła"]
    end

    subgraph "Zarządzanie Stanem"
        J["AuthStore<br/>(Zustand)<br/>Stan Użytkownika"]
    end

    subgraph "Endpointy API - Astro"
        K["/api/auth/login.ts<br/>POST Login"]
        L["/api/auth/register.ts<br/>POST Register"]
        M["/api/auth/logout.ts<br/>POST Logout"]
        N["/api/auth/reset-password.ts<br/>POST Reset"]
    end

    subgraph "Walidacja Danych"
        O["Schematy Zod<br/>Walidacja Formularzy"]
    end

    subgraph "Middleware i Bezpieczeństwo"
        P["middleware/index.ts<br/>Weryfikacja Sesji"]
        Q["RLS Policies<br/>Row Level Security"]
    end

    subgraph "Backend - Supabase"
        R["Supabase Auth<br/>Autentykacja"]
        S["Supabase DB<br/>Dane Użytkowników"]
    end

    subgraph "Komponenty UI Współdzielone"
        T["components/ui/*<br/>Shadcn/ui Components"]
        U["FlashcardGenerationView<br/>Generowanie Fiszek"]
    end

    %% Przepływ danych - Strony do Komponentów
    A --> F
    B --> G
    C --> H
    D --> I

    %% Przepływ danych - Komponenty do API
    G --> K
    H --> L
    F --> M
    I --> N

    %% Walidacja
    G --> O
    H --> O
    I --> O

    %% API do Supabase
    K --> R
    L --> R
    M --> R
    N --> R

    %% Stan globalny
    J <--> F
    J <--> G
    J <--> H
    J <--> U

    %% Middleware
    P --> A
    P --> E
    P --> K
    P --> L
    P --> M
    P --> N

    %% Supabase
    R --> S
    R --> J
    Q --> S

    %% UI Components
    G --> T
    H --> T
    I --> T
    F --> T
    U --> T

    %% Aktualizacja po implementacji autentykacji
    A -.-> E
    J -.-> E
    P -.-> U

    %% Style
    classDef implemented fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    classDef toImplement fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef shared fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px

    class A,E,P,T,U,R,S implemented
    class B,C,D,F,G,H,I,J,K,L,M,N,O,Q toImplement
    class R,S backend
    class T,U shared
```

## Legenda

**Kolorowanie komponentów:**

- 🟦 **Niebieskie** - komponenty już zaimplementowane w projekcie
- 🟠 **Pomarańczowe** - komponenty do implementacji zgodnie ze specyfikacją auth-spec.md
- 🟣 **Fioletowe** - backend (Supabase Auth i Database)
- 🟢 **Zielone** - komponenty współdzielone (UI components, istniejące funkcjonalności)

**Kluczowe przepływy:**

1. **Autentykacja**: Strony → Komponenty React → API Endpoints → Supabase Auth
2. **Stan globalny**: AuthStore (Zustand) synchronizowany z wszystkimi komponentami autentykacji
3. **Ochrona tras**: Middleware weryfikuje sesje przed dostępem do chronionych zasobów
4. **Bezpieczeństwo**: Row Level Security (RLS) w Supabase zapewnia izolację danych użytkowników

**Wymagane aktualizacje:**

- Strona główna (`index.astro`) wymaga integracji z AuthButtons dla wyświetlania odpowiednich opcji
- Middleware wymaga rozszerzenia o logikę autoryzacji i przekierowań
- Wszystkie chronione komponenty (np. generowanie fiszek) wymagają integracji z AuthStore
