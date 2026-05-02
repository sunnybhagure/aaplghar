import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "../aap";

const BuilderAverageRating = ({ builderId }) => {
  const [avgRating, setAvgRating] = useState("0.0");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API}/api/reviews/builder/${builderId}`);
        if (res.data.success) {
          const builderReviews = res.data.builderReviews || [];
          const avg = builderReviews.length > 0 ? (builderReviews.reduce((sum, rev) => sum + (rev.rating || 0), 0) / builderReviews.length).toFixed(1) : "0.0";
          setAvgRating(avg);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (builderId) fetchReviews();
  }, [builderId]);

  return (
    <div className="flex flex-col">
      <div className="flex text-orange-400">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={`text-xs ${i < Math.floor(parseFloat(avgRating)) ? 'text-orange-400' : 'text-gray-300'}`}>★</span>
        ))}
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Avg. Rating ({avgRating})</span>
    </div>
  );
};

export default BuilderAverageRating;