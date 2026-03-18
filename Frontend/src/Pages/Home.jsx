```jsx
import { useNavigate } from "react-router-dom"

const HomePage = () => {

  const navigate = useNavigate()

  const cities = [
    { name: "Nashik", img: "/city1.jpg" },
    { name: "Pune", img: "/city2.jpg" },
    { name: "Mumbai", img: "/city3.jpg" },
    { name: "Bangalore", img: "/city4.jpg" },
  ]

  return (
    <div className="bg-gray-50">

      {/* HERO SECTION */}
      <div className="h-screen bg-[url('/hero.jpg')] bg-cover bg-center relative">

        <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-center text-white px-4">

          <h1 className="text-5xl font-bold mb-4">
            Find Your Dream Home 🏡
          </h1>

          <p className="text-lg mb-6">
            Discover luxury flats, villas & plots at best prices
          </p>

          <button
            onClick={() => navigate("/properties")}
            className="bg-blue-600 px-6 py-3 rounded-full text-lg hover:bg-blue-700 transition"
          >
            Explore Properties
          </button>

        </div>
      </div>

      {/* FEATURED CITIES */}
      <div className="py-16 px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Cities</h2>

        <div className="flex gap-6 overflow-x-auto">

          {cities.map((city, i) => (
            <div
              key={i}
              className="min-w-[250px] h-[180px] relative rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img
                src={city.img}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
              />

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">{city.name}</h3>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* BUILDER CTA */}
      <div className="h-[300px] bg-[url('/builder.jpg')] bg-cover bg-center relative my-16">

        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-10">

          <div className="text-white max-w-xl">
            <h2 className="text-4xl font-bold mb-4">
              Are you a Builder?
            </h2>

            <p className="mb-4">
              Post your new projects & reach thousands of buyers
            </p>

            <button className="bg-white text-black px-6 py-2 rounded-full font-semibold">
              Post Project
            </button>
          </div>

        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="py-16 bg-white">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Us</h2>

        <div className="grid md:grid-cols-4 gap-8 px-10">

          {["Verified Listings","Best Price Deals","Trusted Builders","Easy Loan Support"].map((item,i)=>(
            <div key={i} className="p-6 rounded-2xl shadow hover:shadow-xl transition text-center">
              <h3 className="text-xl font-semibold">{item}</h3>
            </div>
          ))}

        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="py-16 px-6 bg-gray-100">
        <h2 className="text-3xl font-bold text-center mb-10">Happy Buyers ❤️</h2>

        <div className="grid md:grid-cols-3 gap-8">

          {[1,2,3].map(i=>(
            <div key={i} className="bg-white p-6 rounded-2xl shadow">
              <p>
                Amazing experience! Found my dream home easily.
              </p>
              <h4 className="font-bold mt-4">Customer {i}</h4>
            </div>
          ))}

        </div>
      </div>

      {/* FOOTER */}
      <div className="bg-black text-white py-10 text-center">
        <h3 className="text-2xl font-bold mb-3">AaplaGhar</h3>
        <p>© 2026 All Rights Reserved</p>
      </div>

    </div>
  )
}

export default HomePage
```
