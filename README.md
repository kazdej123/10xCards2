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

## Description

10x-cards enables users to efficiently generate, review, and manage flashcards. Users can paste text excerpts to auto-generate flashcard suggestions via an LLM API, as well as manually create, edit, and delete cards. The app integrates with a spaced repetition algorithm for effective learning.

## Tech Stack

- **Framework**: Astro 5
- **Language**: TypeScript 5
- **UI Library**: React 19, Shadcn/ui
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth)
- **AI API**: Openrouter.ai
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