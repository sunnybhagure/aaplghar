import React, { useState, useMemo } from "react";
import { Send, Bot, Sparkles, Loader2, X, CheckCircle2, TrendingUp, Stars } from "lucide-react";
import axios from "axios";
import { PropertyCard } from "./PropertyCard";

export default function AIChatBox({ onClose }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);

  
  const sortedResults = useMemo(() => {
    return [...aiResults].sort((a, b) => (b.searchScore || 0) - (a.searchScore || 0));
  }, [aiResults]);

  const handleAISearch = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setAiResults([]);
    try {
      const res = await axios.post("http://localhost:5000/api/ai/search", { prompt: input });
      if (res.data.success) {
        setAiResults(res.data.properties || []);
      }
    } catch (err) {
      console.error("AI Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      {/* Slimmer Container: Max-width 750px for a better chat feel */}
      <div className="w-full max-w-[750px] bg-slate-50 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden flex flex-col h-[85vh] animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 p-5 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-slate-900 font-black text-lg tracking-tight uppercase italic">
                Aapl Ghar <span className="text-blue-600 font-black">AI Guru</span>
              </h3>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">Personalized Property Matcher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-full transition-all">
       <X size={20} />
    </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar bg-slate-50">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={40} />
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest italic animate-pulse">Finding Best Matches...</p>
            </div>
          ) : sortedResults.length > 0 ? (
            <div className="space-y-12 pb-10">
              {sortedResults.map((p, index) => (
                <div key={p._id} className="animate-in slide-in-from-bottom-10 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                  
                  {/* 1. AI Analysis Insight (First) */}
                  <div className="bg-slate-900 rounded-[2rem] p-6 text-white mb-4 relative overflow-hidden shadow-xl border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Expert Recommendation</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-600/20 px-3 py-1 rounded-full">
                        <TrendingUp size={12} className="text-blue-400" />
                        <span className="text-xs font-black text-blue-400">{p.searchScore || 90}% Match</span>
                      </div>
                    </div>

                    <p className="text-sm font-bold italic leading-relaxed text-slate-100 mb-4">
                      "{p.aiDescription || "He property tumchya budget aani lifestyle sathi ekdam best choice aahe."}"
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {p.aiBestFitPoints?.map((point, idx) => (
                        <div key={idx} className="flex gap-2 items-center text-[11px] font-medium text-slate-300">
                          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Property Card (Second) */}
                  <div className="rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-md hover:shadow-xl transition-shadow">
                    <PropertyCard property={p} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Welcome / Empty State */
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="bg-blue-100/50 p-6 rounded-[2.5rem] mb-6">
                <Stars className="text-blue-600" size={40} />
              </div>
              <h4 className="text-slate-900 font-black text-2xl mb-2 tracking-tight">Kasa ghar shodhtaय?</h4>
              <p className="text-slate-400 text-xs font-medium max-w-[280px]">Area, budget kiva amenities type kara, AI tumhala best option shodhnyat madat karel.</p>
            </div>
          )}
        </div>

        {/* Input Field: Centralized & Large */}
        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
          <div className="relative flex items-center group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAISearch()}
              placeholder="Wakad madhye 2BHK flat, budget 80L..."
              className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl py-4 pl-6 pr-14 text-sm font-bold text-slate-700 transition-all outline-none"
            />
            <button 
              onClick={handleAISearch}
              disabled={loading}
              className="absolute right-2 p-3 bg-blue-600 text-white rounded-xl hover:bg-slate-900 transition-all active:scale-90 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}