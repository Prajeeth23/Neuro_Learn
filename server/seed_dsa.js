const { Pool } = require('pg');

const pool = new Pool({ 
  connectionString: 'postgresql://postgres:deeksha%40282007@db.avkqnlkmslrwpztixscb.supabase.co:5432/postgres' 
});

async function run() {
  try {
    const cRes = await pool.query(`
      INSERT INTO courses (title, description, category) 
      VALUES ('Data Structures and Algorithms', 'Master DSA with this comprehensive YouTube playlist.', 'Computer Science') 
      RETURNING id;
    `);
    
    const cId = cRes.rows[0].id;
    
    await pool.query(`
      INSERT INTO modules (course_id, title, description, video_url, difficulty_level) 
      VALUES 
        ($1, 'Arrays - Part 1', 'Introduction to Arrays and basic operations.', 'https://www.youtube.com/watch?v=bVkjbBBtIro', 3),
        ($1, 'Arrays - Part 2', 'Medium level array problems and logic.', 'https://www.youtube.com/watch?v=F_Y-z2X5Ito', 4),
        ($1, 'Arrays - Part 3', 'Hard array problems, two pointers, sliding window.', 'https://www.youtube.com/watch?v=e_k9b4J1A9w', 5);
    `, [cId]);
    
    console.log('Successfully inserted Data Structures and Algorithms course with id:', cId);
  } catch (err) {
    console.error('Error seeding DB:', err);
  } finally {
    pool.end();
  }
}

run();
