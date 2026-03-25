/**
 * Migration: Enhance schema for NeuroLearn v2
 * Adds: profile columns, screen_time, quiz_results, roadmaps tables, domain to courses
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const { Client } = require('pg');

async function migrate() {
  const client = new Client({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('Connected to database. Running migrations...');

    // 1. Add profile columns to users
    await client.query(`
      ALTER TABLE public.users 
        ADD COLUMN IF NOT EXISTS department TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS year TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS domain_of_interest TEXT DEFAULT '';
    `);
    console.log('✅ Added profile columns to users');

    // 2. Add domain column to courses
    await client.query(`
      ALTER TABLE public.courses
        ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'General';
    `);
    console.log('✅ Added domain column to courses');

    // 3. Create screen_time table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.screen_time (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
        duration_seconds INTEGER NOT NULL DEFAULT 0,
        session_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created screen_time table');

    // 4. Create quiz_results table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.quiz_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
        module_id UUID DEFAULT NULL,
        score INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL DEFAULT 10,
        level INTEGER DEFAULT 3,
        quiz_type TEXT DEFAULT 'module',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created quiz_results table');

    // 5. Create roadmaps table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.roadmaps (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
        domain TEXT NOT NULL,
        role TEXT NOT NULL,
        roadmap_data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Created roadmaps table');

    // 6. Enable RLS and add policies
    for (const table of ['screen_time', 'quiz_results', 'roadmaps']) {
      await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      
      // Allow authenticated users to select their own rows
      await client.query(`
        DO $$ BEGIN
          CREATE POLICY "Users can view own ${table}" ON public.${table}
            FOR SELECT USING (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
      
      // Allow authenticated users to insert their own rows
      await client.query(`
        DO $$ BEGIN
          CREATE POLICY "Users can insert own ${table}" ON public.${table}
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$;
      `);
    }
    console.log('✅ RLS policies created');

    console.log('\n🎉 All migrations completed successfully!');
  } catch (err) {
    console.error('❌ Migration error:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
