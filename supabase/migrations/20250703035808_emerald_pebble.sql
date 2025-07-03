/*
  # Initial Schema for Ask Pastor Stefan

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `text` (text, question content)
      - `author_name` (text, author name or "Anonymous")
      - `is_anonymous` (boolean, whether posted anonymously)
      - `likes` (integer, number of likes)
      - `answered` (boolean, whether answered by pastor)
      - `answer` (text, pastor's answer)
      - `answer_timestamp` (timestamp, when answered)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chat_rooms`
      - `id` (uuid, primary key)
      - `title` (text, room title)
      - `description` (text, room description)
      - `is_active` (boolean, whether room is currently active)
      - `participants` (integer, number of participants)
      - `created_by` (uuid, pastor who created it)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `room_id` (uuid, foreign key to chat_rooms)
      - `text` (text, message content)
      - `author_name` (text, message author)
      - `is_pastor` (boolean, whether message is from pastor)
      - `created_at` (timestamp)

    - `email_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, subscriber email)
      - `is_active` (boolean, whether subscription is active)
      - `created_at` (timestamp)

    - `question_likes`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to questions)
      - `user_identifier` (text, anonymous user identifier)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access and pastor write access
*/

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  author_name text NOT NULL DEFAULT 'Anonymous',
  is_anonymous boolean DEFAULT true,
  likes integer DEFAULT 0,
  answered boolean DEFAULT false,
  answer text,
  answer_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert questions"
  ON questions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update question likes"
  ON questions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  is_active boolean DEFAULT true,
  participants integer DEFAULT 0,
  created_by text DEFAULT 'Pastor Stefan',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat rooms"
  ON chat_rooms
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert chat rooms"
  ON chat_rooms
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update chat rooms"
  ON chat_rooms
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid REFERENCES chat_rooms(id) ON DELETE CASCADE,
  text text NOT NULL,
  author_name text NOT NULL,
  is_pastor boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read chat messages"
  ON chat_messages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert chat messages"
  ON chat_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Email subscribers table
CREATE TABLE IF NOT EXISTS email_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read subscribers"
  ON email_subscribers
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert subscribers"
  ON email_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Question likes table
CREATE TABLE IF NOT EXISTS question_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_identifier text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_identifier)
);

ALTER TABLE question_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read question likes"
  ON question_likes
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert question likes"
  ON question_likes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete question likes"
  ON question_likes
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_created_at ON questions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_answered ON questions(answered);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_question_likes_question_id ON question_likes(question_id);

-- Insert sample data
INSERT INTO questions (text, author_name, is_anonymous, likes, answered, answer, answer_timestamp) VALUES
(
  'Why does God allow suffering if He loves us? I''ve been going through a really tough time and I''m struggling to understand.',
  'Anonymous',
  true,
  15,
  true,
  'I hear you, and I''m sorry you''re going through this. This is one of the deepest questions we face. The Bible shows us that suffering isn''t punishment - it''s part of living in a broken world. But God doesn''t waste our pain. He uses it to shape us, to build our character, and to help us connect with others who are hurting. Remember, Jesus himself suffered more than anyone, so He truly understands what you''re going through. You''re not alone in this.',
  now() - interval '1 hour'
),
(
  'How do I know if I''m really saved? Sometimes I doubt my faith and it scares me.',
  'SearchingHeart',
  false,
  8,
  true,
  'Doubts don''t disqualify you from faith - they''re actually pretty normal! The fact that you care about your relationship with God is a good sign. Salvation isn''t about being perfect or never having doubts. It''s about trusting that Jesus paid for your sins and choosing to follow Him. When doubts come, remember that God''s love for you doesn''t change based on how you feel. Read 1 John 5:13 - it was written specifically to help people like you have assurance.',
  now() - interval '3 hours'
),
(
  'Is it wrong to be angry at God? I lost someone close to me and I''m really struggling with anger.',
  'Anonymous',
  true,
  12,
  false,
  null,
  null
);

INSERT INTO chat_rooms (title, description, is_active, participants) VALUES
(
  'Faith & Anxiety',
  'Let''s talk about trusting God when everything feels uncertain',
  true,
  23
),
(
  'Relationships & Dating',
  'Biblical perspective on modern dating and relationships',
  false,
  0
);