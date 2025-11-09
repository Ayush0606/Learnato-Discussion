const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/learnato'

if (!global._mongoCache) global._mongoCache = { conn: null, promise: null }

async function connect() {
  if (global._mongoCache.conn) return global._mongoCache.conn
  if (!global._mongoCache.promise) {
    global._mongoCache.promise = mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(m => m)
  }
  global._mongoCache.conn = await global._mongoCache.promise
  return global._mongoCache.conn
}

module.exports = { connect }
