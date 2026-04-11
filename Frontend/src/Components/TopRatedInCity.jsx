import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PropertyCard } from './PropertyCard'; // Import your detailed card

const TopRatedInCity = ({ city, currentPropertyId }) => {
  const [topProperties, setTopProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAndSortProperties = async () => {
      if (!city) return;
      try {
        setLoading(true);
        // 1. Fetch properties by city
        const response = await axios.get(`http://localhost:5000/api/property/filterByCity?city=${city}`);
        const properties = response.data.data || [];

        // 2. Fetch ratings for each property
        const propertiesWithRatings = await Promise.all(
          properties.map(async (prop) => {
            try {
              const revRes = await axios.get(`http://localhost:5000/api/reviews/property/${prop._id}`);
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

        // 3. Filter current and sort by rating
        const sorted = propertiesWithRatings
          .filter(p => p._id !== currentPropertyId)
          .sort((a, b) => b.avgRating - a.avgRating)
          .slice(0, 8); // Slice 8 for better slider feel

        setTopProperties(sorted);
      } catch (error) {
        console.error("Sorting error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndSortProperties();
  }, [city, currentPropertyId]);

  // Slider Scroll Logic
  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Ekda click kelyavar purna card chya width evdhe slide hoil
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth 
        : scrollLeft + clientWidth;
      
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading || topProperties.length === 0) return null;

  return (
    <div className="mt-20 mb-16 relative px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8 max-w-[1000px] mx-auto">
        <div className="relative">
            <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-blue-600 fill-blue-600" />
                <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-[3px]">Top Rated in {city}</h4>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase ml-6">The most loved projects by customers</p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          <button 
            onClick={() => handleScroll('left')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white transition-all group"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleScroll('right')}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm hover:bg-blue-600 hover:text-white transition-all group"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Slider Container */}
      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-2 py-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {topProperties.map((property) => (
          <div key={property._id} className="snap-center shrink-0 w-full flex justify-center">
            {/* Using your provided PropertyCard component */}
            <PropertyCard property={property} />
          </div>
        ))}
      </div>

      {/* Custom Scrollbar CSS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TopRatedInCity;