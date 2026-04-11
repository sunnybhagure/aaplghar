import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, ArrowRight } from 'lucide-react';

const TopRatedInCity = ({ city, currentPropertyId }) => {
  const [topProperties, setTopProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndSortProperties = async () => {
      if (!city) return;
      try {
        setLoading(true);
        
        // --- BADAL 1: Route fix kela (404 yenar nahi) ---
        const propRes = await axios.get(`http://localhost:5000/api/property/`);
        const allProperties = propRes.data.data || propRes.data || [];

        // --- BADAL 2: City wise filter frontend la kela ---
        const cityProperties = allProperties.filter(p => 
          p.location?.city?.toLowerCase() === city.toLowerCase() && 
          p._id !== currentPropertyId
        );

        if (cityProperties.length === 0) {
          setTopProperties([]);
          setLoading(false);
          return;
        }

        // --- BADAL 3: Rating fetch logic (Tujhya component sarkhech) ---
        const propertiesWithRatings = await Promise.all(
          cityProperties.map(async (prop) => {
            try {
              const revRes = await axios.get(`http://localhost:5000/api/reviews/property/${prop._id}`);
              // Jar success true asel tar data ghyaycha
              if (revRes.data.success) {
                const reviews = revRes.data.data || [];
                const avg = reviews.length > 0 
                  ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) 
                  : 0;
                return { ...prop, avgRating: avg };
              }
              return { ...prop, avgRating: 0 };
            } catch (err) {
              return { ...prop, avgRating: 0 };
            }
          })
        );

        // Sorting: Highest to Lowest
        const sorted = propertiesWithRatings
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 4);

        setTopProperties(sorted);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSortProperties();
  }, [city, currentPropertyId]);

  if (loading || topProperties.length === 0) return null;

  return (
    <div className="mt-16 mb-10 w-full">
      <div className="flex flex-col mb-8">
        <h4 className="text-[11px] font-black text-slate-800 uppercase tracking-[2px]">Top Rated in {city}</h4>
        <p className="text-[10px] font-bold text-blue-600 uppercase mt-0.5 tracking-tight">Highly Recommended Projects</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topProperties.map((item) => (
          <div 
            key={item._id}
            onClick={() => {
                navigate(`/property/${item._id}`);
                window.scrollTo(0, 0);
            }}
            className="group bg-white border border-slate-200 p-4 rounded-3xl hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500 cursor-pointer"
          >
            <div className="relative h-40 w-full bg-slate-100 rounded-2xl overflow-hidden mb-4">
              <img 
                src={item.images?.coverImage || 'https://via.placeholder.com/300'} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt={item.title} 
              />
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm border border-white">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <span className="text-[11px] font-black text-slate-800">{item.avgRating.toFixed(1)}</span>
              </div>
            </div>

            <h5 className="text-sm font-black text-slate-800 uppercase truncate mb-1 px-1">{item.title}</h5>
            <div className="flex items-center gap-1.5 text-slate-400 mb-4 px-1">
              <MapPin className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-tight truncate">{item.location?.area || city}</span>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 px-1">
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">View Details</span>
              <div className="w-7 h-7 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopRatedInCity;