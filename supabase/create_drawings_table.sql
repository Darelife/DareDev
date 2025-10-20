-- Create drawings table for storing canvas data
CREATE TABLE IF NOT EXISTS drawings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on id for faster lookups
CREATE INDEX IF NOT EXISTS idx_drawings_id ON drawings(id);

-- Enable RLS (Row Level Security)
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

-- Create RLS policy to allow all authenticated users to read/write
CREATE POLICY "Allow all authenticated users" ON drawings
  FOR ALL
  USING (true)
  WITH CHECK (true);
