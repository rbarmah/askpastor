/*
  # Create testimonies table

  1. New Tables
    - `testimonies`
      - `id` (uuid, primary key)
      - `author_name` (text, testimony author name)
      - `age` (integer, author's age)
      - `title` (text, testimony title/topic)
      - `content` (text, full testimony content)
      - `is_anonymous` (boolean, whether posted anonymously)
      - `is_approved` (boolean, whether approved by pastor)
      - `is_featured` (boolean, whether featured on homepage)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on testimonies table
    - Add policies for public read of approved testimonies
    - Add policies for public submission of new testimonies
    - Add policies for pastor management
*/

CREATE TABLE IF NOT EXISTS testimonies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  age integer,
  title text NOT NULL,
  content text NOT NULL,
  is_anonymous boolean DEFAULT false,
  is_approved boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE testimonies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved testimonies"
  ON testimonies
  FOR SELECT
  TO anon, authenticated
  USING (is_approved = true);

CREATE POLICY "Anyone can insert testimonies"
  ON testimonies
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update testimonies"
  ON testimonies
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete testimonies"
  ON testimonies
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_testimonies_approved ON testimonies(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonies_featured ON testimonies(is_featured);
CREATE INDEX IF NOT EXISTS idx_testimonies_created_at ON testimonies(created_at DESC);

-- Insert sample testimonies
INSERT INTO testimonies (author_name, age, title, content, is_anonymous, is_approved, is_featured) VALUES
(
  'Sarah M.',
  19,
  'Finding Hope in Depression',
  'I was in the darkest place of my life when I first reached out to Pastor Stefan. I had been struggling with depression for months and felt completely hopeless. When I asked my question about whether God still loved me despite my struggles, Pastor Stefan''s answer changed everything. He helped me understand that my mental health struggles didn''t make me less valuable to God. Through his guidance and the support of this community, I found the strength to get professional help and start my healing journey. Today, I can honestly say that God used my darkest moment to bring me closer to Him.',
  false,
  true,
  true
),
(
  'Marcus T.',
  22,
  'Breaking Free from Addiction',
  'I was addicted to substances for three years and felt like I was beyond saving. The shame was eating me alive. When I finally got the courage to ask Pastor Stefan about God''s forgiveness, his response brought me to tears. He explained grace in a way that finally made sense to me. It wasn''t just about being forgiven - it was about being completely loved and accepted. That conversation was the turning point that gave me the strength to enter rehab. I''ve been clean for 8 months now, and I know God isn''t done with my story yet.',
  false,
  true,
  true
),
(
  'Emma K.',
  17,
  'Healing from Family Trauma',
  'When my parents got divorced, I was angry at everyone - including God. I felt like He had abandoned my family. Pastor Stefan''s honest answer about how it''s okay to be angry at God was exactly what I needed to hear. He didn''t try to give me easy answers or tell me to just "have faith." Instead, he walked me through the process of healing and showed me how God could use even this painful situation for good. My relationship with my parents is still complicated, but my relationship with God is stronger than ever.',
  false,
  true,
  true
),
(
  'Anonymous',
  20,
  'Overcoming Shame About Sexuality',
  'I struggled with same-sex attraction for years and was terrified that God hated me. The church I grew up in made me feel like I was an abomination. When I finally worked up the courage to ask Pastor Stefan about it, his response was full of love and grace. He helped me understand that God''s love for me isn''t conditional on my struggles. While I''m still figuring out my faith and sexuality, I no longer live in fear that God has rejected me. Pastor Stefan helped me find a community where I can be honest about my questions without being judged.',
  true,
  true,
  false
),
(
  'David R.',
  21,
  'Finding Purpose After Failure',
  'I dropped out of college and felt like a complete failure. My parents were disappointed, and I was convinced that I had ruined my life. Pastor Stefan''s teaching about how God can use our failures for good completely changed my perspective. He helped me see that my worth isn''t tied to my achievements. I''m now working a job I love and taking classes part-time. More importantly, I''m using my experience to help other young people who feel like they''ve messed up their lives.',
  false,
  true,
  false
);