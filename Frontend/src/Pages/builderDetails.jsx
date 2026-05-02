import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  MapPin, Briefcase, Building2, Star, Phone, Mail,
  Search, ChevronDown, ChevronUp, Sparkles, Check,
  Home, Building, LandPlot, Trash2, Layers
} from 'lucide-react';
import BuilderAverageRating from '../Components/BuilderAverageRating';
import API from "../aap";

const BuilderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- Search & Filter States ---
  const [activeTab, setActiveTab] = useState("residential");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedBudget, setSelectedBudget] = useState("All Budgets");
  const [selectedBHK, setSelectedBHK] = useState("All BHK");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  const [showCityMenu, setShowCityMenu] = useState(false);
  const cityMenuRef = useRef(null);
  const searchRef = useRef(null);

  const citiesList = ["All Cities", "Mumbai", "Pune", "Bangalore", "Noida", "Gurgaon", "Hyderabad", "Delhi", "Chennai", "Kolkata", "Ahmedabad", "Nashik", "Nagpur", "Thane", "PCMC", "Other"];

  // Page Top Scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`${API}/api/admin/builder-details/${id}`);
        setData(res.data.data);
      } catch (err) { console.error("Fetch Error:", err); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  useEffect(() => {
    const userDataRaw = localStorage.getItem("user");
    if (userDataRaw) {
      setCurrentUser(JSON.parse(userDataRaw));
    }
  }, []);

  
  const suggestions = useMemo(() => {
    if (!searchInput.trim() || !data) return [];
    const query = searchInput.toLowerCase();
    const matches = new Set();
    data.properties.forEach(p => {
      if (p.title.toLowerCase().includes(query)) matches.add(p.title);
      if (p.location?.city?.toLowerCase().includes(query)) matches.add(p.location.city);
    });
    return Array.from(matches).slice(0, 8);
  }, [searchInput, data]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cityMenuRef.current && !cityMenuRef.current.contains(event.target)) setShowCityMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatPrice = (num) => {
    if (!num || isNaN(num)) return "N/A";
    if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
    if (num >= 100000) return (num / 100000).toFixed(2) + " L";
    return num.toLocaleString('en-IN');
  };

  const handleExplore = (val) => {
    const query = val || searchInput.trim();
    setAppliedSearch(query);
    setIsSearchActive(true);
    setShowSuggestions(false);
  };

  const filteredProperties = useMemo(() => {
    if (!data) return [];
    return data.properties.filter(p => {
      if (p.propertyType !== activeTab) return false;
      if (isSearchActive && appliedSearch !== "") {
        const content = `${p.title} ${p.location?.city} ${p.location?.area}`.toLowerCase();
        if (!content.includes(appliedSearch.toLowerCase())) return false;
      }
      if (selectedStatus !== "All Status" && p.status !== selectedStatus) return false;
      if (selectedCity !== "All Cities" && p.location?.city !== selectedCity) return false;

      if (activeTab === "residential") {
        const res = p.residentialDetails || {};
        if (selectedType !== "All Types" && !res.propertySubTypes?.includes(selectedType)) return false;
        let prices = [], bhks = [];
        Object.keys(res.config || {}).forEach(s => {
          Object.keys(res.config[s]).forEach(b => {
            bhks.push(b);
            res.config[s][b].forEach(plan => { if(plan.price) prices.push(Number(plan.price)) });
          });
        });
        if (selectedBHK !== "All BHK" && !bhks.includes(selectedBHK)) return false;
        if (selectedBudget !== "All Budgets") {
          return prices.some(pr => {
            if (selectedBudget === "Under 40L") return pr < 4000000;
            if (selectedBudget === "40L - 70L") return pr >= 4000000 && pr <= 7000000;
            if (selectedBudget === "70L - 1Cr") return pr >= 7000000 && pr <= 10000000;
            if (selectedBudget === "1Cr - 2Cr") return pr >= 10000000 && pr <= 20000000;
            if (selectedBudget === "4Cr +") return pr >= 40000000;
            return false;
          });
        }
      } else {
        const details = p.propertyType === "commercial" ? p.commercialDetails : p.plotDetails;
        if (selectedType !== "All Types" && !details?.propertySubTypes?.includes(selectedType)) return false;
        if (selectedBudget !== "All Budgets") {
          const pr = p.price?.starting || 0;
          if (selectedBudget === "Under 40L") return pr < 4000000;
          if (selectedBudget === "4Cr +") return pr >= 40000000;
        }
      }
      return true;
    });
  }, [data, activeTab, appliedSearch, isSearchActive, selectedCity, selectedBudget, selectedBHK, selectedType, selectedStatus]);

  const getDisplaySpecs = (p) => {
    if (p.propertyType === 'residential') {
      const configs = p.residentialDetails?.config || {};
      let bhks = [];
      Object.keys(configs).forEach(t => Object.keys(configs[t]).forEach(b => bhks.push(parseInt(b))));
      const uniqueBhks = [...new Set(bhks)].sort();
      return uniqueBhks.length > 0 ? `${uniqueBhks.join(', ')} BHK` : "N/A";
    } else {
      const details = p.propertyType === 'commercial' ? p.commercialDetails : p.plotDetails;
      const units = details?.units || [];
      if (units.length === 0) return "N/A";
      const areas = units.map(u => Number(u.area)).filter(a => a > 0);
      const min = Math.min(...areas);
      const max = Math.max(...areas);
      return min === max ? `${min} sq.ft` : `${min}-${max} sq.ft`;
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black uppercase text-slate-400 animate-pulse">Loading Builder Details...</div>;
  if (!data) return <div>Builder not found</div>;

  const { builder, stats, cities } = data;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-10 items-start">
          <div className="w-full md:w-80 h-60 bg-slate-50 rounded-3xl overflow-hidden border p-4 flex items-center justify-center shadow-sm">
            <img src={builder.coverImage} className="max-w-full max-h-full object-contain" alt="builder" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">{builder.companyName}</h1>
              <span className="bg-blue-600 text-white text-[10px] px-3 py-1 rounded-full font-black uppercase">Verified</span>
            </div>
            
            <div className="flex flex-wrap gap-6 text-slate-500 font-bold text-xs uppercase tracking-widest items-center">
              <div className="flex items-center gap-2"><Briefcase size={16} className="text-blue-500"/> {new Date().getFullYear() - builder.since} Yrs Exp.</div>
              <div className="flex items-center gap-2"><Building2 size={16} className="text-blue-500"/> {stats.totalProjects} Total Projects</div>
              <BuilderAverageRating builderId={id} />
              <div className="flex items-center gap-2 text-slate-400 font-bold border-l pl-6 h-4">
                <MapPin size={14} className="text-blue-500"/> <span className="text-slate-500">Office Address:</span> {builder.companyAddress || "Address Not Available"}
              </div>
            </div>

            <div className="relative">
              <p className={`text-sm text-slate-600 leading-relaxed ${!showFullAbout && 'line-clamp-3'}`}>{builder.about}</p>
              <button onClick={() => setShowFullAbout(!showFullAbout)} className="mt-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                {showFullAbout ? "View Less" : "View More"}
              </button>
            </div>
            
            <div className="flex items-center gap-4">
               <button className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl"><Phone size={16}/> Contact Builder</button>
               <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <Mail size={14} className="text-blue-500" /> <span className="text-slate-400 mr-1">Official Mail:</span> {builder.email || "N/A"}
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* LEFT SIDEBAR */}
        <div className="lg:col-span-1 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div onClick={() => setSelectedStatus(selectedStatus === "ready" ? "All Status" : "ready")} className={`p-6 rounded-3xl flex justify-between items-center cursor-pointer border transition-all ${selectedStatus === "ready" ? "bg-green-600 border-green-700 shadow-xl" : "bg-green-50 border-green-100"}`}>
                <div><p className={`text-2xl font-black ${selectedStatus === "ready" ? "text-white" : "text-green-700"}`}>{stats.readyPossession}</p><p className={`text-[10px] font-black uppercase tracking-widest ${selectedStatus === "ready" ? "text-green-100" : "text-green-600"}`}>Ready Possession</p></div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-green-600 shadow-sm"><Sparkles size={20}/></div>
            </div>
            <div onClick={() => setSelectedStatus(selectedStatus === "under_construction" ? "All Status" : "under_construction")} className={`p-6 rounded-3xl flex justify-between items-center cursor-pointer border transition-all ${selectedStatus === "under_construction" ? "bg-orange-600 border-orange-700 shadow-xl" : "bg-orange-50 border-orange-100"}`}>
                <div><p className={`text-2xl font-black ${selectedStatus === "under_construction" ? "text-white" : "text-orange-700"}`}>{stats.underConstruction}</p><p className={`text-[10px] font-black uppercase tracking-widest ${selectedStatus === "under_construction" ? "text-orange-100" : "text-orange-600"}`}>Under Construction</p></div>
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-orange-600 shadow-sm"><Building2 size={20}/></div>
            </div>
          </div>

          {/* WORK IN CITIES SECTION (Re-added) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Work in Cities</h4>
            <div className="grid grid-cols-3 gap-2">
              {cities.map((city, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-2 rounded-lg text-center font-bold text-[10px] text-slate-600 uppercase truncate">{city}</div>
              ))}
            </div>
          </div>

          <BuilderReviewSection builderId={id} currentUser={currentUser} />
        </div>

        {/* RIGHT SIDE - Property List with Vertical Slider */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 space-y-6">
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                    {["residential", "commercial", "plot"].map((tab) => (
                        <button key={tab} onClick={() => { setActiveTab(tab); setSelectedType("All Types"); }} className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-400 hover:bg-slate-100"}`}>
                            {tab === "residential" ? <Home size={12}/> : tab === "commercial" ? <Building size={12}/> : <LandPlot size={12}/>} {tab}
                        </button>
                    ))}
                </div>
                
                <div className="flex flex-col md:flex-row gap-3 items-center relative" ref={searchRef}>
                    <div className="flex-1 w-full relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <input 
                          type="text" value={searchInput} 
                          onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }} 
                          onFocus={() => setShowSuggestions(true)}
                          onKeyDown={(e) => e.key === "Enter" && handleExplore()} 
                          placeholder="Search from builder's projects or city..." 
                          className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border-none font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                        {showSuggestions && suggestions.length > 0 && (
                          <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-xl shadow-2xl border border-slate-100 z-[1000] overflow-hidden">
                            {suggestions.map((s, i) => (
                              <div key={i} onClick={() => { setSearchInput(s); handleExplore(s); }} className="px-5 py-3 text-[10px] font-black uppercase text-slate-600 hover:bg-blue-50 cursor-pointer flex items-center gap-3">
                                <Search size={12} className="text-slate-300"/> {s}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                    <button onClick={() => handleExplore()} className="w-full md:w-auto bg-blue-600 text-white px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">Explore</button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="relative" ref={cityMenuRef}>
                        <div onClick={() => setShowCityMenu(!showCityMenu)} className="bg-slate-50 rounded-xl py-2.5 px-4 text-[11px] font-bold text-slate-700 flex justify-between items-center cursor-pointer border border-slate-50">
                            <span className="truncate">{selectedCity}</span><MapPin size={12} className="text-slate-300" />
                        </div>
                        {showCityMenu && (
                            <div className="absolute top-[110%] left-0 w-full bg-white rounded-xl shadow-2xl border border-slate-200 z-[999] max-h-48 overflow-y-auto">
                                {citiesList.map((city) => (
                                    <div key={city} onClick={() => { setSelectedCity(city); setShowCityMenu(false); }} className={`px-4 py-2 text-[10px] font-black uppercase cursor-pointer flex justify-between items-center ${selectedCity === city ? "bg-blue-600 text-white" : "hover:bg-blue-50"}`}>{city} {selectedCity === city && <Check size={12}/>}</div>
                                ))}
                            </div>
                        )}
                    </div>
                    <FilterSelect label="Budget" value={selectedBudget} onChange={setSelectedBudget} options={["All Budgets", "Under 40L", "40L - 70L", "70L - 1Cr", "1Cr - 2Cr", "2Cr - 3Cr", "3Cr - 4Cr", "4Cr +"]} />
                    {activeTab === "residential" ? (
                        <>
                            <FilterSelect label="BHK" value={selectedBHK} onChange={setSelectedBHK} options={["All BHK", "1BHK", "2BHK", "3BHK", "4BHK+"]} />
                            <FilterSelect label="Type" value={selectedType} onChange={setSelectedType} options={["All Types", "Apartment", "Villa", "Duplex", "Row House"]} />
                        </>
                    ) : (
                        <FilterSelect label="Type" value={selectedType} onChange={setSelectedType} options={activeTab === "commercial" ? ["All Types", "Shop", "Office", "Showroom", "Warehouse"] : ["All Types", "Residential Plot", "Commercial Plot"]} />
                    )}
                </div>
            </div>

            {/* VERTICAL SLIDER (Threshold: 12 Properties) */}
            <div className={`divide-y divide-slate-50 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent ${filteredProperties.length > 12 ? 'max-h-[1100px]' : ''}`}>
              {filteredProperties.length > 0 ? filteredProperties.map((p) => {
                const subTypes = p.residentialDetails?.propertySubTypes || p.commercialDetails?.propertySubTypes || p.plotDetails?.propertySubTypes || [];
                return (
                  <div key={p._id} onClick={() => navigate(`/property/${p._id}`)} className="grid grid-cols-12 items-center p-5 hover:bg-blue-50/40 transition-all cursor-pointer group">
                    <div className="col-span-5 flex items-center gap-4">
                      <img src={p.images?.coverImage} className="w-14 h-14 rounded-2xl object-cover border shadow-sm" alt="p" />
                      <div className="overflow-hidden">
                        <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tighter truncate text-sm">{p.title}</p>
                        <p className="text-[9px] font-black text-blue-500 uppercase flex items-center gap-1 mb-0.5"><Layers size={10}/> {subTypes.length > 0 ? subTypes.join(', ') : 'Property'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={10}/> {p.location?.area}, {p.location?.city}</p>
                      </div>
                    </div>
                    <div className="col-span-3 px-2">
                      <p className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 inline-block uppercase">{getDisplaySpecs(p)}</p>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full ${p.status === 'ready' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>{p.status?.replace('_', ' ')}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <p className="text-[11px] font-black text-slate-800 uppercase italic">{formatPrice(p.price?.starting)}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase italic">Upto {formatPrice(p.price?.upto)}</p>
                    </div>
                  </div>
                )
              }) : <div className="p-20 text-center text-slate-400 font-black uppercase text-xs">No Properties Found</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BuilderReviewSection = ({ builderId, currentUser }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (builderId) {
      axios.get(`${API}/api/builder-reviews/${builderId}`).then(res => {
        if (res.data.success) setReviews(res.data.data);
      });
    }
  }, [builderId]);

  const handleSubmit = async () => {
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) { alert("Please login to post a review"); return; }
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API}/api/builder-reviews/add`, { builderId, rating, comment }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.data.success) { setReviews([res.data.data, ...reviews]); setComment(""); setRating(5); }
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const deleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API}/api/builder-reviews/${reviewId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReviews(reviews.filter(rev => rev._id !== reviewId));
      } catch (err) {
        alert("Error deleting review");
      }
    }
  };

  const isOwner = (rev) => {
    const curId = currentUser?._id || currentUser?.id;
    const revUserId = rev.user?.id || rev.user?._id || rev.user;
    return curId && revUserId && curId.toString() === revUserId.toString();
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-4">Reviews & Rating</h4>
      <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((num) => (
            <Star key={num} size={16} className={`cursor-pointer transition-all ${num <= rating ? "text-orange-500 fill-orange-500" : "text-slate-300"}`} onClick={() => setRating(num)} />
          ))}
        </div>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write about builder..." className="w-full bg-white border-none rounded-xl p-3 text-[11px] font-bold text-slate-700 outline-none h-20 resize-none shadow-sm" />
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded-xl font-black text-[10px] uppercase tracking-widest">{loading ? "Posting..." : "Post Review"}</button>
      </div>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
        {reviews.map((rev) => (
          <div key={rev._id} className="border-b border-slate-50 pb-4 last:border-0">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">{rev.user?.name ? rev.user.name[0] : "?"}</div>
                <div>
                  <p className="text-[10px] font-black text-slate-800 uppercase">{rev.user?.name || "User"}</p>
                  <div className="flex gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} size={8} className={i < rev.rating ? "text-orange-500 fill-orange-500" : "text-slate-200"} />))}</div>
                </div>
              </div>
              {isOwner(rev) && (
                <button onClick={() => deleteReview(rev._id)} className="text-red-500 hover:text-red-700">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
            <p className="text-[10px] font-bold text-slate-500 mt-2 leading-relaxed italic">"{rev.comment}"</p>
          </div>
        ))}
      </div>
    </div>
  );
};

function FilterSelect({ label, options, value, onChange }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl py-2.5 px-4 text-[11px] font-bold text-slate-700 outline-none cursor-pointer">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  );
}

export default BuilderDetails;