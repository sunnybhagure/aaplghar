import { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { PropertyCard } from "../Components/PropertyCard";
import { 
  Loader2, CheckCircle, Timer, LayoutGrid, 
  Building2, ChevronLeft, ChevronRight, Search, Sparkles
} from "lucide-react";
import API from "../aap";

const PropertySlider = ({ children }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="relative group px-2">
      <button onClick={() => scroll("left")} className="absolute -left-4 top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-xl border border-slate-100 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hidden md:block"><ChevronLeft size={24} /></button>
      <div ref={scrollRef} className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth pb-8 px-4" style={{ scrollSnapType: 'x mandatory' }}>{children}</div>
      <button onClick={() => scroll("right")} className="absolute -right-4 top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-xl border border-slate-100 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hidden md:block"><ChevronRight size={24} /></button>
    </div>
  );
};

export default function YourProperties() {
  const [allProperties, setAllProperties] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [builderInfo, setBuilderInfo] = useState({ name: "", companyName: "" });
  const [activeType, setActiveType] = useState("residential");
  const [activeStatus, setActiveStatus] = useState("all");

  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const resultsSectionRef = useRef(null);

  useEffect(() => {
    const getBuilderId = () => {
      const userDataRaw = localStorage.getItem("user");
      const adminIdRaw = localStorage.getItem("adminId");
      const builderIdRaw = localStorage.getItem("builderId");
      if (userDataRaw) {
        try {
          const userObj = JSON.parse(userDataRaw);
          return userObj._id || userObj.id;
        } catch (e) { return null; }
      }
      return (adminIdRaw || builderIdRaw)?.replace(/"/g, '');
    };

    const builderId = getBuilderId();

    const fetchMyProperties = async () => {
      if (!builderId) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/property/builder/${builderId}`);
        const data = res.data.data || res.data || [];
        if (data.length > 0) {
          const firstProp = data[0];
          const info = { 
            name: firstProp.builder?.name || "Mate Buildcon", 
            companyName: firstProp.builder?.companyName || "Mate Buildcon Pvt" 
          };
          setBuilderInfo(info);
          const updatedData = data.map(p => ({
            ...p,
            builder: p.builder && typeof p.builder === 'object' ? p.builder : info
          }));
          setAllProperties(updatedData);
        } else { setAllProperties([]); }
      } catch (err) {
        setError("Failed to fetch properties.");
      } finally { setLoading(false); }
    };
    fetchMyProperties();
  }, []);

  // --- Suggestions Logic ---
  const suggestions = useMemo(() => {
    if (!searchInput.trim()) return [];
    const query = searchInput.toLowerCase();
    const set = new Set();
    allProperties.forEach(p => {
      if (p.title?.toLowerCase().includes(query)) set.add(p.title);
      if (p.location?.city?.toLowerCase().includes(query)) set.add(p.location.city);
    });
    return Array.from(set).slice(0, 5);
  }, [searchInput, allProperties]);

  const handleExplore = () => {
    setAppliedSearch(searchInput.trim());
    setShowSuggestions(false);
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredGroups = useMemo(() => {
    const filtered = allProperties.filter(p => {
      if (p.propertyType !== activeType) return false;
      if (activeStatus !== "all" && p.status?.toLowerCase() !== activeStatus) return false;
      if (appliedSearch !== "") {
        const query = appliedSearch.toLowerCase();
        return p.title?.toLowerCase().includes(query) || p.location?.city?.toLowerCase().includes(query);
      }
      return true;
    });

    return filtered.reduce((acc, property) => {
      const city = property.location?.city || "Other";
      if (!acc[city]) acc[city] = [];
      acc[city].push(property);
      return acc;
    }, {});
  }, [allProperties, activeType, activeStatus, appliedSearch]);

  const hasResults = Object.keys(filteredGroups).length > 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col space-y-8 mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Your Assets</h1>
              <div className="mt-2 flex flex-col border-l-4 border-blue-600 pl-4">
                <p className="text-blue-600 font-black uppercase text-sm tracking-widest">{builderInfo.name || "Loading..."}</p>
                <p className="text-slate-400 font-bold text-[10px] uppercase italic">{builderInfo.companyName}</p>
              </div>
            </div>
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
              {['residential', 'commercial', 'plot'].map(type => (
                <button key={type} onClick={() => { setActiveType(type); setAppliedSearch(""); setSearchInput(""); }}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all ${activeType === type ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-600"}`}>
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar with Suggestions */}
          <div className="w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-[2rem] shadow-xl border border-slate-100 relative z-[100]">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text"
                placeholder="Search by title or city..."
                value={searchInput}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExplore()}
                className="w-full pl-14 pr-6 py-4 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
                  {suggestions.map((item, idx) => (
                    <div key={idx} onClick={() => { setSearchInput(item); handleExplore(); }} className="px-6 py-3 hover:bg-blue-50 cursor-pointer font-bold text-slate-600 flex items-center gap-3 border-b border-slate-50 last:border-0 uppercase text-[11px] tracking-wider">
                      <Search size={14} className="text-slate-300"/> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={handleExplore} className="w-full md:w-auto bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg">Explore</button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          {[
            { id: "all", label: "All Assets", icon: <LayoutGrid size={14}/> },
            { id: "ready", label: "Ready to Move", icon: <CheckCircle size={14}/> },
            { id: "under_construction", label: "Under Construction", icon: <Timer size={14}/> }
          ].map(status => (
            <button key={status.id} onClick={() => { setActiveStatus(status.id); setAppliedSearch(""); }}
              className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase border transition-all shrink-0 ${activeStatus === status.id ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white text-slate-500 border-slate-200 hover:border-blue-400"}`}>
              {status.icon} {status.label}
            </button>
          ))}
        </div>

        <div className="mb-8 px-2 flex justify-center text-center">
            <p className={`font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${!hasResults && !loading ? "text-red-500 text-lg scale-110" : "text-slate-400 text-[10px]"}`}>
              {!hasResults && !loading ? (
                <>No result found for "{appliedSearch || activeType}"</>
              ) : (
                appliedSearch && <><Sparkles size={12} className="text-blue-500"/> Showing results for "{appliedSearch}"</>
              )}
            </p>
        </div>

        <div ref={resultsSectionRef} className="scroll-mt-10">
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
          ) : (
            <div className="space-y-20">
              {!hasResults ? (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4 text-slate-300"><Building2 size={32}/></div>
                  <p className="text-red-500 font-black uppercase tracking-[0.2em] text-xl text-center px-4">Sorry! No Properties match your search.</p>
                </div>
              ) : (
                Object.keys(filteredGroups).map(city => (
                  <div key={city} className="space-y-8">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic flex items-center gap-4">
                      <div className="h-[2px] w-12 bg-blue-600"></div> {city} Projects
                    </h2>
                    <PropertySlider>
                      {filteredGroups[city].map(p => (
                        <div key={p._id} className="min-w-[320px] md:min-w-[420px] lg:min-w-[460px] flex-shrink-0 snap-start">
                          <PropertyCard property={p} />
                        </div>
                      ))}
                    </PropertySlider>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      {showSuggestions && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSuggestions(false)}></div>}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
}