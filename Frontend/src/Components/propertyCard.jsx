import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { MapPin, Home, Building, IndianRupee } from "lucide-react";

export const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(property?.images?.coverImage);
  const [isHovered, setIsHovered] = useState(false);
  const gallery = property?.images?.gallery || [];

  const handleCardClick = () => {
    // ✅ Navigation logic added here
    navigate(`/property/${property._id}`);
  };

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

  const bhkList = property.residentialDetails?.bhkTypes?.length > 0 
    ? property.residentialDetails.bhkTypes.map(b => b.bhk_type?.toString().replace("BHK", "") || "").join(", ") + " BHK"
    : "N/A";

  return (
    <div 
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)} 
      className="cursor-pointer min-w-[320px] md:min-w-[720px] h-auto md:h-[320px] flex flex-col md:flex-row bg-white rounded-[2.5rem] shadow-lg border border-slate-100 overflow-hidden transition-all duration-500 hover:shadow-2xl group shrink-0"
    >
      {/* Image Section */}
      <div className="w-full md:w-[280px] h-60 md:h-full shrink-0 overflow-hidden relative bg-slate-200">
        <img 
          src={currentImg || "https://via.placeholder.com/400x300?text=Property"} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
        />
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-blue-700 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
          {property.residentialDetails?.status?.replace("_", " ") || 
           property.commercialDetails?.status?.replace("_", " ") || "New Launch"}
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-white">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2 truncate group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>
          
          <div className="flex items-center gap-1.5 text-slate-500 mb-4">
            <MapPin className="w-4 h-4 text-rose-500/80" />
            <span className="text-sm font-bold truncate">
                {property.area || property.location?.area}, {property.city || property.location?.city}
            </span>
          </div>

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
              <span className="text-[10px] font-black text-blue-700 uppercase">{property.propertyType}</span>
            </div>
          </div>
        </div>

        <div className="mt-6">
            <button className="w-full md:w-auto md:px-14 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-[2px] hover:bg-blue-600 transition-all shadow-lg active:scale-95">
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};