const express = require('express');
const router = express.Router();
const supabase = require('../db/supabaseClient');
const authMiddleware = require('../middleware/auth');

// Note: Actual login/signup happens on the frontend via Supabase JS auth client.
// This route is called right after signup to insert the user into the public.users table.
router.post('/sync-user', authMiddleware, async (req, res) => {
  const { name } = req.body;
  const user = req.user;

  try {
    const { data, error } = await supabase
      .from('users')
      .upsert({ id: user.id, email: user.email, name: name || 'User' })
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'User synced successfully', user: data });
  } catch (err) {
    console.error('Error syncing user:', err);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

module.exports = router;
