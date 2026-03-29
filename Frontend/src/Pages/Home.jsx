import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Search, MapPin, Home, Building, LandPlot, 
  IndianRupee, HousePlus, ChevronLeft, ChevronRight, Loader2 
} from "lucide-react";

// --- 1. HORIZONTAL SLIDER COMPONENT ---
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
      <button onClick={() => scroll("left")} className="absolute -left-2 md:-left-5 top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-2xl border border-slate-100 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hidden md:block active:scale-90">
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-10 px-2">
        {children}
      </div>
      <button onClick={() => scroll("right")} className="absolute -right-2 md:-right-5 top-1/2 -translate-y-1/2 z-30 bg-white p-3 rounded-full shadow-2xl border border-slate-100 text-slate-800 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hidden md:block active:scale-90">
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

// --- 2. UPDATED PROPERTY CARD (PRICE BETWEEN LOCATION & BUTTON) ---
const PropertyCard = ({ property }) => {
  const [currentImg, setCurrentImg] = useState(property?.images?.coverImage);
  const [isHovered, setIsHovered] = useState(false);
  const gallery = property?.images?.gallery || [];

  useEffect(() => {
    let interval;
    if (isHovered && gallery.length > 0) {
      let i = 0;
      interval = setInterval(() => {
        setCurrentImg(gallery[i % gallery.length]);
        i++;
      }, 1200);
    } else {
      setCurrentImg(property?.images?.coverImage);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isHovered, gallery, property?.images?.coverImage]);

  // --- JUNA CODE (Replace this) ---
// const bhkList = property.residentialDetails?.bhkTypes?.map(b => b.type.replace("BHK", "")).join(", ") + " BHK";

// --- NAVIN SAFE CODE ---
  const bhkList = property.residentialDetails?.bhkTypes?.length > 0 
    ? property.residentialDetails.bhkTypes.map(b => b.bhk_type?.toString().replace("BHK", "") || "").join(", ") + " BHK"
    : "N/A";
    
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      className="min-w-[320px] md:min-w-[720px] h-auto md:h-[320px] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl group shrink-0"
    >
      {/* Image Section - Fixed Dimensions */}
      <div className="w-full md:w-[280px] h-60 md:h-full shrink-0 overflow-hidden relative bg-slate-200">
        <img 
          src={currentImg || "https://via.placeholder.com/400x300?text=Property"} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
       <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-700 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
        {/* Add ?. before replace */}
        {property.residentialDetails?.status?.replace("_", " ") || 
        property.commercialDetails?.status?.replace("_", " ") || 
        "New Launch"}
      </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 truncate group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          
          {/* 1. Location Section */}
          <div className="flex items-center gap-1.5 text-slate-500 mb-4">
            <MapPin className="w-4 h-4 text-rose-500/80" />
            <span className="text-sm font-bold truncate">
                {property.area || property.location?.area}, {property.city || property.location?.city}
            </span>
          </div>

          {/* 2. PRICE SECTION (Placed here as requested) */}
          <div className="mb-5 bg-emerald-50/50 border border-emerald-100/50 p-3 rounded-2xl w-fit">
            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[1.5px] block mb-1">Budget</span>
            <div className="text-emerald-700 font-black flex items-center text-xl leading-none">
              <IndianRupee className="w-4 h-4 mr-0.5" /> 
              {property.startPrice || property.price?.starting}L - {property.endPrice || property.price?.upto}L
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {property.propertyType === 'residential' && (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                <Home className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[10px] font-black text-slate-700 uppercase">{bhkList}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl border border-blue-100">
              <Building className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] font-black text-blue-700 uppercase">
                {property.propertyType}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Button Section */}
        <div className="mt-6">
            <button className="w-full md:w-auto md:px-14 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN HOME PAGE COMPONENT ---
export default function HomePage() {
  const [activeTab, setActiveTab] = useState("residential");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/property/allProperties"); 
        setProperties(response.data);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(p => p.propertyType === activeTab);

  const tabs = [
    { id: "residential", label: "Residential", icon: <Home className="w-4 h-4"/> },
    { id: "commercial", label: "Commercial", icon: <Building className="w-4 h-4"/> },
    { id: "plot", label: "Plot", icon: <LandPlot className="w-4 h-4"/> },
    { id: "build", label: "Build House", icon: <HousePlus className="w-4 h-4"/> },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <div className="bg-slate-900 pt-16 pb-36 px-4">
        <div className="max-w-4xl mx-auto text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">Find Your <span className="text-blue-500">Dream</span> Home</h1>
            <p className="text-slate-400 text-lg font-medium">Over 10,000+ properties waiting for you.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Tabs */}
          <div className="flex gap-1 mb-0 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 rounded-t-2xl font-bold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-white text-blue-700 shadow-[-5px_-5px_10px_rgba(0,0,0,0.1)]" : "bg-slate-800/50 text-slate-400 hover:text-white"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="bg-white p-5 rounded-b-3xl rounded-tr-3xl shadow-2xl flex flex-col md:flex-row gap-4 items-center relative z-10">
            <div className="flex-1 w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder={`Search for ${activeTab} in Pune, Mumbai...`}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700 outline-none"
              />
            </div>
            <button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 transition-all active:scale-95">
              Search Now
            </button>
          </div>

          {/* Filter Box */}
          <div className="bg-white/80 backdrop-blur-md mt-4 p-5 rounded-3xl border border-white shadow-xl grid grid-cols-2 md:grid-cols-4 gap-6 animate-in fade-in zoom-in duration-500">
              <FilterSelect label="City" options={["Pune", "Mumbai", "Nashik"]} />
              <FilterSelect label="Budget" options={["10L - 50L", "50L - 1Cr", "Above 1Cr"]} />
              {activeTab === "residential" && (
                <>
                  <FilterSelect label="BHK Type" options={["1RK/1BHK", "2BHK", "3BHK", "4BHK+"]} />
                  <FilterSelect label="Type" options={["Apartment", "Villa", "Bungalow"]} />
                </>
              )}
              {(activeTab === "commercial" || activeTab === "plot") && (
                <>
                  <FilterSelect label="Area (sq.ft)" options={["Under 1000", "1000 - 5000", "Above 5000"]} />
                  <FilterSelect label="Sub-Category" options={["Shop", "Office", "Plot"]} />
                </>
              )}
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 -mt-16 pb-32 relative z-20">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
             <span className="font-black text-slate-400 uppercase tracking-widest text-xs">Loading Properties...</span>
          </div>
        ) : (
          <>
            <section className="mb-20">
            <div className="flex items-end justify-between mb-10 px-4">
              <div className="relative">
                <h2 className="text-3xl md:text-4xl m-2 font-black text-white tracking-tighter leading-none">
                  Upcoming <span className="text-blue-500">Projects</span>
                </h2>
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-1 w-10 bg-blue-600 rounded-full"></div>
                  <p className="text-slate-400 font-bold text-sm tracking-wide">Future homes under construction</p>
                </div>
              </div>
              <button className="hidden md:block text-white font-bold text-xs uppercase tracking-widest bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3 rounded-full hover:bg-blue-600 hover:border-blue-600 transition-all">
                View All
              </button>
            </div>
            
            <PropertySlider>
              {filteredProperties.filter(p => 
                p.residentialDetails?.status === "under_construction" || 
                p.commercialDetails?.status === "under_construction"
              ).length > 0 ? (
                filteredProperties
                  .filter(p => 
                    p.residentialDetails?.status === "under_construction" || 
                    p.commercialDetails?.status === "under_construction"
                  )
                  .map((item) => (
                    <PropertyCard key={item._id} property={item} />
                  ))
              ) : (
                <div className="w-full text-center py-16 bg-white/5 rounded-[2.5rem] border border-dashed border-white/10 text-slate-400 font-bold">
                  No upcoming projects found.
                </div>
              )}
            </PropertySlider>
          </section>

          <section>
            <div className="flex items-end justify-between mb-8 px-4">
              <div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight underline decoration-emerald-500 decoration-4">Newly Launched</h2>
                  <p className="text-slate-500 font-bold text-sm">Ready properties from last 15 days</p>
              </div>
              <button className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100 transition-colors">See All</button>
            </div>
            
            <PropertySlider>
              {filteredProperties.slice().reverse().map((item) => (
                <PropertyCard key={item._id + "new"} property={item} />
              ))}
            </PropertySlider>
          </section>
          </>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">{label}</label>
      <select className="bg-slate-50 border-none rounded-xl py-2.5 px-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 cursor-pointer outline-none">
        {options.map(opt => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}