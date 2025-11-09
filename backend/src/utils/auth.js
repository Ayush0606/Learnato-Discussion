const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev-secret'

function sign(user){
  return jwt.sign({ name: user.name }, SECRET, { expiresIn: '7d' })
}

function authMiddleware(req, res, next){
  const auth = req.headers.authorization;
  if(!auth) return next();
  const parts = auth.split(' ');
  if(parts.length !== 2) return next();
  const token = parts[1];
  try{
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
  }catch(err){
    // ignore invalid token
  }
  return next();
}

module.exports = { sign, authMiddleware }
