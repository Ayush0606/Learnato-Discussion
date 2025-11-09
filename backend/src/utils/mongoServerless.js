const mongoose = require('mongoose')

const MONGO_URI = process.env.MONGO_URI
if(!MONGO_URI) throw new Error('MONGO_URI not set')

let cached = global._mongoCached || (global._mongoCached = { conn: null, promise: null })

async function connect(){
  if(cached.conn) return cached.conn
  if(!cached.promise){
    cached.promise = mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(m => m.connection)
  }
  cached.conn = await cached.promise
  return cached.conn
}

module.exports = connect
