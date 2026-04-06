import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  LayoutDashboard, User, Building2, Calendar, 
  Settings, BarChart3, Star, Search, Plus, 
  Edit3, Trash2, CheckCircle2, ChevronRight, Lock, Loader2, Filter,
  Upload, PlusCircle, Eye, ShieldCheck
} from "lucide-react";

const BuilderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [showPassModal, setShowPassModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // To track which update was clicked
  const [loading, setLoading] = useState(true);
  
  const [builderData, setBuilderData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({ total: 0, cities: [] });

  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Q&A State
  const [qaList, setQaList] = useState([]);
  const [newQ, setNewQ] = useState({ question: "", answer: "" });
  const [showAllQa, setShowAllQa] = useState(false);

  // Price Formatter
  const formatPrice = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
    if (num >= 100000) return (num / 100000).toFixed(2) + " Lakh";
    return num.toLocaleString('en-IN');
  };

  // Subtype Extractor
  const getSubtypes = (p) => {
    let types = [];
    if (p.propertyType?.toLowerCase() === "residential") {
      types = p.residentialDetails?.propertySubTypes || [];
    } else if (p.propertyType?.toLowerCase() === "commercial") {
      types = p.commercialDetails?.propertySubTypes || [];
    } else if (p.propertyType?.toLowerCase() === "plots") {
      types = p.plotDetails?.plotTypes || [];
    }
    return types.length > 0 ? types : ["N/A"];
  };

  useEffect(() => {
    const getBuilderId = () => {
      const userDataRaw = localStorage.getItem("user");
      const adminIdRaw = localStorage.getItem("adminId");
      const builderIdRaw = localStorage.getItem("builderId");
      if (userDataRaw) {
        try {
          const userObj = JSON.parse(userDataRaw);
          return userObj._id || userObj.id;
        } catch (e) { return null; }
      }
      return (adminIdRaw || builderIdRaw)?.replace(/"/g, '');
    };

    const builderId = getBuilderId();

    const fetchData = async () => {
      if (!builderId) return;
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/property/builder/${builderId}`);
        const data = res.data.data || res.data || [];
        setProperties(data);

        if (data.length > 0) {
          const bData = data[0].builder;
          setBuilderData(bData);
          setQaList(bData.faqs || []);
          const uniqueCities = [...new Set(data.map(p => p.location?.city || p.city))];
          setStats({ total: data.length, cities: uniqueCities });
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleActionWithPassword = (actionType) => {
    setPendingAction(actionType);
    setShowPassModal(true);
  };

  const handleConfirmPassword = () => {
    // Password check logic here
    console.log("Action Authorized:", pendingAction);
    setShowPassModal(false);
    // Proceed with the actual update...
  };

  const handleAddQa = () => {
    if(newQ.question && newQ.answer) {
      setQaList([newQ, ...qaList]);
      setNewQ({ question: "", answer: "" });
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchInput.trim());
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await axios.delete(`http://localhost:5000/api/property/${id}`);
        setProperties(properties.filter(p => p._id !== id));
      } catch (err) {
        alert("Failed to delete property.");
      }
    }
  };

  const filteredProperties = properties.filter(p => {
    const city = (p.location?.city || p.city || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    const term = activeSearch.toLowerCase();
    return (title.includes(term) || city.includes(term)) &&
           (typeFilter === "All" || p.propertyType?.toLowerCase() === typeFilter.toLowerCase()) &&
           (statusFilter === "All" || p.status?.toLowerCase() === statusFilter.toLowerCase());
  });

  const suggestions = properties.filter(p => {
    const city = (p.location?.city || p.city || "").toLowerCase();
    const title = (p.title || "").toLowerCase();
    const input = searchInput.toLowerCase();
    return title.includes(input) || city.includes(input);
  });

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Aapl Ghar Control Panel Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-8 border-b border-slate-50">
          <h1 className="text-2xl font-black tracking-tighter italic">AAPL <span className="text-blue-600">GHAR</span></h1>
          <p className="text-[10px] text-slate-400 font-black uppercase mt-1 tracking-[0.2em]">Partner Dashboard</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
          <MenuLink icon={<Building2 size={20}/>} label="Properties" active={activeTab === "properties"} onClick={() => setActiveTab("properties")} />
          <MenuLink icon={<User size={20}/>} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
          <MenuLink icon={<Calendar size={20}/>} label="Appointments" active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")} />
          <MenuLink icon={<Settings size={20}/>} label="Add Services" active={activeTab === "services"} onClick={() => setActiveTab("services")} />
          <MenuLink icon={<BarChart3 size={20}/>} label="Statistics" active={activeTab === "statistics"} onClick={() => setActiveTab("statistics")} />
          <MenuLink icon={<Star size={20}/>} label="Reviews" active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
        </nav>
        <div className="p-6 border-t bg-slate-50/50">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-3 text-rose-500 font-black uppercase text-[11px] tracking-widest hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100">
              Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-10 flex justify-between items-center shrink-0 z-10">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tighter italic">Control <span className="text-blue-600">Panel</span></h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified Partner</span>
              <span className="text-slate-300 text-xs font-light">/</span>
              <span className="text-slate-500 text-[11px] font-black uppercase tracking-tight">{builderData?.companyName || "Aapl Ghar Builder"}</span>
            </div>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95 group">
            <Plus size={18} strokeWidth={3} className="group-hover:rotate-90 transition-transform" /> 
            <span className="font-black text-xs uppercase tracking-widest">Add Property</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-10 no-scrollbar bg-gradient-to-br from-slate-50 to-white">
          
          {/* PROPERTIES TAB (SAME LOGIC) */}
          {activeTab === "properties" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="md:col-span-2 relative">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-3.5 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        value={searchInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {setSearchInput(e.target.value); setShowSuggestions(true); if(e.target.value==="") setActiveSearch("");}}
                        placeholder="Search title or city..." 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none text-sm font-medium"
                      />
                    </div>
                    <button onClick={handleSearch} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest">Search</button>
                  </div>
                  {showSuggestions && searchInput.length > 0 && (
                    <div className="absolute top-full left-0 w-full bg-white mt-2 rounded-2xl shadow-2xl border z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((p) => (
                        <div key={p._id} onClick={() => {setSearchInput(p.title); setActiveSearch(p.title); setShowSuggestions(false);}} className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                          <p className="text-xs font-black uppercase">{p.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{p.location?.city || p.city}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase">
                  <option value="All">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Plots">Plots</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase">
                  <option value="All">All Status</option>
                  <option value="ready">Ready</option>
                  <option value="under_construction">Under Construction</option>
                </select>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="grid grid-cols-8 p-6 bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                  <div className="col-span-3">Property Details</div>
                  <div>Location</div>
                  <div>Status</div>
                  <div className="text-center">Created</div>
                  <div className="text-center">Subtype</div>
                  <div className="text-right">Manage</div>
                </div>
                <div className="divide-y divide-slate-50">
                  {filteredProperties.length > 0 ? filteredProperties.map((p) => (
                    <div key={p._id} onClick={() => navigate(`/property/${p._id}`)} className="grid grid-cols-8 items-center p-6 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                      <div className="col-span-3 flex items-center gap-4">
                        <img src={p.images?.coverImage || "https://via.placeholder.com/100"} className="w-12 h-12 rounded-xl object-cover shadow-sm border" alt="p" />
                        <div className="overflow-hidden">
                          <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tighter truncate text-sm leading-tight">{p.title}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">₹{formatPrice(p.price?.starting)} - ₹{formatPrice(p.price?.upto)}</p>
                        </div>
                      </div>
                      <div className="text-[10px] font-black uppercase italic">{p.location?.city || p.city}</div>
                      <div><span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${p.status==='ready'?'bg-green-100 text-green-600':'bg-orange-100 text-orange-600'}`}>{p.status?.replace('_',' ')}</span></div>
                      <div className="text-[9px] font-bold text-slate-400 text-center">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</div>
                      <div className="flex flex-col items-center gap-1">
                        {getSubtypes(p).map((type, idx) => (
                          <span key={idx} className="text-[8px] font-black text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50">{type}</span>
                        ))}
                      </div>
                      <div className="flex justify-end gap-1">
                        <button onClick={(e) => {e.stopPropagation(); navigate(`/edit-property/${p._id}`)}} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg"><Edit3 size={14}/></button>
                        <button onClick={(e) => handleDelete(e, p._id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  )) : <div className="p-20 text-center text-slate-400 font-black uppercase text-xs">No Properties Found</div>}
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB (NEW LOGIC) */}
          {activeTab === "profile" && (
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-600 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg"><User size={28} /></div>
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Professional <span className="text-blue-600">Identity</span></h3>
                  </div>
                  <button onClick={() => handleActionWithPassword("ALL")} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">Update All Information</button>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <ProfileInput label="Company Name" value={builderData?.companyName} onUpdate={() => handleActionWithPassword("companyName")} />
                  <ProfileInput label="Owner Name" value={builderData?.name} onUpdate={() => handleActionWithPassword("name")} />
                  <div className="col-span-2"><ProfileInput label="Registered Address" value={builderData?.address} onUpdate={() => handleActionWithPassword("address")} /></div>
                  <ProfileInput label="Contact Number" value={builderData?.phone} onUpdate={() => handleActionWithPassword("phone")} />
                  <ProfileInput label="Professional Email" value={builderData?.email} onUpdate={() => handleActionWithPassword("email")} />
                  
                  {/* Since & Security */}
                  <ProfileInput label="Since (Working Since)" value={builderData?.since || "2015"} onUpdate={() => handleActionWithPassword("since")} />
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security</label>
                    <button onClick={() => setShowPassModal(true)} className="flex items-center justify-between w-full p-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all">
                      <span>Change Account Password</span>
                      <ShieldCheck size={16} />
                    </button>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">About Firm</label>
                    <div className="relative group">
                      <textarea className="w-full p-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none min-h-[120px] text-sm font-medium" defaultValue="Building trust and quality homes..."></textarea>
                      <button onClick={() => handleActionWithPassword("about")} className="absolute top-4 right-4 p-2 bg-white shadow-sm border rounded-xl text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><Edit3 size={14}/></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cover Image Section */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-4">Brand Presence (Cover Image)</label>
                <div className="relative w-full h-48 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group overflow-hidden">
                  {builderData?.coverImage ? (
                    <img src={builderData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                  ) : (
                    <>
                      <Upload className="text-slate-300 mb-2" size={32} />
                      <p className="text-[10px] font-black text-slate-400 uppercase">Click to upload cover image</p>
                    </>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                    <button className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black uppercase text-[10px]">Update Image</button>
                  </div>
                </div>
              </div>

              {/* Cities & Inventory Slider */}
              <div className="grid grid-cols-2 gap-8">
                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work in Cities</label>
                    <button className="text-blue-600"><PlusCircle size={20}/></button>
                  </div>
                  <div className="flex-1 max-h-40 overflow-y-auto pr-2 no-scrollbar grid grid-cols-3 gap-3">
                    {stats.cities.map((city, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-600 truncate">{city}</p>
                      </div>
                    ))}
                    {stats.cities.length === 0 && <p className="col-span-3 text-center py-10 text-slate-300 uppercase font-black text-[10px]">No cities added</p>}
                  </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-6">Live Inventory Stats</label>
                  <div className="flex items-center gap-6">
                    <div className="flex-1 bg-blue-50 p-6 rounded-[2rem] text-center border border-blue-100">
                      <p className="text-3xl font-black text-blue-600 italic">{stats.total}</p>
                      <p className="text-[9px] font-black uppercase text-blue-400 mt-1">Total Projects</p>
                    </div>
                    <div className="flex-1 bg-slate-50 p-6 rounded-[2rem] text-center border border-slate-100">
                      <p className="text-3xl font-black text-slate-800 italic">4.8</p>
                      <p className="text-[9px] font-black uppercase text-slate-400 mt-1">Avg Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q&A Section */}
              <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10">
                <div className="flex justify-between items-center mb-8">
                  <h4 className="text-sm font-black uppercase tracking-widest italic text-slate-900">Builder <span className="text-blue-600">Q&A</span></h4>
                  <button onClick={() => setShowAllQa(!showAllQa)} className="flex items-center gap-2 text-blue-600 font-black uppercase text-[10px] tracking-widest">
                    <Eye size={16}/> {showAllQa ? "Hide List" : "View All Questions"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <input value={newQ.question} onChange={e => setNewQ({...newQ, question: e.target.value})} placeholder="Write a common question..." className="p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" />
                  <div className="flex gap-2">
                    <input value={newQ.answer} onChange={e => setNewQ({...newQ, answer: e.target.value})} placeholder="Provide the answer..." className="flex-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-sm font-medium" />
                    <button onClick={handleAddQa} className="bg-slate-900 text-white px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all">Add</button>
                  </div>
                </div>

                <div className="space-y-4">
                  {!showAllQa && qaList.length > 0 && (
                    <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-3xl">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-2">Latest Q&A</p>
                      <p className="text-sm font-bold text-slate-800">Q: {qaList[0].question}</p>
                      <p className="text-sm text-slate-500 mt-1">A: {qaList[0].answer}</p>
                    </div>
                  )}
                  {showAllQa && qaList.map((qa, i) => (
                    <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex justify-between items-start">
                      <div>
                        <p className="text-sm font-bold text-slate-800">Q: {qa.question}</p>
                        <p className="text-sm text-slate-500 mt-1">A: {qa.answer}</p>
                      </div>
                      <button className="text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  {qaList.length === 0 && <p className="text-center py-10 text-slate-300 font-black uppercase text-[10px]">No questions added yet</p>}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* PASSWORD MODAL */}
      {showPassModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center mb-6 shadow-inner"><Lock size={28} /></div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic">Secure <span className="text-blue-600">Verification</span></h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Enter your password to authorize changes</p>
            </div>
            <input type="password" placeholder="••••••••" className="w-full mt-8 p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-center font-bold tracking-widest" />
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button onClick={() => setShowPassModal(false)} className="py-4 px-4 font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100">Cancel</button>
              <button onClick={handleConfirmPassword} className="py-4 px-4 font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

// Menu Link Component
const MenuLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
    <span>{icon}</span>
    <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
    {active && <ChevronRight className="ml-auto opacity-50" size={14} strokeWidth={3} />}
  </button>
);

// Profile Input with Individual Update Button
const ProfileInput = ({ label, value, onUpdate }) => (
  <div className="flex flex-col gap-2 relative group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        readOnly 
        value={value || "Not Set"} 
        className="w-full p-4 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none text-slate-700 font-bold text-sm tracking-tight pr-14" 
      />
      <button 
        onClick={onUpdate} 
        className="absolute right-2 top-2 p-2 bg-white text-blue-600 rounded-xl shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white"
        title={`Update ${label}`}
      >
        <Edit3 size={14} />
      </button>
    </div>
  </div>
);

export default BuilderDashboard;