const connect = require('../backend/src/utils/mongoServerless')
const Post = require('../backend/src/models/Post')

module.exports = async (req, res) => {
  try{
    await connect()
    if(req.method === 'GET'){
      const posts = await Post.find().sort({ createdAt: -1 }).lean()
      return res.status(200).json(posts)
    }
    if(req.method === 'POST'){
      const { title, content, author } = req.body || {}
      if(!title || !content) return res.status(400).json({ error: 'title and content required' })
      const post = new Post({ title, content, author: author || 'Anonymous' })
      await post.save()
      return res.status(201).json(post)
    }
    res.setHeader('Allow', 'GET,POST')
    res.status(405).end('Method Not Allowed')
  }catch(err){
    console.error(err)
    res.status(500).json({ error: err.message })
  }
}
