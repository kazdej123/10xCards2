import { test as cleanup } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Konwersja __dirname dla modułów ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ścieżki do plików ze stanem uwierzytelniania
const authDir = path.join(__dirname, "../.auth");
const userAuthFile = path.join(authDir, "user.json");
const adminAuthFile = path.join(authDir, "admin.json");

cleanup("cleanup authentication files", async () => {
  // eslint-disable-next-line no-console
  console.log("🧹 Rozpoczynam czyszczenie plików uwierzytelniania...");

  try {
    // Usuwamy pliki ze stanem uwierzytelniania
    if (fs.existsSync(userAuthFile)) {
      fs.unlinkSync(userAuthFile);
      // eslint-disable-next-line no-console
      console.log("🗑️ Usunięto plik stanu użytkownika");
    }

    if (fs.existsSync(adminAuthFile)) {
      fs.unlinkSync(adminAuthFile);
      // eslint-disable-next-line no-console
      console.log("🗑️ Usunięto plik stanu administratora");
    }

    // eslint-disable-next-line no-console
    console.log("✅ Czyszczenie zakończone pomyślnie");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Błąd podczas czyszczenia:", error);
    // Nie rzucamy błędu, aby nie przerwać procesu testowego
  }
});
