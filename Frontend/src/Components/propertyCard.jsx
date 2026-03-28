import { useState, useEffect } from "react";
import { MapPin, Home, Building, LandPlot, IndianRupee } from "lucide-react";

export const PropertyCard = ({ property }) => {
  const [currentImg, setCurrentImg] = useState(property.images.coverImage);
  const [isHovered, setIsHovered] = useState(false);
  const gallery = property.images.gallery || [];

  // Hover kelyavar images rotate honyasathi logic
  useEffect(() => {
    let interval;
    if (isHovered && gallery.length > 0) {
      let i = 0;
      interval = setInterval(() => {
        setCurrentImg(gallery[i % gallery.length]);
        i++;
      }, 1200); // 1.2 seconds la image badalel
    } else {
      setCurrentImg(property.images.coverImage);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isHovered, gallery, property.images.coverImage]);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="flex flex-col md:flex-row bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden transition-all hover:shadow-xl mb-6 cursor-pointer"
    >
      {/* Left: Image Section */}
      <div className="md:w-1/3 h-56 md:h-auto overflow-hidden relative">
        <img 
          src={currentImg} 
          alt={property.title} 
          className="w-full h-full object-cover transition-transform duration-700 scale-105"
        />
        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
          {property.residentialDetails?.status || property.commercialDetails?.status || "Plot"}
        </div>
      </div>

      {/* Right: Content Section */}
      <div className="md:w-2/3 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{property.title}</h3>
            <div className="flex items-center text-blue-700 font-bold text-lg">
              <IndianRupee className="w-4 h-4" />
              <span>{property.price.starting}L - {property.price.upto}L</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-slate-500 mt-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{property.location.area}, {property.location.city}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
              <Home className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold">
                {property.propertyType === 'residential' ? 
                  property.residentialDetails?.bhkTypes?.map(b => b.type).join(", ") : 
                  property.propertyType}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-2 rounded-lg">
              <Building className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-semibold capitalize">
                {property.residentialDetails?.propertySubType || property.commercialDetails?.propertySubType || property.plotDetails?.plotType}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Posted by Builder</span>
            <button className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors">
                View Details
            </button>
        </div>
      </div>
    </div>
  );
};