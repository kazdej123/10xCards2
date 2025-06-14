# Diagram Podróży Użytkownika - 10xCards

## Analiza Ścieżek Użytkownika

Na podstawie analizy PRD i specyfikacji autentykacji zidentyfikowałem następujące ścieżki użytkownika:

### Wszystkie ścieżki użytkownika:

- Nowy użytkownik → Rejestracja → Automatyczne zalogowanie → Generowanie fiszek
- Istniejący użytkownik → Logowanie → Dostęp do funkcjonalności
- Użytkownik zapomniał hasła → Reset hasła → Logowanie → Funkcjonalność
- Zalogowany użytkownik → Korzystanie z aplikacji → Wylogowanie
- Nieautoryzowany dostęp → Przekierowanie do logowania

### Główne podróże i odpowiadające stany:

- **Stan początkowy**: Wejście na stronę główną
- **Stan niezalogowanego**: Ograniczony dostęp, widok przycisków auth
- **Proces rejestracji**: Formularz → Walidacja → Sukces
- **Proces logowania**: Formularz → Weryfikacja → Sukces
- **Reset hasła**: Email → Link → Nowe hasło
- **Stan zalogowanego**: Pełny dostęp do funkcjonalności
- **Generowanie fiszek**: Główna funkcjonalność aplikacji

### Punkty decyzyjne i alternatywne ścieżki:

- Czy użytkownik jest zalogowany? → Różne UI i dostępne opcje
- Czy dane rejestracji są poprawne? → Sukces lub błędy walidacji
- Czy dane logowania są prawidłowe? → Dostęp lub komunikat o błędzie
- Czy użytkownik chce się wylogować? → Powrót do stanu niezalogowanego
- Czy próba dostępu do chronionej trasy? → Dostęp lub przekierowanie

### Cel każdego stanu:

- **Strona główna**: Punkt wejścia, prezentacja opcji
- **Rejestracja**: Utworzenie nowego konta
- **Logowanie**: Weryfikacja tożsamości i dostęp
- **Reset hasła**: Odzyskanie dostępu do konta
- **Generowanie fiszek**: Główna wartość aplikacji dla użytkownika
- **Zarządzanie fiszkami**: Organizacja utworzonych materiałów
- **Sesja nauki**: Wykorzystanie fiszek do nauki

## Diagram Podróży Użytkownika

```mermaid
stateDiagram-v2
    [*] --> StronaGlowna

    state "Strona Główna" as StronaGlowna {
        [*] --> SprawdzSesje
        SprawdzSesje --> Niezalogowany: Brak sesji
        SprawdzSesje --> Zalogowany: Sesja aktywna
    }

    state if_auth <<choice>>
    StronaGlowna --> if_auth
    if_auth --> WidokNiezalogowany: Brak autoryzacji
    if_auth --> WidokZalogowany: Użytkownik zalogowany

    state "Widok Niezalogowany" as WidokNiezalogowany {
        [*] --> PrzyciskiAuth
        PrzyciskiAuth --> WyborLogowanie: Kliknij Logowanie
        PrzyciskiAuth --> WyborRejestracja: Kliknij Rejestracja
    }

    state "Proces Rejestracji" as ProcesRejestracji {
        [*] --> FormularzRejestracji
        FormularzRejestracji --> WalidacjaRejestracji

        state if_rejestracja <<choice>>
        WalidacjaRejestracji --> if_rejestracja
        if_rejestracja --> BladyRejestracji: Dane niepoprawne
        if_rejestracja --> SukcesRejestracji: Dane poprawne

        BladyRejestracji --> FormularzRejestracji
        SukcesRejestracji --> AutomatyczneLogowanie
        AutomatyczneLogowanie --> [*]
    }

    state "Proces Logowania" as ProcesLogowania {
        [*] --> FormularzLogowania
        FormularzLogowania --> WalidacjaLogowania
        FormularzLogowania --> ResetHasla: Zapomniałeś hasła?

        state if_logowanie <<choice>>
        WalidacjaLogowania --> if_logowanie
        if_logowanie --> BladyLogowania: Nieprawidłowe dane
        if_logowanie --> SukcesLogowania: Dane poprawne

        BladyLogowania --> FormularzLogowania
        SukcesLogowania --> [*]
    }

    state "Reset Hasła" as ResetHasla {
        [*] --> FormularzEmail
        FormularzEmail --> WyslanieLinku
        WyslanieLinku --> KomunikatEmail
        KomunikatEmail --> [*]

        note right of FormularzEmail
            Użytkownik wprowadza email
            do resetowania hasła
        end note
    }

    state "Widok Zalogowany" as WidokZalogowany {
        [*] --> GlownaFunkcjonalnosc
        GlownaFunkcjonalnosc --> GenerowanieFiszek: Generuj fiszki
        GlownaFunkcjonalnosc --> MojeFiszki: Przeglądaj fiszki
        GlownaFunkcjonalnosc --> SesjeNauki: Rozpocznij naukę
        GlownaFunkcjonalnosc --> Wylogowanie: Wyloguj się

        GenerowanieFiszek --> GlownaFunkcjonalnosc
        MojeFiszki --> GlownaFunkcjonalnosc
        SesjeNauki --> GlownaFunkcjonalnosc
    }

    state "Generowanie Fiszek" as GenerowanieFiszek {
        [*] --> WprowadzTekst
        WprowadzTekst --> WalidacjaTekst

        state if_tekst <<choice>>
        WalidacjaTekst --> if_tekst
        if_tekst --> BladWalidacji: Za mało/za dużo znaków
        if_tekst --> GenerowanieAI: Tekst poprawny

        BladWalidacji --> WprowadzTekst
        GenerowanieAI --> ListaPropozycji
        ListaPropozycji --> ZarzadzaniePropozycjami
        ZarzadzaniePropozycjami --> ZapisanieFiszek
        ZapisanieFiszek --> [*]
    }

    state "Zarządzanie Fiszkami" as MojeFiszki {
        [*] --> ListaFiszek
        ListaFiszek --> EdycjaFiszki: Edytuj
        ListaFiszek --> UsuniecieFiszki: Usuń
        ListaFiszek --> DodanieFiszki: Dodaj nową

        EdycjaFiszki --> ListaFiszek
        UsuniecieFiszki --> ListaFiszek
        DodanieFiszki --> ListaFiszek
    }

    state "Sesja Nauki" as SesjeNauki {
        [*] --> PrzygotowanieSesji
        PrzygotowanieSesji --> WyswietlFiszke
        WyswietlFiszke --> OcenaFiszki

        state if_kontynuacja <<choice>>
        OcenaFiszki --> if_kontynuacja
        if_kontynuacja --> WyswietlFiszke: Więcej fiszek
        if_kontynuacja --> ZakonczenieSesji: Koniec sesji

        ZakonczenieSesji --> [*]
    }

    state "Ochrona Tras" as OchronaTras {
        [*] --> SprawdzAutoryzacje

        state if_autoryzacja <<choice>>
        SprawdzAutoryzacje --> if_autoryzacja
        if_autoryzacja --> DostepDozwolony: Sesja ważna
        if_autoryzacja --> PrzekierowanieLogin: Brak autoryzacji

        DostepDozwolony --> [*]
        PrzekierowanieLogin --> ProcesLogowania
    }

    %% Połączenia główne
    WyborRejestracja --> ProcesRejestracji
    WyborLogowanie --> ProcesLogowania

    ProcesRejestracji --> WidokZalogowany: Sukces
    ProcesLogowania --> WidokZalogowany: Sukces
    ResetHasla --> ProcesLogowania: Po reset hasła

    Wylogowanie --> WidokNiezalogowany

    %% Ochrona tras
    GenerowanieFiszek --> OchronaTras: Sprawdź dostęp
    MojeFiszki --> OchronaTras: Sprawdź dostęp
    SesjeNauki --> OchronaTras: Sprawdź dostęp

    %% Koniec
    WidokNiezalogowany --> [*]: Opuść aplikację
    WidokZalogowany --> [*]: Opuść aplikację
```

## Kluczowe ścieżki użytkownika

### 🆕 Nowy użytkownik (Happy Path)

1. **Wejście** → Strona główna → Widok niezalogowany
2. **Rejestracja** → Formularz → Walidacja → Automatyczne zalogowanie
3. **Onboarding** → Główna funkcjonalność → Generowanie pierwszych fiszek
4. **Eksploracja** → Przeglądanie fiszek → Pierwsza sesja nauki

### 🔄 Powracający użytkownik

1. **Powrót** → Strona główna → Sprawdzenie sesji
2. **Logowanie** → Formularz → Weryfikacja → Dostęp
3. **Kontynuacja** → Główne funkcjonalności → Zarządzanie fiszkami
4. **Nauka** → Sesje nauki z algorytmem spaced repetition

### 🔐 Reset hasła

1. **Problem z dostępem** → Link "Zapomniałeś hasła?"
2. **Podanie emaila** → Wysłanie linku → Sprawdzenie skrzynki
3. **Nowe hasło** → Powrót do logowania → Normalne korzystanie

### 🛡️ Bezpieczeństwo i ochrona

1. **Nieautoryzowany dostęp** → Middleware → Przekierowanie do logowania
2. **Wygaśnięcie sesji** → Automatyczne wylogowanie → Powrót do logowania
3. **Izolacja danych** → RLS w Supabase → Tylko własne fiszki

## Metryki sukcesu podróży

### Konwersja rejestracji (US-001)

- **Cel**: 75% użytkowników kończy proces rejestracji
- **Punkt miary**: FormularzRejestracji → AutomatyczneLogowanie

### Retencja użytkowników (US-003, US-008)

- **Cel**: 60% użytkowników generuje fiszki w pierwszej sesji
- **Punkt miary**: Pierwsze logowanie → ZapisanieFiszek

### Efektywność AI (Metryki PRD)

- **Cel**: 75% wygenerowanych fiszek zostaje zaakceptowanych
- **Punkt miary**: GenerowanieAI → ZarzadzaniePropozycjami → ZapisanieFiszek

### Wykorzystanie nauki

- **Cel**: 50% użytkowników rozpoczyna sesję nauki w ciągu tygodnia
- **Punkt miary**: MojeFiszki → SesjeNauki
