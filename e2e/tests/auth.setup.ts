import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { LoginPage } from "../page-objects/login-page";
import { getRequiredEnvVar, getOptionalEnvVar } from "../fixtures/env-validator";

// Konwersja __dirname dla modułów ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ścieżka do pliku ze stanem uwierzytelniania
const authFile = path.join(__dirname, "../.auth/user.json");

// Dane użytkownika testowego z walidacją
const TEST_USER = {
  email: getRequiredEnvVar("TEST_USER_EMAIL"),
  password: getRequiredEnvVar("TEST_USER_PASSWORD"),
};

setup("authenticate user", async ({ page }) => {
  // eslint-disable-next-line no-console
  console.log("🔐 Rozpoczynam proces uwierzytelniania...");

  const loginPage = new LoginPage(page);

  try {
    // Opcja 1: Logowanie przez API (preferowane dla szybkości)
    if (getOptionalEnvVar("USE_API_LOGIN", "true") === "true") {
      // eslint-disable-next-line no-console
      console.log("📡 Logowanie przez API...");
      await loginPage.loginViaAPI(TEST_USER.email, TEST_USER.password);

      // Nawigujemy do strony głównej, aby upewnić się, że stan jest poprawny
      await page.goto("/");
      await loginPage.verifyLoggedIn();
    } else {
      // Opcja 2: Logowanie przez UI (fallback)
      // eslint-disable-next-line no-console
      console.log("🖱️ Logowanie przez UI...");
      await loginPage.loginViaUI(TEST_USER.email, TEST_USER.password);
      await loginPage.verifyLoggedIn();
    }

    // eslint-disable-next-line no-console
    console.log("✅ Uwierzytelnianie zakończone pomyślnie");

    // Zapisz stan uwierzytelniania do pliku
    await page.context().storageState({ path: authFile });
    // eslint-disable-next-line no-console
    console.log(`💾 Stan uwierzytelniania zapisany w: ${authFile}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Błąd podczas uwierzytelniania:", error);
    throw error;
  }
});

// Dodatkowy setup dla testów wymagających specjalnych uprawnień
const adminAuthFile = path.join(__dirname, "../.auth/admin.json");

const ADMIN_USER = {
  email: getRequiredEnvVar("ADMIN_USER_EMAIL"),
  password: getRequiredEnvVar("ADMIN_USER_PASSWORD"),
};

setup("authenticate admin", async ({ page }) => {
  // eslint-disable-next-line no-console
  console.log("🔐 Rozpoczynam proces uwierzytelniania administratora...");

  const loginPage = new LoginPage(page);

  try {
    // Logowanie administratora
    if (getOptionalEnvVar("USE_API_LOGIN", "true") === "true") {
      // eslint-disable-next-line no-console
      console.log("📡 Logowanie administratora przez API...");
      await loginPage.loginViaAPI(ADMIN_USER.email, ADMIN_USER.password);
      await page.goto("/");
      await loginPage.verifyLoggedIn();
    } else {
      // eslint-disable-next-line no-console
      console.log("🖱️ Logowanie administratora przez UI...");
      await loginPage.loginViaUI(ADMIN_USER.email, ADMIN_USER.password);
      await loginPage.verifyLoggedIn();
    }

    // Opcjonalnie: sprawdź czy użytkownik ma uprawnienia administratora
    await expect(page.getByTestId("admin-panel")).toBeVisible();

    // eslint-disable-next-line no-console
    console.log("✅ Uwierzytelnianie administratora zakończone pomyślnie");

    // Zapisz stan uwierzytelniania administratora
    await page.context().storageState({ path: adminAuthFile });
    // eslint-disable-next-line no-console
    console.log(`💾 Stan uwierzytelniania administratora zapisany w: ${adminAuthFile}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Błąd podczas uwierzytelniania administratora:", error);
    throw error;
  }
});
