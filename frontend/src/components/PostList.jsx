import React from 'react'

export default function PostList({ posts, onSelect, refresh, apiBase, onUpvote, onAddReply, theme='light' }){
  return (
    <div className={`bg-theme mt-4 p-2 rounded`}> 
      <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold">Recent Posts</h2>
        <div className="text-sm text-secondary">{posts.length} posts</div>
      </div>
      <ul>
        {posts.map(p => (
          <li key={p._id} className="border-b py-4 hover:bg-theme-soft rounded">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
              <div className="flex-1 w-full text-left" onClick={()=>onSelect(p)} style={{cursor:'pointer'}}>
                <div className="font-semibold text-lg">{p.title}</div>
                <div className="text-sm muted">{p.content.slice(0,140)}{p.content.length>140?'...':''}</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-secondary text-center">
                  <div className="font-bold">{p.votes}</div>
                  <div className="muted text-xs">votes</div>
                </div>
                <button onClick={(e)=>{ e.stopPropagation(); onUpvote && onUpvote(p) }} className="btn-primary px-3 py-1 rounded">Upvote</button>
                <button onClick={(e)=>{ e.stopPropagation(); onAddReply && onAddReply(p) }} className="btn-accent px-3 py-1 rounded">Add Reply</button>
              </div>
            </div>
            <div className="mt-2 text-xs muted">Replies: {p.replies?.length || 0} • {new Date(p.createdAt).toLocaleString()}</div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  )
}
