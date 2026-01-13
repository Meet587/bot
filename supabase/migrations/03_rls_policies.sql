-- Enable Row Level Security
alter table documents enable row level security;

-- Policy to allow users to insert their own documents
create policy "Users can insert their own documents"
on documents for insert
to authenticated
with check (auth.uid() = user_id);

-- Policy to allow users to select their own documents
create policy "Users can select their own documents"
on documents for select
to authenticated
using (auth.uid() = user_id);

-- Policy to allow users to delete their own documents
create policy "Users can delete their own documents"
on documents for delete
to authenticated
using (auth.uid() = user_id);
