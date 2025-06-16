# Environment Variables Validator

Ten moduł zapewnia walidację i debugowanie zmiennych środowiskowych dla testów E2E.

## Funkcje

### `loadTestEnv()`
Ładuje zmienne środowiskowe z pliku `.env.test`.

### `validateEnvVars()`
Waliduje czy wszystkie wymagane zmienne środowiskowe są ustawione i wyświetla szczegółowe informacje debugowe.

### `getRequiredEnvVar(varName: string)`
Pobiera wymaganą zmienną środowiskową. Rzuca błąd z pomocnymi informacjami jeśli zmienna nie jest ustawiona.

### `getOptionalEnvVar(varName: string, defaultValue: string)`
Pobiera opcjonalną zmienną środowiskową z wartością domyślną.

### `debugTestEnvironment()`
Wyświetla szczegółowe informacje debugowe o środowisku testowym.

## Wymagane zmienne środowiskowe

Utwórz plik `.env.test` w głównym katalogu projektu z następującymi zmiennymi:

```bash
# Użytkownik testowy
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=your_secure_password

# Administrator testowy
ADMIN_USER_EMAIL=admin@example.com
ADMIN_USER_PASSWORD=your_admin_password

# Opcjonalne
USE_API_LOGIN=true
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

## Przykład użycia

```typescript
import { getRequiredEnvVar, getOptionalEnvVar } from './env-validator';

const email = getRequiredEnvVar('TEST_USER_EMAIL');
const useApiLogin = getOptionalEnvVar('USE_API_LOGIN', 'true');
```

## Komunikaty błędów

Walidator wyświetla szczegółowe komunikaty błędów z:
- Listą brakujących zmiennych
- Opisem każdej zmiennej
- Przykładami wartości
- Instrukcjami naprawy

## Bezpieczeństwo

Wrażliwe dane (hasła, klucze API) są maskowane w logach jako `***********`. 