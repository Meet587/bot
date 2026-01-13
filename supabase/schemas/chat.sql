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
