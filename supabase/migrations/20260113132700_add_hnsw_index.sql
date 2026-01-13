-- Ensure the embedding column has dimensions (required for HNSW)
-- We use executing this in a do block or just directly altering.
-- If the column is already vector(1536), this is a no-op or safe.
-- If it is generic vector, this will constrain it.
alter table documents 
alter column embedding type vector(1536);

-- Add HNSW index to documents table for faster vector search
create index if not exists documents_embedding_idx 
on documents 
using hnsw (embedding vector_cosine_ops);
