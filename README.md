# 10x-cards

A web application to quickly create and manage educational flashcard sets using AI-powered suggestions.

## Table of Contents

- [Description](#description)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)
- [CI/CD Pipeline](#ci-cd-pipeline)

## Description

10x-cards enables users to efficiently generate, review, and manage flashcards. Users can paste text excerpts to auto-generate flashcard suggestions via an LLM API, as well as manually create, edit, and delete cards. The app integrates with a spaced repetition algorithm for effective learning.

## Tech Stack

- **Framework**: Astro 5
- **Language**: TypeScript 5
- **UI Library**: React 19, Shadcn/ui
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI API**: Openrouter.ai
- **Testing**: Vitest (unit), React Testing Library, Playwright (E2E), MSW (API mocking)
- **Quality Assurance**: ESLint, Prettier, axe-core (accessibility), Lighthouse
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions
- **Hosting**: DigitalOcean (Docker)

## Getting Started

### Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (v8+)

### Installation

```bash
# Clone the repository
git clone https://github.com/kazdej123/10xCards2.git
cd 10xCards2

# Use the specified Node version
nvm use

# Install dependencies
npm install
```

### Configuration

Create a `.env` file in the root directory with the following variables:

```dotenv
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production site
- `npm run preview` - Preview the production build locally
- `npm run astro` - Astro CLI
- `npm run test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with Playwright UI
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier

## Project Scope

### In-Scope (MVP)

- Automatic flashcard generation from user-provided text (1,000–10,000 characters) with accept/edit/reject functionality
- Manual creation, editing, and deletion of flashcards
- User authentication (registration, login, account deletion)
- Integration with a third-party spaced repetition algorithm
- Storage and scalability via Supabase
- Basic statistics on AI-generated vs. accepted flashcards

### Out-of-Scope

- Custom spaced repetition algorithm
- Gamification features
- Mobile applications
- Importing documents (PDF, DOCX)
- Public API
- Flashcard sharing between users
- Advanced notifications and search

## Project Status

Version: **0.0.1**  
Status: **MVP in active development**

## License

This project currently has no license. Please add a `LICENSE` file to specify licensing terms.

## CI/CD Pipeline

Projekt wykorzystuje GitHub Actions do automatyzacji testów i buildów. Pipeline CI/CD składa się z następujących etapów:

### Workflow: CI/CD Pipeline (`.github/workflows/ci-cd.yml`)

**Uruchamianie:**

- Automatycznie przy push do gałęzi `master`
- Automatycznie przy pull request do gałęzi `master`
- Manualnie poprzez GitHub UI (workflow_dispatch)

**Etapy:**

1. **Quality Checks** - Kontrola jakości kodu

   - ESLint (sprawdzanie jakości kodu)
   - Prettier (sprawdzanie formatowania)

2. **Unit Tests** - Testy jednostkowe

   - Vitest (testy jednostkowe)
   - Generowanie raportów coverage

3. **E2E Tests** - Testy end-to-end

   - Playwright (testy w przeglądarce Chromium)

4. **Production Build** - Build produkcyjny

   - Astro build (generowanie statycznych plików)
   - Uruchamia się tylko po pomyślnym przejściu testów jakości i jednostkowych

5. **Deploy Ready Check** - Potwierdzenie gotowości do wdrożenia
   - Uruchamia się tylko dla push do `master`
   - Wykonuje się po pomyślnym przejściu wszystkich wcześniejszych etapów

### Pozostałe workflow

- **Playwright Tests** (`.github/workflows/playwright.yml`) - Dedykowany workflow dla testów E2E

### Konfiguracja środowiska

- Node.js: wersja określona w `.nvmrc` (22.14.0)
- Cache dependencies: npm (przyspiesza instalację)
- Artefakty: raporty testów, coverage, build produkcyjny

### Uruchomienie lokalne

```bash
# Testy jednostkowe
npm run test:run

# Testy E2E
npm run test:e2e

# Linting
npm run lint

# Build produkcyjny
npm run build
```
