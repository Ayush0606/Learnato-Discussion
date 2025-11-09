const { connect } = require('./utils/mongoServerless')
const Post = require('./models/Post')

module.exports = async (req, res) => {
  await connect()
  try {
    if (req.method === 'GET') {
      const posts = await Post.find().sort({ createdAt: -1 }).limit(200)
      return res.status(200).json(posts)
    }

    if (req.method === 'POST') {
      const { title, content, author } = req.body || {}
      if (!title || !content) return res.status(400).json({ error: 'title and content required' })
      const post = await Post.create({ title, content, author })
      return res.status(201).json(post)
    }

    res.setHeader('Allow', 'GET, POST')
    res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('backend/api/posts error:', err)
    res.status(500).json({ error: 'internal error' })
  }
}
