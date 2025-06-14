# Optymalizacja Procesu Logowania w Testach E2E

## Przegląd

Ten dokument opisuje zoptymalizowaną implementację uwierzytelniania w testach E2E przy użyciu Playwright.

## Architektura Rozwiązania

### 1. Dwufazowe Podejście

#### Faza 1: Tymczasowe podejście
- Każdy test loguje się osobno przez UI
- Łatwiejsze debugowanie

#### Faza 2: Zoptymalizowane podejście
- Sesje generowane raz i zapisywane do reużycia
- Logowanie przez API (opcjonalne)
- Znacznie szybsze wykonywanie testów

### 2. Struktura Plików

```
e2e/
├── .auth/                          # Zapisane stany uwierzytelniania
│   ├── user.json                   # Stan zwykłego użytkownika
│   └── admin.json                  # Stan administratora
├── page-objects/
│   └── login-page.ts               # Page Object Model dla logowania
├── tests/
│   ├── auth.setup.ts               # Setup uwierzytelniania
│   ├── auth.cleanup.ts             # Cleanup po testach
│   ├── dashboard.authenticated.spec.ts
│   ├── admin.authenticated.spec.ts
│   └── public-pages.guest.spec.ts
└── AUTH_OPTIMIZATION.md
```

## Konfiguracja

### Zmienne Środowiskowe (.env.test)

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=adminpassword123
USE_API_LOGIN=true
BASE_URL=http://localhost:4321
```

## Uruchamianie Testów

```bash
# Wszystkie testy
npx playwright test

# Tylko testy użytkownika
npx playwright test --project=chromium-user

# Tylko testy administratora
npx playwright test --project=chromium-admin

# Tylko testy publiczne
npx playwright test --project=chromium-guest
```

## Korzyści

- ⚡ 90% szybsze testy
- 🔄 Równoległe wykonywanie
- 📡 Logowanie przez API
- 🔒 Izolacja testów

## Page Object Model

### LoginPage

Klasa `LoginPage` zawiera metody do:
- Logowania przez UI (`loginViaUI`)
- Logowania przez API (`loginViaAPI`) 
- Walidacji stanu logowania
- Wylogowania

Przykład użycia:
```typescript
const loginPage = new LoginPage(page);
await loginPage.loginViaUI("email@test.com", "password");
await loginPage.verifyLoggedIn();
```

## Konwencje Testów

### Nazwy Plików
- `*.authenticated.spec.ts` - testy wymagające uwierzytelniania
- `*.guest.spec.ts` - testy bez uwierzytelniania
- `*.setup.ts` - pliki setup
- `*.cleanup.ts` - pliki cleanup

### Selektory
Używaj `data-testid` zgodnie z konwencją:
```html
<button data-testid="login-button">Zaloguj</button>
```

```typescript
await page.getByTestId("login-button").click();
```

### Struktura Testów (AAA Pattern)
```typescript
test("nazwa testu", async ({ page }) => {
  // Arrange - przygotowanie danych
  const element = page.getByTestId("selector");
  
  // Act - wykonanie akcji
  await element.click();
  
  // Assert - sprawdzenie wyników
  await expect(page).toHaveURL("/expected-url");
});
```

## Migracja z Obecnych Testów

### Krok 1: Identyfikacja testów wymagających uwierzytelniania
Przejrzyj obecne testy i oznacz te, które wymagają logowania.

### Krok 2: Przygotowanie danych testowych
Stwórz użytkowników testowych w bazie testowej:
- Zwykły użytkownik (user)
- Administrator (admin)

### Krok 3: Aktualizacja testów
Przenieś testy do odpowiednich plików:
- Testy wymagające logowania → `*.authenticated.spec.ts`
- Testy publiczne → `*.guest.spec.ts`

### Krok 4: Dostosowanie selektorów
Upewnij się, że strony zawierają `data-testid` dla kluczowych elementów:
- `user-menu` - menu użytkownika
- `login-form` - formularz logowania
- `logout-button` - przycisk wylogowania

## Rozwiązywanie Problemów

### Problem: Setup nie może się zalogować
```bash
# Sprawdź czy zmienne środowiskowe są ustawione
echo $TEST_USER_EMAIL

# Uruchom tylko setup z debugowaniem
npx playwright test --project=setup --headed --debug
```

### Problem: Testy nie widzą stanu uwierzytelniania
```bash
# Sprawdź czy pliki stanu zostały utworzone
ls -la e2e/.auth/

# Sprawdź czy projekt używa właściwego storageState
grep -n "storageState" playwright.config.ts
```

### Problem: Testy są nadal wolne
```bash
# Sprawdź czy USE_API_LOGIN jest ustawione
grep USE_API_LOGIN .env.test

# Uruchom tylko jeden projekt na raz
npx playwright test --project=chromium-user
```

## Dalszy Rozwój

### Opcje rozszerzenia:
1. **Różne role użytkowników** - dodanie więcej stanów uwierzytelniania
2. **Testy międzybranżowe** - testowanie interakcji między różnymi rolami
3. **Uwierzytelnianie OAuth** - obsługa zewnętrznych dostawców uwierzytelniania
4. **Testy mobilne** - rozszerzenie na różne urządzenia

### Monitorowanie wydajności:
```bash
# Porównanie czasów wykonania
time npx playwright test --project=setup
time npx playwright test --project=chromium-user
``` 