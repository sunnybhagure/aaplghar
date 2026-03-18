import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const PropertyCard = ({ property }) => {

  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false)
  const navigate = useNavigate()

  // instant change on hover + auto slide
  useEffect(() => {

    if (!hover) return

    // FIRST instant change
    setIndex(prev => (prev + 1) % property.images.length)

    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % property.images.length)
    }, 3000)

    return () => clearInterval(interval)

  }, [hover, property.images.length])


  const goToImage = (e, i) => {
    e.stopPropagation()
    setIndex(i)
  }

  return (
    <div
      className="min-w-[300px] group bg-white rounded-2xl shadow-lg 
      cursor-pointer hover:scale-105 hover:shadow-2xl transition duration-300"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigate(`/property/${property._id}`)}
    >

      {/* Image Slider */}
      <div className="relative h-[200px] overflow-hidden rounded-t-2xl">

        {property.images.map((img, i) => (
          <img
            key={i}
            src={img.url}
            alt="property"
            className={`absolute w-full h-full object-cover 
            transition-all duration-700
            ${i === index ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
          />
        ))}

        {/* DOT Indicators */}
        <div className="absolute bottom-3 w-full flex justify-center gap-2 
        opacity-0 group-hover:opacity-100 transition">

          {property.images.map((_, i) => (
            <div
              key={i}
              onClick={(e) => goToImage(e, i)}
              className={`h-2 w-2 rounded-full cursor-pointer 
              ${i === index ? "bg-white scale-125" : "bg-white/50"}`}
            />
          ))}

        </div>

      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-lg font-semibold">{property.title}</h3>
        <p className="text-gray-500">{property.location}, {property.city}</p>

        <div className="flex justify-between mt-2">
          <span className="font-bold text-blue-600">₹ {property.price}</span>
          <span className="text-sm text-gray-600">{property.area}</span>
        </div>

        <p className="text-sm text-gray-700 mt-1">
          {property.bedrooms} BHK • {property.bathrooms} Bath
        </p>
      </div>

    </div>
  )
}

export default PropertyCard