import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  MapPin, IndianRupee, Calendar, User, CheckCircle2, 
  Loader2, ChevronDown, ChevronUp, X, Building2,
  Trash2, Edit3, Phone, Clock, Layers
} from "lucide-react";

// --- Read More Wrapper ---
const ReadMoreWrapper = ({ children, maxHeight = 150 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && ref.current.scrollHeight > maxHeight) {
      setShowButton(true);
    }
  }, [children, maxHeight]);

  return (
    <div>
      <div ref={ref} style={{ maxHeight: isExpanded ? "none" : `${maxHeight}px`, overflow: "hidden" }}>
        {children}
      </div>
      {showButton && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-3 text-[10px] font-black uppercase text-blue-600 tracking-widest hover:underline"
        >
          {isExpanded ? "Read Less -" : "Read More +"}
        </button>
      )}
    </div>
  );
};

export default function PropertyShow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState("");
  const [openPlanKey, setOpenPlanKey] = useState(null); 
  const [showAllMedia, setShowAllMedia] = useState(false);

  // --- Appointment States ---
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentData, setAppointmentData] = useState({
    name: "",
    phone: "",
    date: "",
    time: "",
    variant: "", // New Variant Field
    message: ""
  });
  const [bookingLoading, setBookingLoading] = useState(false);

  const isAdminOwner = useMemo(() => {
    if (!property) return false;
    const getLoggedInId = () => {
      const userDataRaw = localStorage.getItem("user");
      const adminIdRaw = localStorage.getItem("adminId");
      const builderIdRaw = localStorage.getItem("builderId");
      if (userDataRaw) {
        try {
          const userObj = JSON.parse(userDataRaw);
          return String(userObj._id || userObj.id);
        } catch (e) { return null; }
      }
      return (adminIdRaw || builderIdRaw)?.replace(/"/g, '');
    };
    const currentAdminId = getLoggedInId();
    const propertyOwnerId = property?.builder?._id || property?.builder;
    return currentAdminId && propertyOwnerId && String(currentAdminId).trim() === String(propertyOwnerId).trim();
  }, [property]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/property/getProperty/${id}`);
        const data = res.data.data || res.data;
        setProperty(data);
        setActiveImg(data.images?.coverImage);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // Extract Variants for Dropdown
  const variantOptions = useMemo(() => {
    if (!property) return [];
    let variants = [];
    if (property.propertyType === "residential" && property.residentialDetails?.config) {
      Object.values(property.residentialDetails.config).forEach(bhkObj => {
        variants.push(...Object.keys(bhkObj));
      });
    } else if (property.propertyType === "commercial") {
      variants = Object.keys(property.commercialDetails?.config || {});
    } else if (property.propertyType === "plot") {
      variants = Object.keys(property.plotDetails?.config || {});
    }
    return [...new Set(variants)];
  }, [property]);

const handleAppointmentSubmit = async (e) => {
  e.preventDefault();
  setBookingLoading(true);

  const userDataRaw = localStorage.getItem("user");
  let currentUserId = null;

  if (userDataRaw) {
    try {
      const userObj = JSON.parse(userDataRaw);
      currentUserId = userObj._id || userObj.id;
    } catch (err) { console.error(err); }
  }

  if (!currentUserId) {
    alert("Please login first!");
    setBookingLoading(false);
    return;
  }

  try {
    const payload = {
      property: id,                      // matches controller
      builder: property?.builder?._id || property?.builder, // matches controller
      user: currentUserId,               // matches controller
      userName: appointmentData.name,    // matches controller
      userPhone: appointmentData.phone,  // matches controller
      date: appointmentData.date,
      timeSlot: appointmentData.time,    // matches controller (mapping time to timeSlot)
      variant: appointmentData.variant,
      message: appointmentData.message || "I am interested in this property"
    };

    const res = await axios.post("http://localhost:5000/api/appointments/bookAppointment", payload);
    
    if (res.data.success) {
      alert("Appointment Scheduled Successfully!");
      setShowAppointmentModal(false);
      setAppointmentData({ name: "", phone: "", date: "", time: "", variant: "", message: "" });
    }
  } catch (err) {
    console.error("Booking Error:", err.response?.data);
    alert(err.response?.data?.error || "Error booking appointment.");
  } finally {
    setBookingLoading(false);
  }
};

  const formatPrice = (num) => {
    const val = Number(num);
    if (!val || val <= 0) return "0";
    if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
    else if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
    else return val.toLocaleString('en-IN'); 
  };


  useEffect(() => {
    const fillAppointmentData = async () => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser || !showAppointmentModal) return;

      const name = savedUser.name || savedUser.fullName || "";
      let phone = savedUser.phone || savedUser.mobile || savedUser.phoneNumber || "";

      if (!phone && savedUser.id) {
        try {
          const res = await axios.get(`http://localhost:5000/api/auth/user/${savedUser.id}`);
          if (res.data.success && res.data.user) {
            phone = res.data.user.phone || phone;
            const updatedUser = { ...savedUser, phone: res.data.user.phone };
            localStorage.setItem("user", JSON.stringify(updatedUser));
          }
        } catch (err) {
          console.error("Unable to fetch user phone:", err);
        }
      }

      setAppointmentData(prev => ({
        ...prev,
        name,
        phone
      }));
    };

    fillAppointmentData();
  }, [showAppointmentModal]);

  const displayTags = useMemo(() => {
    if (!property) return [];
    const tags = [];
    if (property.propertyType === 'residential' && property.residentialDetails?.config) {
      Object.entries(property.residentialDetails.config).forEach(([subType, bhkObj]) => {
        const bhkList = Object.keys(bhkObj).map(b => b.replace(/bhk/i, '').trim());
        tags.push({ label: subType, subLabel: bhkList.length > 0 ? `${bhkList.join(', ')} BHK` : "Property" });
      });
    } else {
      const otherTypes = [
        ...(property.commercialDetails?.propertySubTypes || []),
        ...(property.plotDetails?.plotTypes || [])
      ];
      otherTypes.forEach(t => tags.push({ label: t, subLabel: property.propertyType?.toUpperCase() }));
    }
    return tags;
  }, [property]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-white"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>;
  if (!property) return <div className="p-20 text-center font-bold uppercase tracking-widest text-slate-400">Property Not Found</div>;

  const allMedia = [...new Set([...(property.images?.gallery || []), property.images?.societyPlan])].filter(img => img && typeof img === 'string');

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 text-slate-900">
      
      {isAdminOwner && (
        <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex gap-3 justify-end">
            <button onClick={() => navigate(`/update-property/${property._id}`)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all"><Edit3 className="w-3.5 h-3.5" /> Update Property</button>
            <button onClick={async () => { if(window.confirm("Delete?")) { await axios.delete(`http://localhost:5000/api/property/delete/${id}`); navigate("/your-properties"); }}} className="flex items-center gap-2 bg-rose-600 text-white px-5 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-100"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end">
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
        <div className="mt-6 md:mt-0 flex items-end gap-8">
          <div className="text-right">
             <p className={`text-[12px] font-black uppercase tracking-widest ${property.status === 'ready' ? 'text-emerald-500' : 'text-orange-500'}`}>{property.status?.replace('_', ' ')}</p>
             {property.status !== 'ready' && property.possessionDate && <p className="text-[10px] font-black text-blue-600 uppercase mt-0.5">Possession-Date: {property.possessionDate}</p>}
          </div>
          <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
          <div className="text-right">
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Project Area</p>
             <p className="text-xl font-black text-slate-900 leading-none">{property.projectArea || "N/A"} <span className="text-[10px]">Acres</span></p>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
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

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* Price Box */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-0.5 tracking-widest">Estimated Value</p>
              <div className="text-2xl font-black text-emerald-600 flex items-center leading-none">
                <IndianRupee className="w-5 h-5" /> {formatPrice(property.price?.starting)} - {formatPrice(property.price?.upto)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {displayTags.map((tag, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 p-2 px-4 rounded-xl flex flex-col items-start min-w-[120px]">
                    <span className="text-[14px] font-black text-slate-400 uppercase tracking-tighter leading-none">{tag.label}</span>
                    <span className="text-[11px] font-bold text-slate-700 mt-1 uppercase tracking-tight italic">{tag.subLabel}</span>
                  </div>
              ))}
            </div>
          </div>

          {/* Localities Slider */}
          {property.nearbyLocalities?.length > 0 && (
            <section className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Nearby Localities</h4>
                <div className="flex overflow-x-auto gap-4 pb-4 overflow-y-hidden scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-50">
                    {property.nearbyLocalities.map((loc, i) => {
                        const [place, dist] = loc.split('(');
                        return (
                            <div key={i} className="min-w-[240px] border border-slate-100 p-4 rounded-xl bg-slate-50/50 flex-shrink-0 hover:border-blue-200 transition-colors">
                                <p className="font-black text-[13px] text-slate-800 leading-tight uppercase mb-1">{place.trim()}</p>
                                <p className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> {dist ? `${dist.replace(')', '')}` : "Nearby"}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </section>
          )}

          {/* Highlights */}
          {property.highlights?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Highlights</h4>
                <ReadMoreWrapper maxHeight={150}>
                    <div className="space-y-2.5">
                        {property.highlights.map((h, i) => (
                            <div key={i} className="text-[13px] font-bold text-slate-500 bg-blue-50/30 p-4 rounded-xl flex items-center gap-3 border border-blue-100/50">
                                <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" /> <span className="capitalize">{h}</span>
                            </div>
                        ))}
                    </div>
                </ReadMoreWrapper>
            </section>
          )}

          {/* Amenities */}
          <section>
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-3 ml-1">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {property.amenities?.map((amn, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest border border-emerald-100">{amn}</span>
              ))}
            </div>
          </section>

          {/* Project Overview */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Project Overview</h4>
            <ReadMoreWrapper maxHeight={100}>
                <p className="text-[14px] text-slate-600 leading-relaxed font-medium">{property.description}</p>
            </ReadMoreWrapper>
          </section>

          {/* Specifications */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-800 uppercase mb-4 tracking-widest">Specifications</h4>
            <ReadMoreWrapper maxHeight={200}>
                <div className="space-y-2.5">
                {property.specification?.map((spec, i) => (
                    <div key={i} className="text-[13px] font-bold text-slate-500 bg-slate-50/50 p-4 rounded-xl flex items-center gap-3 border border-slate-100/50">
                    <CheckCircle2 className="w-4.5 h-4.5 text-blue-500 shrink-0" /> <span className="capitalize">{spec}</span>
                    </div>
                ))}
                </div>
            </ReadMoreWrapper>
          </section>

          {/* Facilities */}
          {property.facilities?.length > 0 && (
            <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
               <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-4">Facilities</h4>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.facilities.map((fac, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-[12px] font-bold text-slate-600 uppercase tracking-tight">{fac}</span>
                    </div>
                  ))}
               </div>
            </section>
          )}

          {/* Property Plan Details */}
          <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-widest mb-6">Property Plan Details</h4>
            <div className="space-y-8">
              {/* Residential */}
              {property.propertyType === "residential" && Object.entries(property.residentialDetails?.config || {}).map(([subType, bhks]) => (
                <div key={subType} className="border-l-4 border-blue-600 pl-4 space-y-4">
                  <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-blue-600" /><h5 className="font-black text-sm uppercase tracking-tight">{subType}</h5></div>
                  {Object.entries(bhks).map(([bhkName, variants]) => (
                    <div key={bhkName} className="ml-4 space-y-3">
                      <div className="inline-block bg-slate-900 px-4 py-1.5 rounded-full"><p className="text-[11px] font-black text-white uppercase tracking-widest">{bhkName} Variants</p></div>
                      <div className="grid grid-cols-1 gap-2">
                        {variants.map((v, vIdx) => {
                          const uniqueKey = `res-${subType}-${bhkName}-${vIdx}`;
                          return (
                            <div key={vIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-0.5"><span className="text-xs font-black text-slate-700">{v.area} SQFT Area</span><span className="text-[14px] font-black text-emerald-600 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" /> {formatPrice(v.price)}</span></div>
                                <button onClick={() => setOpenPlanKey(openPlanKey === uniqueKey ? null : uniqueKey)} className="text-[10px] font-black uppercase bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">{openPlanKey === uniqueKey ? "Hide Plan" : "Show Plan"} {openPlanKey === uniqueKey ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}</button>
                              </div>
                              {openPlanKey === uniqueKey && v.planImage && <div className="bg-white rounded-lg border border-slate-200 p-2"><img src={v.planImage} className="w-full h-auto rounded-lg object-contain max-h-[350px]" alt="Plan" /></div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              {/* Commercial & Plot */}
              {(property.propertyType === "commercial" || property.propertyType === "plot") && 
                Object.entries((property.propertyType === "commercial" ? property.commercialDetails?.config : property.plotDetails?.config) || {}).map(([subType, variants]) => (
                  <div key={subType} className="border-l-4 border-emerald-600 pl-4 space-y-4">
                    <div className="flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-600" /><h5 className="font-black text-sm uppercase tracking-tight">{subType}</h5></div>
                    <div className="grid grid-cols-1 gap-2 ml-4">
                        {variants.map((v, vIdx) => {
                          const uniqueKey = `other-${subType}-${vIdx}`;
                          return (
                            <div key={vIdx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                              <div className="flex justify-between items-center">
                                <div className="flex flex-col gap-1">
                                  <span className="text-xs font-black text-slate-700">{v.area} SQFT</span>
                                  {property.propertyType === "plot" && (v.length || v.width) && (
                                    <div className="flex gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                                      <span>L: {v.length} ft</span> <span>W: {v.width} ft</span>
                                    </div>
                                  )}
                                  <span className="text-[14px] font-black text-emerald-600 flex items-center"><IndianRupee className="w-3 h-3 mr-0.5" /> {formatPrice(v.price)}</span>
                                </div>
                                <button onClick={() => setOpenPlanKey(openPlanKey === uniqueKey ? null : uniqueKey)} className="text-[10px] font-black uppercase bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">{openPlanKey === uniqueKey ? "Hide Plan" : "Show Plan"} {openPlanKey === uniqueKey ? <ChevronUp className="w-3 h-3"/> : <ChevronDown className="w-3 h-3"/>}</button>
                              </div>
                              {openPlanKey === uniqueKey && v.planImage && <div className="bg-white rounded-lg border border-slate-200 p-2"><img src={v.planImage} className="w-full h-auto rounded-lg object-contain max-h-[350px]" alt="Plan" /></div>}
                            </div>
                          );
                        })}
                    </div>
                  </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 text-white p-7 rounded-2xl sticky top-24 shadow-2xl space-y-8">
            <div>
                <h5 className="text-[10px] font-black uppercase tracking-[3px] mb-6 opacity-40 italic">Inquiry Center</h5>
                <div className="space-y-3.5">
                <button onClick={() => setShowAppointmentModal(true)} className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-900/40">Schedule Call</button>
                <button className="w-full bg-white/10 py-4 rounded-xl font-black uppercase text-[11px] tracking-widest border border-white/5 hover:bg-white/20 transition-all">Download Brochure</button>
                </div>
            </div>
            <div className="pt-8 border-t border-white/5 flex items-center gap-4">
              <div className="w-11 h-11 bg-blue-600/20 rounded-full flex items-center justify-center font-black text-blue-400 text-xs">AG</div>
              <div>
                <p className="font-black text-[13px] tracking-tight">{property.builder?.name || "Property Advisor"}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Authorized Partner</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {showAllMedia && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto p-4 md:p-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8 sticky top-0 bg-white py-4 border-b border-slate-100 z-10">
              <h2 className="font-black uppercase tracking-tighter text-2xl">Property Gallery ({allMedia.length})</h2>
              <button onClick={() => setShowAllMedia(false)} className="p-3 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"><X className="w-7 h-7"/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
              {allMedia.map((img, i) => (
                <div key={i} className="rounded-3xl overflow-hidden border border-slate-100 shadow-md">
                   <img src={img} className="w-full h-auto object-cover" alt="Gallery" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="font-black uppercase tracking-widest text-lg">Book Visit</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">Enter details to schedule a call or visit</p>
              </div>
              <button onClick={() => setShowAppointmentModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <form onSubmit={handleAppointmentSubmit} className="p-6 space-y-4">
              {/* Select Variant Dropdown */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Select Variant</label>
                <div className="relative mt-1">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select 
                    required 
                    className="w-full pl-11 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black uppercase tracking-tighter focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 appearance-none transition-all cursor-pointer shadow-sm"
                    value={appointmentData.variant} 
                    onChange={(e) => setAppointmentData({...appointmentData, variant: e.target.value})}
                  >
                    <option value="" disabled className="text-slate-400 font-bold">
                      Select Property Configuration
                    </option>

                    {displayTags.flatMap((tag, i) => {
                      // १. subLabel ला split करा (उदा. "1, 2" किंवा "1BHK, 2BHK")
                      const individualVariants = tag.subLabel.split(',').map(s => s.trim());

                      return individualVariants.map((variant, j) => {
                        
                        // २. तपासणी करा: जर आकडा असेल आणि "BHK" नसेल, तर "BHK" जोडा
                        // पण जर "Plot" किंवा "Commercial" असेल तर तिथे "BHK" नकोय
                        let cleanVariant = variant;
                        const isResidential = tag.label.toLowerCase().includes("Apartment") || tag.label.toLowerCase().includes("Duplex") || tag.label.toLowerCase().includes("villa") || tag.label.toLowerCase().includes("Bungalow") || tag.label.toLowerCase().includes("Rowhouse");

                        if (isResidential && !variant.includes("bhk")) {
                          cleanVariant = `${variant} BHK`;
                        }

                        return (
                          <option 
                            key={`${i}-${j}`} 
                            value={cleanVariant} 
                            className="py-2 font-bold text-slate-700"
                          >
                            {/* APARTMENT 1 BHK असं दिसेल */}
                            {`${tag.label} ${cleanVariant}`.toUpperCase()}
                          </option>
                        );
                      });
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown size={18} strokeWidth={3} />
                  </div>                
                </div>
              </div>

              {/* Full Name Field */}
              {/* Full Name */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    type="text" 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none" 
                    value={appointmentData.name || ""} 
                    onChange={(e) => setAppointmentData({...appointmentData, name: e.target.value})} 
                  />
                </div>
              </div>

              {/* Phone Number - 'phone' field database नुसार */}
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Number</label>
                <div className="relative mt-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    required 
                    type="text" // 'tel' ऐवजी 'text' वापरून बघ जर नंबर दिसत नसेल तर
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none" 
                    value={appointmentData.phone || ""} 
                    onChange={(e) => setAppointmentData({...appointmentData, phone: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Date</label>
                  <div className="relative mt-1">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="date" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none" value={appointmentData.date} onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Time</label>
                  <div className="relative mt-1">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input required type="time" className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none" value={appointmentData.time} onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})} />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Message (Optional)</label>
                <textarea 
                  placeholder="Add any special requests or questions..." 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 resize-none h-[100px]" 
                  value={appointmentData.message} 
                  onChange={(e) => setAppointmentData({...appointmentData, message: e.target.value})} 
                />
              </div>

              <button disabled={bookingLoading} type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[11px] tracking-[2px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {bookingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Appointment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}