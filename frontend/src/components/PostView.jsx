import React, { useState, useEffect } from 'react'
import axios from 'axios'

export default function PostView({ post, refresh, apiBase, focusReply, onDeleted, theme='light' }){
  const [reply, setReply] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [localReplies, setLocalReplies] = useState([])
  const [summary, setSummary] = useState('')
  const [similar, setSimilar] = useState([])
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)
  const [localVotes, setLocalVotes] = useState(post?.votes || 0)
  const [upvoting, setUpvoting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editingText, setEditingText] = useState('')

  useEffect(()=>{
    setLocalReplies(post?.replies ? [...post.replies] : [])
    setLocalVotes(post?.votes || 0)
    setReply('')
    setSuggestions([])
    setSummary('')
    setSimilar([])
    setError(null)
    if(focusReply){
      setTimeout(()=>{ const el = document.querySelector('#reply-input'); if(el) el.focus() }, 200)
    }
  }, [post])

  if(!post) return <div className="card muted">Select a post to view details</div>

  const addReply = async () =>{
    if(!reply) return;
    setError(null)
    // optimistic reply
    const tempId = `temp-${Date.now()}-${Math.floor(Math.random()*1000)}`
    const tempReply = { author: 'You', content: reply, _id: tempId, createdAt: new Date().toISOString(), __optimistic: true }
    setLocalReplies(prev => [...prev, tempReply])
    setReply('')
    setSending(true)
    try{
      await axios.post(`${apiBase}/posts/${post._id}/reply`, { content: tempReply.content, author: tempReply.author })
      // refresh from server to get canonical data
      await refresh()
    }catch(err){
      // rollback optimistic reply
      setLocalReplies(prev => prev.filter(r => r._id !== tempId))
      setError('Failed to send reply')
      console.error(err)
    }finally{
      setSending(false)
    }
  }

  const askAI = async (text) =>{
    try{
      const res = await axios.post(`${apiBase}/suggest`, { text })
      setSuggestions(res.data.suggestions || [])
    }catch(err){ console.error(err) }
  }

  const summarize = async () => {
    try{
      const res = await axios.post(`${apiBase}/suggest`, { postId: post._id })
      const { summary, similar } = res.data || {}
      setSummary(summary || '')
      setSimilar(similar || [])
    }catch(err){ console.error(err) }
  }

  const useSuggestion = (s) => { setReply(s); setSuggestions([]) }

  const upvote = async ()=>{
    // optimistic UI: increment immediately
    setError(null)
    setUpvoting(true)
    setLocalVotes(v => v + 1)
    try{
      await axios.post(`${apiBase}/posts/${post._id}/upvote`)
      // refresh to get canonical state
      await refresh()
    }catch(err){
      // rollback
      setLocalVotes(v => Math.max(0, v - 1))
      setError('Failed to upvote')
      console.error(err)
    }finally{
      setUpvoting(false)
    }
  }

  return (
    <div className={`card p-4 rounded`}> 
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold text-xl">{post.title}</h3>
          <div className="text-sm muted">by {post.author} • {new Date(post.createdAt).toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{localVotes}</div>
          <button onClick={upvote} disabled={upvoting} className={`mt-2 btn-primary px-4 py-2 rounded w-full sm:w-auto ${upvoting? 'opacity-60 cursor-not-allowed':''}`}>
            {upvoting ? 'Upvoting…' : 'Upvote'}
          </button>
          {/* Delete post button - visible if user matches post author */}
          { (localStorage.getItem('user') === post.author) && (
            <div className="mt-2">
              <button onClick={async ()=>{
                if(!confirm('Delete this post?')) return;
                try{
                  const author = localStorage.getItem('user')
                  const res = await axios.delete(`${apiBase}/posts/${post._id}`, { data: { author } })
                  if(res && res.data && res.data.success){
                    if(typeof onDeleted === 'function') onDeleted()
                  } else {
                    // fallback: refresh list to reflect any server changes and show message
                    await refresh()
                    alert('Delete request did not return success')
                  }
                }catch(err){ console.error(err); alert('Failed to delete post: ' + (err.response?.data?.error || err.message)) }
              }} className="mt-2 btn-danger px-3 py-1 rounded">Delete Post</button>
            </div>
          )}
        </div>
      </div>

  <div className="mt-4">{post.content}</div>

      <div className="mt-4">
        {/* Summary & AI suggestions area */}
        {summary && (
          <div className="mb-4 p-3 card-ghost rounded">
            <div className="font-semibold mb-2">Summary</div>
            <div className="text-sm text-secondary whitespace-pre-wrap">{summary}</div>
          </div>
        )}

        {similar && similar.length>0 && (
          <div className="mb-4 p-3 card-ghost rounded">
            <div className="font-semibold mb-2">Similar posts</div>
            <ul className="space-y-2">
              {similar.map(s => (
                <li key={s._id} className="text-sm">
                  <div className="font-medium">{s.title}</div>
                  <div className="text-secondary text-xs">{s.snippet}</div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <h4 className="font-semibold">Replies</h4>
        <ul className="mt-2 space-y-3">
          {localReplies?.map((r, idx)=> (
            <li key={r._id || idx} className={`p-3 rounded ${r.__optimistic ? 'optimistic' : 'card-ghost'}`}>
              {editingId === r._id ? (
                <div>
                  <textarea value={editingText} onChange={e=>setEditingText(e.target.value)} className="w-full p-2 border rounded mb-2" rows={3}></textarea>
                  <div className="flex gap-2">
                    <button onClick={async ()=>{
                      try{
                        const author = localStorage.getItem('user') || r.author || undefined
                        await axios.patch(`${apiBase}/posts/${post._id}/reply/${r._id}`, { content: editingText, author })
                        setEditingId(null); setEditingText(''); await refresh()
                      }catch(err){ console.error(err) }
                    }} className="btn-primary px-3 py-1 rounded">Save</button>
                    <button onClick={()=>{ setEditingId(null); setEditingText('') }} className="px-3 py-1 rounded border">Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div>{r.content}</div>
                  <div className="text-xs text-secondary">— {r.author || 'Anonymous'} • {new Date(r.createdAt).toLocaleString()}</div>
                  <div className="mt-2 flex gap-2">
                    <button onClick={()=>{ setEditingId(r._id); setEditingText(r.content) }} className="text-xs text-link">Edit</button>
                    <button onClick={async ()=>{
                      if(!confirm('Delete this reply?')) return;
                      try{
                        const author = localStorage.getItem('user') || r.author || undefined
                        await axios.delete(`${apiBase}/posts/${post._id}/reply/${r._id}`, { data: { author } })
                        await refresh()
                      }catch(err){ console.error(err) }
                    }} className="text-xs text-danger">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
  <textarea id="reply-input" value={reply} onChange={e=>setReply(e.target.value)} className="w-full p-2 border rounded" rows={3}></textarea>
        <div className="flex gap-2 mt-2 flex-wrap items-center">
          <button onClick={()=>askAI(post.content)} className="btn-warning px-3 py-2 rounded flex-1 sm:flex-initial">AI Suggest</button>
          <button onClick={summarize} className="px-3 py-2 rounded border flex-1 sm:flex-initial">Summarize</button>
          <button onClick={addReply} disabled={sending} className={`btn-success px-3 py-2 rounded flex-1 sm:flex-initial ${sending? 'opacity-60 cursor-not-allowed':''}`}>
            {sending ? 'Sending…' : 'Reply'}
          </button>
        </div>

  {error && <div className="mt-2 text-sm text-danger">{error}</div>}

        {suggestions.length>0 && (
          <div className="mt-2 p-2 card-ghost rounded">
            <div className="text-sm text-secondary mb-1">Suggestions</div>
            <ul className="space-y-1">
              {suggestions.map((s,i)=>(
                <li key={i} className="flex justify-between items-center">
                  <div className="text-sm">{s}</div>
                  <button onClick={()=>useSuggestion(s)} className="text-xs text-link">Use</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
