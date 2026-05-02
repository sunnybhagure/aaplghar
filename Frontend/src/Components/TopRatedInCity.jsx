import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PropertyCard } from './PropertyCard'; 
import API from "../aap";

// propertyType navacha prop add kela aahe
const TopRatedInCity = ({ city, currentPropertyId, propertyType }) => {
  const [topProperties, setTopProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndSortProperties = async () => {
      if (!city) return;
      try {
        setLoading(true);
        const response = await axios.get(`${API}/api/property/filterByCity?city=${city}`);
        const properties = response.data.data || [];

        const propertiesWithRatings = await Promise.all(
          properties.map(async (prop) => {
            try {
              const revRes = await axios.get(`${API}/api/reviews/property/${prop._id}`);
              const reviews = revRes.data.data || [];
              const avg = reviews.length > 0 
                ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) 
                : 0;
              return { ...prop, avgRating: avg };
            } catch (err) {
              return { ...prop, avgRating: 0 };
            }
          })
        );

        // --- FILTER LOGIC (SAME AS BEFORE) ---
        const sorted = propertiesWithRatings
          .filter(p => p._id !== currentPropertyId && p.propertyType === propertyType)
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 8); 

        setTopProperties(sorted);
      } catch (error) {
        console.error("Sorting error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSortProperties();
  }, [city, currentPropertyId, propertyType]); 

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading || topProperties.length === 0) return null;

  return (
    /* mt-20 kadhun mt-4 kela (Space Reduced) */
    /* mb-16 kadhun mb-4 kela (Space Reduced) */
    <div className="mt-4 mb-4 relative px-4">
      
      {/* max-w-[1000px] as it is, mb-8 kadhun mb-4 kela (Header space reduced) */}
      <div className="flex items-center justify-between mb-4 max-w-[1000px] mx-auto">
        <div className="relative">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[3px]">
                   Top Rated {propertyType} in {city}
                </h4>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase ml-6 leading-none">Highly Recommended {propertyType} Projects</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleScroll('left')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={() => handleScroll('right')} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white transition-all"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      {/* py-4 kadhun py-1 kela (Card chi varchi/khalchi extra space kadhli) */}
      <div ref={scrollRef} className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 py-1">
        {topProperties.map((property) => (
          /* shrink-0 as it is, w-full kadhun width auto keli jyamule card stretch nahi honar */
          <div key={property._id} className="snap-center shrink-0 w-auto flex justify-center">
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

export default TopRatedInCity;