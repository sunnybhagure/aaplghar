import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import BuilderProfileCard from './builderProfileCard';
import BuilderCitiesCount from './BuilderCitiesCount';



const TopBuildersInCity = ({ city }) => {
  const [topBuilders, setTopBuilders] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

 useEffect(() => {
  const fetchTopBuilders = async () => {
    if (!city) return;
    try {
      setLoading(true);
      
      // 1. City wise unique builders ghyayche
      const response = await axios.get(`http://localhost:5000/api/property/buildersByCity?city=${city}`);
      const uniqueBuilders = response.data.data || [];

      // 2. Pratyek builder sathi reviews fetch karun average kadhne
      const buildersWithData = await Promise.all(
        uniqueBuilders.map(async (builder) => {
          try {
            const revRes = await axios.get(`http://localhost:5000/api/reviews/builder/${builder._id}`);
            
            // 👉 ITHLI CHUK: Controller 'builderReviews' pathvto, 'data' nahi
            const reviews = revRes.data.builderReviews || []; 
            
            // Same calculation logic as TopRatedInCity
            const avg = reviews.length > 0 
              ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length) 
              : 0;

            return { 
              ...builder, 
              avgRating: Number(avg), // Strict Number conversion
              totalProjects: 0 // (Optional: Add project count logic if needed)
            };
          } catch (err) {
            console.error(`Error for builder ${builder._id}:`, err);
            return { ...builder, avgRating: 0 };
          }
        })
      );

      // --- STRICT DESCENDING SORTING ---
      const sorted = buildersWithData.sort((a, b) => b.avgRating - a.avgRating);

      setTopBuilders([...sorted]); // Use spread to trigger re-render
    } catch (error) {
      console.error("Sorting error in TopBuilders:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchTopBuilders();
}, [city]);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (loading || topBuilders.length === 0) return null;

  return (
    /* mt-24 kadhun mt-4 kela ani mb-20 kadhun mb-4 kela (Space Reduced) */
    <div className="mt-4 mb-4 relative px-4 max-w-[1300px] mx-auto">
      {/* Header - mb-10 kadhun mb-4 kela */}
      <div className="flex items-center justify-between mb-4 px-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <Trophy className="w-5 h-5 text-orange-600 fill-orange-600" />
            </div>
            <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">
              Top Rated Builders in {city}
            </h4>
          </div>
          <p className="text-xs font-medium text-slate-400 ml-12 italic leading-none">
            Handpicked developers with excellence in construction
          </p>
        </div>

        {topBuilders.length > 3 && (
          <div className="flex gap-4">
            <button 
              onClick={() => handleScroll('left')} 
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md hover:bg-slate-900 hover:text-white transition-all hover:-translate-y-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleScroll('right')} 
              className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md hover:bg-slate-900 hover:text-white transition-all hover:-translate-y-1"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Slider Container - py-8 kadhun py-2 kela (Card chi space kami) */}
      <div 
        ref={scrollRef} 
        className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 py-2 scroll-smooth"
      >
        {topBuilders.map((builder) => (
          <div 
            key={builder._id} 
            className="snap-start shrink-0 basis-full md:basis-[calc(50%-16px)] lg:basis-[calc(33.333%-22px)]"
          >
            <BuilderProfileCard builder={builder} />
          </div>
        ))}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default TopBuildersInCity;