const { connect } = require('../../utils/mongoServerless')
const Post = require('../../models/Post')

module.exports = async (req, res) => {
  await connect()
  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'missing post id' })

  try {
    if (req.method === 'POST') {
      const { author, content } = req.body || {}
      if (!content) return res.status(400).json({ error: 'content required' })

      const post = await Post.findById(id)
      if (!post) return res.status(404).json({ error: 'post not found' })

      post.replies.push({ author, content })
      await post.save()
      return res.status(201).json(post)
    }

    if (req.method === 'PATCH') {
      const { replyId, content } = req.body || {}
      if (!replyId || !content) return res.status(400).json({ error: 'replyId and content required' })

      const post = await Post.findById(id)
      if (!post) return res.status(404).json({ error: 'post not found' })

      const reply = post.replies.id(replyId)
      if (!reply) return res.status(404).json({ error: 'reply not found' })

      reply.content = content
      await post.save()
      return res.status(200).json(post)
    }

    if (req.method === 'DELETE') {
      const { replyId } = req.body || {}
      if (!replyId) return res.status(400).json({ error: 'replyId required' })

      const post = await Post.findById(id)
      if (!post) return res.status(404).json({ error: 'post not found' })

      post.replies.id(replyId).remove()
      await post.save()
      return res.status(200).json(post)
    }

    res.setHeader('Allow', 'POST, PATCH, DELETE')
    res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('backend/api/posts/[id]/reply error:', err)
    res.status(500).json({ error: 'internal error' })
  }
}
