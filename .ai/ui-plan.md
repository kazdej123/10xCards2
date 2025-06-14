# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Aplikacja 10x-cards to web application zbudowana w Astro 5 z komponentami React 19. Główną filozofią architektury jest prostota i efektywność w tworzeniu fiszek edukacyjnych z wykorzystaniem AI.

Struktura UI opiera się na czterech głównych obszarach funkcjonalnych:

- **Generowanie AI** - główny widok z textarea i propozycjami fiszek
- **Zarządzanie fiszkami** - przeglądanie, edycja i usuwanie własnych fiszek
- **Sesja nauki** - algorytm spaced repetition dla nauki fiszek
- **Panel użytkownika** - zarządzanie informacjami o koncie użytkownika i ustawieniami

Nawigacja realizowana jest przez topbar z Navigation Menu, który scrolluje wraz z contentem. Aplikacja wykorzystuje card-based layout z wyraźnym podziałem na front/back fiszek oraz implementuje bulk operations dla efektywnego zarządzania dużymi zestawami propozycji AI.

## 2. Lista widoków

### Widok Uwierzytelniania

- **Ścieżka widoku:** `/auth/login`, `/auth/register`
- **Główny cel:** Umożliwienie użytkownikom logowania i rejestracji w systemie
- **Kluczowe informacje do wyświetlenia:**
  - Formularz logowania (email, hasło)
  - Formularz rejestracji (email, hasło, potwierdzenie hasła)
  - Komunikaty o błędach walidacji
  - Informacje o pomyślnej rejestracji/logowaniu
- **Kluczowe komponenty widoku:**
  - AuthenticationForm (Shadcn/ui Input, Button)
  - ValidationMessages
  - LoadingSpinner dla operacji asynchronicznych
- **UX, dostępność i względy bezpieczeństwa:**
  - Keyboard navigation (Tab, Enter)
  - Clear error messages dla nieprawidłowych danych
  - JWT token handling z automatic redirect po udanym logowaniu

### Widok generowania AI

- **Ścieżka widoku:** `/generate`
- **Główny cel:** Umożliwienie użytkownikom wprowadzenia tekstu (1000-10000 znaków) i wygenerowania propozycji fiszek przez AI oraz ich zarządzanie przed zapisem.
- **Kluczowe informacje do wyświetlenia:**
  - Pole tekstowe do wprowadzenia tekstu źródłowego
  - Licznik znaków z walidacją długości tekstu
  - Przycisk generowania fiszek
  - Loading state podczas generowania (skeleton)
  - Lista propozycji fiszek z podziałem front/back
  - Przyciski akcji dla każdej fiszki: "Zatwierdź", "Edytuj", "Odrzuć"
  - Przycisk zapisu zbiorczego wybranych fiszek
- **Kluczowe komponenty widoku:**
  - FlashcardGenerationView - główny kontener widoku
  - TextInputArea - pole tekstowe z walidacją
  - GenerateButton - przycisk inicjujący proces generowania
  - FlashcardList - lista wyświetlająca propozycje fiszek
  - FlashcardListItem - pojedynczy element listy propozycji
  - SkeletonLoader - wskaźnik ładowania
  - ErrorNotification - komunikaty o błędach
  - BulkSaveButton - przycisk zapisu zbiorczego
- **UX, dostępność i względy bezpieczeństwa:**
  - Walidacja długości tekstu (1000-10000 znaków) w czasie rzeczywistym
  - Dezaktywacja przycisków w przypadku nieprawidłowych danych
  - Skeleton loading podczas oczekiwania na odpowiedź API
  - Toast notifications dla błędów API i walidacji
  - Proper focus management i keyboard navigation

### Moje Fiszki

- **Ścieżka widoku:** `/flashcards`
- **Główny cel:** Przeglądanie, edycja i zarządzanie wszystkimi fiszkami użytkownika
- **Kluczowe informacje do wyświetlenia:**
  - Lista wszystkich fiszek z widocznymi front i back
  - Przyciski edycji i usuwania dla każdej fiszki
  - Empty state gdy brak fiszek
  - Przyciski dodania nowej fiszki ręcznie
- **Kluczowe komponenty widoku:**
  - FlashcardsList z inline editing
  - FlashcardItem z edit/delete actions
  - InlineEditor z save/cancel na Enter/Escape
  - InlineConfirmation dla usuwania
  - AddFlashcardButton
  - EmptyState component
- **UX, dostępność i względy bezpieczeństwa:**
  - Single-click activation editing z kursorem w miejscu kliknięcia
  - Confirmation dialog dla usuwania (inline: przycisk → potwierdź/anuluj)
  - Auto-save na blur/Enter, cancel na Escape
  - Optimistic updates z rollback przy błędach
  - Proper ARIA labeling dla edit mode

### Sesja Nauki

- **Ścieżka widoku:** `/study`
- **Główny cel:** Przeprowadzenie sesji nauki z wykorzystaniem algorytmu spaced repetition
- **Kluczowe informacje do wyświetlenia:**
  - Aktualną fiszkę (front → back po interakcji)
  - Opcje oceniania zgodnie z algorytmem
  - Postęp sesji nauki
  - Informacje o zakończeniu sesji
- **Kluczowe komponenty widoku:**
  - StudyCard z flip animation
  - RatingButtons dla algorytmu spaced repetition
  - SessionProgress indicator
  - SessionComplete summary
- **UX, dostępność i względy bezpieczeństwa:**
  - Clear visual feedback dla flip card
  - Keyboard navigation (Spacebar dla flip, numery dla ocen)
  - Session timeout handling
  - Data persistence dla przerwanych sesji

### Historia Generowań (Modal)

- **Ścieżka widoku:** Modal otwierany przyciskiem "Historia" w topbar
- **Główny cel:** Wyświetlenie historii poprzednich generowań AI z podstawowymi statystykami
- **Kluczowe informacje do wyświetlenia:**
  - Lista poprzednich sesji generowania
  - Liczba wygenerowanych vs. zaakceptowanych fiszek
  - Data i czas generowania
  - Informacje o błędach generowania
- **Kluczowe komponenty widoku:**
  - GenerationHistoryModal
  - GenerationHistoryList
  - GenerationStatsCard
  - ErrorLogsList
- **UX, dostępność i względy bezpieczeństwa:**
  - Modal z proper focus trap
  - Close na Escape i click outside
  - Pagination dla dużych historii
  - Error details bez ujawniania wrażliwych informacji

## 3. Mapa podróży użytkownika

### Główny przepływ użytkownika (Happy Path):

1. **Wejście do aplikacji** → Przekierowanie do `/auth/login` jeśli niezalogowany
2. **Logowanie/Rejestracja** → Walidacja danych → Przekierowanie do generowania AI (`/generate`)
3. **Generowanie AI - Wklejanie tekstu** → Wpisanie/wklejenie tekstu (1000-10000 znaków)
4. **Walidacja tekstu** → Real-time character counter z kolorowaniem
5. **Generowanie AI** → Kliknięcie "Generuj" → Loading state → Lista propozycji
6. **Przegląd propozycji** → Akcje na pojedynczych fiszkach (zatwierdź, edytuj, odrzuć)
7. **Bulk zapisywanie** → "Zapisz wszystkie" lub "Zapisz zaakceptowane" → Toast confirmation
8. **Przejście do Moich Fiszek** → Navigation Menu → Przeglądanie zapisanych fiszek
9. **Zarządzanie fiszkami** → Inline editing, usuwanie z confirmation, dodawanie ręczne
10. **Sesja nauki** → Navigation Menu → Algorytm spaced repetition

### Alternatywne przepływy:

- **Ręczne tworzenie fiszek:** Generowanie AI → "Moje Fiszki" → "Dodaj fiszkę" → Formularz → Zapisz
- **Historia generowań:** Dowolny widok → "Historia" w topbar → Modal z listą poprzednich sesji
- **Edycja z generowania AI:** Po generowaniu → Inline editing propozycji → Bulk save
- **Error handling:** Błąd API → Toast notification → Retry lub powrót do poprzedniego stanu

### Przepływ dla nowych użytkowników:

1. **Pierwszy kontakt** → `/auth/register` → Formularz rejestracji
2. **Potwierdzenie rejestracji** → Toast success → Auto-login → Generowanie AI
3. **Onboarding** → Empty state z clear instructions w widoku generowania AI
4. **Pierwsza generacja** → Wklejenie przykładowego tekstu → Generowanie → Akceptacja propozycji
5. **Pierwszy zestaw fiszek** → "Moje Fiszki" → Przegląd → "Sesja nauki"

## 4. Układ i struktura nawigacji

### Struktura nawigacji:

- **Topbar Navigation Menu** (Shadcn/ui NavigationMenu)
  - Scrolluje wraz z contentem (nie sticky)
  - Trzy główne sekcje:
    - "Generuj AI" → Widok generowania AI (`/generate`)
    - "Moje Fiszki" → Lista fiszek (`/flashcards`)
    - "Historia" → Modal z historią generowań
  - Brak breadcrumbs ani dodatkowych opcji użytkownika

### Zasady nawigacji:

- **Active state** dla aktualnie wybranej sekcji
- **Keyboard navigation** (Tab, Enter, Arrow keys)
- **No-refresh navigation** - SPA routing
- **Deep linking support** dla wszystkich głównych widoków
- **Back button handling** - proper browser history

### Sesja Nauki - specjalna nawigacja:

- **Dedicated route** (`/study`) dostępna z "Moje Fiszki"
- **Exit confirmations** przy próbie opuszczenia w trakcie sesji
- **Auto-return** do "Moje Fiszki" po zakończeniu sesji

### Unauthorized states:

- **Redirect to login** dla wszystkich protected routes
- **Preserve intended destination** w URL params dla post-login redirect
- **Clear navigation state** po logout

## 5. Kluczowe komponenty

### FlashcardComponent (Reusable)

- **Tryby wyświetlania:** Preview (generowanie AI), Edit (inline), List (moje fiszki), Study (sesja nauki)
- **Funkcjonalności:** Flip animation, inline editing, selection state, progress tracking
- **Props interface:** mode, flashcard data, callbacks, edit permissions

### TextInputArea

- **Specyficzne cechy:** Pole tekstowe z walidacją długości (1000-10000 znaków)
- **Walidacja:** Real-time walidacja z komunikatami błędów
- **Accessibility:** ARIA labels, proper focus management, validation messages

### BulkSaveButton

- **Przyciski:** "Zapisz wszystkie", "Zapisz zaakceptowane"
- **States:** Disabled gdy brak zaakceptowanych fiszek, loading podczas operacji API
- **Funkcjonalności:** Bulk save management, progress feedback

### InlineEditor

- **Activation:** Single-click z kursorem w miejscu kliknięcia
- **Controls:** Save na Enter/blur, cancel na Escape
- **Validation:** Real-time dla front (≤200 chars), back (≤500 chars)

### InlineConfirmation

- **UI Pattern:** Zamiana przycisku "Usuń" na "Potwierdź/Anuluj"
- **Timeout:** Auto-cancel po 10 sekundach bez interakcji
- **States:** Pending, confirmed, cancelled

### ProgressIndicator

- **AI Operations:** Prosty komunikat "Generowanie..." bez progress bar
- **Bulk Operations:** Loading state z opcjonalnym licznikiem operacji
- **Study Sessions:** Progress w sesji nauki z algorytmem

### ToastNotifications

- **Typy:** Success, error, warning, info
- **Positioning:** Top-right corner
- **Auto-dismiss:** 5 sekund dla success, manual dismiss dla errors
- **Accessibility:** Screen reader announcements

### NavigationMenu (Shadcn/ui)

- **Layout:** Horizontal topbar z trzema sekcjami
- **Active states:** Visual indication aktualnego widoku
- **Responsive behavior:** Adaptacyjny layout

### AuthenticationForm

- **Validation:** Real-time z clear error messages
- **Security:** Password visibility toggle
- **Submission:** Loading states z disabled form podczas API calls

### ErrorBoundary

- **Fallback UI:** User-friendly error messages
- **Recovery:** Retry mechanisms gdzie to możliwe
- **Logging:** Error reporting bez ujawniania wrażliwych informacji
