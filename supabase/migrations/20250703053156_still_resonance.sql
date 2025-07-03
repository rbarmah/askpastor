/*
  # Add Question Categories

  1. Schema Updates
    - Add `category` column to questions table
    - Add `subcategory` column for more specific categorization

  2. Categories
    - Help for my personal issue
    - What does the Bible Say?
    - Deepening my walk with God
    - I am not a Christian but have questions about Christianity

  3. Security
    - No changes to existing RLS policies needed
*/

-- Add category and subcategory columns to questions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'category'
  ) THEN
    ALTER TABLE questions ADD COLUMN category text DEFAULT 'Help for my personal issue';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'subcategory'
  ) THEN
    ALTER TABLE questions ADD COLUMN subcategory text;
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);

-- Update existing questions with appropriate categories
UPDATE questions 
SET category = CASE 
  WHEN text ILIKE '%suffering%' OR text ILIKE '%pain%' OR text ILIKE '%hurt%' OR text ILIKE '%depression%' OR text ILIKE '%anxiety%' THEN 'Help for my personal issue'
  WHEN text ILIKE '%bible%' OR text ILIKE '%scripture%' OR text ILIKE '%verse%' OR text ILIKE '%what does%' THEN 'What does the Bible Say?'
  WHEN text ILIKE '%prayer%' OR text ILIKE '%faith%' OR text ILIKE '%grow%' OR text ILIKE '%relationship with god%' THEN 'Deepening my walk with God'
  WHEN text ILIKE '%not a christian%' OR text ILIKE '%don''t believe%' OR text ILIKE '%is god real%' OR text ILIKE '%why should i%' THEN 'I am not a Christian but have questions about Christianity'
  ELSE 'Help for my personal issue'
END
WHERE category IS NULL OR category = 'Help for my personal issue';