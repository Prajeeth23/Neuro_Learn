const { Client } = require('pg');
require('dotenv').config({ path: '../.env' });

const connectionString = process.env.SUPABASE_DB_URL;

if (!connectionString) {
  console.error('❌ Error: SUPABASE_DB_URL is missing in .env');
  process.exit(1);
}

async function run() {
  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL database.');

    // 1. Create table
    console.log('🔨 Creating student_evaluations table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.student_evaluations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        feedback_notes TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        CONSTRAINT unique_user_course UNIQUE(user_id, course_id)
      );
    `);
    console.log('✅ student_evaluations table is ready.');

    // 2. Fetch users and courses to seed beautiful statuses
    console.log('🌱 Fetching active users and courses for seeding...');
    const usersRes = await client.query("SELECT id, name, email FROM public.users WHERE role = 'user' ORDER BY name ASC;");
    const coursesRes = await client.query("SELECT id, title FROM public.courses ORDER BY created_at ASC;");

    const users = usersRes.rows;
    const courses = coursesRes.rows;

    console.log(`Found ${users.length} students and ${courses.length} courses/steps.`);

    if (users.length > 0 && courses.length > 0) {
      console.log('🌾 Generating visual progress status matrix...');
      const statuses = ['approved', 'pending', 'rejected'];

      for (let u = 0; u < users.length; u++) {
        const userId = users[u].id;
        for (let c = 0; c < courses.length; c++) {
          const courseId = courses[c].id;

          // Determine a deterministic but natural distribution of statuses to match the mockup
          // Green = Done (Approved) ~ 60%, Yellow = Pending ~ 25%, Red = Rejected ~ 15%
          const hash = (u * 3 + c * 7) % 100;
          let status = 'approved';
          let feedback = '';

          if (hash < 15) {
            status = 'rejected';
            feedback = 'Requires revision. Please review step requirements and re-submit with correct methodology.';
          } else if (hash < 40) {
            status = 'pending';
            feedback = 'Submitted and waiting for final manual evaluation.';
          } else {
            status = 'approved';
            feedback = 'Excellent submission! Step criteria fully verified and approved.';
          }

          await client.query(`
            INSERT INTO public.student_evaluations (user_id, course_id, status, feedback_notes)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, course_id) DO NOTHING;
          `, [userId, courseId, status, feedback]);
        }
      }
      console.log('✅ Seeded visual progress database statuses.');
    } else {
      console.log('⚠️ Seeding skipped: no students or courses present in DB.');
    }

  } catch (err) {
    console.error('❌ Migration / seeding error:', err.message);
  } finally {
    await client.end();
  }
}

run();
