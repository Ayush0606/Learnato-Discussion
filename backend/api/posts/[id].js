const { connect } = require('../utils/mongoServerless')
const Post = require('../models/Post')

module.exports = async (req, res) => {
  await connect()
  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'missing id' })

  try {
    if (req.method === 'GET') {
      const post = await Post.findById(id)
      if (!post) return res.status(404).json({ error: 'not found' })
      return res.status(200).json(post)
    }

    if (req.method === 'DELETE') {
      await Post.findByIdAndDelete(id)
      return res.status(204).end()
    }

    if (req.method === 'PATCH') {
      const updates = req.body || {}
      const allowed = ['title', 'content', 'answered']
      const patch = {}
      for (const k of allowed) if (k in updates) patch[k] = updates[k]

      if (Object.keys(patch).length === 0) return res.status(400).json({ error: 'no valid fields to update' })

      const updated = await Post.findByIdAndUpdate(id, patch, { new: true })
      return res.status(200).json(updated)
    }

    res.setHeader('Allow', 'GET, DELETE, PATCH')
    res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('backend/api/posts/[id] error:', err)
    res.status(500).json({ error: 'internal error' })
  }
}
