/*
  # Weekly Live Chat System

  1. New Tables
    - `chat_registrations`
      - `id` (uuid, primary key)
      - `session_date` (date, the Saturday session date)
      - `user_name` (text, participant name)
      - `email` (text, participant email)
      - `phone` (text, optional phone number)
      - `is_confirmed` (boolean, whether registration is confirmed)
      - `created_at` (timestamp)

    - `chat_sessions`
      - `id` (uuid, primary key)
      - `session_date` (date, the Saturday session date)
      - `start_time` (timestamptz, 7pm GMT)
      - `end_time` (timestamptz, 8pm GMT)
      - `is_active` (boolean, whether session is currently live)
      - `is_completed` (boolean, whether session has ended)
      - `max_participants` (integer, participant limit)
      - `created_at` (timestamp)

    - `chat_participants`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to chat_sessions)
      - `registration_id` (uuid, foreign key to chat_registrations)
      - `user_name` (text, participant name)
      - `joined_at` (timestamptz, when they joined)
      - `is_removed` (boolean, if pastor removed them)

  2. Schema Updates
    - Update `chat_messages` to link to sessions instead of rooms
    - Add moderation fields to messages

  3. Security
    - Enable RLS on all new tables
    - Add policies for public registration and pastor management
*/

-- Chat registrations table
CREATE TABLE IF NOT EXISTS chat_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL,
  user_name text NOT NULL,
  email text NOT NULL,
  phone text,
  is_confirmed boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_date, email)
);

ALTER TABLE chat_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read registrations"
  ON chat_registrations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert registrations"
  ON chat_registrations
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update registrations"
  ON chat_registrations
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_date date NOT NULL UNIQUE,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  is_active boolean DEFAULT false,
  is_completed boolean DEFAULT false,
  max_participants integer DEFAULT 50,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read sessions"
  ON chat_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert sessions"
  ON chat_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update sessions"
  ON chat_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true);

-- Chat participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE,
  registration_id uuid REFERENCES chat_registrations(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  joined_at timestamptz DEFAULT now(),
  is_removed boolean DEFAULT false
);

ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read participants"
  ON chat_participants
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert participants"
  ON chat_participants
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update participants"
  ON chat_participants
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete participants"
  ON chat_participants
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add session support to chat messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'session_id'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN session_id uuid REFERENCES chat_sessions(id) ON DELETE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'chat_messages' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE chat_messages ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_registrations_session_date ON chat_registrations(session_date);
CREATE INDEX IF NOT EXISTS idx_chat_registrations_email ON chat_registrations(email);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_date ON chat_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_active ON chat_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_participants_session_id ON chat_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);

-- Function to get next Saturday
CREATE OR REPLACE FUNCTION get_next_saturday()
RETURNS date AS $$
BEGIN
  RETURN CURRENT_DATE + (6 - EXTRACT(DOW FROM CURRENT_DATE))::integer;
END;
$$ LANGUAGE plpgsql;

-- Function to create weekly sessions automatically
CREATE OR REPLACE FUNCTION create_weekly_sessions()
RETURNS void AS $$
DECLARE
  next_saturday date;
  session_start timestamptz;
  session_end timestamptz;
BEGIN
  -- Get next Saturday
  next_saturday := get_next_saturday();
  
  -- Create session start time (7 PM GMT on Saturday)
  session_start := (next_saturday || ' 19:00:00')::timestamptz AT TIME ZONE 'GMT';
  session_end := (next_saturday || ' 20:00:00')::timestamptz AT TIME ZONE 'GMT';
  
  -- Insert session if it doesn't exist
  INSERT INTO chat_sessions (session_date, start_time, end_time)
  VALUES (next_saturday, session_start, session_end)
  ON CONFLICT (session_date) DO NOTHING;
  
  -- Create sessions for next 4 weeks
  FOR i IN 1..4 LOOP
    next_saturday := next_saturday + 7;
    session_start := (next_saturday || ' 19:00:00')::timestamptz AT TIME ZONE 'GMT';
    session_end := (next_saturday || ' 20:00:00')::timestamptz AT TIME ZONE 'GMT';
    
    INSERT INTO chat_sessions (session_date, start_time, end_time)
    VALUES (next_saturday, session_start, session_end)
    ON CONFLICT (session_date) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create initial sessions
SELECT create_weekly_sessions();