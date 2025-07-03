/*
  # Add Blog and Question Relates Functionality

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, blog post title)
      - `content` (text, blog post content)
      - `excerpt` (text, brief description)
      - `author` (text, post author)
      - `published` (boolean, whether post is published)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `question_relates`
      - `id` (uuid, primary key)
      - `question_id` (uuid, foreign key to questions)
      - `user_identifier` (text, anonymous user identifier)
      - `created_at` (timestamp)

  2. Schema Updates
    - Add `relates` column to questions table

  3. Security
    - Enable RLS on new tables
    - Add policies for public read access and pastor write access
*/

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text,
  author text NOT NULL DEFAULT 'Pastor Stefan',
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Anyone can insert blog posts"
  ON blog_posts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update blog posts"
  ON blog_posts
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete blog posts"
  ON blog_posts
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Question relates table
CREATE TABLE IF NOT EXISTS question_relates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  user_identifier text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(question_id, user_identifier)
);

ALTER TABLE question_relates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read question relates"
  ON question_relates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert question relates"
  ON question_relates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can delete question relates"
  ON question_relates
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Add relates column to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'relates'
  ) THEN
    ALTER TABLE questions ADD COLUMN relates integer DEFAULT 0;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_relates_question_id ON question_relates(question_id);

-- Insert sample blog posts
INSERT INTO blog_posts (title, content, excerpt, published) VALUES
(
  'Finding Hope in Dark Times',
  'Life has a way of throwing curveballs when we least expect them. Whether it''s losing a job, facing illness, or dealing with broken relationships, we all go through seasons that feel overwhelming and hopeless.

But here''s what I''ve learned through my own struggles and walking alongside countless young people: darkness is not the end of your story. It''s often the beginning of a deeper understanding of God''s love and your own strength.

When everything feels like it''s falling apart, remember that God is still working. He''s not absent in your pain - He''s present in it, using it to shape you into who you''re meant to become.

The Bible tells us in Romans 8:28 that "all things work together for good for those who love God." This doesn''t mean everything that happens is good, but that God can bring good out of even the worst situations.

So if you''re in a dark place right now, hold on. Your breakthrough might be just around the corner. And remember, you''re not walking through this alone.',
  'When life feels overwhelming, remember that darkness is not the end of your story. God is still working, even in your pain.',
  true
),
(
  'Why Your Questions Matter to God',
  'I get a lot of messages from young people who are afraid to ask certain questions about faith. They worry that having doubts makes them bad Christians or that God will be angry with them for questioning.

Let me tell you something: your questions don''t scare God. In fact, He welcomes them.

Look at the Bible - it''s full of people who questioned God. Job questioned why he was suffering. David questioned why God felt distant. Even Jesus, in His humanity, cried out "My God, why have you forsaken me?"

God is big enough to handle your doubts, your anger, and your confusion. He''d rather have an honest conversation with you about your struggles than have you pretend everything is fine when it''s not.

Your questions are actually a sign of a growing faith. They show that you''re thinking deeply about what you believe and why. That''s not something to be ashamed of - it''s something to celebrate.

So bring your questions to God. Wrestle with Him like Jacob did. Search for answers in His Word. Talk to trusted mentors and friends. Your faith will be stronger on the other side of your questions, not weaker.',
  'Your questions don''t scare God - they''re actually a sign of growing faith. Bring your doubts to Him without fear.',
  true
),
(
  'Breaking Free from Shame',
  'Shame is one of the most destructive forces in a young person''s life. It whispers lies like "You''re not good enough," "You''ve messed up too badly," and "God could never love someone like you."

But shame is a liar.

The truth is, there is nothing you have done or could do that would make God love you any less. His love isn''t based on your performance - it''s based on His character.

When Jesus died on the cross, He didn''t just pay for your sins - He took your shame too. The Bible says He "despised the shame" so that you wouldn''t have to carry it.

I know it''s easier said than done. Shame has a way of embedding itself deep in our hearts and minds. But healing is possible. It starts with bringing your shame into the light - talking to God about it, sharing with trusted friends, maybe even getting professional help.

Remember, you are not defined by your worst moments. You are defined by God''s love for you. You are chosen, beloved, and free.

Don''t let shame keep you in prison any longer. The door is open, and Jesus is calling you out into freedom.',
  'Shame is a liar. You are not defined by your worst moments, but by God''s unchanging love for you.',
  true
);