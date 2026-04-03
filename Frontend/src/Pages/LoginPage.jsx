"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Mail, Lock, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"

const LoginPage = () => {
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
      const response = await fetch("http://localhost:5000/api/auth/login", {
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
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      setError("Server connection failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Background Subtle Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 w-full max-w-[450px]">
        {/* Card Container */}
        <div className="bg-white border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-8 md:p-12">
          
          <div className="mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">Sign In</h2>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[2px] mt-2">Enter your details to continue</p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest p-4 rounded-2xl flex items-center gap-3">
              <div className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="group relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white pl-12 pr-4 py-4 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300 placeholder:font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                <Link to="/forgot" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-colors">Forgot?</Link>
              </div>
              <div className="group relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-600/20 focus:bg-white pl-12 pr-4 py-4 rounded-2xl font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[3px] text-[12px] py-5 rounded-2xl transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Login Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 text-center">
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest">
              Don't have an account? 
              <Link to="/register" className="text-blue-600 font-black ml-2 hover:underline">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage