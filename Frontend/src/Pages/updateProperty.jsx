import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { 
  CheckCircle, Home, Building2, Map, Upload, ArrowRight, 
  ArrowLeft, ClipboardList, MapPin, X, Trash2, PlusCircle, Loader2, ImageIcon, FileText 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// --- MultiInput Component ---
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

export default function UpdateProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm();
  const currentPropertyType = watch("propertyType");

  const [resSubTypes, setResSubTypes] = useState([]); 
  const [commSubTypes, setCommSubTypes] = useState([]);
  const [plotSubTypes, setPlotSubTypes] = useState([]);
  const [config, setConfig] = useState({});

  const [highlightsList, setHighlightsList] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [specsList, setSpecsList] = useState([]);
  const [localitiesList, setLocalitiesList] = useState([]);

  const [existingMedia, setExistingMedia] = useState({
    coverImage: "",
    societyPlan: "",
    gallery: []
  });

  const getOriginalName = (path) => {
    if (!path || typeof path !== 'string') return "";
    const fullFileName = path.split('/').pop(); 
    const parts = fullFileName.split('-'); 
    return parts.length > 2 ? parts.slice(2).join('-') : fullFileName;
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/property/getProperty/${id}`);
        const p = res.data.data;

        setValue("title", p.title);
        setValue("city", p.location?.city);
        setValue("area", p.location?.area);
        setValue("propertyType", p.propertyType);
        setValue("description", p.description);
        setValue("startPrice", p.price?.starting);
        setValue("endPrice", p.price?.upto);

        const dbStatus = p.residentialDetails?.status || p.commercialDetails?.status || p.plotDetails?.status || "";
        setValue("status", dbStatus);

        setHighlightsList(p.highlights || []);
        setAmenitiesList(p.amenities || []);
        setSpecsList(p.specification || []);
        setLocalitiesList(p.nearbyLocalities || []); 
        
        if (p.propertyType === 'residential') {
          setResSubTypes(p.residentialDetails?.propertySubTypes || []);
          const resConfig = p.residentialDetails?.config || {};
          const normalized = {};
          Object.keys(resConfig).forEach(sub => {
            normalized[sub] = {};
            Object.keys(resConfig[sub]).forEach(bhk => {
              normalized[sub][bhk] = resConfig[sub][bhk].map(v => ({
                ...v, plan: v.planImage || v.plan 
              }));
            });
          });
          setConfig(normalized);
        } else if (p.propertyType === 'commercial') {
          setCommSubTypes(p.commercialDetails?.propertySubTypes || []);
          const commConfig = p.commercialDetails?.config || {};
          const normalized = {};
          Object.keys(commConfig).forEach(sub => {
            normalized[sub] = commConfig[sub].map(v => ({
              ...v, plan: v.planImage || v.plan
            }));
          });
          setConfig(normalized);
        } else if (p.propertyType === 'plot') {
          setPlotSubTypes(p.plotDetails?.plotTypes || []);
          const plotConfig = p.plotDetails?.config || {};
          const normalized = {};
          Object.keys(plotConfig).forEach(sub => {
            normalized[sub] = plotConfig[sub].map(v => ({
              ...v, plan: v.planImage || v.plan
            }));
          });
          setConfig(normalized);
        }

        setExistingMedia({
          coverImage: p.images?.coverImage || "",
          societyPlan: p.images?.societyPlan || "",
          gallery: p.images?.gallery || []
        });

        setInitialLoading(false);
      } catch (err) {
        console.error(err);
        navigate("/my-properties");
      }
    };
    fetchProperty();
  }, [id, setValue, navigate]);

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const updateVal = (subType, index, field, value, bhk = null) => {
    const newConfig = { ...config };
    if (bhk) newConfig[subType][bhk][index][field] = value;
    else newConfig[subType][index][field] = value;
    setConfig(newConfig);
  };

  const toggleMainType = (type, list, setList) => {
    if (list.includes(type)) {
      setList(list.filter(item => item !== type));
      const newConfig = { ...config };
      delete newConfig[type];
      setConfig(newConfig);
    } else {
      setList([...list, type]);
      const initialVal = currentPropertyType === 'residential' ? {} : [{ area: "", plan: null, price: "" }];
      setConfig({ ...config, [type]: initialVal });
    }
  };

  const toggleBHK = (subType, bhk) => {
    const subTypeConfig = config[subType] || {};
    if (subTypeConfig[bhk]) {
      const newSubConfig = { ...subTypeConfig };
      delete newSubConfig[bhk];
      setConfig({ ...config, [subType]: newSubConfig });
    } else {
      setConfig({ ...config, [subType]: { ...subTypeConfig, [bhk]: [{ area: "", plan: null, price: "" }] } });
    }
  };

  const addVariant = (subType, bhk = null) => {
    const newConfig = { ...config };
    if (bhk) newConfig[subType][bhk] = [...newConfig[subType][bhk], { area: "", plan: null, price: "" }];
    else newConfig[subType] = [...newConfig[subType], { area: "", plan: null, price: "" }];
    setConfig(newConfig);
  };

  const removeVariant = (subType, index, bhk = null) => {
    const newConfig = { ...config };
    if (bhk) newConfig[subType][bhk] = newConfig[subType][bhk].filter((_, i) => i !== index);
    else newConfig[subType] = newConfig[subType].filter((_, i) => i !== index);
    setConfig(newConfig);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      
      // Basic Fields - Array error fix
      const textFields = ["title", "city", "area", "propertyType", "description", "startPrice", "endPrice", "status"];
      textFields.forEach(k => {
        // Ensuring only single string values are appended, not arrays from watch/getValues
        const val = data[k];
        if (val !== undefined && val !== null) {
          formData.append(k, Array.isArray(val) ? val[0] : val);
        }
      });

      // Stringify lists
      formData.append("highlights", JSON.stringify(highlightsList));
      formData.append("amenities", JSON.stringify(amenitiesList));
      formData.append("specification", JSON.stringify(specsList));
      formData.append("localities", JSON.stringify(localitiesList));
      formData.append("resSubTypes", JSON.stringify(resSubTypes));
      formData.append("commSubTypes", JSON.stringify(commSubTypes));
      formData.append("plotSubTypes", JSON.stringify(plotSubTypes));
      formData.append("configData", JSON.stringify(config));

      // Config Images
      Object.keys(config).forEach(subType => {
        if (currentPropertyType === 'residential') {
          Object.keys(config[subType] || {}).forEach(bhk => {
            config[subType][bhk].forEach((v, i) => {
              if (v.plan instanceof File) formData.append(`plan_${subType}_${bhk}_${i}`, v.plan);
            });
          });
        } else {
          (config[subType] || []).forEach((v, i) => {
            if (v.plan instanceof File) formData.append(`plan_${subType}_${i}`, v.plan);
          });
        }
      });

      // Main Media
      if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);
      if (data.societyPlan?.[0]) formData.append("societyPlan", data.societyPlan[0]);
      if (data.gallery && data.gallery.length > 0) {
        Array.from(data.gallery).forEach(f => formData.append("gallery", f));
      }

      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`http://localhost:5000/api/property/update/${id}`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data", 
          "Authorization": `Bearer ${token}` 
        },
      });

      if (res.data.success) {
        alert("Property Updated Successfully!");
        navigate(`/my-properties`);
      }
    } catch (error) {
      console.error("Submit Error:", error.response?.data);
      alert(error.response?.data?.message || "Update Failed!");
    }
  };

  if (initialLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12"><Progress step={step} /></div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-white text-center">
            <h1 className="text-2xl font-bold">Update Property</h1>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <SectionTitle title="Basic & Location Info" icon={<Home className="w-5 h-5" />} />
                <Input label="Property Title" register={register("title", { required: true })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" register={register("city")} />
                  <Input label="Area" register={register("area")} />
                </div>
                <MultiInput label="Near Localities" value={localitiesList} onChange={setLocalitiesList} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Starting Price" register={register("startPrice")} />
                  <Input label="Upto Price" register={register("endPrice")} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Property Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["residential", "commercial", "plot"].map((type) => (
                      <label key={type} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all ${watch("propertyType") === type ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100"}`}>
                        <input type="radio" value={type} {...register("propertyType")} className="hidden" />
                        <span className="capitalize font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={next} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <SectionTitle title="Specifications" icon={<ClipboardList className="w-5 h-5" />} />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Status" options={["Ready", "Under Construction"]} register={register("status")} />
                  <MultiInput label="Amenities" value={amenitiesList} onChange={setAmenitiesList} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea {...register("description")} className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24 focus:border-blue-500 outline-none" />
                </div>
                
                <MultiInput label="Highlights" value={highlightsList} onChange={setHighlightsList} />
                <MultiInput label="Technical Specs" value={specsList} onChange={setSpecsList} />

                {/* Configuration Area */}
                <div className="space-y-6 pt-4 border-t">
                  {currentPropertyType === "residential" && (
                    <>
                      <label className="text-sm font-bold">Residential Sub-Types</label>
                      <div className="flex flex-wrap gap-2">
                        {["Apartment", "Villa", "Bungalow", "Duplex", "Rowhouse"].map(t => (
                          <button type="button" key={t} onClick={() => toggleMainType(t, resSubTypes, setResSubTypes)} 
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${resSubTypes.includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>
                        ))}
                      </div>
                      {resSubTypes.map(subType => (
                        <div key={subType} className="p-5 bg-slate-50 rounded-2xl border-2 border-blue-100 space-y-4">
                          <h3 className="font-extrabold text-blue-700 uppercase">{subType}</h3>
                          <div className="flex flex-wrap gap-2">
                            {["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].map(b => (
                              <button type="button" key={b} onClick={() => toggleBHK(subType, b)}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${config[subType]?.[b] ? "bg-slate-800 text-white" : "bg-white text-slate-600"}`}>{b}</button>
                            ))}
                          </div>
                          {Object.keys(config[subType] || {}).map(bhk => (
                            <div key={bhk} className="bg-white p-4 rounded-xl border space-y-3">
                              <h4 className="text-sm font-bold border-b pb-1">{bhk} Variants</h4>
                              {config[subType][bhk].map((v, i) => (
                                <div key={i} className="flex flex-col gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  <div className="flex gap-3 items-end">
                                    <div className="flex-1"><label className="text-[9px] font-black uppercase">Area</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value, bhk)} className="w-full border-b p-1 text-sm outline-none" /></div>
                                    <div className="flex-1"><label className="text-[9px] font-black uppercase">Price</label><input type="text" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value, bhk)} className="w-full border-b p-1 text-sm outline-none font-bold text-emerald-600" /></div>
                                    {i > 0 && <button type="button" onClick={() => removeVariant(subType, i, bhk)} className="text-red-400 pb-1"><Trash2 className="w-4 h-4"/></button>}
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase block">Plan Image</label>
                                    {v.plan && typeof v.plan === 'string' && (
                                      <span className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(v.plan)}</span>
                                    )}
                                    <input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0], bhk)} className="text-[10px] block w-full" />
                                  </div>
                                </div>
                              ))}
                              <button type="button" onClick={() => addVariant(subType, bhk)} className="text-[11px] text-blue-600 font-bold">+ Add Variant</button>
                            </div>
                          ))}
                        </div>
                      ))}
                    </>
                  )}

                  {(currentPropertyType === "commercial" || currentPropertyType === "plot") && (
                    <>
                      <label className="text-sm font-bold capitalize">{currentPropertyType} Sub-Types</label>
                      <div className="flex flex-wrap gap-2">
                        {(currentPropertyType === "commercial" ? ["Shop", "Office", "Showroom"] : ["Residential Plot", "Commercial Plot", "Industrial Plot"]).map(t => (
                          <button type="button" key={t} onClick={() => toggleMainType(t, currentPropertyType === "commercial" ? commSubTypes : plotSubTypes, currentPropertyType === "commercial" ? setCommSubTypes : setPlotSubTypes)} 
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${(currentPropertyType === "commercial" ? commSubTypes : plotSubTypes).includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>
                        ))}
                      </div>
                      {(currentPropertyType === "commercial" ? commSubTypes : plotSubTypes).map(subType => (
                        <div key={subType} className="p-5 bg-slate-50 rounded-2xl border-2 border-blue-100 space-y-4">
                          <h3 className="font-extrabold text-blue-700 uppercase">{subType}</h3>
                          {config[subType]?.map((v, i) => (
                            <div key={i} className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-slate-200">
                               <div className="flex gap-3 items-end">
                                    <div className="flex-1"><label className="text-[9px] font-black uppercase">Area</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value)} className="w-full border-b p-1 text-sm outline-none" /></div>
                                    <div className="flex-1"><label className="text-[9px] font-black uppercase">Price</label><input type="text" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value)} className="w-full border-b p-1 text-sm outline-none font-bold text-emerald-600" /></div>
                                    {i > 0 && <button type="button" onClick={() => removeVariant(subType, i)} className="text-red-400 pb-1"><Trash2 className="w-4 h-4"/></button>}
                               </div>
                               <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase block">Plan Image</label>
                                    {v.plan && typeof v.plan === 'string' && (
                                      <span className="text-[9px] bg-slate-50 border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(v.plan)}</span>
                                    )}
                                    <input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0])} className="text-[10px] block w-full" />
                               </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => addVariant(subType)} className="text-[11px] text-blue-600 font-bold">+ Add {subType} Variant</button>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={back} className="bg-slate-200 px-6 py-3 rounded-xl font-bold flex-1">Back</button>
                  <button type="button" onClick={next} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex-[2]">Continue</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <SectionTitle title="Media Update" icon={<Upload className="w-5 h-5" />} />
                
                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border">
                  <label className="text-xs font-bold text-slate-500 uppercase">Cover Image</label>
                  {existingMedia.coverImage && (
                    <span className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(existingMedia.coverImage)}</span>
                  )}
                  <input type="file" {...register("coverImage")} className="w-full text-sm mt-2" />
                </div>

                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border">
                  <label className="text-xs font-bold text-slate-500 uppercase">Society Plan</label>
                  {existingMedia.societyPlan && (
                    <span className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(existingMedia.societyPlan)}</span>
                  )}
                  <input type="file" {...register("societyPlan")} className="w-full text-sm mt-2" />
                </div>

                <div className="space-y-2 p-4 bg-slate-50 rounded-xl border">
                  <label className="text-xs font-bold text-slate-500 uppercase block">Gallery</label>
                  {existingMedia.gallery.length > 0 && (
                    <div className="flex flex-wrap gap-2 my-1">
                      {existingMedia.gallery.map((g, i) => (
                        <span key={i} className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate max-w-[150px]">Old: {getOriginalName(g)}</span>
                      ))}
                    </div>
                  )}
                  <input type="file" multiple {...register("gallery")} className="w-full text-sm mt-2" />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={back} className="bg-slate-200 px-6 py-3 rounded-xl font-bold flex-1">Back</button>
                  <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex-[2]">Update Property</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UI HELPERS ---
function SectionTitle({ title, icon }) {
  return (
    <div className="flex items-center gap-3 pb-2 border-b mb-6">
      <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{icon}</div>
      <h2 className="text-xl font-bold text-slate-800">{title}</h2>
    </div>
  );
}
function Input({ label, register, type = "text" }) {
  return (
    <div className="space-y-1 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <input type={type} {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" />
    </div>
  );
}
function Select({ label, options, register }) {
  return (
    <div className="space-y-1 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <select {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white">
        <option value="">Select Status</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}
function Progress({ step }) {
  const steps = ["Basics", "Specs", "Uploads"];
  return (
    <div className="flex items-center justify-between relative max-w-sm mx-auto">
      <div className="absolute top-1/2 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
      {steps.map((label, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= i + 1 ? "bg-blue-600 text-white" : "bg-white text-slate-400 border-2"}`}>
            {step > i + 1 ? <CheckCircle className="w-6 h-6" /> : i + 1}
          </div>
          <span className="text-[10px] font-bold uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}