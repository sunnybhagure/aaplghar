import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { 
  CheckCircle, Home, Building2, Map, Upload, ArrowRight, 
  ArrowLeft, ClipboardList, MapPin, X, Trash2, PlusCircle, Loader2, ImageIcon, FileText 
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// --- PRICE CONVERTER LOGIC ---
const formatPrice = (value) => {
  if (!value || isNaN(value)) return "";
  const num = parseFloat(value);
  if (num >= 10000000) return `(${(num / 10000000).toFixed(2)} Cr)`;
  if (num >= 100000) return `(${(num / 100000).toFixed(2)} Lakh)`;
  return `(${num.toLocaleString("en-IN")})`;
};

// --- CUSTOM LOCALITIES INPUT ---
const LocalitiesInput = ({ label, value = [], onChange }) => {
  const [loc, setLoc] = useState("");
  const [dist, setDist] = useState("");
  const addLocality = () => {
    if (loc.trim()) {
      const combined = dist.trim() ? `${loc.trim()} (${dist.trim()})` : loc.trim();
      if (!value.includes(combined)) {
        onChange([...value, combined]);
        setLoc(""); setDist("");
      }
    }
  };
  return (
    <div className="space-y-2 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex flex-col md:flex-row gap-2">
        <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="Location Name" className="flex-[1.5] px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
        <input type="text" value={dist} onChange={(e) => setDist(e.target.value)} placeholder="Dist/Time (e.g. 5 min)" className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500" />
        <button type="button" onClick={addLocality} className="bg-slate-900 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Add</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, index) => (
          <span key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
            <MapPin className="w-3 h-3" /> {item}
            <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

// --- MultiInput Component ---
const MultiInput = ({ label, placeholder, value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); }
  };
  const addTag = () => {
    const trimmed = inputValue.trim().replace(/,/g, "");
    if (trimmed && !value.includes(trimmed)) { onChange([...value, trimmed]); setInputValue(""); }
  };
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label} <span className="text-[10px] text-blue-500 normal-case">(Type & press Comma)</span></label>
      <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl focus-within:border-blue-500 transition-all min-h-[50px]">
        {value.map((tag, index) => (
          <span key={index} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold border border-blue-100">
            {tag} <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="hover:text-red-500"><X className="w-3 h-3" /></button>
          </span>
        ))}
        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} onBlur={addTag} placeholder={value.length === 0 ? placeholder : "Add more..."} className="flex-1 bg-transparent outline-none text-sm font-semibold text-slate-700 min-w-[100px]" />
      </div>
    </div>
  );
};

// --- QUESTIONS & ANSWERS INPUT ---
const QuestionsInput = ({ label, value = [], onChange }) => {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");

  const addQA = () => {
    if (q.trim() && a.trim()) {
      onChange([...value, { question: q.trim(), answer: a.trim() }]);
      setQ("");
      setA("");
    }
  };

  return (
    <div className="space-y-2 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="space-y-2">
        <div className="flex gap-2">
          <input 
            type="text" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Property Question (e.g. Is it RERA approved?)" 
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition-all"
          />
          <button type="button" onClick={addQA} className="bg-blue-600 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all">Add QA</button>
        </div>
        <textarea 
          value={a} onChange={(e) => setA(e.target.value)}
          placeholder="Detailed Answer..." 
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition-all h-20"
        />
      </div>
      <div className="space-y-2 mt-3">
        {value.map((item, index) => (
          <div key={index} className="bg-slate-50 p-3 rounded-xl border border-slate-200 relative group">
            <p className="text-xs font-black text-blue-700 uppercase mb-1">Q: {item.question}</p>
            <p className="text-sm text-slate-600">A: {item.answer}</p>
            <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
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
  const sPrice = watch("startPrice");
  const ePrice = watch("endPrice");
  const currentStatus = watch("status");

  const [resSubTypes, setResSubTypes] = useState([]); 
  const [commSubTypes, setCommSubTypes] = useState([]);
  const [plotSubTypes, setPlotSubTypes] = useState([]);
  const [config, setConfig] = useState({});

  const [highlightsList, setHighlightsList] = useState([]);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [specsList, setSpecsList] = useState([]);
  const [localitiesList, setLocalitiesList] = useState([]);
  const [facilitiesList, setFacilitiesList] = useState([]); 

  const [existingMedia, setExistingMedia] = useState({ coverImage: "", societyPlan: "", gallery: [] });

  const [questionsList, setQuestionsList] = useState([]);
  
  const [isUpdating, setIsUpdating] = useState(false); // Update process sathi// Questions sathi navin state

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
        
        // Main Level Values
        setValue("status", p.status || "");
        setValue("projectArea", p.projectArea || "");
        setValue("possessionDate", p.possessionDate || "");

        setHighlightsList(p.highlights || []);
        setAmenitiesList(p.amenities || []);
        setSpecsList(p.specification || []);
        setLocalitiesList(p.nearbyLocalities || []); 
        setFacilitiesList(p.facilities || []); 
        setQuestionsList(p.questions || []);
        
        if (p.propertyType === 'residential') {
          setResSubTypes(p.residentialDetails?.propertySubTypes || []);
          const resConfig = p.residentialDetails?.config || {};
          const normalized = {};
          Object.keys(resConfig).forEach(sub => {
            normalized[sub] = {};
            Object.keys(resConfig[sub]).forEach(bhk => {
              normalized[sub][bhk] = resConfig[sub][bhk].map(v => ({ ...v, plan: v.planImage || v.plan }));
            });
          });
          setConfig(normalized);
        } else if (p.propertyType === 'commercial') {
          setCommSubTypes(p.commercialDetails?.propertySubTypes || []);
          const commConfig = p.commercialDetails?.config || {};
          const normalized = {};
          Object.keys(commConfig).forEach(sub => {
            normalized[sub] = commConfig[sub].map(v => ({ ...v, plan: v.planImage || v.plan }));
          });
          setConfig(normalized);
        } else if (p.propertyType === 'plot') {
          setPlotSubTypes(p.plotDetails?.plotTypes || []);
          const plotConfig = p.plotDetails?.config || {};
          const normalized = {};
          Object.keys(plotConfig).forEach(sub => {
            normalized[sub] = plotConfig[sub].map(v => ({ ...v, plan: v.planImage || v.plan }));
          });
          setConfig(normalized);
        }
        setExistingMedia({ coverImage: p.images?.coverImage || "", societyPlan: p.images?.societyPlan || "", gallery: p.images?.gallery || [] });
        setInitialLoading(false);
      } catch (err) { navigate("/my-properties"); }
    };
    fetchProperty();
  }, [id, setValue, navigate]);

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const updateVal = (subType, index, field, value, bhk = null) => {
    const newConfig = { ...config };
    if (bhk) {
        if (!newConfig[subType][bhk]) newConfig[subType][bhk] = [];
        newConfig[subType][bhk][index][field] = value;
    } else {
        newConfig[subType][index][field] = value;
    }
    setConfig(newConfig);
  };

  const toggleMainType = (type, list, setList) => {
    if (list.includes(type)) {
      setList(list.filter(item => item !== type));
      const newConfig = { ...config }; delete newConfig[type]; setConfig(newConfig);
    } else {
      setList([...list, type]);
      const initialVal = currentPropertyType === 'residential' ? {} : [{ area: "", plan: null, price: "" }];
      setConfig({ ...config, [type]: initialVal });
    }
  };

  const toggleBHK = (subType, bhk) => {
    const subTypeConfig = config[subType] || {};
    if (subTypeConfig[bhk]) {
      const newSubConfig = { ...subTypeConfig }; delete newSubConfig[bhk];
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

  const handleGalleryChange = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 8) {
    alert("Bhai, fakt 8 images select kara!");
    e.target.value = ""; // Selection clear kara
  }
};

  const onSubmit = async (data) => {
    setIsUpdating(true); // <--- Loading suru zali
    try {
      const formData = new FormData();
      const allData = getValues();
      ["title", "city", "area", "propertyType", "description", "startPrice", "endPrice", "status", "possessionDate", "projectArea"].forEach(k => {
        if (allData[k]) formData.append(k, allData[k]);
      });
      formData.append("highlights", JSON.stringify(highlightsList));
      formData.append("amenities", JSON.stringify(amenitiesList));
      formData.append("specification", JSON.stringify(specsList));
      formData.append("localities", JSON.stringify(localitiesList));
      formData.append("facilities", JSON.stringify(facilitiesList)); 
      formData.append("resSubTypes", JSON.stringify(resSubTypes));
      formData.append("commSubTypes", JSON.stringify(commSubTypes));
      formData.append("plotSubTypes", JSON.stringify(plotSubTypes));
      formData.append("configData", JSON.stringify(config));
      formData.append("questions", JSON.stringify(questionsList));

      Object.keys(config).forEach(subType => {
        if (currentPropertyType === 'residential') {
          Object.keys(config[subType] || {}).forEach(bhk => {
            config[subType][bhk].forEach((v, i) => { if (v.plan instanceof File) formData.append(`plan_${subType}_${bhk}_${i}`, v.plan); });
          });
        } else {
          (config[subType] || []).forEach((v, i) => { if (v.plan instanceof File) formData.append(`plan_${subType}_${i}`, v.plan); });
        }
      });
      if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);
      if (data.societyPlan?.[0]) formData.append("societyPlan", data.societyPlan[0]);
      if (data.gallery) Array.from(data.gallery).forEach(f => formData.append("gallery", f));

      const token = localStorage.getItem("adminToken");
      const res = await axios.put(`http://localhost:5000/api/property/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` },
      });
      if (res.data.success) { alert("Property Updated Successfully!"); navigate(`/property/${id}`); }
    } catch (error) { alert("Update Failed!"); }finally {
    setIsUpdating(false); // <--- Loading thambli (Success hovo kiva Error yevo)
  }
  };

  if (initialLoading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-12 h-12 animate-spin text-blue-600" /></div>;

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12"><Progress step={step} /></div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-blue-600 px-8 py-6 text-white text-center"><h1 className="text-2xl font-bold">Update Property</h1></div>
          <div className="p-8">
            
            {step === 1 && (
              <div className="space-y-6">
                <SectionTitle title="Basic & Location Info" icon={<Home className="w-5 h-5" />} />
                <Input label="Property Title" register={register("title", { required: true })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" register={register("city")} />
                  <Input label="Area" register={register("area")} />
                </div>
                <LocalitiesInput label="Near Localities" value={localitiesList} onChange={setLocalitiesList} />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Starting Price</label><input type="number" {...register("startPrice")} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" /><p className="text-[10px] font-bold text-blue-600 ml-1">{formatPrice(sPrice)}</p></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Upto Price</label><input type="number" {...register("endPrice")} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" /><p className="text-[10px] font-bold text-blue-600 ml-1">{formatPrice(ePrice)}</p></div>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Property Type</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["residential", "commercial", "plot"].map((type) => (
                      <label key={type} className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col items-center transition-all ${watch("propertyType") === type ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100"}`}>
                        <input type="radio" value={type} {...register("propertyType")} className="hidden" /><span className="capitalize font-medium">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={next} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <SectionTitle title="Specifications" icon={<ClipboardList className="w-5 h-5" />} />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                    <select {...register("status")} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-blue-500 outline-none">
                        <option value="">Select Status</option>
                        <option value="ready">Ready</option>
                        <option value="under_construction">Under Construction</option>
                    </select>
                  </div>
                  <Input label="Project Area" type="text" placeholder="e.g. 2.5 Acres" register={register("projectArea")} />
                </div>

                {(currentStatus === "under_construction") && (
                  <div className="w-full">
                    <Input label="Possession Date" type="text" placeholder="e.g. Dec 2026" register={register("possessionDate")} />
                  </div>
                )}
                
                <MultiInput label="Amenities" value={amenitiesList} onChange={setAmenitiesList} />
                <MultiInput label="Facilities" placeholder="Water, Security, Parking..." value={facilitiesList} onChange={setFacilitiesList} />
                <MultiInput label="Technical Specs" value={specsList} onChange={setSpecsList} />
                <MultiInput label="Highlights" value={highlightsList} onChange={setHighlightsList} />

                <div className="space-y-1 pt-2 border-t">
                  <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                  <textarea {...register("description")} className="w-full px-4 py-3 rounded-xl border border-slate-200 h-24 focus:border-blue-500 outline-none" />
                </div>

                <div className="pt-4 border-t">
                <QuestionsInput 
                  label="Property FAQ's" 
                  value={questionsList} 
                  onChange={setQuestionsList} 
                />
              </div>

                {/* --- FULL CONFIG UI SECTIONS --- */}
                <div className="space-y-6 pt-6 border-t">
                  
                  {/* RESIDENTIAL CONFIG */}
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
                                  <div className="flex flex-col md:flex-row gap-3">
                                    <div className="flex-1"><label className="text-[9px] font-black uppercase">Area (sqft)</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value, bhk)} className="w-full border-b p-1 text-sm outline-none" /></div>
                                    <div className="flex-1"><label className="text-[9px] font-black uppercase">Price</label><input type="number" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value, bhk)} className="w-full border-b p-1 text-sm outline-none font-bold text-emerald-600" /><p className="text-[9px] font-bold text-blue-500 mt-1">{formatPrice(v.price)}</p></div>
                                    {i > 0 && <button type="button" onClick={() => removeVariant(subType, i, bhk)} className="text-red-400 self-center"><Trash2 className="w-4 h-4"/></button>}
                                  </div>
                                  <div className="space-y-1 border-t pt-2">
                                    <label className="text-[9px] font-black uppercase block">Plan Image</label>
                                    {v.plan && typeof v.plan === 'string' && ( <span className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(v.plan)}</span> )}
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

                  {/* COMMERCIAL CONFIG */}
                  {currentPropertyType === "commercial" && (
                    <>
                      <label className="text-sm font-bold">Commercial Sub-Types</label>
                      <div className="flex flex-wrap gap-2">
                        {["Shop", "Office", "Showroom", "Warehouse"].map(t => (
                          <button type="button" key={t} onClick={() => toggleMainType(t, commSubTypes, setCommSubTypes)} 
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${commSubTypes.includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>
                        ))}
                      </div>
                      {commSubTypes.map(subType => (
                        <div key={subType} className="p-5 bg-slate-50 rounded-2xl border-2 border-blue-100 space-y-4">
                          <h3 className="font-extrabold text-blue-700 uppercase">{subType}</h3>
                          {(config[subType] || []).map((v, i) => (
                            <div key={i} className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-slate-200">
                              <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1"><label className="text-[9px] font-black uppercase">Area (sqft)</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value)} className="w-full border-b p-1 text-sm outline-none" /></div>
                                <div className="flex-1"><label className="text-[9px] font-black uppercase">Price</label><input type="number" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value)} className="w-full border-b p-1 text-sm outline-none font-bold text-emerald-600" /><p className="text-[9px] font-bold text-blue-500 mt-1">{formatPrice(v.price)}</p></div>
                                {i > 0 && <button type="button" onClick={() => removeVariant(subType, i)} className="text-red-400 self-center"><Trash2 className="w-4 h-4"/></button>}
                              </div>
                              <div className="space-y-1 border-t pt-2">
                                <label className="text-[9px] font-black uppercase block">Plan Image</label>
                                {v.plan && typeof v.plan === 'string' && ( <span className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(v.plan)}</span> )}
                                <input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0])} className="text-[10px] block w-full" />
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => addVariant(subType)} className="text-[11px] text-blue-600 font-bold">+ Add Variant</button>
                        </div>
                      ))}
                    </>
                  )}

                  {/* PLOT CONFIG */}
                  {currentPropertyType === "plot" && (
                    <>
                      <label className="text-sm font-bold">Plot Types</label>
                      <div className="flex flex-wrap gap-2">
                        {["Residential Plot", "Commercial Plot", "Agricultural Land"].map(t => (
                          <button type="button" key={t} onClick={() => toggleMainType(t, plotSubTypes, setPlotSubTypes)} 
                          className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${plotSubTypes.includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>
                        ))}
                      </div>
                      {plotSubTypes.map(subType => (
                        <div key={subType} className="p-5 bg-slate-50 rounded-2xl border-2 border-blue-100 space-y-4">
                          <h3 className="font-extrabold text-blue-700 uppercase">{subType}</h3>
                          {(config[subType] || []).map((v, i) => (
                            <div key={i} className="flex flex-col gap-3 bg-white p-3 rounded-lg border border-slate-200">
                              <div className="flex flex-col md:flex-row gap-3">
                                <div className="flex-1"><label className="text-[9px] font-black uppercase">Area (sqft)</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value)} className="w-full border-b p-1 text-sm outline-none" /></div>
                                <div className="flex-1"><label className="text-[9px] font-black uppercase">Price</label><input type="number" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value)} className="w-full border-b p-1 text-sm outline-none font-bold text-emerald-600" /><p className="text-[9px] font-bold text-blue-500 mt-1">{formatPrice(v.price)}</p></div>
                                {i > 0 && <button type="button" onClick={() => removeVariant(subType, i)} className="text-red-400 self-center"><Trash2 className="w-4 h-4"/></button>}
                              </div>
                              <div className="space-y-1 border-t pt-2">
                                <label className="text-[9px] font-black uppercase block">Layout Plan</label>
                                {v.plan && typeof v.plan === 'string' && ( <span className="text-[9px] bg-white border border-blue-100 px-2 py-0.5 rounded text-blue-600 truncate block mb-1">Old: {getOriginalName(v.plan)}</span> )}
                                <input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0])} className="text-[10px] block w-full" />
                              </div>
                            </div>
                          ))}
                          <button type="button" onClick={() => addVariant(subType)} className="text-[11px] text-blue-600 font-bold">+ Add Variant</button>
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

              {/* Cover Image Section */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border">
                <label className="text-xs font-bold text-slate-500 uppercase">Cover Image</label>
                {existingMedia.coverImage && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100">
                    <img 
                      src={`http://localhost:5000/${existingMedia.coverImage}`} 
                      className="w-12 h-12 object-cover rounded shadow-sm" 
                      alt="Old Cover"
                    />
                    <span className="text-[10px] text-blue-600 font-medium truncate max-w-[200px]">
                      Current: {getOriginalName(existingMedia.coverImage)}
                    </span>
                  </div>
                )}
                <input type="file" {...register("coverImage")} className="w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              {/* Society Plan Section */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border">
                <label className="text-xs font-bold text-slate-500 uppercase">Society Plan</label>
                {existingMedia.societyPlan && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-blue-100">
                    <img 
                      src={`http://localhost:5000/${existingMedia.societyPlan}`} 
                      className="w-12 h-12 object-cover rounded shadow-sm" 
                      alt="Old Plan"
                    />
                    <span className="text-[10px] text-blue-600 font-medium truncate max-w-[200px]">
                      Current: {getOriginalName(existingMedia.societyPlan)}
                    </span>
                  </div>
                )}
                <input type="file" {...register("societyPlan")} className="w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
              </div>

              {/* Gallery Section with 8 Images Limit */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border">
                <label className="text-xs font-bold text-slate-500 uppercase block">Gallery (Max 8 Images)</label>
                
                {/* Old Gallery Images Display */}
                {existingMedia.gallery.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {existingMedia.gallery.map((g, i) => (
                      <div key={i} className="relative group">
                        <img 
                          src={`http://localhost:5000/${g}`} 
                          className="w-full h-16 object-cover rounded-lg border border-slate-200" 
                          alt={`gallery-${i}`}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                          <span className="text-[8px] text-white font-bold">Old</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  type="file" 
                  multiple 
                  {...register("gallery")} 
                  onChange={handleGalleryChange}
                  className="w-full text-sm mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                />
                <p className="text-[10px] text-slate-400 mt-1">* Navin select kelya nanter junya images replace hotil.</p>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={back} className="bg-slate-200 px-6 py-3 rounded-xl font-bold flex-1">Back</button>
                <button type="submit" disabled={isUpdating} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex-[2]">
                  {isUpdating ? "Updating..." : "Update Property"}
                </button>
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
function SectionTitle({ title, icon }) { return <div className="flex items-center gap-3 pb-2 border-b mb-6"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{icon}</div><h2 className="text-xl font-bold text-slate-800">{title}</h2></div>; }
function Input({ label, register, type = "text", placeholder }) { return <div className="space-y-1 flex-1"><label className="text-xs font-bold text-slate-500 uppercase">{label}</label><input type={type} placeholder={placeholder} {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none" /></div>; }
function Progress({ step }) {
  const steps = ["Basics", "Specs", "Uploads"];
  return (
    <div className="flex items-center justify-between relative max-w-sm mx-auto">
      <div className="absolute top-1/2 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
      {steps.map((label, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= i + 1 ? "bg-blue-600 text-white" : "bg-white text-slate-400 border-2"}`}>{step > i + 1 ? <CheckCircle className="w-6 h-6" /> : i + 1}</div>
          <span className="text-[10px] font-bold uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}