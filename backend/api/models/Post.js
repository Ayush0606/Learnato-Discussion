const mongoose = require('mongoose')

const ReplySchema = new mongoose.Schema({
  author: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
})

const PostSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  votes: { type: Number, default: 0 },
  replies: [ReplySchema],
  answered: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.models.Post || mongoose.model('Post', PostSchema)
