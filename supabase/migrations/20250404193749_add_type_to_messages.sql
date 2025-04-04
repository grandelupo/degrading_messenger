alter table messages add column type text not null default 'text';

-- Create an enum type for message types
create type message_type as enum ('text', 'emoji');

-- Add check constraint to ensure type is either 'text' or 'emoji'
alter table messages 
  alter column type type message_type using type::message_type,
  alter column type set default 'text';
