'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabaseClient } from "@/lib/supabase-client"

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const router = useRouter()

  const supabase = supabaseClient()

  const handleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
  
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/main-page')
  }

  const handleSignUp = async () => {
    setLoading(true)
    setErrorMsg('')

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/main-page')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg("Please fill out all fields")
      return
    }
    if (mode === 'login') {
      handleLogin()
    } else {
      handleSignUp()
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#09090b] text-neutral-200 px-4 antialiased selection:bg-neutral-800 selection:text-white">
      
     
      <div className="absolute top-0 left-1/2 -z-10 h-125 w-175 -translate-x-1/2 rounded-full bg-neutral-900/40 opacity-50 blur-[120px]" />
      
      
      <div className="w-full max-w-100 rounded-2xl border border-neutral-800/80 bg-[#121214]/40 p-8 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
        
     
        <div className="mb-8 flex flex-col space-y-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white transition-all duration-300">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-xs text-neutral-400 tracking-wide">
            {mode === 'login' ? 'Enter your details below to access your space' : 'Enter your email below to start creating'}
          </p>
        </div>

        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <input 
                type="email" 
                placeholder="name@domain.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all duration-200"
              />
            </div>
            
            <div className="relative">
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 px-3.5 bg-neutral-900/60 border border-neutral-800/80 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all duration-200"
              />
            </div>
          </div>

          
          {errorMsg && (
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg">
              <p className="text-center text-xs font-medium text-red-400">
                {errorMsg}
              </p>
            </div>
          )}

        
          <button 
            type="submit"
            disabled={loading} 
            className="relative flex items-center justify-center w-full h-11 mt-2 bg-neutral-100 hover:bg-white disabled:bg-neutral-800 disabled:text-neutral-500 text-neutral-950 font-medium text-sm rounded-lg transition-all duration-200 shadow-sm active:scale-[0.99]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : mode === 'login' ? "Continue" : "Register Account"}
          </button>

        
          <div className="pt-4 text-center">
            <p className="text-xs text-neutral-400">
              {mode === 'login' ? "New to the platform?" : "Have an active profile?"}{" "}
              <button 
                type="button"
                onClick={() => { 
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setErrorMsg('') 
                }} 
                className="font-medium text-neutral-200 underline underline-offset-4 transition-colors hover:text-white"
              >
                {mode === 'login' ? "Sign Up" : "Log In"}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}