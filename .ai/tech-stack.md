Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testing i Quality Assurance:
- Vitest do testów jednostkowych z szybkim wykonaniem i integracją z Vite/Astro
- React Testing Library do testowania komponentów React z naciskiem na testy behawioralne
- Playwright do testów end-to-end z obsługą wszystkich głównych przeglądarek (Chrome, Firefox, Safari, Edge)
- MSW (Mock Service Worker) do mockowania API w testach jednostkowych i integracyjnych
- axe-core do automatycznych testów dostępności (WCAG AA compliance)
- Lighthouse do audytów wydajności i dostępności
- Vitest Coverage do raportowania pokrycia kodu testami (cel: ≥90%)
- Playwright UI Mode do debugowania testów E2E w interaktywnym interfejsie

Narzędzia deweloperskie:
- ESLint i Prettier do utrzymania jakości kodu
- Lighthouse do audytów wydajności i dostępności
- Sentry do monitorowania błędów w produkcji
- Supabase CLI do lokalnego developmentu

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker