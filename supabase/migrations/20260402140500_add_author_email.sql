-- Add author_email column to questions table
-- This allows question askers to optionally provide their email
-- to receive notifications when their question is answered
ALTER TABLE questions ADD COLUMN IF NOT EXISTS author_email text;
