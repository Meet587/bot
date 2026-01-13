-- Create a table to store chats
create table if not exists chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table to store messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid references chats(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table chats enable row level security;
alter table messages enable row level security;

-- Policies for chats
create policy "Users can view their own chats"
  on chats for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own chats"
  on chats for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own chats"
  on chats for delete
  to authenticated
  using (auth.uid() = user_id);

-- Policies for messages
create policy "Users can view messages in their chats"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

create policy "Users can insert messages in their chats"
  on messages for insert
  to authenticated
  with check (
    exists (
      select 1 from chats
      where chats.id = messages.chat_id
      and chats.user_id = auth.uid()
    )
  );

-- Add chat_id to documents
alter table documents
add column if not exists chat_id uuid references chats(id) on delete cascade;

-- Update match_documents to filter by chat_id
-- Drop first because we are changing parameter name from filter_user_id to filter_chat_id
drop function if exists match_documents(vector(1536), float, int, uuid);

create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_chat_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity
  from documents
  where 1 - (documents.embedding <=> query_embedding) > match_threshold
  and documents.chat_id = filter_chat_id
  order by similarity desc
  limit match_count;
end;
$$;

-- RLS for documents update to include chat_id check (optional but good practice)
-- Existing RLS checks user_id, which is good.
-- Documents now belong to a chat, which belongs to a user.
-- We should probably ensure that when inserting a document, the chat_id belongs to the user.
-- But the existing policy "Users can insert their own documents" checks `auth.uid() = user_id`.
-- As long as we set `user_id` correctly on insert, we are fine.
