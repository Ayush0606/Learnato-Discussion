const { connect } = require('../../utils/mongoServerless')
const Post = require('../../models/Post')

module.exports = async (req, res) => {
  await connect()
  const { id } = req.query || {}
  if (!id) return res.status(400).json({ error: 'missing post id' })

  try {
    if (req.method === 'POST') {
      const updated = await Post.findByIdAndUpdate(id, { $inc: { votes: 1 } }, { new: true })
      if (!updated) return res.status(404).json({ error: 'post not found' })
      return res.status(200).json({ votes: updated.votes })
    }

    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  } catch (err) {
    console.error('backend/api/posts/[id]/upvote error:', err)
    res.status(500).json({ error: 'internal error' })
  }
}
