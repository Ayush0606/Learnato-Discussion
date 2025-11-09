module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')
  try {
    const { username } = req.body || {}
    if (!username) return res.status(400).json({ error: 'username required' })
    const token = Buffer.from(username).toString('base64')
    return res.status(200).json({ token, user: { name: username } })
  } catch (err) {
    console.error('backend/api/auth/login error:', err)
    res.status(500).json({ error: 'internal error' })
  }
}
