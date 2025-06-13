# Diagram Sekwencji Autentykacji - 10xCards

## Analiza Przepływów Autentykacji

Na podstawie analizy specyfikacji z prd.md i auth-spec.md zidentyfikowałem następujące przepływy autentykacji:

### Wszystkie przepływy autentykacji:
- Rejestracja nowego użytkownika (US-001)
- Logowanie istniejącego użytkownika (US-002)
- Odzyskiwanie hasła (US-002B)
- Wylogowanie użytkownika
- Weryfikacja sesji przed dostępem do chronionych zasobów
- Przekierowania dla nieautoryzowanych użytkowników

### Główni aktorzy i ich interakcje:
- **Przeglądarka** - inicjuje żądania użytkownika, wyświetla UI
- **Middleware** - weryfikuje sesje, chroni trasy, przekierowuje
- **Astro API** - endpointy autentykacji, walidacja danych Zod
- **Supabase Auth** - backend autentykacji, zarządzanie sesjami

### Procesy weryfikacji i odświeżania tokenów:
- Sprawdzenie sesji przy ładowaniu aplikacji przez AuthStore
- Middleware weryfikuje JWT tokeny przed dostępem do chronionych tras
- Automatyczne przekierowanie do /login przy braku autoryzacji
- Supabase automatycznie zarządza odświeżaniem tokenów JWT
- Row Level Security (RLS) filtruje dane po user_id

### Opis każdego kroku autentykacji:
- **Rejestracja**: formularz → walidacja → signUp() → automatyczne zalogowanie → redirect
- **Logowanie**: formularz → walidacja → signInWithPassword() → sesja → redirect
- **Reset hasła**: email → resetPasswordForEmail() → link 24h → nowe hasło
- **Wylogowanie**: signOut() → usunięcie sesji → redirect do /login
- **Weryfikacja**: middleware sprawdza sesję → dostęp/przekierowanie

## Diagram Sekwencji Autentykacji

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przeglądarka
    participant Middleware as Middleware Astro
    participant API as Astro API
    participant Supabase as Supabase Auth
    
    Note over Browser,Supabase: Scenariusz 1: Rejestracja nowego użytkownika
    
    Browser->>+API: POST /api/auth/register
    Note over Browser,API: {email, password, confirmPassword}
    
    API->>API: Walidacja danych (Zod)
    
    alt Dane niepoprawne
        API-->>Browser: 400 - Błąd walidacji
    else Dane poprawne
        API->>+Supabase: supabase.auth.signUp()
        
        alt Email już istnieje
            Supabase-->>API: Błąd - konto istnieje
            API-->>Browser: 409 - Konto już istnieje
        else Rejestracja udana
            Supabase-->>-API: Użytkownik + sesja
            API-->>-Browser: 200 - Automatyczne zalogowanie
            Browser->>Browser: Przekierowanie do /
        end
    end
    
    Note over Browser,Supabase: Scenariusz 2: Logowanie użytkownika
    
    Browser->>+API: POST /api/auth/login
    Note over Browser,API: {email, password}
    
    API->>API: Walidacja danych (Zod)
    API->>+Supabase: supabase.auth.signInWithPassword()
    
    alt Nieprawidłowe dane
        Supabase-->>API: Błąd autentykacji
        API-->>Browser: 401 - Nieprawidłowy email lub hasło
    else Logowanie udane
        Supabase-->>-API: Użytkownik + sesja
        API-->>-Browser: 200 - Zalogowano pomyślnie
        Browser->>Browser: Przekierowanie do /
    end
    
    Note over Browser,Supabase: Scenariusz 3: Reset hasła
    
    Browser->>+API: POST /api/auth/reset-password
    Note over Browser,API: {email}
    
    API->>+Supabase: supabase.auth.resetPasswordForEmail()
    Supabase-->>-API: Link resetujący wysłany
    API-->>-Browser: 200 - Sprawdź email
    
    Note over Browser,Supabase: Scenariusz 4: Dostęp do chronionej trasy
    
    Browser->>+Middleware: GET /generate
    Middleware->>+Supabase: Sprawdź sesję
    
    alt Brak sesji lub wygasła
        Supabase-->>Middleware: Brak autoryzacji
        Middleware-->>Browser: Przekierowanie do /login
    else Sesja ważna
        Supabase-->>-Middleware: Użytkownik zweryfikowany
        Middleware-->>-Browser: Dostęp do strony
    end
    
    Note over Browser,Supabase: Scenariusz 5: Wylogowanie
    
    Browser->>+API: POST /api/auth/logout
    API->>+Supabase: supabase.auth.signOut()
    Supabase-->>-API: Sesja usunięta
    API-->>-Browser: 200 - Wylogowano
    Browser->>Browser: Przekierowanie do /login
    
    Note over Browser,Supabase: Zarządzanie sesjami przez AuthStore
    
    Browser->>+Supabase: Sprawdź bieżącą sesję
    
    alt Sesja aktywna
        Supabase-->>Browser: Dane użytkownika
        Browser->>Browser: AuthStore.setUser()
    else Brak sesji
        Supabase-->>-Browser: Null
        Browser->>Browser: AuthStore.clearUser()
    end
```

## Kluczowe aspekty bezpieczeństwa

### Weryfikacja i ochrona
1. **Walidacja po stronie serwera** - wszystkie dane są walidowane przez schematy Zod
2. **JWT tokeny** - automatyczne zarządzanie przez Supabase Auth
3. **Middleware** - ochrona tras przed nieautoryzowanym dostępem
4. **RLS (Row Level Security)** - izolacja danych użytkowników w bazie danych

### Zarządzanie sesjami
1. **Automatyczne odświeżanie** tokenów przez Supabase
2. **Synchronizacja stanu** między AuthStore a Supabase Auth
3. **Przekierowania** dla nieautoryzowanych użytkowników
4. **Bezpieczne wylogowanie** z usunięciem wszystkich tokenów

### Obsługa błędów
1. **Spójne komunikaty** błędów bez ujawniania szczegółów technicznych
2. **Graceful handling** błędów sieci i API
3. **Walidacja po stronie klienta** dla lepszego UX
4. **Fallback** mechanizmy przy awariach usług 