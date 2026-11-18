-- Create table for subject background images
CREATE TABLE IF NOT EXISTS subject_backgrounds (
  id SERIAL PRIMARY KEY,
  subject_name TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE subject_backgrounds ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read background images
CREATE POLICY "Allow public read access" ON subject_backgrounds
  FOR SELECT USING (true);

-- Allow admins to insert/update (Assuming an 'admin' role or specific check in application logic)
-- Since RLS is complex without user management context, for simplicity here, 
-- we suggest protecting the admin upload route in the application component.
-- For production, replace 'true' with a check for admin status.
CREATE POLICY "Allow admin write access" ON subject_backgrounds
  FOR ALL USING (true); 

-- Create table for high yield questions
CREATE TABLE IF NOT EXISTS high_yield_questions (
  id SERIAL PRIMARY KEY,
  subject_name TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE high_yield_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON high_yield_questions
  FOR SELECT USING (true);

CREATE POLICY "Allow admin write access" ON high_yield_questions
  FOR ALL USING (true);
