import { useState } from "react";
import axios from "axios";
const token = localStorage.getItem("adminToken");

const AddProperty = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    location: "",
    price: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    amenities: "",
  });

  const [images, setImages] = useState({
    hall: null,
    kitchen: null,
    bed1: null,
    bed2: null,
    outer: null,
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setImages({
      ...images,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    Object.keys(form).forEach((key) => {
      data.append(key, form[key]);
    });

    Object.keys(images).forEach((key) => {
      if (images[key]) {
        data.append(key, images[key]);
      }
    });

    try {
      await axios.post(
        "http://localhost:5000/api/admin/add-property",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
             "Content-Type": "multipart/form-data"
          },
        }
      );

      alert("✅ Property Added");
    } catch (err) {
      console.error("Error adding property:", err);
      alert(`❌ Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-6">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Add Property
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input name="title" placeholder="Title" onChange={handleChange} className="border p-3 rounded" />
          <input name="city" placeholder="City" onChange={handleChange} className="border p-3 rounded" />
          <input name="location" placeholder="Location" onChange={handleChange} className="border p-3 rounded" />
          <input name="price" placeholder="Price" onChange={handleChange} className="border p-3 rounded" />
          <input name="area" placeholder="Area" onChange={handleChange} className="border p-3 rounded" />
          <input name="bedrooms" placeholder="Bedrooms" onChange={handleChange} className="border p-3 rounded" />
          <input name="bathrooms" placeholder="Bathrooms" onChange={handleChange} className="border p-3 rounded" />
          <input name="amenities" placeholder="Amenities" onChange={handleChange} className="border p-3 rounded md:col-span-2" />

          <textarea name="description" placeholder="Description" onChange={handleChange}
            className="border p-3 rounded md:col-span-2"></textarea>

          {/* Image Inputs */}
          <input type="file" name="hall" onChange={handleImage} className="border p-3 rounded" />
          <input type="file" name="kitchen" onChange={handleImage} className="border p-3 rounded" />
          <input type="file" name="bed1" onChange={handleImage} className="border p-3 rounded" />
          <input type="file" name="bed2" onChange={handleImage} className="border p-3 rounded" />
          <input type="file" name="outer" onChange={handleImage} className="border p-3 rounded md:col-span-2" />

          <button className="bg-blue-500 text-white p-3 rounded md:col-span-2">
            Add Property
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;