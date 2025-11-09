import React, { useState } from 'react'
import axios from 'axios'

export default function NewPostForm({ onCreated, apiBase, theme='light' }){
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const submit = async (e)=>{
    e.preventDefault()
    if(!title || !content) return
    setSubmitting(true)
    setError(null)
    // optimistic UX: clear inputs immediately
    const optimistic = { title, content, author: 'You', votes: 0, replies: [], createdAt: new Date().toISOString(), _id: `temp-${Date.now()}` }
    try{
      // attempt create
      await axios.post(`${apiBase}/posts`, { title, content })
      setTitle('')
      setContent('')
      onCreated()
    }catch(err){
      setError('Failed to create post')
      console.error(err)
    }finally{
      setSubmitting(false)
    }
  }

  const askAI = async (text) => {
    try {
      const res = await axios.post(`${apiBase}/suggest`, { text })
      setSuggestions(res.data.suggestions || [])
    } catch (err) {
      console.error(err)
    }
  }

  const applySuggestion = (s) => {
    // If title empty, apply to title else append to content
    if(!title) setTitle(s)
    else setContent(prev => (prev ? prev + '\n' + s : s))
    setSuggestions([])
  }

  return (
  <form onSubmit={submit} className={`card p-4 rounded shadow`}>
      <h2 className="font-semibold mb-2 text-lg">New Post</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="flex-1 border p-2 rounded" />
  <button type="button" onClick={()=>askAI(title || content)} className="btn-warning px-3 py-2 rounded w-full sm:w-auto">AI Suggest</button>
      </div>
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="What's your question or insight?" className="w-full border p-2 rounded mb-2" rows={4}></textarea>

      {suggestions.length>0 && (
  <div className="p-2 mb-2 card-ghost rounded">
          <div className="text-sm text-secondary mb-1">Suggestions:</div>
          <ul className="space-y-1">
            {suggestions.map((s, i)=> (
              <li key={i} className="flex justify-between items-center">
                <div className="text-sm">{s}</div>
                <button type="button" onClick={()=>applySuggestion(s)} className="text-xs text-link">Use</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-2">
  <button type="submit" disabled={submitting} className={`btn-primary px-4 py-2 rounded w-full sm:w-auto ${submitting? 'opacity-60 cursor-not-allowed':''}`}>{submitting? 'Posting…' : 'Post'}</button>
      </div>
  {error && <div className="mt-2 text-sm text-danger">{error}</div>}
    </form>
  )
}
