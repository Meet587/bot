-- Add user_id column to documents table
alter table documents
add column user_id uuid references auth.users(id);

-- Update match_documents function to filter by user_id
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
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
  and documents.user_id = filter_user_id
  order by similarity desc
  limit match_count;
end;
$$;
