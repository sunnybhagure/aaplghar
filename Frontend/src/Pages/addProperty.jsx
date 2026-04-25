import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import {
  CheckCircle, Home, Upload, ArrowRight,
  ArrowLeft, ClipboardList, X, Trash2, MapPin
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// --- INDIAN PRICE FORMATTER (NO CHANGE) ---
const formatIndianPrice = (num) => {
  if (!num || isNaN(num)) return "";
  const val = parseFloat(num);
  if (val >= 10000000) return (val / 10000000).toFixed(2) + " Cr";
  if (val >= 100000) return (val / 100000).toFixed(2) + " Lakh";
  return val.toLocaleString('en-IN');
};

// --- CUSTOM LOCALITIES INPUT (NO CHANGE) ---
const LocalitiesInput = ({ label, value = [], onChange }) => {
  const [loc, setLoc] = useState("");
  const [dist, setDist] = useState("");

  const addLocality = () => {
    if (loc.trim()) {
      const combined = dist.trim() ? `${loc.trim()} (${dist.trim()})` : loc.trim();
      if (!value.includes(combined)) {
        onChange([...value, combined]);
        setLoc("");
        setDist("");
      }
    }
  };

  return (
    <div className="space-y-2 flex-1">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label>
      <div className="flex flex-col md:flex-row gap-2">
        <input 
          type="text" value={loc} onChange={(e) => setLoc(e.target.value)}
          placeholder="Location (e.g. Panvel Station)" 
          className="flex-[1.5] px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition-all"
        />
        <input 
          type="text" value={dist} onChange={(e) => setDist(e.target.value)}
          placeholder="Dist/Time (e.g. 14 mins away)" 
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-500 transition-all"
        />
        <button type="button" onClick={addLocality} className="bg-slate-900 text-white px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all">Add</button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map((item, index) => (
          <span key={index} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-100">
            <MapPin className="w-3 h-3" /> {item}
            <button type="button" onClick={() => onChange(value.filter((_, i) => i !== index))} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
};

// --- MULTI-INPUT COMPONENT (NO CHANGE) ---
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
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label} <span className="text-[10px] text-blue-500 normal-case">(Type & Comma)</span></label>
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

export default function PropertyForm() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const currentPropertyType = watch("propertyType");
  const [resSubTypes, setResSubTypes] = useState([]);
  const [commSubTypes, setCommSubTypes] = useState([]);
  const [plotSubTypes, setPlotSubTypes] = useState([]);
  const [config, setConfig] = useState({});
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [specsList, setSpecsList] = useState([]);
  const [localitiesList, setLocalitiesList] = useState([]);
  const [highlightsList, setHighlightsList] = useState([]);
  const [facilitiesList, setFacilitiesList] = useState([]);
  // PropertyForm function chya aat, itar state sobat add kara
const [questionsList, setQuestionsList] = useState([]);

  const next = () => setStep(step + 1);
  const back = () => setStep(step - 1);

  const toggleMainType = (type, list, setList) => {
    if (list.includes(type)) {
      setList(list.filter(i => i !== type));
      const newConfig = { ...config }; delete newConfig[type]; setConfig(newConfig);
    } else {
      setList([...list, type]);
      const initialVal = currentPropertyType === 'residential' ? {} : [{ area: "", price: "", plan: null }];
      setConfig({ ...config, [type]: initialVal });
    }
  };

  const toggleBHK = (subType, bhk) => {
    const subTypeConfig = config[subType] || {};
    if (subTypeConfig[bhk]) {
      const newSubConfig = { ...subTypeConfig }; delete newSubConfig[bhk];
      setConfig({ ...config, [subType]: newSubConfig });
    } else {
      setConfig({ ...config, [subType]: { ...subTypeConfig, [bhk]: [{ area: "", price: "", plan: null }] } });
    }
  };

  const updateVal = (subType, index, field, value, bhk = null) => {
    const newConfig = { ...config };
    if (bhk) newConfig[subType][bhk][index][field] = value;
    else newConfig[subType][index][field] = value;
    setConfig(newConfig);
  };

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      ["title", "city", "area", "propertyType", "description", "startPrice", "endPrice", "status", "projectArea", "possessionDate"].forEach(k => {
        if(data[k]) formData.append(k, data[k]);
      });
      formData.append("amenities", JSON.stringify(amenitiesList));
      formData.append("specification", JSON.stringify(specsList));
      formData.append("localities", JSON.stringify(localitiesList));
      formData.append("highlights", JSON.stringify(highlightsList));
      formData.append("facilities", JSON.stringify(facilitiesList));
      formData.append("questions", JSON.stringify(questionsList));
      formData.append("resSubTypes", JSON.stringify(resSubTypes));
      formData.append("commSubTypes", JSON.stringify(commSubTypes));
      formData.append("plotSubTypes", JSON.stringify(plotSubTypes));
      formData.append("configData", JSON.stringify(config));
      
      Object.keys(config).forEach(subType => {
        if (currentPropertyType === 'residential') {
          Object.keys(config[subType]).forEach(bhk => {
            config[subType][bhk].forEach((v, i) => { if (v.plan instanceof File) formData.append(`plan_${subType}_${bhk}_${i}`, v.plan); });
          });
        } else {
          config[subType].forEach((v, i) => { if (v.plan instanceof File) formData.append(`plan_${subType}_${i}`, v.plan); });
        }
      });

      if (data.coverImage?.[0]) formData.append("coverImage", data.coverImage[0]);
      if (data.societyPlan?.[0]) formData.append("societyPlan", data.societyPlan[0]);
      if (data.gallery) Array.from(data.gallery).forEach(file => formData.append("gallery", file));

      const token = localStorage.getItem("adminToken");
      const res = await axios.post("http://localhost:5000/api/property/addProperty", formData, {
        headers: { "Content-Type": "multipart/form-data", "Authorization": `Bearer ${token}` },
      });
      if(res.data.success) {         showAlert("success", "Property Added Successfully!")
; navigate("/my-properties"); }
    } catch (error) { showAlert("error", "Server connection failed"); }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12"><Progress step={step} /></div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 px-8 py-6 text-white text-center md:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Post Your Property</h1>
            <p className="text-slate-400 text-sm mt-1">Fill details to list your property on AaplGhar.</p>
          </div>
          <div className="p-8">
            {step === 1 && (
              <form onSubmit={handleSubmit(next)} className="space-y-6">
                <SectionTitle title="Basic & Location Info" icon={<Home className="w-5 h-5" />} />
                <Input label="Property Title" placeholder="e.g. Dream Valley Apartments" register={register("title", { required: true })} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" placeholder="Pune" register={register("city")} />
                  <Input label="Area (Locality)" placeholder="Kothrud" register={register("area")} />
                </div>

                <LocalitiesInput label="Near Localities (Location + Description)" value={localitiesList} onChange={setLocalitiesList} />
                
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

                <div className="pt-4 border-t border-slate-50">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Property Type</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {["residential", "commercial", "plot"].map((type) => (
                      <label key={type} className={`cursor-pointer border rounded-xl p-2 text-center text-sm transition-all ${watch("propertyType") === type ? "border-blue-600 bg-blue-50 text-blue-700 font-bold" : "border-slate-200"}`}>
                        <input type="radio" value={type} {...register("propertyType", { required: true })} className="hidden" /> 
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>

                <button className="btn-primary w-full flex justify-center items-center gap-2">Next Step <ArrowRight className="w-4 h-4" /></button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit(next)} className="space-y-6">
                <SectionTitle title="Specifications & Area" icon={<ClipboardList className="w-5 h-5" />} />
                
                <div className="grid grid-cols-2 gap-4">
                  <Select label="Status" options={["Ready", "Under Construction"]} register={register("status")} />
                  <Input label="Project Area (Acres)" type="number" step="0.01" placeholder="e.g. 5.5" register={register("projectArea")} />
                </div>
                {watch("status") === "under construction" && <Input label="Possession Date (MM/YYYY)" placeholder="Dec 2026" register={register("possessionDate")} />}

                {/* --- FULL WIDTH STACKED ARRANGEMENT --- */}
                <div className="space-y-5">
                  <MultiInput label="Amenities" placeholder="Gym, Pool, Club House..." value={amenitiesList} onChange={setAmenitiesList} />
                  <MultiInput label="Facilities" placeholder="24/7 Water, CCTV, Power Backup..." value={facilitiesList} onChange={setFacilitiesList} />
                  <MultiInput label="Technical Specs" placeholder="Vitrified Tiles, Granite Kitchen..." value={specsList} onChange={setSpecsList} />
                  <MultiInput label="Highlights" placeholder="Near Highway, Ocean View, Prime Location..." value={highlightsList} onChange={setHighlightsList} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Description</label>
                  <textarea {...register("description")} placeholder="Describe property highlights..." className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none h-24 transition-all" />
                </div>

                {/* Navin Questions Section */}
                <QuestionsInput label="Property Q&A (Builder FAQ)" value={questionsList} onChange={setQuestionsList} />

                {/* RESIDENTIAL CONFIG (NO LOGIC CHANGE) */}
                {currentPropertyType === "residential" && (
                  <div className="space-y-4 pt-4 border-t">
                    <label className="text-sm font-bold text-slate-700">Select Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {["Apartment", "Villa", "Bungalow", "Duplex", "Rowhouse"].map(t => (
                        <button type="button" key={t} onClick={() => toggleMainType(t, resSubTypes, setResSubTypes)} className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${resSubTypes.includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>
                      ))}
                    </div>
                    {resSubTypes.map(subType => (
                      <div key={subType} className="p-4 bg-slate-50 rounded-xl border-2 border-blue-100 space-y-4">
                        <h3 className="font-bold text-blue-700 uppercase text-xs">{subType} Config</h3>
                        <div className="flex flex-wrap gap-2">
                          {["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "5BHK"].map(b => (
                            <button type="button" key={b} onClick={() => toggleBHK(subType, b)} className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${config[subType]?.[b] ? "bg-slate-800 text-white" : "bg-white text-slate-600"}`}>{b}</button>
                          ))}
                        </div>
                        {Object.keys(config[subType] || {}).map(bhk => (
                          <div key={bhk} className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                            <h4 className="text-xs font-bold text-slate-800">{bhk} Variants</h4>
                            {config[subType][bhk].map((v, i) => (
                              <div key={i} className="flex flex-col md:flex-row gap-2 items-end bg-slate-50 p-2 rounded-lg border border-dashed">
                                <div className="flex-1 w-full"><label className="text-[9px] font-black text-slate-400 uppercase">Area (Sqft)</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value, bhk)} className="w-full border-b p-1 text-xs outline-none bg-transparent" /></div>
                                <div className="flex-1 w-full">
                                  <label className="text-[9px] font-black text-slate-400 uppercase">Price (₹)</label>
                                  <input type="number" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value, bhk)} className="w-full border-b p-1 text-xs outline-none font-bold text-emerald-600 bg-transparent" />
                                  <p className="text-[10px] text-blue-600 font-bold mt-1">{formatIndianPrice(v.price)}</p>
                                </div>
                                <div className="flex-1 w-full"><label className="text-[9px] font-black text-slate-400 uppercase">Plan Image</label><input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0], bhk)} className="text-[9px] w-full" /></div>
                                {i > 0 && <button type="button" onClick={() => { const newC = {...config}; newC[subType][bhk].splice(i,1); setConfig(newC); }} className="p-1 text-red-400"><Trash2 className="w-4 h-4"/></button>}
                              </div>
                            ))}
                            <button type="button" onClick={() => { const newC = {...config}; newC[subType][bhk].push({area:"",price:"",plan:null}); setConfig(newC); }} className="text-[10px] text-blue-600 font-bold">+ Add {bhk} Size</button>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* COMMERCIAL & PLOT CONFIG (NO LOGIC CHANGE) */}
                {(currentPropertyType === "commercial" || currentPropertyType === "plot") && (
                  <div className="space-y-4 pt-4 border-t">
                    <label className="text-sm font-bold text-slate-700">Select Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {(currentPropertyType === 'commercial' ? ["Shop", "Office", "Showroom", "Warehouse"] : ["Residential Plot", "Commercial Plot"]).map(t => (
                        <button type="button" key={t} onClick={() => toggleMainType(t, currentPropertyType === 'commercial' ? commSubTypes : plotSubTypes, currentPropertyType === 'commercial' ? setCommSubTypes : setPlotSubTypes)}
                        className={`px-4 py-2 rounded-lg border-2 text-sm font-bold ${(currentPropertyType === 'commercial' ? commSubTypes : plotSubTypes).includes(t) ? "bg-blue-600 text-white border-blue-600" : "border-slate-100 text-slate-500"}`}>{t}</button>
                      ))}
                    </div>
                    {(currentPropertyType === 'commercial' ? commSubTypes : plotSubTypes).map(subType => (
                      <div key={subType} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                        {(config[subType] || []).map((v, i) => (
                          <div key={i} className="bg-white p-3 rounded-lg border space-y-2 relative">
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Area (Sqft)</label><input type="number" value={v.area} onChange={e => updateVal(subType, i, 'area', e.target.value)} className="w-full border-b p-1 text-xs outline-none" /></div>
                              <div className="flex-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Price (₹)</label><input type="number" value={v.price} onChange={e => updateVal(subType, i, 'price', e.target.value)} className="w-full border-b p-1 text-xs outline-none text-emerald-600 font-bold" /><p className="text-[10px] text-blue-600 font-bold mt-1">{formatIndianPrice(v.price)}</p></div>
                              {currentPropertyType === 'plot' && (
                                <>
                                  <div className="flex-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Length (Ft)</label><input type="number" value={v.length} onChange={e => updateVal(subType, i, 'length', e.target.value)} className="w-full border-b p-1 text-xs outline-none" /></div>
                                  <div className="flex-1"><label className="text-[9px] font-bold text-slate-400 uppercase">Width (Ft)</label><input type="number" value={v.width} onChange={e => updateVal(subType, i, 'width', e.target.value)} className="w-full border-b p-1 text-xs outline-none" /></div>
                                </>
                              )}
                              <div className="col-span-2"><label className="text-[9px] font-bold text-slate-400 uppercase">Plan Image</label><input type="file" onChange={e => updateVal(subType, i, 'plan', e.target.files[0])} className="text-[9px] w-full mt-1" /></div>
                            </div>
                            {i > 0 && <button type="button" onClick={() => { const newC = {...config}; newC[subType].splice(i,1); setConfig(newC); }} className="absolute top-2 right-2 text-red-400"><X className="w-4 h-4"/></button>}
                          </div>
                        ))}
                        <button type="button" onClick={() => { const newC = {...config}; newC[subType].push({area:"",price:"",plan:null}); setConfig(newC); }} className="text-[10px] text-blue-600 font-bold">+ Add {subType} Variant</button>
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

            {step === 3 && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <SectionTitle title="Media & Documents" icon={<Upload className="w-5 h-5" />} />
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cover Image (Main Banner)</label>
                    <input type="file" {...register("coverImage", { required: true })} className="file-input w-full" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Property Gallery (Multiple Photos)</label>
                    <input type="file" multiple {...register("gallery", { required: true })} className="file-input w-full" />
                  </div>
                  <div className="space-y-2 border-t pt-4">
                    <label className="text-xs font-bold text-slate-900 uppercase ml-1">Society Plan / Layout Copy</label>
                    <input type="file" {...register("societyPlan", { required: true })} className="file-input w-full" />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={back} className="btn-secondary flex-1">Back</button>
                  <button type="submit" className="btn-success flex-[2] flex justify-center items-center gap-2">Submit Property <CheckCircle className="w-4 h-4" /></button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- STYLED HELPERS (NO UI CHANGE) ---
function SectionTitle({ title, icon }) { return <div className="flex items-center gap-3 pb-2 border-b border-slate-100 mb-6"><div className="p-2 bg-blue-100 text-blue-600 rounded-lg">{icon}</div><h2 className="text-xl font-bold text-slate-800">{title}</h2></div>; }
function Input({ label, register, type = "text", placeholder, step }) { return <div className="space-y-1.5 flex-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">{label}</label><input type={type} step={step} placeholder={placeholder} {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none transition-all" /></div>; }
function Select({ label, options, register }) { return <div className="space-y-1.5 flex-1"><label className="text-xs font-bold text-slate-500 uppercase ml-1">{label}</label><select {...register} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none bg-white"><option value="">Select {label}</option>{options.map(opt => <option key={opt} value={opt.toLowerCase()}>{opt}</option>)}</select></div>; }
function Progress({ step }) {
  const steps = ["Basics", "Specs", "Uploads"];
  return (
    <div className="flex items-center justify-between relative max-w-sm mx-auto">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
      {steps.map((label, i) => (
        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${step >= i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-slate-400 border-2 border-slate-200"}`}>{step > i + 1 ? <CheckCircle className="w-6 h-6" /> : i + 1}</div>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= i + 1 ? "text-blue-700" : "text-slate-400"}`}>{label}</span>
        </div>
      ))}
    </div>
  );
}