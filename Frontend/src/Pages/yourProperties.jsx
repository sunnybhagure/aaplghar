import { useEffect, useState } from "react"
import axios from "axios"
import PropertyCard from "../Components/PropertiesCard"

const YourProperties = () => {

  const [data, setData] = useState([])

  useEffect(() => {
    fetchMyProperties()
  }, [])

  const fetchMyProperties = async () => {

    const token = localStorage.getItem("adminToken")

    const res = await axios.get(
      "http://localhost:5000/api/property/my-properties",
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    setData(res.data)
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-3xl font-bold mb-6">Your Properties</h1>

      {data.length === 0 ? (
        <p>No Properties Added</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {data.map(p => (
            <PropertyCard key={p._id} property={p} />
          ))}
        </div>
      )}

    </div>
  )
}

export default YourProperties