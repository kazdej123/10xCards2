-- Migration: Disable RLS Policies
-- Description: Disables all RLS policies from flashcards, generations and generation_error_logs tables
-- Created at: 2024-03-21 14:30:00 UTC

-- Drop policies for flashcards
drop policy if exists "Authenticated users can view their own flashcards" on public.flashcards;
drop policy if exists "Authenticated users can create their own flashcards" on public.flashcards;
drop policy if exists "Authenticated users can update their own flashcards" on public.flashcards;
drop policy if exists "Authenticated users can delete their own flashcards" on public.flashcards;

-- Drop policies for generations
drop policy if exists "Authenticated users can view their own generations" on public.generations;
drop policy if exists "Authenticated users can create their own generations" on public.generations;
drop policy if exists "Authenticated users can update their own generations" on public.generations;
drop policy if exists "Authenticated users can delete their own generations" on public.generations;

-- Drop policies for generation_error_logs
drop policy if exists "Authenticated users can view their own error logs" on public.generation_error_logs;
drop policy if exists "Authenticated users can create their own error logs" on public.generation_error_logs;

-- Disable RLS on tables
alter table public.flashcards disable row level security;
alter table public.generations disable row level security;
alter table public.generation_error_logs disable row level security; 