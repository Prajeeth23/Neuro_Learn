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

// GET /api/auth/profile — Fetch user profile with all fields
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await req.supabaseClient
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/auth/profile — Update profile fields
router.put('/profile', authMiddleware, async (req, res) => {
  const { name, department, year, domain_of_interest } = req.body;

  try {
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (department !== undefined) updateFields.department = department;
    if (year !== undefined) updateFields.year = year;
    if (domain_of_interest !== undefined) updateFields.domain_of_interest = domain_of_interest;

    const { data, error } = await req.supabaseClient
      .from('users')
      .update(updateFields)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Profile updated successfully', user: data });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
