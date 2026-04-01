import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  MapPin, IndianRupee, Calendar, User, CheckCircle2, 
  Loader2, ChevronDown, ChevronUp, X, LayoutDashboard, Building2,
  Trash2, Edit3 
} from "lucide-react";

export default function PropertyShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState("");
  const [openPlanKey, setOpenPlanKey] = useState(null); 
  const [showAllMedia, setShowAllMedia] = useState(false);

  // LOGIC: Current Login असलेल्या युजरचा ID मिळवणे
  const currentAdminId = localStorage.getItem("adminId");
  
  // LOGIC: जर प्रॉपर्टी बनवणारा आणि लॉगिन असलेला आयडी एकच असेल तरच True होईल
  const isAdminOwner = property?.createdBy === currentAdminId;

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/property/getProperty/${id}`);

       // १. आधी खात्री करा की property लोड झाली आहे
if (property) {
  const currentAdminId = localStorage.getItem("adminId");
  
  // २. डेटाबेस मधील आयडी नेमका कुठे आहे ते तपासा (उदा. property.createdBy किंवा property.builderId)
  const ownerIdInDB = property.createdBy || property.builderId || property.admin;

  const isAdminOwner = ownerIdInDB && currentAdminId && 
                       String(ownerIdInDB) === String(currentAdminId);

  console.log("Checking match:", {
    db: ownerIdInDB,
    local: currentAdminId,
    match: isAdminOwner
  });
}
        const data = res.data.data || res.data;
        setProperty(data);
        setActiveImg(data.images?.coverImage);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching property:", err);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if(window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`http://localhost:5000/api/property/delete/${property._id}`);
        alert("Property deleted successfully!");
        navigate("/your-properties"); // किंवा तुमच्या डॅशबोर्डचा मार्ग
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete property");
      }
    }
  };

  const formatPrice = (num) => {
    const val = Number(num);
    if (!val || val <= 0) return "0";
    if (val >= 10000000) {
      const cr = val / 10000000;
      return Number.isInteger(cr) ? `${cr} Cr` : `${cr.toFixed(2)} Cr`;
    } else if (val >= 100000) {
      const lakh = val / 100000;
      return Number.isInteger(lakh) ? `${lakh} L` : `${lakh.toFixed(2)} L`;
    } else {
      return val.toLocaleString('en-IN'); 
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );

  if (!property) return <div className="p-20 text-center font-bold uppercase tracking-widest text-slate-400">Property Not Found</div>;

  const gallery = property.images?.gallery || [];
  const societyPlan = property.images?.societyPlan ? [property.images.societyPlan] : [];
  const allMedia = [...new Set([...gallery, ...societyPlan])].filter(img => img && typeof img === 'string');

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900">
      
      {/* 🟢 ADMIN CONTROLS: फक्त प्रॉपर्टी मालकाला दिसणार */}
      {isAdminOwner && (
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3 justify-end">
            <button 
              onClick={() => navigate(`/update-property/${property._id}`)}
              className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" /> Update Property
            </button>
            <button 
              onClick={handleDelete}
              className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
      
      {/* 1. HEADER SECTION */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px] uppercase tracking-widest">
            <User className="w-3.5 h-3.5" /> {property.builder?.name || "Aaple Ghar Partner"} | <Calendar className="w-3.5 h-3.5" /> {new Date(property.createdAt).toLocaleDateString()}
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-none">{property.title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <MapPin className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-bold text-[13px] text-slate-500">{property.location?.area}, {property.location?.city}</span>
          </div>
        </div>
      </div>

      {/* 2. IMAGE SECTION */}
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-3 aspect-video bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
            {activeImg ? <img src={activeImg} className="w-full h-full object-cover transition-opacity duration-300" alt="Property" /> : <div className="w-full h-full flex items-center justify-center">Loading...</div>}
          </div>
          <div className="hidden md:flex flex-col gap-2 h-full">
            <div className="flex-1 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
               {allMedia[0] && <img src={allMedia[0]} onClick={() => setActiveImg(allMedia[0])} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-all" />}
            </div>
            <div className="flex-1 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 relative">
               {allMedia[1] && <img src={allMedia[1]} onClick={() => setActiveImg(allMedia[1])} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-all" />}
               {allMedia.length > 2 && (
                 <div onClick={() => setShowAllMedia(true)} className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white cursor-pointer hover:bg-slate-800 transition-all">
                    <span className="text-xl font-black">+{allMedia.length - 2}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest">Photos</span>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. MAIN PRICE BAR */}
      <div className="max-w-6xl mx-auto px-4 mb-6 space-y-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Estimated Value</p>
            <div className="text-2xl font-black text-emerald-600 flex items-center leading-none">
              <IndianRupee className="w-5 h-5" /> {formatPrice(property.price?.starting)} - {formatPrice(property.price?.upto)}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {(property.residentialDetails?.propertySubTypes || property.commercialDetails?.propertySubTypes || property.plotDetails?.plotTypes || []).map((type, i) => {
              const configs = property.propertyType === 'residential' 
                ? Object.keys(property.residentialDetails?.config?.[type] || {})
                    .map(key => key.replace(/\D/g, ''))
                    .filter(val => val !== "")
                    .join(", ")
                : "";

              return (
                <div key={i} className="bg-slate-50 border border-slate-200 p-2 px-4 rounded-xl flex flex-col items-start min-w-[100px]">
                  <span className="text-[16px] font-black text-slate-400 uppercase tracking-tighter">{type}</span>
                  <span className="text-[12px] font-bold text-slate-700">
                    {property.propertyType === 'residential' ? `${configs} BHK` : "Available"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. MAIN LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          <section>
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 ml-1">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.map((amn, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">{amn}</span>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-800 uppercase mb-4 tracking-widest">Specifications</h4>
            <div className="space-y-2.5">
              {property.specification?.map((spec, i) => (
                <div key={i} className="text-[13px] font-bold text-slate-500 bg-slate-50/50 p-4 rounded-xl flex items-center gap-3 border border-slate-100/50">
                  <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0" /> <span className="capitalize">{spec}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Overview</h4>
            <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{property.description}</p>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Property Plan Details</h4>
            
            <div className="space-y-8">
              {property.propertyType === "residential" && Object.entries(property.residentialDetails?.config || {}).map(([subType, bhks]) => (
                <div key={subType} className="border-l-4 border-blue-600 pl-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <h5 className="font-black text-sm uppercase tracking-tight">{subType}</h5>
                  </div>
                  
                  {Object.entries(bhks).map(([bhkName, variants]) => (
                    <div key={bhkName} className="ml-4 space-y-3">
                      <div className="inline-block bg-slate-900 px-4 py-1.5 rounded-full">
                        <p className="text-[11px] font-black text-white uppercase tracking-widest">{bhkName} Variants</p>
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {variants.map((v, vIdx) => {
                          const uniqueKey = `${subType}-${bhkName}-${vIdx}`;
                          return (
                            <div key={vIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-xs font-black text-slate-700">{v.area} SQFT Area</span>
                                  <span className="text-[14px] font-black text-emerald-600 flex items-center">
                                    <IndianRupee className="w-3 h-3 mr-0.5" /> {formatPrice(v.price)}
                                  </span>
                                </div>
                                <button onClick={() => setOpenPlanKey(openPlanKey === uniqueKey ? null : uniqueKey)} className="text-[10px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-200">
                                  {openPlanKey === uniqueKey ? "Hide Plan" : "Show Plan"}
                                  {openPlanKey === uniqueKey ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}
                                </button>
                              </div>
                              {openPlanKey === uniqueKey && (
                                <div className="bg-white rounded-lg border border-slate-200 p-2">
                                  <img src={v.planImage} className="w-full h-auto rounded-lg object-contain max-h-[350px]" alt="Plan" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {(property.propertyType === "commercial" || property.propertyType === "plot") && 
                Object.entries((property.commercialDetails || property.plotDetails)?.config || {}).map(([subType, variants]) => (
                <div key={subType} className="border-l-4 border-emerald-600 pl-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                    <h5 className="font-black text-sm uppercase tracking-tight">{subType}</h5>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {variants.map((v, vIdx) => {
                      const uniqueKey = `${subType}-${vIdx}`;
                      return (
                        <div key={vIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-xs font-black text-slate-700">{v.area} SQFT</span>
                              <span className="text-[14px] font-black text-emerald-600 flex items-center">
                                <IndianRupee className="w-3 h-3 mr-0.5" /> {formatPrice(v.price)}
                              </span>
                            </div>
                            <button onClick={() => setOpenPlanKey(openPlanKey === uniqueKey ? null : uniqueKey)} className="text-[10px] font-black uppercase bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                              {openPlanKey === uniqueKey ? "Hide Plan" : "Show Plan"}
                            </button>
                          </div>
                          {openPlanKey === uniqueKey && (
                            <div className="bg-white rounded-lg border border-slate-200 p-2">
                              <img src={v.planImage} className="w-full h-auto rounded-lg object-contain max-h-[350px]" alt="Plan" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* SIDEBAR */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-7 rounded-2xl sticky top-6 shadow-2xl">
            <h5 className="text-[10px] font-black uppercase tracking-[3px] mb-6 opacity-40">Ready to Visit?</h5>
            <div className="space-y-3.5">
              <button className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/40">Schedule Call</button>
              <button className="w-full bg-white/10 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest border border-white/5 hover:bg-white/20 transition-all">Project Details</button>
            </div>
            <div className="mt-8 pt-8 border-t border-white/5 flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-600/20 rounded-full flex items-center justify-center font-black text-blue-400 text-xs">AG</div>
              <div>
                <p className="font-black text-[13px] tracking-tight">Property Advisor</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Authorized Partner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* GALLERY MODAL */}
      {showAllMedia && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-4 md:p-10 animate-in fade-in duration-300">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white py-4 border-b border-slate-100 z-10">
              <h2 className="font-black uppercase tracking-tighter text-2xl">Property Gallery ({allMedia.length})</h2>
              <button onClick={() => setShowAllMedia(false)} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"><X className="w-7 h-7"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {allMedia.map((img, i) => (
                <div key={i} className="rounded-3xl overflow-hidden border border-slate-100 shadow-md">
                   <img src={img} className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500" alt="Gallery" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}