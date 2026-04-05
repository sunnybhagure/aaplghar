import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom"; 
import axios from "axios";
import { 
  Search, MapPin, Home, Building, LandPlot, 
  ChevronLeft, ChevronRight, Loader2, Sparkles, Check
} from "lucide-react";

import { PropertyCard } from "../Components/propertyCard"; 

const PropertySlider = ({ children, isEmpty }) => {
  const scrollRef = useRef(null);
  const scroll = (direction) => {
    if (scrollRef.current && scrollRef.current.children.length > 0) {
      const cardWidth = scrollRef.current.children[0].offsetWidth + 24; 
      const scrollTo = direction === "left" 
        ? scrollRef.current.scrollLeft - cardWidth 
        : scrollRef.current.scrollLeft + cardWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };
  if (isEmpty) return null;
  return (
    <div className="relative group px-2">
      <button onClick={() => scroll("left")} className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-2xl border border-slate-100 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hidden md:block active:scale-90"><ChevronLeft className="w-6 h-6" /></button>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-10 px-2">{children}</div>
      <button onClick={() => scroll("right")} className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-2xl border border-slate-100 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hidden md:block active:scale-90"><ChevronRight className="w-6 h-6" /></button>
    </div>
  );
};

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(sessionStorage.getItem("home_activeTab") || searchParams.get("tab") || "residential");
  
  // Search States
  const [searchInput, setSearchInput] = useState(sessionStorage.getItem("home_searchQuery") || "");
  const [appliedSearch, setAppliedSearch] = useState(sessionStorage.getItem("home_searchQuery") || "");
  
  // ही स्टेट ठरवेल की सध्या सर्च बारचे रिझल्ट दाखवायचे की फिल्टरचे
  const [isSearchActive, setIsSearchActive] = useState(!!sessionStorage.getItem("home_searchQuery"));

  const [selectedCity, setSelectedCity] = useState(sessionStorage.getItem("home_selectedCity") || "All Cities");
  const [selectedBudget, setSelectedBudget] = useState(sessionStorage.getItem("home_selectedBudget") || "All Budgets");
  const [selectedBHK, setSelectedBHK] = useState(sessionStorage.getItem("home_selectedBHK") || "All BHK");
  const [selectedType, setSelectedType] = useState(sessionStorage.getItem("home_selectedType") || "All Types");
  const [selectedArea, setSelectedArea] = useState(sessionStorage.getItem("home_selectedArea") || "Any Area");

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const resultsRef = useRef(null);
  const cityMenuRef = useRef(null); 
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const cities = ["All Cities", "Mumbai", "Pune", "Bangalore", "Noida", "Gurgaon", "Hyderabad", "Delhi", "Chennai", "Kolkata", "Ahmedabad", "Nashik", "Nagpur", "Thane", "PCMC", "Other"];

  useEffect(() => {
    sessionStorage.setItem("home_activeTab", activeTab);
    sessionStorage.setItem("home_searchQuery", appliedSearch);
    sessionStorage.setItem("home_selectedCity", selectedCity);
    sessionStorage.setItem("home_selectedBudget", selectedBudget);
    sessionStorage.setItem("home_selectedBHK", selectedBHK);
    sessionStorage.setItem("home_selectedType", selectedType);
    sessionStorage.setItem("home_selectedArea", selectedArea);
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, appliedSearch, selectedCity, selectedBudget, selectedBHK, selectedType, selectedArea, setSearchParams]);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/property/allProperties"); 
        setProperties(response.data.data || response.data || []);
      } catch (error) { console.error(error); } 
      finally { setLoading(false); }
    };
    fetchProperties();
  }, []);

  const suggestions = useMemo(() => {
    if (!searchInput) return [];
    const set = new Set();
    const query = searchInput.toLowerCase();
    properties.forEach(p => {
      if (p.title?.toLowerCase().includes(query)) set.add(p.title);
      if (p.location?.area?.toLowerCase().includes(query)) set.add(p.location.area);
    });
    return Array.from(set).slice(0, 6);
  }, [searchInput, properties]);

  // Explore button logic
  const handleExplore = () => {
    const finalSearch = searchInput.trim();
    setAppliedSearch(finalSearch);
    setIsSearchActive(true); // सर्च ॲक्टिव्ह केला
    setShowSuggestions(false);

    if (finalSearch !== "") {
      const matchedCity = cities.find(c => c.toLowerCase() === finalSearch.toLowerCase());
      if (matchedCity) setSelectedCity(matchedCity);
      else setSelectedCity("Other");
    }
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // जेव्हा कोणताही फिल्टर बदलतो, तेव्हा सर्च बारची पकड ढिली करायची
  const handleFilterChange = (setter, value) => {
    setter(value);
    setIsSearchActive(false); // आता फिल्टर रिझल्ट दिसणार
  };

  const filteredProperties = useMemo(() => {
    return properties.filter(p => {
      if (p.propertyType !== activeTab) return false;

      // १. जर युजरने सर्च बार मधून Explore केलं असेल तर:
      if (isSearchActive && appliedSearch !== "") {
        const content = `${p.title} ${p.location?.city} ${p.location?.area} ${p.builder?.name}`.toLowerCase();
        return content.includes(appliedSearch.toLowerCase());
      }

      // २. जर युजरने फिल्टर बॉक्स वापरले असतील तर (Instant Results):
      if (selectedCity !== "All Cities" && p.location?.city !== selectedCity) return false;

      if (activeTab === "residential") {
        const res = p.residentialDetails || {};
        const config = res.config || {};
        if (selectedType !== "All Types" && !res.propertySubTypes?.includes(selectedType)) return false;

        let prices = [];
        let bhks = [];
        Object.keys(config).forEach(s => {
          Object.keys(config[s]).forEach(b => {
            bhks.push(b);
            config[s][b].forEach(plan => { if(plan.price) prices.push(Number(plan.price)) });
          });
        });

        if (selectedBHK !== "All BHK" && !bhks.includes(selectedBHK)) return false;
        if (selectedBudget !== "All Budgets") {
          return prices.some(pr => {
            if (selectedBudget === "Under 40L") return pr < 4000000;
            if (selectedBudget === "40L - 70L") return pr >= 4000000 && pr <= 7000000;
            if (selectedBudget === "70L - 1Cr") return pr >= 7000000 && pr <= 10000000;
            if (selectedBudget === "1Cr - 2Cr") return pr >= 10000000 && pr <= 20000000;
            if (selectedBudget === "2Cr - 3Cr") return pr >= 20000000 && pr <= 30000000;
            if (selectedBudget === "3Cr - 4Cr") return pr >= 30000000 && pr <= 40000000;
            if (selectedBudget === "4Cr +") return pr >= 40000000;
            return false;
          });
        }
      } else {
        // Commercial/Plot Logic
        if (selectedType !== "All Types") {
          const sub = p.propertyType === "commercial" ? p.commercialDetails?.propertySubTypes : p.plotDetails?.propertySubTypes;
          if (!sub?.includes(selectedType)) return false;
        }
        if (selectedBudget !== "All Budgets") {
          const pr = p.price?.starting || 0;
          if (selectedBudget === "Under 40L") return pr < 4000000;
          if (selectedBudget === "40L - 70L") return pr >= 4000000 && pr <= 7000000;
          if (selectedBudget === "70L - 1Cr") return pr >= 7000000 && pr <= 10000000;
          if (selectedBudget === "1Cr - 2Cr") return pr >= 10000000 && pr <= 20000000;
          if (selectedBudget === "2Cr - 3Cr") return pr >= 20000000 && pr <= 30000000;
          if (selectedBudget === "3Cr - 4Cr") return pr >= 30000000 && pr <= 40000000;
          if (selectedBudget === "4Cr +") return pr >= 40000000;
        }
      }
      return true;
    });
  }, [properties, activeTab, appliedSearch, isSearchActive, selectedCity, selectedBudget, selectedBHK, selectedType]);

  const displayProperties = filteredProperties.length > 0 
    ? filteredProperties 
    : properties.filter(p => p.propertyType === activeTab);

  const upcomingProjects = displayProperties.filter(p => p.status === "under_construction");
  const newlyLaunched = displayProperties.filter(p => p.status !== "under_construction");

  const resetFiltersOnTabChange = (tab) => {
    setActiveTab(tab);
    setSearchInput("");
    setAppliedSearch("");
    setIsSearchActive(false);
    setSelectedBHK("All BHK");
    setSelectedType("All Types");
    setSelectedArea("Any Area");
    setSelectedCity("All Cities");
    setSelectedBudget("All Budgets");
  };

  const resultText = useMemo(() => {
    if (isSearchActive && appliedSearch) return `matching "${appliedSearch}"`;
    let parts = [];
    if (selectedBHK !== "All BHK") parts.push(selectedBHK);
    if (selectedType !== "All Types") parts.push(selectedType);
    parts.push(activeTab);
    if (selectedCity !== "All Cities") parts.push(`in ${selectedCity}`);
    if (selectedBudget !== "All Budgets") parts.push(`within ${selectedBudget}`);
    return parts.join(" ");
  }, [isSearchActive, appliedSearch, selectedBHK, selectedType, activeTab, selectedCity, selectedBudget]);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="bg-slate-900 pt-12 pb-32 px-4 relative">
        <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-3 tracking-tight italic uppercase">Find Your <span className="text-blue-500">Dream</span> Space</h1>
        </div>

        <div className="max-w-5xl mx-auto relative">
          <div className="flex gap-1 mb-0 overflow-x-auto no-scrollbar">
            {["residential", "commercial", "plot"].map((tab) => (
              <button key={tab} onClick={() => resetFiltersOnTabChange(tab)} className={`flex items-center gap-2 px-8 py-4 rounded-t-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-2xl" : "bg-slate-800/40 text-slate-500 hover:text-white"}`}>
                {tab === "residential" ? <Home size={14}/> : tab === "commercial" ? <Building size={14}/> : <LandPlot size={14}/>} {tab}
              </button>
            ))}
          </div>

          <div className="bg-white p-4 rounded-b-3xl rounded-tr-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-center relative z-[60] border border-slate-100">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
              <input 
                type="text" 
                value={searchInput} 
                onFocus={() => setShowSuggestions(true)} 
                onChange={(e) => setSearchInput(e.target.value)} 
                onKeyDown={(e) => e.key === "Enter" && handleExplore()} 
                placeholder="Search title, builder, or area..." 
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500" 
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
                   {suggestions.map((s, i) => (
                     <div key={i} onClick={() => {setSearchInput(s); setShowSuggestions(false);}} className="px-6 py-3 hover:bg-blue-50 cursor-pointer font-bold text-slate-600 flex items-center gap-3 border-b border-slate-50 last:border-0"><Search size={14} className="text-slate-300"/>{s}</div>
                   ))}
                </div>
              )}
            </div>
            <button onClick={handleExplore} className="w-full md:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Explore</button>
          </div>

          <div className="bg-white/95 backdrop-blur-md mt-4 p-5 rounded-3xl shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 relative z-[55]">
              <div className="flex flex-col gap-1.5 relative" ref={cityMenuRef}>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">City</label>
                <div onClick={() => setShowCityMenu(!showCityMenu)} className="bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-200 border border-slate-100 transition-all">
                  <span className="truncate">{selectedCity}</span>
                  <MapPin size={14} className={showCityMenu ? "text-blue-500" : "text-slate-300"} />
                </div>
                {showCityMenu && (
                  <div className="absolute top-[110%] left-0 w-full bg-white rounded-2xl shadow-2xl border border-slate-200 z-[9999] overflow-hidden">
                    <div className="max-h-[220px] overflow-y-auto py-2">
                      {cities.map((city) => (
                        <div key={city} onClick={() => { handleFilterChange(setSelectedCity, city); setShowCityMenu(false); }} className={`px-5 py-3 text-[11px] font-black uppercase tracking-wider cursor-pointer flex justify-between items-center ${selectedCity === city ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}>
                          {city} {selectedCity === city && <Check size={14} />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <FilterSelect label="Budget" value={selectedBudget} onChange={(val) => handleFilterChange(setSelectedBudget, val)} options={["All Budgets", "Under 40L", "40L - 70L", "70L - 1Cr", "1Cr - 2Cr", "2Cr - 3Cr", "3Cr - 4Cr", "4Cr +"]} />

              {activeTab === "residential" ? (
                <>
                  <FilterSelect label="BHK" value={selectedBHK} onChange={(val) => handleFilterChange(setSelectedBHK, val)} options={["All BHK", "1BHK", "2BHK", "3BHK", "4BHK+"]} />
                  <FilterSelect label="Type" value={selectedType} onChange={(val) => handleFilterChange(setSelectedType, val)} options={["All Types", "Apartment", "Villa", "Duplex", "Row House", "Bungalow"]} />
                </>
              ) : activeTab === "commercial" ? (
                <>
                  <FilterSelect label="Area" value={selectedArea} onChange={(val) => handleFilterChange(setSelectedArea, val)} options={["Any Area", "Under 500", "500-1500", "1500+"]} />
                  <FilterSelect label="Type" value={selectedType} onChange={(val) => handleFilterChange(setSelectedType, val)} options={["All Types", "Shop", "Office", "Warehouse", "Showroom"]} />
                </>
              ) : (
                <>
                  <FilterSelect label="Area" value={selectedArea} onChange={(val) => handleFilterChange(setSelectedArea, val)} options={["Any Area", "Under 1000", "1000-3000", "3000+"]} />
                  <FilterSelect label="Type" value={selectedType} onChange={(val) => handleFilterChange(setSelectedType, val)} options={["All Types", "Residential", "Commercial"]} />
                </>
              )}
          </div>

          <div className="mt-4 px-2 h-8 overflow-hidden flex items-center justify-center text-center">
             <p className={`font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300 ${filteredProperties.length === 0 ? "text-red-500 text-base scale-110" : "text-slate-400 text-[10px]"}`}>
               {filteredProperties.length === 0 ? (
                 <>No result found for {resultText}</>
               ) : (
                 <><Sparkles size={12} className="text-blue-500"/> Showing {filteredProperties.length} {resultText}</>
               )}
             </p>
          </div>
        </div>
      </div>

      <div ref={resultsRef} className="max-w-7xl mx-auto px-4 -mt-8 pb-32 relative z-20 scroll-mt-24">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-12 h-12 text-blue-600 animate-spin" /></div>
        ) : (
          <div className="space-y-24">
              <section>
                <div className="mb-10 px-6 flex items-center gap-4"><div className="h-1.5 w-12 bg-blue-600 rounded-full"></div><h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Upcoming Projects</h2></div>
                {upcomingProjects.length > 0 ? (
                  <PropertySlider>
                    {upcomingProjects.map(p => (
                      <div key={p._id} className="min-w-[340px] md:min-w-[420px] lg:min-w-[460px] flex-shrink-0">
                        <PropertyCard property={p} />
                      </div>
                    ))}
                  </PropertySlider>
                ) : (
                  <div className="bg-white/5 py-12 rounded-3xl text-center border-2 border-dashed border-slate-800/20 font-bold text-slate-500 uppercase text-xs tracking-widest">No upcoming projects found</div>
                )}
              </section>
              <section>
                <div className="mb-10 px-6 flex items-center gap-4"><div className="h-1.5 w-12 bg-emerald-500 rounded-full"></div><h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Newly Launched</h2></div>
                {newlyLaunched.length > 0 ? (
                  <PropertySlider>
                    {newlyLaunched.slice().reverse().map(p => (
                      <div key={p._id} className="min-w-[340px] md:min-w-[420px] lg:min-w-[460px] flex-shrink-0">
                        <PropertyCard property={p} />
                      </div>
                    ))}
                  </PropertySlider>
                ) : (
                  <div className="bg-white py-12 rounded-3xl text-center border-2 border-dashed border-slate-200 font-bold text-slate-400 uppercase text-xs tracking-widest">No properties listed in this category</div>
                )}
              </section>
          </div>
        )}
      </div>
      {showSuggestions && <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSuggestions(false)}></div>}
    </div>
  );
}

function FilterSelect({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">{label}</label>
      <select value={value} onChange={(e) => onChange?.(e.target.value)} className="bg-slate-50 border-none rounded-xl py-3 px-4 text-sm font-bold text-slate-700 outline-none cursor-pointer hover:bg-slate-200 transition-all">
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}