const express = require('express');
const router = express.Router();
const axios = require('axios');
const Post = require('../models/Post');
require('dotenv').config();

// POST /api/suggest
// body: { text: string }
// returns: { suggestions: [string] }
router.post('/', async (req, res) => {
  const { text, postId } = req.body || {};

  // If postId provided, provide a summary of replies and similar posts (local, no external APIs)
  if (postId) {
    try {
      const post = await Post.findById(postId).lean();
      if (!post) return res.status(404).json({ error: 'Post not found' });

      // token helpers
      const tokenize = (t) => (t || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      const tokens = tokenize(text || post.title + ' ' + post.content);

      const scoreText = (t, toks) => {
        const freq = {};
        for (const w of tokenize(t)) freq[w] = (freq[w] || 0) + 1;
        let s = 0; for (const tk of toks) if (freq[tk]) s += freq[tk]; return s;
      }

      // find similar posts
      const all = await Post.find({ _id: { $ne: post._id } }).lean();
      const similar = all.map(p => ({ p, score: scoreText(p.title + ' ' + p.content, tokens) }))
        .sort((a,b)=>b.score-a.score)
        .slice(0,6)
        .filter(s=>s.score>0)
        .map(s=>({ _id: s.p._id, title: s.p.title, snippet: (s.p.content||'').slice(0,160), score: s.score }))

      // extractive summary of replies: rank by token overlap and return top 3
      const ranked = (post.replies || []).map(r => ({ r, score: scoreText(r.content, tokens) }))
        .sort((a,b)=>b.score-a.score)
      const top = ranked.slice(0,3).map(x => x.r.content)
      const summary = top.length ? top.join('\n\n') : (post.replies||[]).slice(0,3).map(r=>r.content).join('\n\n')

      return res.json({ summary, similar })
    } catch (err) { console.error(err); return res.status(500).json({ error: err.message }) }
  }

  // Otherwise behave like before: suggest short alternative phrasings for the provided text
  if (!text) return res.status(400).json({ error: 'text required' });

  // If OPENAI_API_KEY is present, try to call OpenAI (chat completion)
  const key = process.env.OPENAI_API_KEY;
  if (key) {
    try {
      const resp = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an assistant that suggests improvements or similar questions for forum posts.' },
          { role: 'user', content: `Suggest 3 short, helpful alternative phrasings or related questions for: "${text}"` }
        ],
        max_tokens: 200,
        temperature: 0.8
      }, { headers: { Authorization: `Bearer ${key}` } });

      const content = resp.data.choices?.[0]?.message?.content || '';
      const suggestions = content.split(/\n+/).map(s => s.trim()).filter(Boolean).slice(0,3);
      return res.json({ suggestions });
    } catch (err) {
      console.error('OpenAI error', err?.response?.data || err.message);
      // fallthrough to local suggestions
    }
  }

  // Local fallback: produce simple variations
  const s = text;
  const suggestions = [
    `Can you clarify: ${s}`,
    `How would you approach: ${s}`,
    `Have you tried: ${s.split(' ').slice(0,6).join(' ')}... ?`
  ];
  res.json({ suggestions });
});

module.exports = router;
