import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { CheckCircle, Home, Building2, Map, Upload, ArrowRight, ArrowLeft, ClipboardList, MapPin } from "lucide-react";

export default function PropertyForm() {
  const [step, setStep] = useState(1);
  const [selectedBHK, setSelectedBHK] = useState([]);

  const { register, handleSubmit, watch, getValues, formState: { errors } } = useForm();
  const currentPropertyType = watch("propertyType");

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const toggleBHK = (bhk) => {
    setSelectedBHK(prev => prev.includes(bhk) ? prev.filter(b => b !== bhk) : [...prev, bhk]);
  };

  const onSubmit = async () => {
     // ... (Tuza backend submission logic same rahil)
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        
        <div className="mb-12">
          <Progress step={step} />
        </div>

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

                  {/* Near Localities Field */}
                  <Input label="Near Localities" placeholder="e.g. Near Metro Station, Highstreet" register={register("localities")} />

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

            {/* ---------------- STEP 2: Specific Details & Amenities ---------------- */}
            {step === 2 && (
              <form onSubmit={handleSubmit(next)} className="space-y-6 animate-in slide-in-from-right-5 duration-500">
                <SectionTitle title="Property Specifications" icon={<ClipboardList className="w-5 h-5" />} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select label="Status" options={["Ready", "Under Construction"]} register={register("status")} />
                    <Input label="Amenities (comma separated)" placeholder="Gym, Pool, Parking" register={register("amenities")} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Property Description</label>
                    <textarea {...register("description")} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none h-24" placeholder="Tell us about the property..."></textarea>
                </div>

                {/* Specification Field - ✅ NAVIN ADDED */}
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Technical Specifications</label>
                    <textarea 
                      {...register("specification")} 
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none h-24 transition-all" 
                      placeholder="e.g. Vitrified flooring, Teak wood doors, Concealed copper wiring..."
                    ></textarea>
                </div>

                {/* Conditional Sections */}
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

                {currentPropertyType === "commercial" && (
                   <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in">
                      <Select label="Commercial Type" options={["Office", "Shop", "Showroom", "Warehouse"]} register={register("resType")} />
                      <Input label="Commercial Area (sq.ft)" register={register("commercialArea")} />
                      <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 rounded-lg w-fit">
                        <input type="checkbox" {...register("parking")} className="w-4 h-4 text-blue-600 rounded" />
                        <span className="text-sm font-medium text-slate-700">Parking Available</span>
                      </label>
                   </div>
                )}

                {currentPropertyType === "plot" && (
                   <div className="space-y-4 pt-4 border-t border-slate-100 animate-in fade-in">
                      <Select label="Plot Type" options={["Residential_Plot", "Commercial_Plot"]} register={register("plotType")} />
                      <Input label="Plot Area (sq.ft)" register={register("plotArea")} />
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
                  {/* Cover Image */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cover Image</label>
                    <input type="file" {...register("coverImage")} className="file-input w-full" />
                  </div>

                  {/* Gallery */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Property Gallery (Max 8)</label>
                    <input type="file" multiple {...register("gallery")} className="file-input w-full" />
                  </div>

                  {/* Society Plan - NAVIN ADDED */}
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

// ---------------- STYLED COMPONENTS (Same) ----------------
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