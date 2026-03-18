import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"

const PropertyShowPage = () => {

  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    fetch(`http://localhost:5000/api/property/${id}`)
      .then(res => res.json())
      .then(data => setProperty(data))
  }, [id])

  if (!property)
    return <div className="text-center mt-20 text-xl">Loading...</div>

  return (
    <div className="bg-gray-100 min-h-screen pb-20">

      {/* IMAGE GALLERY */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto p-3 grid md:grid-cols-5 gap-2">

          <img
            src={property.images[activeImg]?.url}
            className="md:col-span-3 h-[420px] w-full object-cover rounded-xl"
          />

          <div className="grid grid-cols-2 gap-2">
            {property.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                onClick={() => setActiveImg(i)}
                className={`h-[205px] w-full object-cover rounded-xl cursor-pointer
                ${activeImg === i ? "ring-4 ring-white" : ""}`}
              />
            ))}
          </div>

        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="max-w-7xl mx-auto mt-6 px-4 grid md:grid-cols-3 gap-6">

        {/* LEFT CONTENT */}
        <div className="md:col-span-2 space-y-6">

          {/* TITLE CARD */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">{property.title}</h1>

              <span className={`px-4 py-1 rounded-full text-sm font-semibold
                ${property.status === "available"
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"}`}>
                {property.status}
              </span>
            </div>

            <p className="text-gray-500 mt-2">
              {property.location}, {property.city}
            </p>

            <div className="flex gap-6 mt-4 text-lg">
              <span>🛏 {property.bedrooms} BHK</span>
              <span>🛁 {property.bathrooms} Bath</span>
              <span>📐 {property.area}</span>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-700 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* AMENITIES */}
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Amenities</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {property.amenities.map((a, i) => (
                <div key={i} className="bg-gray-100 py-2 rounded-lg text-center">
                  {a}
                </div>
              ))}
            </div>
          </div>

          {/* PLANS */}
          <div className="bg-white p-6 rounded-2xl shadow space-y-4">
            <h2 className="text-xl font-semibold">Plans</h2>

            {property.societyPlan?.url && (
              <a
                href={property.societyPlan.url}
                target="_blank"
                className="block bg-blue-600 text-white text-center py-2 rounded-lg"
              >
                View Society Plan
              </a>
            )}

            {property.homePlan?.url && (
              <a
                href={property.homePlan.url}
                target="_blank"
                className="block border border-blue-600 text-blue-600 text-center py-2 rounded-lg"
              >
                View Home Plan
              </a>
            )}
          </div>

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">

          {/* PRICE CARD */}
          <div className="bg-white p-6 rounded-2xl shadow sticky top-6">
            <h2 className="text-3xl font-bold text-blue-600 mb-4">
              ₹ {property.price}
            </h2>

            <button className="w-full bg-blue-600 text-white py-3 rounded-xl mb-3 hover:bg-blue-700">
              Contact Builder
            </button>

            <button className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl">
              Schedule Visit
            </button>
          </div>

          {/* BUILDER */}
          {property.builder && (
            <div className="bg-white p-6 rounded-2xl shadow text-center">
              <h3 className="font-semibold text-lg">Builder Details</h3>
              <p className="text-gray-500 mt-1">
                {property.builder.name || "Trusted Builder"}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default PropertyShowPage