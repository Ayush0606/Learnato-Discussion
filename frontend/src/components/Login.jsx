import React, { useState } from 'react'
import axios from 'axios'

export default function Login({ onLogin, apiBase, theme='light' }){
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e) =>{
    e.preventDefault()
    if(!name) return
    setLoading(true)
    try{
      const res = await axios.post(`${apiBase}/auth/login`, { name })
  const { token, name: returnedName } = res.data
  localStorage.setItem('token', token)
  localStorage.setItem('user', returnedName)
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  onLogin(returnedName)
    }catch(err){
      setError('Login failed')
      console.error(err)
    }finally{ setLoading(false) }
  }

  return (
    <form onSubmit={submit} className={`card p-4 rounded`}>
      <div className="text-sm muted mb-2">Login (mock)</div>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" className="w-full border p-2 rounded mb-2" />
      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="btn-primary px-3 py-2 rounded w-full">{loading? 'Signing…':'Sign in'}</button>
      </div>
  {error && <div className="text-xs text-danger mt-2">{error}</div>}
    </form>
  )
}
