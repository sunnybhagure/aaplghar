"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ShieldCheck, Lock, Mail, Loader2, ChevronRight, Fingerprint, Globe, ArrowRight } from "lucide-react"

const AdminLogin = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem("adminToken", data.token)
        localStorage.setItem("adminId", data.admin?._id || data.id)
        localStorage.setItem("user", JSON.stringify(data.admin)) 
        navigate("/admin-dashboard")
      } else {
        setError(data.message || "Invalid Admin Credentials")
      }
    } catch (err) {
      setError("Server Connection Failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
      
      {/* --- BACKGROUND GRAPHICS --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row items-center gap-12 px-6">
        
        {/* --- LEFT SIDE: INFO & IMPROVED REGISTER SECTION --- */}
        <div className="w-full md:w-1/2 text-center md:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase tracking-[3px]">
            <Globe className="w-3 h-3" /> System Gateway
          </div>
          
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">
            ADMIN <br /> <span className="text-blue-600 underline decoration-blue-600/30 underline-offset-8">PORTAL.</span>
          </h1>
          
          <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
            Manage your real-estate empire with precision. High-security access for authorized administrators only.
          </p>

          {/* --- REGISTER BUTTON (Aata nit disel asa kela aahe) --- */}
          <div className="pt-8">
            <div className="inline-block p-1 rounded-[2rem] bg-gradient-to-r from-blue-600/20 to-transparent border border-white/10 backdrop-blur-sm">
              <div className="px-6 py-6 space-y-4">
                <p className="text-white text-[11px] font-black uppercase tracking-[2px]">New Administrator?</p>
                <Link 
                  to="/AdminRegister" 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-[11px] uppercase tracking-widest transition-all shadow-lg shadow-blue-600/20 group"
                >
                  Create Admin Account 
                  <Fingerprint className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDE: THE LOGIN CARD --- */}
        <div className="w-full md:w-[420px]">
          <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8 md:p-10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)]">
            
            <div className="mb-8 flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <span className="block text-white font-black text-xs uppercase tracking-widest">Secure Login</span>
                <span className="block text-slate-500 text-[9px] font-bold uppercase">v4.0.2 Stable</span>
              </div>
            </div>

            {error && (
              <div className="mb-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-[2px] p-4 rounded-2xl flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Admin ID</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    placeholder="ADMIN@SYSTEM.COM"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-slate-950/50 border border-white/5 focus:border-blue-600/40 pl-14 pr-6 py-4 rounded-2xl font-bold text-white outline-none transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[2px] ml-1">Access Key</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-950/50 border border-white/5 focus:border-blue-600/40 pl-14 pr-6 py-4 rounded-2xl font-bold text-white outline-none transition-all placeholder:text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-white hover:bg-blue-600 hover:text-white text-slate-950 font-black uppercase tracking-[3px] text-[12px] py-5 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Enter Dashboard <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Back to site link */}
      <div className="absolute bottom-8 w-full text-center">
        <Link to="/" className="text-slate-600 hover:text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all">
          ← Exit Secure Environment
        </Link>
      </div>
    </div>
  )
}

export default AdminLogin