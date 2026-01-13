-- Make user_id and chat_id not null in documents table
alter table documents
alter column user_id set not null,
alter column chat_id set not null;
