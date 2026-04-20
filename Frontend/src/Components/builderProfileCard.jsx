import React from 'react';
import { useNavigate } from 'react-router-dom';
import BuilderAverageRating from './BuilderAverageRating';
import BuilderCitiesCount from './BuilderCitiesCount';

const BuilderProfileCard = ({ builder }) => {
  const navigate = useNavigate();
  
  const currentYear = new Date().getFullYear();
  const experienceYears = currentYear - parseInt(builder.since || currentYear);

  const handleCardClick = () => {
    navigate(`/builder-info/${builder._id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="w-[380px] h-[280px] bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col group relative"
    >
      {/* Top Section: Image & Basic Info */}
      <div className="flex p-5 gap-4 h-[120px]">
        {/* Mothi Cover Image */}
        <div className="w-28 h-full flex-shrink-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 p-1">
          <img 
            src={builder.coverImage || 'https://via.placeholder.com/150'} 
            alt={builder.companyName}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Company Info */}
        <div className="flex-1 flex flex-col justify-center overflow-hidden">
          <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter leading-tight truncate">
            {builder.companyName || "Premier Developers"}
          </h3>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            ESTD. {builder.since || "N/A"}
          </p>
          
          {/* Stats Bar */}
          <div className="flex gap-3 mt-3">
            <div>
              <p className="text-sm font-black text-blue-600 leading-none">{experienceYears}+</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Exp. Yrs</p>
            </div>
            <div className="w-[1px] h-6 bg-slate-100"></div>
            <div>
              <p className="text-sm font-black text-emerald-600 leading-none">{builder.totalProjects || 0}</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Projects</p>
            </div>
            <div className="w-[1px] h-6 bg-slate-100"></div>
            <div>
              <p className="text-sm font-black text-orange-600 leading-none">
                {/* Ensure builder._id is definitely defined here */}
                {builder._id ? <BuilderCitiesCount builderId={builder._id} /> : 0}
              </p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Cities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: About (With Vertical Scroll) */}
      <div className="px-5 flex-1 overflow-hidden">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-1">About Builder</p>
        <div className="h-[65px] overflow-y-auto pr-2 custom-scrollbar text-xs text-slate-600 leading-relaxed font-medium italic">
          {builder.about || "This builder is one of the leading real estate developers in the region, known for quality and trust."}
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-5 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between mt-auto">
        <BuilderAverageRating builderId={builder._id} />
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/builder-projects/${builder._id}`);
          }}
          className="bg-slate-900 hover:bg-blue-600 text-white text-[10px] font-black py-2.5 px-5 rounded-full transition-all shadow-lg active:scale-95 uppercase tracking-widest"
        >
          View All Projects
        </button>
      </div>

      {/* Scrollbar CSS logic inline */}
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default BuilderProfileCard;