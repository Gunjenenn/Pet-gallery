'use client'

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { DialogDemo } from "../__component/postDialog"
import { supabaseClient } from "@/lib/supabase-client"
import { Textarea } from "@/components/ui/textarea"

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [posts, setPosts] = useState(null)
  
  const supabase = supabaseClient()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const postsResult = await supabase.from('pets').select('*')
    const commentsResult = await supabase.from('postComments').select('*')

    const dbPosts = postsResult.data || []
    const dbComments = commentsResult.data || []

    for (let i = 0; i < dbPosts.length; i++) {
      dbPosts[i].commentsList = []
      dbPosts[i].inputText = ""

      for (let j = 0; j < dbComments.length; j++) {
        if (dbComments[j].postId === dbPosts[i].id) {
          dbPosts[i].commentsList.push(dbComments[j])
        }
      }
    }

    setPosts(dbPosts)
  }


  async function handleDelete(postId) {
    const confirmDelete = confirm("Are you sure to delete this post?")
    if (!confirmDelete) return

    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('id', postId)

    if (error) {
      console.log('Error deleting post:', error.message)
      alert("Error: " + error.message)
      return
    }

    loadData()
  }

  function handleCommentChange(postId, event) {
    const newText = event.target.value

    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        return { ...post, inputText: newText }
      }
      return post
    })

    setPosts(updatedPosts)
  }

  async function addComment(postId) {
    let targetPost = null
    for (let i = 0; i < posts.length; i++) {
      if (posts[i].id === postId) {
        targetPost = posts[i]
      }
    }

    if (!targetPost || !targetPost.inputText || targetPost.inputText === "") {
      return
    }

    const result = await supabase.from('postComments').insert({
      postId: postId,
      body: targetPost.inputText
    })

    if (result.error) {
      console.log('Error adding comment:', result.error)
      return
    }

    loadData()
  }

  if (posts === null) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-pink-300/70 font-medium">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-stone-950 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-rose-950/40 via-stone-950 to-pink-950/30 text-stone-100 px-6 py-12 md:px-12 lg:px-20 selection:bg-rose-500/30 selection:text-pink-200">
      
      {/* Header Section */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-16 border-b border-rose-900/30 pb-8">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-pink-300 font-semibold bg-rose-950/80 px-3.5 py-1 rounded-full border border-pink-500/30 shadow-xs">
            Curated Space
          </span>
          <h1 className="text-4xl md:text-5xl font-light tracking-tight text-stone-50 mt-3 font-serif">
            The Pet Gallery
          </h1>
        </div>
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="bg-rose-900 hover:bg-rose-800 text-pink-100 border border-rose-700/50 rounded-full px-7 py-6 text-sm font-medium shadow-lg shadow-rose-950/60 hover:shadow-rose-900/30 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          ✨ Create Post
        </Button>
      </div>

      <DialogDemo 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onPostCreated={loadData}
      />

      {/* Grid Content */}
      <div className="max-w-6xl mx-auto">
        {posts.length === 0 ? (
          <div className="text-center py-32 bg-stone-900/50 backdrop-blur-md rounded-3xl border border-stone-800 max-w-md mx-auto">
            <p className="text-3xl mb-2">🌸</p>
            <p className="text-stone-300 text-sm font-medium">No posts in the gallery yet.</p>
            <p className="text-stone-500 text-xs mt-1">Share the first photo using the button above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((data) => {
              const { data: publicUrlData } = supabase.storage
                .from('pet-images')
                .getPublicUrl(data.image_path)

              return (
                <div 
                  key={data.id} 
                  className="group bg-stone-900/70 backdrop-blur-xl border border-stone-800/80 hover:border-pink-500/30 rounded-[28px] overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-rose-950/30 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
                >
                  {/* Image Header */}
                  <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-950">
                    <img 
                      src={publicUrlData.publicUrl} 
                      alt={data.description || "Pet image"} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Animal Type Badge */}
                    <div className="absolute top-4 right-4 bg-stone-950/80 backdrop-blur-md text-pink-200 text-[10px] tracking-widest uppercase font-bold px-3 py-1 rounded-full border border-pink-500/30">
                      {data.animal_type}
                    </div>

                    {/* ✅ 2. DELETE BUTTON (Зургийн зүүн дээд талд) */}
                    <button
                      onClick={() => handleDelete(data.id)}
                      title="Delete post"
                      className="absolute top-4 left-4 p-2 rounded-full bg-stone-950/70 hover:bg-red-950/90 text-stone-400 hover:text-red-400 border border-stone-800 hover:border-red-500/50 backdrop-blur-md transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                  </div>

                  {/* Card Body */}
                  <div className="p-6 flex flex-col grow justify-between gap-5">
                    
                    <div>
                      <p className="text-sm font-light text-stone-200 leading-relaxed">
                        {data.description}
                      </p>
                      
                      {/* Location Badge */}
                      <div className="flex items-center gap-1.5 mt-3 text-xs text-stone-400 font-medium">
                        <svg className="w-3.5 h-3.5 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate">{data.location || "Unknown location"}</span>
                      </div>
                    </div>

                    {/* Interactive Section */}
                    <div className="space-y-4 pt-4 border-t border-stone-800/80">
                      
                      {/* 1. Add Comment Input Box */}
                      <div className="flex flex-col gap-2">
                        <Textarea 
                          value={data.inputText} 
                          onChange={(e) => handleCommentChange(data.id, e)}
                          placeholder="Write a sweet comment..."
                          className="text-xs resize-none bg-stone-950/60 focus:bg-stone-950 border-stone-800 text-stone-200 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 transition-all rounded-xl p-3 placeholder:text-stone-600 min-h-16"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => addComment(data.id)}
                          className="self-end text-xs font-semibold bg-rose-950 hover:bg-rose-800 text-pink-200 border border-rose-800/60 rounded-lg px-4 transition-all"
                        >
                          Post Comment
                        </Button>
                      </div>

                      {/* 2. Comments Display Area */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-pink-300/60">
                            Comments ({data.commentsList.length})
                          </span>
                        </div>

                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {data.commentsList.length === 0 ? (
                            <p className="text-xs text-stone-600 italic py-2 text-center bg-stone-950/40 rounded-xl border border-dashed border-stone-800/60">
                              No comments yet
                            </p>
                          ) : (
                            data.commentsList.map((item) => (
                              <div key={item.id} className="text-xs text-stone-300 bg-stone-950/50 border border-stone-800/60 p-2.5 rounded-xl">
                                <p className="leading-snug">{item.body}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}