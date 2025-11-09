import React, { useEffect, useState } from 'react'
import axios from 'axios'
import PostList from './components/PostList'
import PostView from './components/PostView'
import NewPostForm from './components/NewPostForm'
import Login from './components/Login'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api'

export default function App(){
  const [posts, setPosts] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [user, setUser] = useState(null)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')

  const fetchPosts = async () => {
    const res = await axios.get(`${API_BASE}/posts`)
    setPosts(res.data)
  }

  const upvotePost = async (p) => {
    try{
      await axios.post(`${API_BASE}/posts/${p._id}/upvote`)
      fetchPosts()
    }catch(err){ console.error(err) }
  }

  const addReplyTo = (p) => {
    setSelected(p)
    // PostView will render and can focus reply
    setTimeout(()=>{
      const el = document.querySelector('#reply-input')
      if(el) el.focus()
    }, 150)
  }

  useEffect(()=>{ fetchPosts(); const tokenUser = localStorage.getItem('user'); if(tokenUser) setUser(tokenUser)}, [])

  const onLogin = (name)=>{ localStorage.setItem('user', name); setUser(name) }

  const onSignout = ()=>{
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="min-h-screen bg-transparent">
      <div className="max-w-4xl mx-auto p-6">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Learnato Discussion</h1>
          <p className="text-sm muted">Empower learning through conversation</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-sm px-3 py-1 rounded border">
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search posts..." className="ml-2 border rounded px-2 py-1 text-sm" />
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-sm text-secondary">Signed in as <strong>{user}</strong></div>
              <button onClick={onSignout} className="text-sm text-danger underline">Sign out</button>
            </div>
          ) : <Login onLogin={onLogin} apiBase={API_BASE} theme={theme} />}
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="card mb-6">
            <NewPostForm onCreated={fetchPosts} apiBase={API_BASE} theme={theme} />
          </div>
          <PostList posts={posts.filter(p=> (p.title+p.content).toLowerCase().includes(query.toLowerCase()))} onSelect={setSelected} refresh={fetchPosts} apiBase={API_BASE} onUpvote={upvotePost} onAddReply={addReplyTo} theme={theme} />
        </div>
        <aside className="md:col-span-1">
          <PostView post={selected} refresh={fetchPosts} apiBase={API_BASE} onDeleted={()=>{ setSelected(null); fetchPosts() }} focusReply={false} theme={theme} />
        </aside>
      </div>
      </div>
    </div>
  )
}
