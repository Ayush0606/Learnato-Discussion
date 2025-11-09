const express = require('express');
const router = express.Router();
const { sign } = require('../utils/auth');

// Simple mock login: provide { name }
router.post('/login', (req, res) => {
  const { name } = req.body;
  if(!name) return res.status(400).json({ error: 'name required' });
  const token = sign({ name });
  res.json({ token, name });
})

module.exports = router;
