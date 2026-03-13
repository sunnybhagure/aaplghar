import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AdminRegister() {

const [formData,setFormData] = useState({
    name:"",
    email:"",
    password:"",
    companyName:"",
    companyAddress:"",
    phone:""
})

const navigate = useNavigate()

const handleChange = (e)=>{
    setFormData({
        ...formData,
        [e.target.name]:e.target.value
    })
}

const handleSubmit = async(e)=>{
    e.preventDefault()

    const res = await fetch("http://localhost:5000/api/admin/register",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    })

    const data = await res.json()

    if(data.success){

        localStorage.setItem("adminToken",data.token)

        alert("Admin Registered Successfully")

        navigate("/admin-dashboard")

    }else{
        alert(data.message)
    }

}

return(

<div className="flex justify-center items-center h-screen bg-gray-100">

    <div className="bg-white p-8 rounded-xl shadow-md w-[400px]">

        <h2 className="text-2xl font-bold mb-6 text-center">
            Builder Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

            <input
                type="text"
                name="name"
                placeholder="Builder Name"
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

            <input
                type="text"
                name="companyName"
                placeholder="Company Name"
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

            <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

            <input
                type="text"
                name="companyAddress"
                placeholder="Company Address"
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

                <input
                type="number"
                name="phone"
                placeholder="Phone Number"
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

            <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                className="w-full border p-2 rounded"
            />

            <button
                className="w-full bg-black text-white py-2 rounded"
            >
                Register
            </button>

        </form>

    </div>

</div>

)

}

export default AdminRegister