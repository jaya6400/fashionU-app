-- Enable pgvector (already exists, but idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- Styling rules table
CREATE TABLE styling_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  body_shape TEXT NOT NULL CHECK (body_shape IN ('hourglass', 'rectangle', 'triangle', 'inverted_triangle', 'oval')),
  occasion TEXT NOT NULL,
  category TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  embedding extensions.vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Saved looks table
CREATE TABLE saved_looks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id TEXT NOT NULL,
  body_shape TEXT NOT NULL,
  occasion TEXT NOT NULL,
  vto_image_url TEXT,
  styling_insight TEXT,
  embedding extensions.vector(768),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vector search function
CREATE OR REPLACE FUNCTION match_styling_rules(
  query_embedding extensions.vector(768),
  match_body_shape TEXT,
  match_occasion TEXT,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  body_shape TEXT,
  occasion TEXT,
  category TEXT,
  rule_text TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    styling_rules.id,
    styling_rules.body_shape,
    styling_rules.occasion,
    styling_rules.category,
    styling_rules.rule_text,
    1 - (styling_rules.embedding <=> query_embedding) AS similarity
  FROM styling_rules
  WHERE styling_rules.body_shape = match_body_shape
    AND styling_rules.occasion = match_occasion
  ORDER BY styling_rules.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Seed data
INSERT INTO styling_rules (body_shape, occasion, category, rule_text) VALUES
('hourglass', 'casual', 'tops', 'Fitted tops that follow your natural waistline emphasize your balanced proportions.'),
('hourglass', 'casual', 'bottoms', 'High-waisted jeans or pants highlight your defined waist.'),
('rectangle', 'casual', 'tops', 'Peplum tops or belts create the illusion of waist definition.'),
('triangle', 'casual', 'tops', 'Boat necks and statement sleeves balance your lower body proportions.'),
('inverted_triangle', 'casual', 'bottoms', 'Wide-leg pants or A-line skirts balance your broader shoulders.'),
('oval', 'casual', 'tops', 'V-necks and vertical lines create elongation and structure.');