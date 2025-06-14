# Środowisko testowe

To jest kompletne środowisko do testów jednostkowych w projekcie 10xCards.

## Konfiguracja

- **Vitest** - Test runner z szybkim wykonaniem
- **React Testing Library** - Do testowania komponentów React
- **jsdom** - Symulacja środowiska przeglądarki
- **MSW** (Mock Service Worker) - Mockowanie API
- **jest-axe** - Automatyczne testy dostępności
- **@vitest/coverage-v8** - Raportowanie pokrycia kodu (cel: ≥90%)

## Dostępne skrypty

```bash
# Uruchomienie testów w trybie watch
npm run test:watch

# Uruchomienie testów jednokrotnie
npm run test:run

# Uruchomienie testów z interfejsem UI
npm run test:ui

# Uruchomienie testów z raportowaniem pokrycia
npm run test:coverage
```

## Struktura testów

```
src/
├── test/
│   ├── setup.ts              # Konfiguracja globalna testów
│   ├── mocks/
│   │   ├── server.ts          # MSW server setup
│   │   └── handlers.ts        # MSW request handlers
│   ├── helpers/
│   │   └── supabase-mock.ts   # Helper do mockowania Supabase
│   └── README.md              # Ta dokumentacja
└── components/
    ├── Component.tsx
    └── Component.test.tsx     # Testy dla komponentu
```

## Przykłady użycia

### Test komponentu React

```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  it("renders correctly", () => {
    render(<MyComponent />);
    expect(screen.getByText("Expected text")).toBeInTheDocument();
  });
});
```

### Test z mockami

```typescript
import { vi } from "vitest";

// Mock funkcji
const mockFunction = vi.fn();

// Mock modułu
vi.mock("@/lib/supabase", () => ({
  supabase: createMockSupabaseClient(),
}));
```

### Test dostępności

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

it("has no accessibility violations", async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Mockowanie API z MSW

```typescript
// W pliku test/mocks/handlers.ts
http.get("/api/flashcards", () => {
  return HttpResponse.json([{ id: 1, front: "Test", back: "Answer" }]);
});
```

## Najlepsze praktyki

1. **Struktura testów** - Używaj AAA (Arrange, Act, Assert)
2. **Nazewnictwo** - Opisowe nazwy testów w języku polskim
3. **Mocking** - Mockuj zależności zewnętrzne
4. **Dostępność** - Używaj testów axe dla wszystkich komponentów UI
5. **Coverage** - Utrzymuj pokrycie kodu ≥90%
6. **Setup** - Używaj beforeEach/afterEach do czyszczenia stanu

## Konfiguracja IDE

Dodaj to do swojego `settings.json` w VS Code:

```json
{
  "vitest.enable": true,
  "vitest.commandLine": "npm run test"
}
```
