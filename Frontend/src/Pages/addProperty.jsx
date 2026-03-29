import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { 
  CheckCircle, Home, Building2, Map, Upload, ArrowRight, 
  ArrowLeft, ClipboardList, MapPin, X 
} from "lucide-react";

// --- NAVIN ADDED: MULTI-CHIP INPUT COMPONENT ---
const MultiInput = ({ label, placeholder, value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const trimmed = inputValue.trim().replace(/,/g, "");
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
        {label} <span className="text-[10px] text-blue-500 normal-case">(Type & press Comma)</span>
      </label>
      <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 transition-all min-h-[50px]">
        {value.map((tag, index) => (
          <span key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={value.length === 0 ? placeholder : "Add more..."}
          className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 min-w-[100px]"
        />
      </div>
    </div>
  );
};

export default function PropertyForm() {
  const [step, setStep] = useState(1);
  const [selectedBHK, setSelectedBHK] = useState([]);

  // States for Multi-Inputs
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [specsList, setSpecsList] = useState([]);
  const [localitiesList, setLocalitiesList] = useState([]);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const currentPropertyType = watch("propertyType");

  // Syncing Multi-Input States with useForm
  useEffect(() => { setValue("amenities", amenitiesList); }, [amenitiesList, setValue]);
  useEffect(() => { setValue("specification", specsList); }, [specsList, setValue]);
  useEffect(() => { setValue("localities", localitiesList); }, [localitiesList, setValue]);

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const toggleBHK = (bhk) => {
    setSelectedBHK(prev => prev.includes(bhk) ? prev.filter(b => b !== bhk) : [...prev, bhk]);
  };

 const onSubmit = async (data) => {
  try {
    const formData = new FormData();

    // 1. Text Fields (Must be FIRST)
    formData.append("title", data.title);
    formData.append("city", data.city);
    formData.append("area", data.area);
    formData.append("propertyType", data.propertyType);
    formData.append("description", data.description);
    formData.append("startPrice", data.startPrice);
    formData.append("endPrice", data.endPrice);
    formData.append("status", data.status);
    formData.append("resType", data.resType);

    // 2. Arrays (Stringify karun)
    formData.append("amenities", JSON.stringify(amenitiesList));
    formData.append("specification", JSON.stringify(specsList));
    formData.append("localities", JSON.stringify(localitiesList));

    // 3. Files (Must be LAST)
    if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);
    if (data.societyPlan?.[0]) formData.append("societyPlan", data.societyPlan[0]);
    
    if (data.gallery) {
      Array.from(data.gallery).forEach((file) => {
        formData.append("gallery", file);
      });
    }

    // BHK Plans
    selectedBHK.forEach((bhk) => {
      if (data[`${bhk}_area`]) formData.append(`${bhk}_area`, data[`${bhk}_area`]);
      if (data[`${bhk}_plan`]?.[0]) {
        formData.append(`${bhk}_plan`, data[`${bhk}_plan`][0]);
      }
    });

    const token = localStorage.getItem("adminToken");
    const response = await axios.post("http://localhost:5000/api/property/addProperty", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "Authorization": `Bearer ${token}` 
      },
    });

    alert("Property Added!");
  } catch (error) {
    console.error("FRONTEND ERROR:", error.response?.data || error);
    alert("Check terminal for error details");
  }
};

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12"><Progress step={step} /></div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Post Your Property</h1>
            <p className="text-slate-400 text-sm mt-1">Provide detailed information to get better leads.</p>
          </div>

          <div className="p-8">
            {/* ---------------- STEP 1: Basic & Location ---------------- */}
            {step === 1 && (
              <form onSubmit={handleSubmit(next)} className="space-y-6 animate-in fade-in duration-500">
                <SectionTitle title="Basic & Location Info" icon={<Home className="w-5 h-5" />} />
                <div className="space-y-4">
                  <Input label="Property Title" placeholder="e.g. Luxury 2BHK Apartment" register={register("title", { required: true })} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="City" placeholder="Pune" register={register("city")} />
                    <Input label="Area" placeholder="Baner" register={register("area")} />
                  </div>

                  {/* Near Localities - Updated to MultiInput */}
                  <MultiInput 
                    label="Near Localities" 
                    placeholder="e.g. Metro Station, Highstreet" 
                    value={localitiesList} 
                    onChange={setLocalitiesList} 
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Starting Price (₹)" type="number" register={register("startPrice")} />
                    <Input label="Upto Price (₹)" type="number" register={register("endPrice")} />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">Property Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {["residential", "commercial", "plot"].map((type) => (
                        <label key={type} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center gap-2 transition-all ${watch("propertyType") === type ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 hover:border-slate-200"}`}>
                          <input type="radio" value={type} {...register("propertyType")} className="hidden" />
                          <span className="capitalize font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="btn-primary w-full flex justify-center items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>
              </form>
            )}

            {/* ---------------- STEP 2: Details & Amenities ---------------- */}
            {step === 2 && (
              <form onSubmit={handleSubmit(next)} className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                <SectionTitle title="Property Specifications" icon={<ClipboardList className="w-5 h-5" />} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Status" options={["Ready", "Under Construction"]} register={register("status")} />
                    {/* Amenities - Updated to MultiInput */}
                    <MultiInput 
                      label="Amenities" 
                      placeholder="e.g. Gym, Pool, Parking" 
                      value={amenitiesList} 
                      onChange={setAmenitiesList} 
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Description</label>
                    <textarea {...register("description")} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none h-24" placeholder="Tell us about the property..."></textarea>
                </div>

                {/* Technical Specifications - Updated to MultiInput */}
                <div className="space-y-1.5">
                    <MultiInput 
                      label="Technical Specifications" 
                      placeholder="e.g. Vitrified flooring, Teak wood doors" 
                      value={specsList} 
                      onChange={setSpecsList} 
                    />
                </div>

                {currentPropertyType === "residential" && (
                  <div className="space-y-6 pt-4 border-t border-slate-100">
                    <Select label="Residential Sub Type" options={["Apartment", "Villa", "Bungalow", "Penthouse", "Duplex", "Rowhouse"]} register={register("resType")} />
                    <div className="space-y-3">
                      <label className="text-sm font-semibold text-slate-700">Select BHK Types</label>
                      <div className="flex flex-wrap gap-2">
                        {["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].map((bhk) => (
                          <button key={bhk} type="button" onClick={() => toggleBHK(bhk)} 
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedBHK.includes(bhk) ? "bg-slate-900 border-slate-900 text-white" : "border-slate-100 text-slate-600"}`}>
                            {bhk}
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedBHK.map((bhk) => (
                      <div key={bhk} className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 items-end animate-in fade-in duration-300">
                        <Input label={`${bhk} Area (sq.ft)`} register={register(`${bhk}_area`)} />
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{bhk} Floor Plan</label>
                          <input type="file" {...register(`${bhk}_plan`)} className="file-input" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Commercial & Plot logic (Same as before) */}
                {currentPropertyType === "commercial" && (
                   <div className="space-y-4 pt-4 border-t border-slate-100">
                      <Select label="Commercial Type" options={["Office", "Shop", "Showroom", "Warehouse"]} register={register("resType")} />
                      <Input label="Commercial Area (sq.ft)" register={register("commercialArea")} />
                   </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={back} className="btn-secondary flex-1 flex justify-center items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button className="btn-primary flex-[2] flex justify-center items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>
                </div>
              </form>
            )}

            {/* ---------------- STEP 3: Media Upload ---------------- */}
            {step === 3 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                <SectionTitle title="Media & Documents" icon={<Upload className="w-5 h-5" />} />
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cover Image</label>
                    <input type="file" {...register("coverImage")} className="file-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Property Gallery (Max 8)</label>
                    <input type="file" multiple {...register("gallery")} className="file-input w-full" />
                  </div>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide italic">Society Plan / Layout Copy</label>
                    <input type="file" {...register("societyPlan")} className="file-input w-full" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={back} className="btn-secondary flex-1 flex justify-center items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>
                  <button className="btn-success flex-[2] flex justify-center items-center gap-2">Submit Property <CheckCircle className="w-4 h-4" /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- HELPER COMPONENTS (Same as before) ---
function SectionTitle({ title, icon }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b border-slate-100 mb-6">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{icon}</div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
  );
}

function Input({ label, register, type = "text", placeholder }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <input type={type} placeholder={placeholder} {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" />
    </div>
  );
}

function Select({ label, options, register }) {
  return (
    <div className="space-y-1.5 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <select {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white">
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}
      </select>
    </div>
  );
}

function Progress({ step }) {
  const steps = ["Basics", "Specs", "Uploads"];
  return (
    <div className="flex items-center justify-between relative max-w-sm mx-auto">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
      {steps.map((label, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 border-2 border-slate-200"}`}>
            {step > i + 1 ? <CheckCircle className="w-6 h-6" /> : i + 1}
          </div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i + 1 ? "text-blue-700" : "text-slate-400"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}