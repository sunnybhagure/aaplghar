"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, Loader2, ArrowRight, Building2, Home } from "lucide-react"
import API from "./api";

const LoginPage = ({ showAlert }) => {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("${API}/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        showAlert("success", "Welcome Back! Login Successful.") 
        navigate("/") 
      } else {
        showAlert("error", data.message || "Invalid credentials")
      }
    } catch (err) {
      showAlert("error", "Server connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-900">
      
      {/* Left Side: Visual Experience (Image jashi aahe tashi) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 items-center justify-center overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="Modern House" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 hover:scale-100 transition-transform duration-700"
        />
        {/* Color overlay matching Slate-900 theme */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        
        <div className="relative z-10 p-12 text-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
              <Home className="w-8 h-8 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tighter uppercase italic">AAPL<span className="text-blue-500">GHAR</span></span>
          </div>
          <h1 className="text-5xl font-black leading-tight mb-4 uppercase italic tracking-tighter">Find your <br/> <span className="text-blue-500 text-6xl">Dream Space</span></h1>
          <p className="text-slate-300 text-lg max-w-md font-bold uppercase tracking-widest text-xs opacity-80">Experience the most seamless way to find premium properties.</p>
          
          <div className="mt-12 flex gap-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-blue-500 italic">12k+</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Properties</span>
            </div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-blue-500 italic">8k+</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Login Form (Theme Updated) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          
          {/* Logo for Mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
             <Home className="w-6 h-6 text-blue-600" />
             <span className="text-xl font-black tracking-tighter uppercase italic">AAPL<span className="text-blue-600">GHAR</span></span>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Welcome Back</h2>
            <div className="h-1.5 w-12 bg-blue-600 rounded-full mt-3"></div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
              <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Password</label>
                <Link to="/forgot" className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-900 text-sm font-bold focus:outline-none focus:border-blue-600/30 focus:ring-4 focus:ring-blue-600/5 transition-all"
                />
              </div>
            </div>

            {/* Submit Button - Now matches Home Explore button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[3px] text-[12px] py-5 rounded-2xl transition-all shadow-xl active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Sign In To Space</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest">
              New to AaplGhar? 
              <Link to="/register" className="text-blue-600 ml-2 hover:underline">Create Account</Link>
            </p>
          </div>

          {/* Footer Minimal links */}
          <div className="mt-12 flex justify-center gap-6 text-[9px] font-black text-slate-300 uppercase tracking-[2px]">
              <span className="cursor-pointer hover:text-blue-600 transition-colors">Privacy</span>
              <span className="cursor-pointer hover:text-blue-600 transition-colors">Terms</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage