"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { User, Mail, Phone, Lock, Loader2, ArrowRight, Home, CheckCircle, Star, Users } from "lucide-react"
import API from "./api";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" })
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
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("${API}/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (data.success) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))
        navigate("/")
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
      setError("Connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
      
      {/* LEFT SIDE: THE FORM (Clean, White, Focused) */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 md:p-16 bg-white relative z-10 shadow-2xl">
        <div className="w-full max-w-[420px]">
          
          {/* Header Branding */}
          <div className="flex items-center gap-2 mb-12 group cursor-pointer">
             <div className="p-2.5 bg-slate-900 rounded-2xl group-hover:bg-blue-600 transition-all duration-500 shadow-lg shadow-slate-200">
               <Home className="w-6 h-6 text-white" />
             </div>
             <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
              Aapl<span className="text-blue-600"> Ghar</span>
            </span>
          </div>

          <div className="mb-10 text-left">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
              Join The <br/> <span className="text-blue-600">Elite.</span>
            </h2>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[4px] mt-4 opacity-80">Become a member of Aapl Ghar</p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border-2 border-rose-100 text-rose-600 text-[11px] font-black uppercase tracking-widest p-4 rounded-2xl animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange} required
                  placeholder="John Doe"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white pl-12 pr-4 py-4 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Email & Phone Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="mail@site.com"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white px-6 py-4 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone</label>
                <input
                  type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                  placeholder="10 Digits"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white px-6 py-4 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password" name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Min. 6 chars"
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white pl-12 pr-4 py-4 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* CTA Button */}
            <button
              type="submit" disabled={loading}
              className="w-full mt-4 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[3px] text-[13px] py-5 rounded-2xl transition-all shadow-xl shadow-blue-900/10 active:scale-95 flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Create My Space <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <p className="mt-10 text-center text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Already have an account? <Link to="/login" className="text-blue-600 ml-2 font-black hover:underline transition-all">Log In</Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: THE EXPERIENCE (Visual with Background Image) */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-slate-900 items-center justify-center p-16 overflow-hidden">
        {/* Background Image - Luxury Real Estate */}
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Luxury Architecture" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay scale-110 hover:scale-100 transition-transform duration-[2000ms]"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/40 to-transparent" />

        <div className="relative z-10 w-full max-w-lg">
          <div className="mb-10">
            <h1 className="text-7xl font-black text-white leading-[0.9] uppercase italic tracking-tighter mb-6">
              Design <br/> Your <span className="text-blue-500">Destiny.</span>
            </h1>
            <p className="text-slate-300 text-lg font-medium opacity-80 leading-relaxed max-w-md">
              Discover the most exclusive properties and start living the life you've always imagined.
            </p>
          </div>

          {/* Floating Trust Cards (Glassmorphism Effect) */}
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 translate-x-10 hover:translate-x-0 transition-transform duration-500 shadow-2xl">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/30">
                   <Star className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                   <p className="text-white font-black uppercase italic text-sm tracking-wider">Premium Experience</p>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Curated only for you</p>
                </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 -translate-x-5 hover:translate-x-0 transition-transform duration-500 shadow-2xl">
                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30">
                   <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                   <p className="text-white font-black uppercase italic text-sm tracking-wider">10k+ Active Users</p>
                   <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Join the growing community</p>
                </div>
            </div>
          </div>

          <div className="mt-20 flex items-center gap-4">
             <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} className="w-10 h-10 rounded-full border-2 border-slate-900 shadow-xl" />
                ))}
             </div>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px]">Trusted by thousands</p>
          </div>
        </div>

        {/* Decorative Light Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      </div>
    </div>
  )
}

export default RegisterPage