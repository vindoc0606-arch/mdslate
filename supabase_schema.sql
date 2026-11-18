-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dashboard content table
CREATE TABLE IF NOT EXISTS dashboard_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  target_date DATE UNIQUE NOT NULL,
  quote TEXT NOT NULL,
  tip TEXT NOT NULL,
  trick TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE dashboard_content ENABLE ROW LEVEL SECURITY;

-- Flow chart questions table
CREATE TABLE IF NOT EXISTS flow_chart_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  subject_id TEXT,
  question_text TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  generated_flowchart JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE flow_chart_questions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can read" ON dashboard_content FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can update" ON dashboard_content FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can insert" ON dashboard_content FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Anyone can read flow chart questions" ON flow_chart_questions FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert/update flow chart questions" ON flow_chart_questions FOR ALL USING (auth.role() = 'authenticated');

-- Syndromes table
CREATE TABLE IF NOT EXISTS syndromes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE syndromes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read syndromes" ON syndromes FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert/update syndromes" ON syndromes FOR ALL USING (auth.role() = 'authenticated');
