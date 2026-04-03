import { useState, useEffect } from "react";

import { useForm } from "react-hook-form";

import axios from "axios";

import {

  CheckCircle, Home, Building2, Map, Upload, ArrowRight,

  ArrowLeft, ClipboardList, MapPin, X, Trash2, PlusCircle

} from "lucide-react";

import { Navigate } from "react-router-dom";



// --- INDIAN PRICE FORMATTER ---

const formatIndianPrice = (num) => {

  if (!num || isNaN(num)) return "";

  const val = parseFloat(num);

  if (val >= 10000000) return (val / 10000000).toFixed(2) + " Cr";

  if (val >= 100000) return (val / 100000).toFixed(2) + " Lakh";

  return val.toLocaleString('en-IN');

};



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

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const currentPropertyType = watch("propertyType");



  // Multi-Selection States

  const [resSubTypes, setResSubTypes] = useState([]);

  const [commSubTypes, setCommSubTypes] = useState([]);

  const [plotSubTypes, setPlotSubTypes] = useState([]);



  // Data Structure for Variants

  // Residential: { "Apartment": { "2BHK": [{area:'', plan:null}] } }

  // Commercial/Plot: { "Shop": [{area:'', plan:null}] }

  const [config, setConfig] = useState({});



  const [amenitiesList, setAmenitiesList] = useState([]);

  const [specsList, setSpecsList] = useState([]);

  const [localitiesList, setLocalitiesList] = useState([]);



  useEffect(() => { setValue("amenities", amenitiesList); }, [amenitiesList, setValue]);

  useEffect(() => { setValue("specification", specsList); }, [specsList, setValue]);

  useEffect(() => { setValue("localities", localitiesList); }, [localitiesList, setValue]);



  const next = () => setStep(step + 1);

  const back = () => setStep(step - 1);



  const toggleMainType = (type, list, setList) => {

  if (list.includes(type)) {

    // ... (remove logic)

  } else {

    setList([...list, type]);

    // Residential sathi object ({}), Commercial/Plot sathi array ([])

    const initialVal = currentPropertyType === 'residential' ? {} : [{ area: "", plan: null }];

    setConfig({ ...config, [type]: initialVal });

  }

};



  // Toggle BHK Function madhye check kar

const toggleBHK = (subType, bhk) => {

  const subTypeConfig = config[subType] || {};

  if (subTypeConfig[bhk]) {

    const newSubConfig = { ...subTypeConfig };

    delete newSubConfig[bhk];

    setConfig({ ...config, [subType]: newSubConfig });

  } else {

    // ITHE ARRAY ([]) ASNA GARJECHA AAHE

    setConfig({ ...config, [subType]: { ...subTypeConfig, [bhk]: [{ area: "", plan: null }] } });

  }

};



  // Add More Variants (BHKs or Shop Areas)

  const addVariant = (subType, bhk = null) => {

    const newConfig = { ...config };

    if (bhk) {

      newConfig[subType][bhk] = [...newConfig[subType][bhk], { area: "", plan: null }];

    } else {

      newConfig[subType] = [...newConfig[subType], { area: "", plan: null, length: "", width: "" }];

    }

    setConfig(newConfig);

  };



  // Remove Variant

  const removeVariant = (subType, index, bhk = null) => {

    const newConfig = { ...config };

    if (bhk) {

      newConfig[subType][bhk] = newConfig[subType][bhk].filter((_, i) => i !== index);

    } else {

      newConfig[subType] = newConfig[subType].filter((_, i) => i !== index);

    }

    setConfig(newConfig);

  };



  const updateVal = (subType, index, field, value, bhk = null) => {

    const newConfig = { ...config };

    if (bhk) {

      newConfig[subType][bhk][index][field] = value;

    } else {

      newConfig[subType][index][field] = value;

    }

    setConfig(newConfig);

  };



  const onSubmit = async (data) => {

  try {

    const formData = new FormData();

   

    // 1. Basic Fields

    ["title", "city", "area", "propertyType", "description", "startPrice", "endPrice", "status"].forEach(k => {

      if(data[k]) formData.append(k, data[k]);

    });



    formData.append("amenities", JSON.stringify(amenitiesList));

    formData.append("specification", JSON.stringify(specsList));

    formData.append("localities", JSON.stringify(localitiesList));



    formData.append("resSubTypes", JSON.stringify(resSubTypes));

    formData.append("commSubTypes", JSON.stringify(commSubTypes));

    formData.append("plotSubTypes", JSON.stringify(plotSubTypes));

   

    // 2. Config Data (Safety Parse)

    formData.append("configData", JSON.stringify(config));

   

    // 3. Dynamic Plan Images Loop with Safety Checks

    Object.keys(config).forEach(subType => {

      if (currentPropertyType === 'residential') {

        // config[subType] ha BHK types cha object aahe (e.g. { "2BHK": [...] })

        const bhks = config[subType] || {};

       

        Object.keys(bhks).forEach(bhk => {

          // Check kara ki bhks[bhk] ha kharch Array aahe ka

          if (Array.isArray(bhks[bhk])) {

            bhks[bhk].forEach((v, i) => {

              if (v.plan) {

                // Key: plan_Apartment_2BHK_0

                formData.append(`plan_${subType}_${bhk}_${i}`, v.plan);

              }

            });

          }

        });

      } else {

        // Commercial & Plot sathi (Direct array)

        if (Array.isArray(config[subType])) {

          config[subType].forEach((v, i) => {

            if (v.plan) {

              // Key: plan_Shop_0

              formData.append(`plan_${subType}_${i}`, v.plan);

            }

          });

        }

      }

    });



    // 4. Media Files

    if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);

    if (data.societyPlan?.[0]) formData.append("societyPlan", data.societyPlan[0]);

    if (data.gallery) {

      Array.from(data.gallery).forEach(f => formData.append("gallery", f));

    }



    const token = localStorage.getItem("adminToken");

    const res = await axios.post("http://localhost:5000/api/property/addProperty", formData, {

      headers: {

        "Content-Type": "multipart/form-data",

        "Authorization": `Bearer ${token}`

      },

    });



    if(res.data.success) {

      alert("Property Added Successfully!");

      Navigate("/my-properties"); // Redirect to dashboard after successful submission

      // window.location.reload(); // Optional

    }



  } catch (error) {

    console.error("FULL ERROR:", error);

    // Error chi details baghayla alert madhye message dakhva

    alert("Submission Failed: " + (error.response?.data?.message || error.message));

  }

};



  return (

    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">

      <div className="max-w-3xl mx-auto">

        <div className="mb-12"><Progress step={step} /></div>



        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">

          <div className="bg-slate-900 px-8 py-6 text-white text-center md:text-left">

            <h1 className="text-2xl font-bold tracking-tight">Post Your Property</h1>

            <p className="text-slate-400 text-sm mt-1">Fill details to list your property.</p>

          </div>



          <div className="p-8">

            {/* STEP 1 */}

            {step === 1 && (

              <form onSubmit={handleSubmit(next)} className="space-y-6">

                <SectionTitle title="Basic & Location Info" icon={<Home className="w-5 h-5" />} />

                <Input label="Property Title" placeholder="e.g. Dream Valley Apartments" register={register("title", { required: true })} />

                <div className="grid grid-cols-2 gap-4">

                  <Input label="City" placeholder="Pune" register={register("city")} />

                  <Input label="Area" placeholder="Kothrud" register={register("area")} />

                </div>

                <MultiInput label="Near Localities" placeholder="e.g. Metro Station, Hospital" value={localitiesList} onChange={setLocalitiesList} />

                <div className="grid grid-cols-2 gap-4 items-end">

                  <div>

                    <Input label="Starting Price (₹)" placeholder="5000000" type="number" register={register("startPrice")} />

                    <p className="text-blue-600 font-bold text-[11px] mt-1 ml-1">{formatIndianPrice(watch("startPrice"))}</p>

                  </div>

                  <div>

                    <Input label="Upto Price (₹)" placeholder="9000000" type="number" register={register("endPrice")} />

                    <p className="text-blue-600 font-bold text-[11px] mt-1 ml-1">{formatIndianPrice(watch("endPrice"))}</p>

                  </div>

                </div>

                <div className="space-y-3">

                  <label className="text-sm font-semibold text-slate-700">Property Type</label>

                  <div className="grid grid-cols-3 gap-3">

                    {["residential", "commercial", "plot"].map((type) => (

                      <label key={type} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all ${watch("propertyType") === type ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100"}`}>

                        <input type="radio" value={type} {...register("propertyType")} className="hidden" />

                        <span className="capitalize font-medium">{type}</span>

                      </label>

                    ))}

                  </div>

                </div>

                <button className="btn-primary w-full flex justify-center items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>

              </form>

            )}



            {/* STEP 2 */}

            {step === 2 && (

              <form onSubmit={handleSubmit(next)} className="space-y-6">

                <SectionTitle title="Property Specifications" icon={<ClipboardList className="w-5 h-5" />} />

                <div className="grid grid-cols-2 gap-4">

                  <Select label="Status" options={["Ready", "Under Construction"]} register={register("status")} />

                  <MultiInput label="Amenities" placeholder="Gym, Pool, Lift" value={amenitiesList} onChange={setAmenitiesList} />

                </div>

                <div className="space-y-1.5">

                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>

                  <textarea {...register("description")} placeholder="Describe your property highlights..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none h-24" />

                </div>

                <MultiInput label="Technical Specs" placeholder="Vitrified Tiles, Teak Wood Doors" value={specsList} onChange={setSpecsList} />



                {/* --- RESIDENTIAL HIERARCHY --- */}

                {currentPropertyType === "residential" && (

                  <div className="space-y-6 pt-4 border-t border-slate-100">

                    <label className="text-sm font-bold text-slate-700">Select Property Categories</label>

                    <div className="flex flex-wrap gap-2">

                      {["Apartment", "Villa", "Bungalow", "Duplex", "Rowhouse"].map(t => (

                        <button type="button" key={t} onClick={() => toggleMainType(t, resSubTypes, setResSubTypes)}

                        className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${resSubTypes.includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>

                      ))}

                    </div>



                    {resSubTypes.map(subType => (

                      <div key={subType} className="p-5 bg-slate-50 rounded-2xl border-2 border-blue-100 space-y-4 animate-in fade-in">

                        <div className="flex justify-between items-center"><h3 className="font-extrabold text-blue-700 uppercase tracking-tight">{subType} Configuration</h3></div>

                       

                        <div className="space-y-2">

                          <label className="text-xs font-bold text-slate-500">Select BHK Types for {subType}</label>

                          <div className="flex flex-wrap gap-2">

                            {["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].map(b => (

                              <button type="button" key={b} onClick={() => toggleBHK(subType, b)}

                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${config[subType]?.[b] ? "bg-slate-800 text-white" : "bg-white text-slate-600"}`}>{b}</button>

                            ))}

                          </div>

                        </div>



                        {Object.keys(config[subType] || {}).map(bhk => (

                          <div key={bhk} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">

                            <h4 className="text-sm font-bold text-slate-800 border-b pb-1">{bhk} Variants</h4>

                            {config[subType][bhk].map((v, i) => (

                              <div key={i} className="flex flex-col gap-2 bg-slate-100/50 p-3 rounded-xl border border-dashed border-slate-300">

                                <div className="flex gap-3 items-end">

                                  {/* AREA INPUT */}

                                  <div className="flex-1">

                                    <label className="text-[9px] font-black text-slate-400 uppercase">Area (sqft)</label>

                                    <input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value, bhk)} className="w-full border-b-2 p-1 text-sm outline-none focus:border-blue-400 bg-transparent" />

                                  </div>



                                  {/* INDIVIDUAL PRICE INPUT */}

                                  <div className="flex-1">

                                    <label className="text-[9px] font-black text-slate-400 uppercase">Fix Price (₹)</label>

                                    <input type="number" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value, bhk)} className="w-full border-b-2 p-1 text-sm outline-none focus:border-emerald-400 bg-transparent" />

                                    <p className="text-[9px] font-bold text-emerald-600 mt-1">{formatIndianPrice(v.price)}</p>

                                  </div>



                                  {/* PLAN FILE */}

                                  <div className="flex-1">

                                    <label className="text-[9px] font-black text-slate-400 uppercase">Plan Image</label>

                                    <input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0], bhk)} className="text-[9px] w-full" />

                                  </div>



                                  {i > 0 && <button type="button" onClick={() => removeVariant(subType, i, bhk)} className="p-1.5 text-red-400"><Trash2 className="w-4 h-4"/></button>}

                                </div>

                              </div>

                            ))}

                            <button type="button" onClick={() => addVariant(subType, bhk)} className="text-[11px] text-blue-600 font-bold hover:underline">+ Add More {bhk} Sizes</button>

                          </div>

                        ))}

                      </div>

                    ))}

                  </div>

                )}



                {/* --- COMMERCIAL & PLOT HIERARCHY --- */}

                {(currentPropertyType === "commercial" || currentPropertyType === "plot") && (

                  <div className="space-y-6 pt-4 border-t border-slate-100">

                    <label className="text-sm font-bold text-slate-700">Select Categories</label>

                    <div className="flex flex-wrap gap-2">

                      {(currentPropertyType === 'commercial' ? ["Shop", "Office", "Showroom", "Warehouse"] : ["Residential Plot", "Commercial Plot"]).map(t => (

                        <button type="button" key={t} onClick={() => toggleMainType(t, currentPropertyType === 'commercial' ? commSubTypes : plotSubTypes, currentPropertyType === 'commercial' ? setCommSubTypes : setPlotSubTypes)}

                        className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${(currentPropertyType === 'commercial' ? commSubTypes : plotSubTypes).includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>

                      ))}

                    </div>



                    {(currentPropertyType === 'commercial' ? commSubTypes : plotSubTypes).map(subType => (

                      <div key={subType} className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">

                        <h3 className="font-extrabold text-slate-700 uppercase tracking-tight">{subType} Details</h3>

                        {(config[subType] || []).map((v, i) => (

                          <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 relative">

                            {i > 0 && <button type="button" onClick={() => removeVariant(subType, i)} className="absolute top-2 right-2 text-red-400"><X className="w-4 h-4"/></button>}

                           

                            {/* Grid layout madhye Price add kela aahe */}

                            <div className="grid grid-cols-2 gap-4">

                             

                              {/* 1. AREA */}

                              <div className="flex-1">

                                <label className="text-[10px] font-bold text-slate-400 uppercase">Area (sq.ft)</label>

                                <input type="number" placeholder="500" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value)} className="w-full border-b p-1 text-sm outline-none" />

                              </div>



                              {/* 2. PRICE (Navin Add kela) */}

                              <div className="flex-1">

                                <label className="text-[10px] font-bold text-slate-400 uppercase">Fix Price (₹)</label>

                                <input type="number" placeholder="5000000" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value)} className="w-full border-b p-1 text-sm outline-none text-emerald-600 font-semibold" />

                                <p className="text-[9px] font-bold text-emerald-600 mt-1">{formatIndianPrice(v.price)}</p>

                              </div>



                              {/* 3. PLOT SPECIFIC (Length/Width) */}

                              {currentPropertyType === 'plot' && (

                                <>

                                  <div className="flex-1">

                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Length (ft)</label>

                                    <input type="number" placeholder="50" value={v.length} onChange={e => updateVal(subType, i, 'length', e.target.value)} className="w-full border-b p-1 text-sm outline-none" />

                                  </div>

                                  <div className="flex-1">

                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Width (ft)</label>

                                    <input type="number" placeholder="30" value={v.width} onChange={e => updateVal(subType, i, 'width', e.target.value)} className="w-full border-b p-1 text-sm outline-none" />

                                  </div>

                                </>

                              )}



                              {/* 4. PLAN IMAGE */}

                              <div className="flex-1">

                                <label className="text-[10px] font-bold text-slate-400 uppercase">Plan Image</label>

                                <input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0])} className="text-[10px] w-full" />

                              </div>



                            </div>

                          </div>

                        ))}

                        <button type="button" onClick={() => addVariant(subType)} className="text-xs text-blue-600 font-bold">+ Add Another {subType} Variant</button>

                      </div>

                    ))}

                  </div>

                )}



                <div className="flex gap-4 pt-4">

                  <button type="button" onClick={back} className="btn-secondary flex-1 flex justify-center items-center gap-2"><ArrowLeft className="w-4 h-4" /> Back</button>

                  <button className="btn-primary flex-[2] flex justify-center items-center gap-2">Continue <ArrowRight className="w-4 h-4" /></button>

                </div>

              </form>

            )}



            {/* STEP 3 */}

            {step === 3 && (

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                <SectionTitle title="Media & Documents" icon={<Upload className="w-5 h-5" />} />

                <div className="grid grid-cols-1 gap-6">

                  <div className="space-y-2">

                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cover Image</label>

                    <input type="file" {...register("coverImage")} className="file-input w-full" />

                  </div>

                  <div className="space-y-2">

                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Property Gallery</label>

                    <input type="file" multiple {...register("gallery")} className="file-input w-full" />

                  </div>

                  <div className="space-y-2 pt-4 border-t">

                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 italic">Society Plan / Layout Copy</label>

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



// --- HELPERS (STYLING KEPT ORIGINAL) ---

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

      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>

      <input type={type} placeholder={placeholder} {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" />

    </div>

  );

}



function Select({ label, options, register }) {

  return (

    <div className="space-y-1.5 flex-1">

      <label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label>

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