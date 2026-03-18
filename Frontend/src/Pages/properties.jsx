import { useEffect, useState } from "react"
import axios from "axios"
import PropertyCard from "../Components/PropertiesCard"

const Properties = () => {

  const [data, setData] = useState([])

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    const res = await axios.get("http://localhost:5000/api/property/all-properties")
    setData(res.data)
  }

  const cities = [...new Set(data.map(p => p.city))]

  return (
    <div className="bg-gray-100 min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-8">Explore Properties</h1>

      {cities.map(city => (
        <div key={city} className="mb-10">

          <h2 className="text-2xl font-semibold mb-4">{city}</h2>

          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">

            {data
              .filter(p => p.city === city)
              .map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}

          </div>

        </div>
      ))}

    </div>
  )
}

export default Properties