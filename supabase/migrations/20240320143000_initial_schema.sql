-- Migration: Initial Schema Setup
-- Description: Creates the core tables for the 10x-cards application including flashcards, 
-- generations, and error logs with proper RLS policies
-- Created at: 2024-03-20 14:30:00 UTC

-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- Create updated_at trigger function
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql security definer;

-- Create flashcards table
create table public.flashcards (
    id bigserial primary key,
    front varchar(200) not null,
    back varchar(500) not null,
    source varchar not null check (source in ('ai-full', 'ai-edited', 'manual')),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    generation_id bigint,
    user_id uuid not null references auth.users(id) on delete cascade
);

-- Create generations table
create table public.generations (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar(100) not null,
    generated_count integer not null,
    accepted_unedited_count integer,
    accepted_edited_count integer,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    generation_duration integer not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Create generation_error_logs table
create table public.generation_error_logs (
    id bigserial primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    model varchar not null,
    source_text_hash varchar not null,
    source_text_length integer not null check (source_text_length between 1000 and 10000),
    error_code varchar(100) not null,
    error_message text not null,
    created_at timestamptz not null default now()
);

-- Add foreign key constraint for flashcards.generation_id
alter table public.flashcards
    add constraint flashcards_generation_id_fkey
    foreign key (generation_id)
    references public.generations(id)
    on delete set null;

-- Create indexes
create index flashcards_user_id_idx on public.flashcards(user_id);
create index flashcards_generation_id_idx on public.flashcards(generation_id);
create index generations_user_id_idx on public.generations(user_id);
create index generation_error_logs_user_id_idx on public.generation_error_logs(user_id);

-- Create updated_at triggers
create trigger update_flashcards_updated_at
    before update on public.flashcards
    for each row
    execute function public.update_updated_at();

create trigger update_generations_updated_at
    before update on public.generations
    for each row
    execute function public.update_updated_at();

-- Enable Row Level Security
alter table public.flashcards enable row level security;
alter table public.generations enable row level security;
alter table public.generation_error_logs enable row level security;

-- RLS Policies for flashcards
create policy "Authenticated users can view their own flashcards"
    on public.flashcards
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Authenticated users can create their own flashcards"
    on public.flashcards
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Authenticated users can update their own flashcards"
    on public.flashcards
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Authenticated users can delete their own flashcards"
    on public.flashcards
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policies for generations
create policy "Authenticated users can view their own generations"
    on public.generations
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Authenticated users can create their own generations"
    on public.generations
    for insert
    to authenticated
    with check (auth.uid() = user_id);

create policy "Authenticated users can update their own generations"
    on public.generations
    for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Authenticated users can delete their own generations"
    on public.generations
    for delete
    to authenticated
    using (auth.uid() = user_id);

-- RLS Policies for generation_error_logs
create policy "Authenticated users can view their own error logs"
    on public.generation_error_logs
    for select
    to authenticated
    using (auth.uid() = user_id);

create policy "Authenticated users can create their own error logs"
    on public.generation_error_logs
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Note: No update/delete policies for error logs as they should be immutable 