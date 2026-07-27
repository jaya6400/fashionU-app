-- Update embedding columns from 768 -> 3072 dimensions

-- Update styling_rules embedding column
ALTER TABLE styling_rules
DROP COLUMN embedding;

ALTER TABLE styling_rules
ADD COLUMN embedding extensions.vector(3072);

-- Update saved_looks embedding column
ALTER TABLE saved_looks
DROP COLUMN embedding;

ALTER TABLE saved_looks
ADD COLUMN embedding extensions.vector(3072);

-- Recreate the vector search function with the new vector size
DROP FUNCTION IF EXISTS match_styling_rules(
  extensions.vector(768),
  TEXT,
  TEXT,
  INT
);

CREATE OR REPLACE FUNCTION match_styling_rules(
  query_embedding extensions.vector(3072),
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
    sr.id,
    sr.body_shape,
    sr.occasion,
    sr.category,
    sr.rule_text,
    1 - (sr.embedding <=> query_embedding) AS similarity
  FROM styling_rules sr
  WHERE sr.body_shape = match_body_shape
    AND sr.occasion = match_occasion
  ORDER BY sr.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;