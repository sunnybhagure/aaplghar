import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"

function AdminLogin() {

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [error,setError] = useState("")
  const [loading,setLoading] = useState(false)

  const navigate = useNavigate()

  const handleSubmit = async(e)=>{
    e.preventDefault()
    setLoading(true)
    setError("")

    try{

      const res = await fetch("http://localhost:5000/api/admin/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({email,password})
      })

      const data = await res.json()

     if (data.success) {
    // 1. टोकन सेव्ह करा
    localStorage.setItem("adminToken", data.token);

    // 2. Builder चा ID सेव्ह करा (खूप महत्त्वाचे)
    // तुझ्या API कडून जर 'builder' की येत असेल तर data.builder._id वापर
    const builderId = data.builder?._id || data.admin?._id || data.user?._id;
    localStorage.setItem("adminId", builderId);

    // 3. पूर्ण ऑब्जेक्ट सेव्ह करा (भविष्यात नावासाठी किंवा ईमेलसाठी लागेल)
    localStorage.setItem("adminUser", JSON.stringify(data.builder || data.admin));

    // डॅशबोर्डवर नेणे
    navigate("/admin-dashboard");
    } else {
        setError(data.message || "Login failed");
    }
    }catch(err){
      setError("Server error")
    }

    setLoading(false)
  }

  return(

<div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">

<div className="bg-white shadow-xl rounded-xl w-[400px] p-8">

<h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
Admin Login
</h2>

{error && (
<div className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
{error}
</div>
)}

<form onSubmit={handleSubmit} className="space-y-4">

<div>
<label className="block text-sm font-semibold text-gray-600 mb-1">
Email
</label>

<input
type="email"
placeholder="Enter admin email"
onChange={(e)=>setEmail(e.target.value)}
required
className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
/>
</div>

<div>
<label className="block text-sm font-semibold text-gray-600 mb-1">
Password
</label>

<input
type="password"
placeholder="Enter password"
onChange={(e)=>setPassword(e.target.value)}
required
className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
/>
</div>

<button
type="submit"
disabled={loading}
className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-md transition duration-300"
>
{loading ? "Logging in..." : "Login"}
</button>

</form>

<p className="text-sm text-center text-gray-600 mt-4">
Not registered?{" "}
<Link
to="/AdminRegister"
className="text-indigo-600 font-semibold hover:underline"
>
Register here
</Link>
</p>

</div>

</div>

  )
}

export default AdminLogin