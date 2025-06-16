import dotenv from "dotenv";
import path from "path";

// Interfejs dla wymaganych zmiennych środowiskowych
type RequiredEnvVars = Record<
  string,
  {
    required: boolean;
    description: string;
    example?: string;
    sensitive?: boolean;
  }
>;

// Definicja wymaganych zmiennych dla testów e2e
const E2E_ENV_VARS: RequiredEnvVars = {
  TEST_USER_EMAIL: {
    required: true,
    description: "Email użytkownika testowego",
    example: "test@example.com",
    sensitive: false,
  },
  TEST_USER_PASSWORD: {
    required: true,
    description: "Hasło użytkownika testowego",
    example: "secure_password_123",
    sensitive: true,
  },
  ADMIN_USER_EMAIL: {
    required: true,
    description: "Email administratora testowego",
    example: "admin@example.com",
    sensitive: false,
  },
  ADMIN_USER_PASSWORD: {
    required: true,
    description: "Hasło administratora testowego",
    example: "admin_secure_password_123",
    sensitive: true,
  },
  USE_API_LOGIN: {
    required: false,
    description: "Użyj logowania przez API zamiast UI",
    example: "true",
    sensitive: false,
  },
  SUPABASE_URL: {
    required: false,
    description: "URL Supabase dla testów",
    example: "https://your-project.supabase.co",
    sensitive: false,
  },
  SUPABASE_ANON_KEY: {
    required: false,
    description: "Klucz anonimowy Supabase",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    sensitive: true,
  },
};

/**
 * Ładuje zmienne środowiskowe z pliku .env.test
 */
export function loadTestEnv(): void {
  const envPath = path.resolve(process.cwd(), ".env.test");

  // eslint-disable-next-line no-console
  console.log(`🔧 Ładowanie zmiennych środowiskowych z: ${envPath}`);

  dotenv.config({ path: envPath });
}

/**
 * Waliduje czy wszystkie wymagane zmienne środowiskowe są ustawione
 */
export function validateEnvVars(): void {
  // eslint-disable-next-line no-console
  console.log("🔍 Sprawdzanie zmiennych środowiskowych...");

  const missingVars: string[] = [];
  const warningVars: string[] = [];
  const debugInfo: string[] = [];

  Object.entries(E2E_ENV_VARS).forEach(([varName, config]) => {
    const value = process.env[varName];

    if (config.required && !value) {
      missingVars.push(varName);
    } else if (!config.required && !value) {
      warningVars.push(varName);
    }

    // Dodaj informacje debugowe (bez ujawniania wrażliwych danych)
    if (value) {
      if (config.sensitive) {
        debugInfo.push(`✅ ${varName}: ***********`);
      } else {
        debugInfo.push(`✅ ${varName}: ${value}`);
      }
    } else {
      debugInfo.push(`❌ ${varName}: nie ustawiona`);
    }
  });

  // Wyświetl informacje debugowe
  // eslint-disable-next-line no-console
  console.log("📋 Status zmiennych środowiskowych:");
  debugInfo.forEach((info) => {
    // eslint-disable-next-line no-console
    console.log(`   ${info}`);
  });

  // Wyświetl ostrzeżenia
  if (warningVars.length > 0) {
    // eslint-disable-next-line no-console
    console.log("⚠️  Opcjonalne zmienne środowiskowe nie są ustawione:");
    warningVars.forEach((varName) => {
      const config = E2E_ENV_VARS[varName];
      // eslint-disable-next-line no-console
      console.log(`   - ${varName}: ${config.description}`);
      if (config.example) {
        // eslint-disable-next-line no-console
        console.log(`     Przykład: ${config.example}`);
      }
    });
  }

  // Rzuć błąd jeśli brakuje wymaganych zmiennych
  if (missingVars.length > 0) {
    // eslint-disable-next-line no-console
    console.error("❌ Błąd: Brakuje wymaganych zmiennych środowiskowych:");

    missingVars.forEach((varName) => {
      const config = E2E_ENV_VARS[varName];
      // eslint-disable-next-line no-console
      console.error(`   - ${varName}: ${config.description}`);
      if (config.example) {
        // eslint-disable-next-line no-console
        console.error(`     Przykład: ${config.example}`);
      }
    });

    // eslint-disable-next-line no-console
    console.error("\n📝 Instrukcja naprawy:");
    // eslint-disable-next-line no-console
    console.error("1. Utwórz plik .env.test w głównym katalogu projektu");
    // eslint-disable-next-line no-console
    console.error("2. Dodaj brakujące zmienne w formacie:");
    // eslint-disable-next-line no-console
    console.error("   NAZWA_ZMIENNEJ=wartość");
    // eslint-disable-next-line no-console
    console.error("3. Uruchom testy ponownie");

    throw new Error(`Brakuje ${missingVars.length} wymaganych zmiennych środowiskowych`);
  }

  // eslint-disable-next-line no-console
  console.log("✅ Wszystkie wymagane zmienne środowiskowe są ustawione");
}

/**
 * Pobiera zmienną środowiskową z walidacją
 */
export function getRequiredEnvVar(varName: string): string {
  const value = process.env[varName];

  if (!value) {
    const config = E2E_ENV_VARS[varName];
    const description = config ? config.description : "Brak opisu";
    const example = config?.example ? `\nPrzykład: ${config.example}` : "";

    throw new Error(
      `Wymagana zmienna środowiskowa ${varName} nie jest ustawiona.\n` +
        `Opis: ${description}${example}\n` +
        `Dodaj ją do pliku .env.test`
    );
  }

  return value;
}

/**
 * Pobiera opcjonalną zmienną środowiskową z wartością domyślną
 */
export function getOptionalEnvVar(varName: string, defaultValue: string): string {
  return process.env[varName] || defaultValue;
}

/**
 * Wyświetla debug informacje o środowisku testowym
 */
export function debugTestEnvironment(): void {
  // eslint-disable-next-line no-console
  console.log("🐛 Debug informacje o środowisku testowym:");
  // eslint-disable-next-line no-console
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || "nie ustawiona"}`);
  // eslint-disable-next-line no-console
  console.log(`   PWD: ${process.cwd()}`);
  // eslint-disable-next-line no-console
  console.log(`   CI: ${process.env.CI || "false"}`);

  const envFile = path.resolve(process.cwd(), ".env.test");
  try {
    const fs = require("fs");
    const exists = fs.existsSync(envFile);
    // eslint-disable-next-line no-console
    console.log(`   .env.test exists: ${exists}`);
    if (exists) {
      const stats = fs.statSync(envFile);
      // eslint-disable-next-line no-console
      console.log(`   .env.test size: ${stats.size} bytes`);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`   .env.test check failed: ${error}`);
  }
}
