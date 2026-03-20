-- NeuroLearn Database Schema

-- Custom types
CREATE TYPE difficulty_level AS ENUM ('1', '2', '3', '4', '5');

-- Users table (extends Supabase auth.users indirectly, but we keep our own profile data)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Modules table
CREATE TABLE public.modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  video_url TEXT,
  difficulty_level difficulty_level NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Assessments (Initial and end-of-module)
CREATE TABLE public.assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array of questions, options, correct_answer
  is_initial BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Progress (Tracking Adaptive Learning Level)
CREATE TABLE public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level >= 3 AND level <= 5), -- Starting levels are 3 to 5 based on initial assessment
  last_assessment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);

-- User Activity (Tracking Individual module completion)
CREATE TABLE public.user_activity (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
  quiz_score INTEGER, -- Percentage 0-100
  completed BOOLEAN DEFAULT false,
  time_spent INTEGER DEFAULT 0, -- in seconds
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);

-- Personalized Learning Materials (Module 2)
CREATE TABLE public.personalized_materials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  material_text TEXT,
  deadline TIMESTAMPTZ,
  study_plan JSONB,
  notes JSONB,
  quiz JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personalized_materials ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Allow all for rapid development, restrict later if needed)
CREATE POLICY "Enable read access for all users" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.assessments FOR SELECT USING (true);

-- Users can read/write their own data
CREATE POLICY "Users can manage their own profile" ON public.users FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage their own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own activity" ON public.user_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own personalized materials" ON public.personalized_materials FOR ALL USING (auth.uid() = user_id);
