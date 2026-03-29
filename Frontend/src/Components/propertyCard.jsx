export const PropertyCard = ({ property }) => {
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

  // BHK Logic: Map types array to "2, 3 BHK" format
  const bhkList = property.residentialDetails?.bhkTypes?.map(b => b.type).join(", ") || "N/A";

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col md:flex-row bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] mb-8 cursor-pointer group"
    >
      {/* --- Image Section --- */}
      <div className="md:w-[35%] h-64 md:h-auto overflow-hidden relative">
        <img 
          src={currentImg || "https://via.placeholder.com/400x300?text=AaplGhar"} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-600 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
          {property.residentialDetails?.status?.replace("_", " ") || property.commercialDetails?.status || "Premium"}
        </div>
      </div>

      {/* --- Content Section --- */}
      <div className="md:w-[65%] p-8 flex flex-col justify-between bg-gradient-to-br from-white to-slate-50/30">
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-2">
            <div>
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-600 transition-colors">
                {property.title}
              </h3>
              {/* Near Localities - Small Text */}
              {property.location?.nearLocalities?.length > 0 && (
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  Near: {property.location.nearLocalities.join(" • ")}
                </p>
              )}
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center text-emerald-600 font-black text-xl">
                <IndianRupee className="w-5 h-5" />
                <span>{property.price?.starting}L - {property.price?.upto}L</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Market Price</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-500 mt-4">
            <MapPin className="w-4 h-4 text-rose-500/70" />
            <span className="text-sm font-semibold tracking-tight">{property.location?.area}, {property.location?.city}</span>
          </div>

          {/* Key Features / BHK Info */}
          <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
            <Home className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold text-blue-800">
              {/* Jar data asel tarach dakhvel */}
              {property.propertyType === 'residential' ? bhkList : property.propertyType}
            </span>
          </div>
        </div>

        {/* --- Footer Section --- */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[10px] text-slate-400 font-black uppercase tracking-[2px]">RERA Verified</span>
            </div>
            <button className="bg-slate-950 text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[3px] hover:bg-blue-600 transition-all active:scale-95 shadow-xl shadow-slate-200 group-hover:shadow-blue-100">
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};