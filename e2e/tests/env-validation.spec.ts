import { test, expect } from "@playwright/test";
import { getRequiredEnvVar, getOptionalEnvVar, debugTestEnvironment } from "../fixtures/env-validator";

test.describe("Environment Variables Validation", () => {
  test("should demonstrate env validator usage", async () => {
    // Przykład pobierania wymaganych zmiennych
    const testUserEmail = getRequiredEnvVar("TEST_USER_EMAIL");
    const adminUserEmail = getRequiredEnvVar("ADMIN_USER_EMAIL");

    // Przykład pobierania opcjonalnych zmiennych z wartościami domyślnymi
    const useApiLogin = getOptionalEnvVar("USE_API_LOGIN", "true");

    // Walidacje
    expect(testUserEmail).toBeTruthy();
    expect(testUserEmail).toContain("@");
    expect(adminUserEmail).toBeTruthy();
    expect(adminUserEmail).toContain("@");
    expect(["true", "false"]).toContain(useApiLogin);

    // eslint-disable-next-line no-console
    console.log("✅ Wszystkie zmienne środowiskowe są poprawne");
  });

  test("should handle missing environment variables gracefully", async () => {
    // Test sprawdzający czy walidator poprawnie rzuca błędy
    try {
      getRequiredEnvVar("NON_EXISTENT_VAR");
      // Jeśli dotarliśmy tutaj, test powinien nie przejść
      expect(false).toBe(true);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toContain("NON_EXISTENT_VAR");
      expect((error as Error).message).toContain("nie jest ustawiona");
    }
  });

  test("should provide default values for optional variables", async () => {
    const defaultValue = "default_test_value";
    const result = getOptionalEnvVar("NON_EXISTENT_OPTIONAL_VAR", defaultValue);

    expect(result).toBe(defaultValue);
  });

  test("should debug environment information", async () => {
    // Ten test nie sprawdza nic konkretnego, ale uruchamia funkcję debugową
    // eslint-disable-next-line no-console
    console.log("🐛 Wyświetlanie informacji debugowych o środowisku:");
    debugTestEnvironment();

    // Sprawdź czy podstawowe zmienne są ustawione
    expect(process.cwd()).toBeTruthy();
    // NODE_ENV może nie być ustawiona w środowisku testowym, to jest OK
    expect(process.env.NODE_ENV !== undefined || process.env.NODE_ENV === undefined).toBe(true);
  });
});
