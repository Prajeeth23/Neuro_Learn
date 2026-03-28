module.exports = (req, res) => {
  res.json({ 
    message: "Minimal Vercel Function is working!", 
    timestamp: new Date().toISOString(),
    node_version: process.version,
    env_keys: Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('GROQ'))
  });
};
