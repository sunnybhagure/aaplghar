import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; 
import { MapPin, IndianRupee, Navigation2, Calendar, User, Maximize2, ChevronRight, ChevronLeft } from "lucide-react";

export const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(property?.images?.coverImage);
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for smart sliders
  const locRef = useRef(null);
  const amtRef = useRef(null);
  const highRef = useRef(null);
  const variantRef = useRef(null);

  // States to track if content is overflowing
  const [overflow, setOverflow] = useState({ loc: false, amt: false, high: false, variant: false });

  const handleCardClick = () => navigate(`/property/${property._id}`);

  // Function to check overflow
  const checkOverflow = () => {
    setOverflow({
      loc: locRef.current?.scrollWidth > locRef.current?.clientWidth,
      amt: amtRef.current?.scrollWidth > amtRef.current?.clientWidth,
      high: highRef.current?.scrollWidth > highRef.current?.clientWidth,
      variant: variantRef.current?.scrollWidth > variantRef.current?.clientWidth,
    });
  };

  useEffect(() => {
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [property]);

  const scroll = (e, ref, direction) => {
    e.stopPropagation(); 
    if (ref.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  useEffect(() => {
    let interval;
    if (isHovered && property?.images?.gallery?.length > 0) {
      let i = 0;
      const gallery = property.images.gallery;
      interval = setInterval(() => {
        setCurrentImg(gallery[i % gallery.length]);
        i++;
      }, 1200);
    } else {
      setCurrentImg(property?.images?.coverImage);
      if (interval) clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isHovered, property?.images?.gallery, property?.images?.coverImage]);

  const formatPrice = (num) => {
    const val = Number(num);
    if (!val || val <= 0) return "0";
    if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
    return val.toLocaleString('en-IN');
  };

  const getVariants = () => {
    const variants = [];
    const pType = property.propertyType;
    if (pType === 'residential') {
      const config = property.residentialDetails?.config || {};
      Object.keys(config).forEach(subType => {
        Object.keys(config[subType]).forEach(bhk => {
          const list = config[subType][bhk];
          if (list && list.length > 0) {
            const sorted = [...list].sort((a, b) => a.area - b.area);
            variants.push({ 
              label: `${subType} ${bhk}`, 
              minArea: sorted[0].area, 
              maxArea: sorted[sorted.length - 1].area, 
              minPrice: sorted[0].price, 
              maxPrice: sorted[sorted.length - 1].price 
            });
          }
        });
      });
    } else {
      const config = (pType === 'commercial' ? property.commercialDetails?.config : property.plotDetails?.config) || {};
      Object.keys(config).forEach(subType => {
        const list = config[subType];
        if (list && list.length > 0) {
          const sorted = [...list].sort((a, b) => a.area - b.area);
          variants.push({ label: subType, minArea: sorted[0].area, maxArea: sorted[sorted.length - 1].area, minPrice: sorted[0].price, maxPrice: sorted[sorted.length - 1].price });
        }
      });
    }
    return variants;
  };

  const allVariants = getVariants();
  const localities = property.nearbyLocalities || [];
  const amenities = property.amenities || [];
  const highlights = property.highlights || [];

  return (
    <div 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      // ✅ Updated: Responsive height and smaller desktop width
      className="cursor-pointer w-full max-w-[340px] md:max-w-[1000px] mx-auto h-auto md:h-[420px] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl group shrink-0 mb-8"
    >
      {/* Image Section */}
      {/* ✅ Updated: Smaller image width on desktop */}
      <div className="w-full md:w-[320px] h-60 md:h-full shrink-0 overflow-hidden relative">
        <img src={currentImg || "https://via.placeholder.com/400x300"} alt={property.title} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110" />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md text-blue-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase border border-white/50 shadow-sm">{property.status?.replace("_", " ") || "New Launch"}</div>
      </div>

      {/* Content Section */}
      {/* ✅ Updated: Slightly tighter padding */}
      <div className="flex-1 p-5 md:px-7 md:py-5 flex flex-col bg-white overflow-hidden relative">
        
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start gap-4 mb-0.5">
            <h3 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">{property.title}</h3>
            <div className="p-2 bg-slate-50 rounded-full group-hover:bg-blue-50 shrink-0"><Navigation2 className="w-4 h-4 text-blue-500 fill-blue-500" /></div>
          </div>
          
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="text-[12px] font-bold tracking-wide truncate">{property.area || property.location?.area}, {property.city || property.location?.city}</span>
          </div>

          {/* NEARBY SLIDER */}
          {localities.length > 0 && (
            <div className="relative group/slider mb-1.5">
              <div ref={locRef} className="flex items-center gap-3 bg-slate-50/80 p-1.5 px-4 rounded-xl border border-slate-100/50 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest shrink-0">Nearby</span>
                {localities.map((loc, index) => (
                  <span key={index} className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap italic">• {loc.split('(')[0].trim()}</span>
                ))}
              </div>
              {overflow.loc && (
                <>
                  <button onClick={(e) => scroll(e, locRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity"><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={(e) => scroll(e, locRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity"><ChevronRight className="w-3 h-3" /></button>
                </>
              )}
            </div>
          )}

          {/* AMENITIES SLIDER */}
          {amenities.length > 0 && (
            <div className="relative group/slider mb-1.5">
              <div ref={amtRef} className="flex items-center gap-3 bg-emerald-50/30 p-1.5 px-4 rounded-xl border border-blue-50/30 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest shrink-0">Amenities</span>
                {amenities.map((amt, index) => (
                  <span key={index} className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">+ {amt}</span>
                ))}
              </div>
              {overflow.amt && (
                <>
                  <button onClick={(e) => scroll(e, amtRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity"><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={(e) => scroll(e, amtRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity"><ChevronRight className="w-3 h-3" /></button>
                </>
              )}
            </div>
          )}

          {/* HIGHLIGHTS SLIDER */}
          {highlights.length > 0 && (
            <div className="relative group/slider mb-1.5">
              <div ref={highRef} className="flex items-center gap-3 bg-amber-50/30 p-1.5 px-4 rounded-xl border border-amber-100/50 overflow-x-auto no-scrollbar">
                <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest shrink-0">Highlights</span>
                {highlights.map((high, index) => (
                  <span key={index} className="text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap italic">★ {high}</span>
                ))}
              </div>
              {overflow.high && (
                <>
                  <button onClick={(e) => scroll(e, highRef, 'left')} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity"><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={(e) => scroll(e, highRef, 'right')} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 shadow-md rounded-full p-1 opacity-0 group-hover/slider:opacity-100 transition-opacity"><ChevronRight className="w-3 h-3" /></button>
                </>
              )}
            </div>
          )}

          {/* BHK/VARIANT SLIDER */}
          {allVariants.length > 0 && (
            <div className="relative group/variant mb-2">
              <div ref={variantRef} className="flex gap-3 overflow-x-auto no-scrollbar pb-1 pt-1">
                {allVariants.map((v, i) => (
                  <div key={i} className="min-w-[150px] bg-white border border-slate-200 p-2.5 rounded-2xl hover:border-blue-400 transition-all shadow-sm">
                    <span className="text-[8px] font-black text-blue-500 uppercase block mb-0.5">{v.label}</span>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-black text-slate-700">{v.minArea === v.maxArea ? `${v.minArea} sq.ft` : `${v.minArea}-${v.maxArea} sq.ft`}</span>
                      <span className="text-[11px] font-bold text-emerald-600">₹ {v.minPrice === v.maxPrice ? formatPrice(v.minPrice) : `${formatPrice(v.minPrice)}-${formatPrice(v.maxPrice)}`}</span>
                    </div>
                  </div>
                ))}
              </div>
              {overflow.variant && (
                <>
                  <button onClick={(e) => scroll(e, variantRef, 'left')} className="absolute left-[-10px] top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-1.5 z-10 border opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-3 h-3" /></button>
                  <button onClick={(e) => scroll(e, variantRef, 'right')} className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-1.5 z-10 border opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-3 h-3" /></button>
                </>
              )}
            </div>
          )}
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-auto pt-2 border-t border-slate-50">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400"><Calendar className="w-3 h-3" /> {new Date(property.createdAt).toLocaleDateString('en-GB')}</div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400"><User className="w-3 h-3" /> {property.builder?.name || property.builderName || "Official Builder"}</div>
             </div>
             <div className="flex items-center gap-1 text-[8px] font-black text-blue-600 uppercase tracking-tighter bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {property.possessionDate ? <><Calendar className="w-3 h-3" /> POSS: {property.possessionDate}</> : <><Maximize2 className="w-3 h-3" /> AREA: {property.projectArea || "N/A"}</>}
             </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[7px] font-black text-slate-400 uppercase tracking-[1px] block">Project Budget Range</span>
              <div className="text-slate-900 font-black flex items-center text-lg md:text-xl leading-none">
                <IndianRupee className="w-4 h-4 mr-0.5 text-blue-600" /> 
                {formatPrice(property.startPrice || property.price?.starting)} - {formatPrice(property.endPrice || property.price?.upto)}
              </div>
            </div>
            <div className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-900 transition-all">View Details</div>
          </div>
        </div>
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};