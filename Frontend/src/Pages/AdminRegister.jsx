"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { ShieldPlus, User, Building2, Mail, MapPin, Phone, Lock, Loader2, ArrowLeft, ChevronRight } from "lucide-react"
import API from "../aap";

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    companyAddress: "",
    phone: ""
  })
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${API}/api/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        localStorage.setItem("adminToken", data.token)
        showAlert("success", "Administrative Credentials Granted! Welcome to the Network.")
        navigate("/admin-dashboard")
      } else {
      showAlert("error", data.message || "Registration failed. Please check your details.")      }
    } catch (err) {
      showAlert("error", "Connection failed. Please check if the server is running.")    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#f8fafc] font-sans selection:bg-blue-500/30">
      
      {/* --- LEFT SIDE: THE ROYAL BRANDING (DARK) --- */}
      <div className="hidden md:flex md:w-[40%] bg-[#020617] relative items-center justify-center p-16 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
        
        <div className="relative z-10 w-full max-w-sm text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40 mb-10 mx-auto md:mx-0">
            <ShieldPlus className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-5xl font-black text-white leading-tight tracking-tighter uppercase mb-6">
            Join the <br /> <span className="text-blue-500 italic">Network.</span>
          </h2>
          
          <p className="text-slate-500 font-bold text-xs tracking-widest leading-relaxed uppercase mb-12">
            Establish your professional builder profile and start managing your real-estate empire.
          </p>

          <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 backdrop-blur-md">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[2px] mb-4">Already have access?</p>
            <Link 
              to="/AdminLogin" 
              className="inline-flex items-center gap-2 text-white font-black text-[11px] uppercase tracking-widest hover:text-blue-500 transition-all group"
            >
              Back to Login <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: THE REGISTER FORM --- */}
      <div className="w-full md:w-[60%] flex items-center justify-center p-8 md:p-12 bg-white">
        <div className="w-full max-w-[550px]">
          
          <div className="mb-10 text-center md:text-left">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">Builder Register</h3>
            <div className="h-1.5 w-16 bg-blue-600 rounded-full mx-auto md:mx-0" />
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[4px] mt-4">Administrative Onboarding</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Builder Name */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Builder Name</label>
              <div className="relative">
                <User className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="name"
                  type="text"
                  placeholder="Sunny Bhagure"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pl-8 pr-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Company Name</label>
              <div className="relative">
                <Building2 className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="companyName"
                  type="text"
                  placeholder="Realty Corp"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pl-8 pr-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="email"
                  type="email"
                  placeholder="admin@system.com"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pl-8 pr-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2 group">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Contact Number</label>
              <div className="relative">
                <Phone className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="phone"
                  type="number"
                  placeholder="9876543210"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pl-8 pr-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Company Address (Full Width) */}
            <div className="space-y-2 group md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Business Address</label>
              <div className="relative">
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="companyAddress"
                  type="text"
                  placeholder="Street 12, Business District"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pl-8 pr-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-200 text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2 group md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  onChange={handleChange}
                  required
                  className="w-full bg-transparent border-b border-slate-200 focus:border-blue-600 pl-8 pr-4 py-3 font-bold text-slate-800 outline-none transition-all placeholder:text-slate-200 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 mt-4 bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[5px] text-[12px] py-5 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-4 group"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>Establish Admin Profile <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" /></>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}

export default AdminRegister