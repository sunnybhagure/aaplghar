import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { 
  LayoutDashboard, User, Building2, Calendar, 
  Settings, BarChart3, Star, Search, Plus, 
  Edit3, Trash2, CheckCircle2, ChevronRight, Lock, Loader2, Filter,
  Upload, PlusCircle, Eye, ShieldCheck, X, Check, AlertTriangle, Menu
} from "lucide-react";
import API from "../aap";

const BuilderDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("properties");
  const [showPassModal, setShowPassModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  // New States for Profile Editing
  const [isEditable, setIsEditable] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passError, setPassError] = useState("");

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

  // Cover Image State
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [uploadingCover, setUploadingCover] = useState(false);

const [isPasswordMode, setIsPasswordMode] = useState(false); // Password fields दाखवण्यासाठी
const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });

const [appointments, setAppointments] = useState([]);
const [selectedAppt, setSelectedAppt] = useState(null); // Click केल्यावर detail दाखवण्यासाठी
const [apptFilter, setApptFilter] = useState("today"); // today, tomorrow, week, all
const [reason, setReason] = useState(""); // Cancel/Reschedule साठी

const [showAllHistory, setShowAllHistory] = useState(false);

const [reviewType, setReviewType] = useState("property"); // "property" or "builder"
const [subtypeFilter, setSubtypeFilter] = useState("All");
const [expandedBuilder, setExpandedBuilder] = useState(true);

// 1. Initial state ashi thev (undefined cha error yenar nahi)
const [reviewData, setReviewData] = useState({
    properties: [],
    builderReviews: [],
    stats: { // 'state' ऐवजी 'stats' करा
        totalPropertyReviews: 0,
        avgPropertyRating: "0.0",
        totalBuilderReviews: 0,
        avgBuilderRating: "0.0"
    }
});
const [loadingReviews, setLoadingReviews] = useState(false);

// 1. Reviews Fetch karne (Existing useEffect sarkhech)
useEffect(() => {
    if (activeTab === "reviews") {
        const builderId = getBuilderId();
        if (builderId) {
            const fetchReviews = async () => {
                setLoadingReviews(true);
                try {
                    const res = await axios.get(`${API}/api/reviews/builder/${builderId}`);
                    if (res.data.success) {
                        setReviewData(res.data);
                    }
                } catch (err) {
                    console.error("Reviews fetch error:", err);
                } finally {
                    setLoadingReviews(false);
                }
            };
            fetchReviews();
        }
    }
}, [activeTab]); // activeTab change zalyavar trigger hoil

  // Price Formatter
  const formatPrice = (num) => {
    if (!num || isNaN(num)) return "0";
    if (num >= 10000000) return (num / 10000000).toFixed(2) + " Cr";
    if (num >= 100000) return (num / 100000).toFixed(2) + " Lakh";
    return num.toLocaleString('en-IN');
  };

  const getSubtypes = (p) => {
    let types = [];
    if (p.propertyType?.toLowerCase() === "residential") {
      types = p.residentialDetails?.propertySubTypes || [];
    } else if (p.propertyType?.toLowerCase() === "commercial") {
      types = p.commercialDetails?.propertySubTypes || [];
    } else if (p.propertyType?.toLowerCase() === "plot") {
      types = p.plotDetails?.plotTypes || [];
    }
    return types.length > 0 ? types : ["N/A"];
  };

  const getBuilderId = () => {
    const userDataRaw = localStorage.getItem("user");
    const adminIdRaw = localStorage.getItem("adminId");
    const builderIdRaw = localStorage.getItem("builderId");
    
    // Check in user object first
    if (userDataRaw) {
      try {
        const userObj = JSON.parse(userDataRaw);
        if (userObj._id || userObj.id) return userObj._id || userObj.id;
      } catch (e) { console.error("JSON Parse error"); }
    }
    
    // Check separate IDs
    if (adminIdRaw) return adminIdRaw.replace(/"/g, '');
    if (builderIdRaw) return builderIdRaw.replace(/"/g, '');
    
    return null;
  };

  useEffect(() => {
    const builderId = getBuilderId();
    const fetchData = async () => {
      if (!builderId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/property/builder/${builderId}`);
        const data = res.data.data || res.data || [];
        setProperties(data);

        if (data.length > 0) {
          const bData = data[0].builder;
          setBuilderData(bData);
          setQaList(bData.faqs || []);
          const uniqueCities = [...new Set(data.map(p => p.location?.city || p.city))];
          setStats({ total: data.length, cities: uniqueCities });
        } else {
          // If no properties, fetch builder data directly from admin route if needed
          const adminRes = await axios.get(`${API}/api/admin/adminprofile/${builderId}`);
          if(adminRes.data.success) setBuilderData(adminRes.data.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Load profile data from database when profile tab is opened
  useEffect(() => {
    if (activeTab === "profile") {
      const builderId = getBuilderId();
      if (builderId) {
        axios.get(`${API}/api/admin/adminprofile/${builderId}`)
          .then(res => {
            if (res.data.success) {
              setBuilderData(res.data.data);
              setQaList(res.data.data.faqs || []);
            }
          })
          .catch(err => console.error("Error loading profile:", err));
      }
    }
  }, [activeTab]);

  // Fetch appointments when appointments tab is opened
  useEffect(() => {
    if (activeTab === "appointments") {
      const builderId = getBuilderId();
      if (builderId) {
        axios.get(`${API}/api/appointments/builder/${builderId}`)
          .then(res => {
            setAppointments(res.data || []);
          })
          .catch(err => console.error("Error loading appointments:", err));
      }
    }
  }, [activeTab]);

  // Helper functions for date filtering
  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isTomorrow = (dateStr) => {
    if (!dateStr) return false;
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    return dateStr === tomorrow;
  };

  const isThisWeek = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    const weekFromNow = new Date(Date.now() + 7 * 86400000);
    return date >= today && date <= weekFromNow;
  };

  // Filter appointments based on apptFilter state
  const getFilteredAppointments = (appts) => {
    if (apptFilter === 'all') return appts;
    if (apptFilter === 'today') return appts.filter(a => isToday(a.date));
    if (apptFilter === 'tomorrow') return appts.filter(a => isTomorrow(a.date));
    if (apptFilter === 'week') return appts.filter(a => isThisWeek(a.date));
    if (apptFilter === 'rescheduled') return appts.filter(a => a.status === 'rescheduled');
    return appts;
  };

  // Update Logic
  const handleActionWithPassword = (actionType) => {
    setPendingAction(actionType);
    setShowPassModal(true);
  };

  const handleConfirmPassword = async () => {
    const adminId = getBuilderId();
    setPassError("");
    
    if(!adminId) {
        setPassError("User session not found. Please login again.");
        return;
    }

    try {
      const res = await axios.post("${API}/api/admin/verify-password", {
        userId: adminId,
        password: passwordInput
      });

      if (res.data.success) {
        setIsEditable(true);
        setShowPassModal(false);
        setPasswordInput("");
        setPassError("");
      }
    } catch (err) {
      setPassError(err.response?.data?.message || "Invalid Password");
    }
  };

  const handleSaveAll = async () => {
    try {
      const builderId = getBuilderId();
      await axios.put(`${API}/api/admin/adminprofile/${builderId}`, {
        ...builderData,
        faqs: qaList
      });
      setIsEditable(false);
      
      // Fetch fresh data from database after save
      const freshDataRes = await axios.get(`${API}/api/admin/adminprofile/${builderId}`);
      if (freshDataRes.data.success) {
        setBuilderData(freshDataRes.data.data);
        setQaList(freshDataRes.data.data.faqs || []);
      }
      
      alert("Information Updated Successfully! Data refreshed from database.");
    } catch (err) {
      alert("Error saving data.");
    }
  };

  const handleApptAction = async (apptId, newStatus) => {
  if ((newStatus === 'cancelled' || newStatus === 'rescheduled') && !reason.trim()) {
    alert("Please provide a reason for this action.");
    return;
  }

  try {
    const res = await axios.put(`${API}/api/appointments/${apptId}/builder-update`, {
      status: newStatus,
      actionReason: reason, // Database मध्ये save होईल
      updatedAt: new Date()
    });

    if (res.data) {
      alert(`Appointment marked as ${newStatus}`);
      setReason("");
      setSelectedAppt(null);
      // Refresh appointments list
      const builderId = getBuilderId();
      if (builderId) {
        const refreshRes = await axios.get(`${API}/api/appointments/builder/${builderId}`);
        setAppointments(refreshRes.data || []);
      }
    }
  } catch (err) {
    alert("Error updating appointment status: " + (err.response?.data?.message || err.message));
  }
};

  const markAllRescheduledAsRead = async () => {
    const builderId = getBuilderId();
    if (!builderId) return;

    try {
      const rescheduledAppts = appointments.filter(a => a.status === 'rescheduled' && a.isNewForBuilder);
      for (const appt of rescheduledAppts) {
        await axios.put(`${API}/api/appointments/${appt._id}/mark-read-builder`);
      }
      
      // Refresh appointments
      const refreshRes = await axios.get(`${API}/api/appointments/builder/${builderId}`);
      setAppointments(refreshRes.data || []);
    } catch (err) {
      console.error("Error marking appointments as read:", err);
    }
  };
  
  // Refresh profile data from database
  const handleRefreshProfile = async () => {
    try {
      const builderId = getBuilderId();
      const res = await axios.get(`${API}/api/admin/adminprofile/${builderId}`);
      if (res.data.success) {
        setBuilderData(res.data.data);
        setQaList(res.data.data.faqs || []);
        alert("Profile data refreshed from database!");
      }
    } catch (err) {
      alert("Error refreshing profile data.");
    }
  };

  const handleInputChange = (field, value) => {
    setBuilderData({ ...builderData, [field]: value });
  };

  const handleAddQa = () => {
    if(newQ.question && newQ.answer) {
      setQaList([newQ, ...qaList]);
      setNewQ({ question: "", answer: "" });
    }
  };

 const handleUpdatePassword = async () => {
    const userId = getBuilderId();

    // Basic Validation
    if (!passData.oldPassword || !passData.newPassword) {
        alert("Please fill all password fields.");
        return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
        alert("New passwords do not match!");
        return;
    }

    try {
        const res = await axios.post("${API}/api/admin/change-password", {
            userId: userId,
            oldPassword: passData.oldPassword,
            newPassword: passData.newPassword
        });

        if (res.data.success) {
            alert("Password successfully updated!");
            setIsPasswordMode(false); // Box परत normal करा
            setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" }); // Reset data
        }
    } catch (err) {
        alert(err.response?.data?.message || "Incorrect old password or server error.");
    }
};

  // Update Cover Image
  const handleUploadCoverImage = async () => {
    if (!coverImageFile) {
      alert("Please select an image file");
      return;
    }

    setUploadingCover(true);
    try {
      const builderId = getBuilderId();
      const formData = new FormData();
      formData.append("file", coverImageFile);
      formData.append("builderId", builderId);
      formData.append("builderName", builderData?.companyName || "Builder");

      const res = await axios.post(
        "${API}/api/admin/upload-cover-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );

      if (res.data.success) {
        setBuilderData({ ...builderData, coverImage: res.data.imageUrl });
        setCoverImageFile(null);
        alert("Cover image uploaded successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error uploading cover image.");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please select a valid image file");
        return;
      }
      setCoverImageFile(file);
    }
  };

  // Add Q&A to Database
  const handleAddQaToDB = async () => {
    if (!newQ.question.trim() || !newQ.answer.trim()) {
      alert("Please fill both question and answer");
      return;
    }

    try {
      const builderId = getBuilderId();
      const updatedFaqs = [newQ, ...qaList];
      
      await axios.put(`${API}/api/admin/adminprofile/${builderId}`, {
        faqs: updatedFaqs
      });
      
      // Update local state
      setQaList(updatedFaqs);
      setNewQ({ question: "", answer: "" });
      alert("Q&A added successfully!");
    } catch (err) {
      alert("Error adding Q&A.");
    }
  };

  // Delete Q&A from Database
  const handleDeleteQa = async (index) => {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) {
      return;
    }

    try {
      const builderId = getBuilderId();
      const updatedFaqs = qaList.filter((_, i) => i !== index);
      
      await axios.put(`${API}/api/admin/adminprofile/${builderId}`, {
        faqs: updatedFaqs
      });
      
      // Update local state
      setQaList(updatedFaqs);
      alert("Q&A deleted successfully!");
    } catch (err) {
      alert("Error deleting Q&A.");
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
        await axios.delete(`${API}/api/property/${id}`);
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

// Data extraction with safety checks
// १. आधी पूर्ण reviewData चेक करा
const propertyReviewsRaw = reviewData?.properties || [];
const builderReviewsRaw = reviewData?.builderReviews || [];
const avgBuilderRating = reviewData?.stats?.avgBuilderRating || (builderReviewsRaw.length > 0 ? (builderReviewsRaw.reduce((sum, rev) => sum + (rev.rating || 0), 0) / builderReviewsRaw.length).toFixed(1) : "0.0");

const filteredReviewsList = propertyReviewsRaw.filter(prop => {
  const title = prop?.title?.toLowerCase() || "";
  const city = (prop?.location?.city || prop?.city || "").toLowerCase();
  const term = (activeSearch || "").toLowerCase();
  const normalizedType = (prop.propertyType || prop.property?.propertyType || "").toLowerCase();
  const selectedType = subtypeFilter === "All"
    ? "all"
    : subtypeFilter.toLowerCase() === "plots"
      ? "plot"
      : subtypeFilter.toLowerCase();
  const matchesSubtype = subtypeFilter === "All" || normalizedType === selectedType;
  return (title.includes(term) || city.includes(term)) && matchesSubtype;
});

  const handleReviewSearch = (value) => {
    setActiveSearch(value);
  };

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
      <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <div className="p-4 md:p-8 border-b border-slate-50">
          <h1 className="text-lg md:text-2xl font-black tracking-tighter italic">AAPL <span className="text-blue-600">GHAR</span></h1>
          <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase mt-1 tracking-[0.2em]">Partner Dashboard</p>
        </div>
        <nav className="flex-1 p-2 md:p-4 space-y-2 overflow-y-auto no-scrollbar">
          <MenuLink icon={<Building2 size={20}/>} label="Properties" active={activeTab === "properties"} onClick={() => setActiveTab("properties")} />
          <MenuLink icon={<User size={20}/>} label="Profile" active={activeTab === "profile"} onClick={() => setActiveTab("profile")} />
          <MenuLink icon={<Calendar size={20}/>} label="Appointments" active={activeTab === "appointments"} onClick={() => setActiveTab("appointments")} />
          <MenuLink icon={<Settings size={20}/>} label="Add Services" active={activeTab === "services"} onClick={() => setActiveTab("services")} />
          <MenuLink icon={<BarChart3 size={20}/>} label="Statistics" active={activeTab === "statistics"} onClick={() => setActiveTab("statistics")} />
          <MenuLink icon={<Star size={20}/>} label="Reviews" active={activeTab === "reviews"} onClick={() => setActiveTab("reviews")} />
        </nav>
        <div className="p-4 md:p-6 border-t bg-slate-50/50">
          <button className="w-full flex items-center justify-center gap-3 px-4 py-2 md:py-3 text-rose-500 font-black uppercase text-[9px] md:text-[11px] tracking-widest hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100">
              Logout
          </button>
        </div>
      </aside>

      {/* MOBILE MENU OVERLAY */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div onClick={() => setShowMobileMenu(false)} className="absolute inset-0 bg-black/50"></div>
          
          {/* Mobile Menu Panel */}
          <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl flex flex-col">
            <div className="p-4 border-b border-slate-50">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-lg font-black tracking-tighter italic">AAPL <span className="text-blue-600">GHAR</span></h1>
                <button onClick={() => setShowMobileMenu(false)} className="p-1">
                  <X size={20} className="text-slate-600" />
                </button>
              </div>
              <p className="text-[8px] text-slate-400 font-black uppercase tracking-[0.2em]">Partner Dashboard</p>
            </div>
            
            <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
              <MobileMenuLink icon={<Building2 size={18}/>} label="Properties" active={activeTab === "properties"} onClick={() => {setActiveTab("properties"); setShowMobileMenu(false);}} />
              <MobileMenuLink icon={<User size={18}/>} label="Profile" active={activeTab === "profile"} onClick={() => {setActiveTab("profile"); setShowMobileMenu(false);}} />
              <MobileMenuLink icon={<Calendar size={18}/>} label="Appointments" active={activeTab === "appointments"} onClick={() => {setActiveTab("appointments"); setShowMobileMenu(false);}} />
              <MobileMenuLink icon={<Settings size={18}/>} label="Add Services" active={activeTab === "services"} onClick={() => {setActiveTab("services"); setShowMobileMenu(false);}} />
              <MobileMenuLink icon={<BarChart3 size={18}/>} label="Statistics" active={activeTab === "statistics"} onClick={() => {setActiveTab("statistics"); setShowMobileMenu(false);}} />
              <MobileMenuLink icon={<Star size={18}/>} label="Reviews" active={activeTab === "reviews"} onClick={() => {setActiveTab("reviews"); setShowMobileMenu(false);}} />
            </nav>
            
            <div className="p-4 border-t bg-slate-50/50">
              <button className="w-full flex items-center justify-center gap-3 px-4 py-2 text-rose-500 font-black uppercase text-[9px] tracking-widest hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 md:h-24 bg-white/80 backdrop-blur-md border-b border-slate-100 px-3 md:px-10 flex justify-between items-center shrink-0 z-10 gap-2">
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-all flex-shrink-0">
            <Menu size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            {builderData?.coverImage ? (
                <img 
                    src={builderData.coverImage} 
                    className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover shadow-sm border border-slate-100 flex-shrink-0" 
                    alt="Builder Profile" 
                />
            ) : (
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-slate-100 flex items-center justify-center border border-slate-100 flex-shrink-0">
                    <User size={16} className="md:block text-slate-400" />
                </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm md:text-xl font-black uppercase tracking-tighter italic leading-none">Control <span className="text-blue-600">Panel</span></h2>
              <div className="hidden md:flex items-center gap-2 mt-1">
                <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Verified Partner</span>
                <span className="text-slate-300 text-xs font-light">/</span>
                <span className="text-slate-500 text-[11px] font-black uppercase tracking-tight truncate max-w-[150px]">{builderData?.companyName || "Aapl Ghar Builder"}</span>
              </div>
            </div>
          </div>
          <button onClick={() => navigate("/add-property")} className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-6 py-2 md:py-3 rounded-lg md:rounded-2xl flex items-center gap-1 md:gap-2 transition-all shadow-xl shadow-blue-100 active:scale-95 group flex-shrink-0">
            <Plus size={16} className="md:w-[18px] strokeWidth-3 group-hover:rotate-90 transition-transform" /> 
            <span className="font-black text-[10px] md:text-xs uppercase tracking-widest hidden sm:inline">Add Property</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar bg-gradient-to-br from-slate-50 to-white">
          
          {activeTab === "properties" && (
            <div className="space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 bg-white p-3 md:p-5 rounded-xl md:rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="sm:col-span-2 lg:col-span-2 relative">
                  <div className="flex gap-1 md:gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 md:left-4 top-2.5 md:top-3.5 text-slate-300" size={16} />
                      <input 
                        type="text" 
                        value={searchInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => {setSearchInput(e.target.value); setShowSuggestions(true); if(e.target.value==="") setActiveSearch("");}}
                        placeholder="Search title or city..." 
                        className="w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2 md:py-3.5 bg-slate-50/50 border border-slate-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm font-medium"
                      />
                    </div>
                    <button onClick={handleSearch} className="bg-slate-900 text-white px-3 md:px-6 rounded-lg md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest flex-shrink-0">Search</button>
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
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-full p-2 md:p-3.5 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase">
                  <option value="All">All Types</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Plots">Plots</option>
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full p-2 md:p-3.5 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase">
                  <option value="All">All Status</option>
                  <option value="ready">Ready</option>
                  <option value="under_construction">Under Construction</option>
                </select>
              </div>

              <div className="bg-white rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                <div className="grid grid-cols-12 p-3 md:p-6 bg-slate-50/50 border-b text-[7px] sm:text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] whitespace-nowrap min-w-min">
                  <div className="col-span-4">Property Details</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2 text-center">Created</div>
                  <div className="col-span-2 text-center">Subtype</div>
                </div>
                <div className="divide-y divide-slate-50">
                  {filteredProperties.length > 0 ? filteredProperties.map((p) => (
                    <div key={p._id} onClick={() => navigate(`/property/${p._id}`)} className="grid grid-cols-12 items-start md:items-center p-3 md:p-6 hover:bg-blue-50/30 transition-colors cursor-pointer group min-w-min gap-2">
                      <div className="col-span-4 flex items-center gap-2 min-w-0">
                        <img src={p.images?.coverImage || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e2e8f0' width='100' height='100'/%3E%3Ctext x='50%' y='50%' font-size='12' fill='%23999' text-anchor='middle' dy='.3em'%3E No Image%3C/text%3E%3C/svg%3E"} className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover shadow-sm border flex-shrink-0" alt="p" />
                        <div className="overflow-hidden min-w-0">
                          <p className="font-black text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tighter truncate text-[7px] sm:text-[8px] md:text-sm leading-tight">{p.title}</p>
                          <p className="text-[6px] sm:text-[7px] md:text-[9px] text-slate-400 font-bold uppercase mt-0.5 truncate">₹{formatPrice(p.price?.starting)}</p>
                        </div>
                      </div>
                      <div className="col-span-2 text-[7px] sm:text-[8px] md:text-[10px] font-black uppercase italic truncate">{p.location?.city || p.city}</div>
                      <div className="col-span-2"><span className={`text-[6px] sm:text-[7px] md:text-[8px] font-black uppercase px-1 md:px-2 py-1 rounded-md inline-block ${p.status==='ready'?'bg-green-100 text-green-600':'bg-orange-100 text-orange-600'}`}>{p.status?.replace('_',' ')}</span></div>
                      <div className="col-span-2 text-[6px] sm:text-[7px] md:text-[9px] font-bold text-slate-400 text-center">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</div>
                      <div className="col-span-2 flex flex-wrap justify-center gap-0.5">
                        {getSubtypes(p).slice(0,1).map((type, idx) => (
                          <span key={idx} className="text-[6px] font-black text-blue-600 uppercase bg-blue-50 px-1 py-0.5 rounded-md border border-blue-100/50">{type}</span>
                        ))}
                      </div>
                      <div className="col-span-1 flex justify-end gap-0.5">
                        <button onClick={(e) => {e.stopPropagation(); navigate(`/edit-property/${p._id}`)}} className="p-1 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg flex-shrink-0" title="Edit"><Edit3 size={12}/></button>
                      </div>
                      <div className="col-span-1 flex justify-start gap-0.5">
                        <button onClick={(e) => handleDelete(e, p._id)} className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-lg flex-shrink-0" title="Delete"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  )) : <div className="col-span-12 p-20 text-center text-slate-400 font-black uppercase text-xs">No Properties Found</div>}
                </div>
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm p-5 md:p-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 mb-8 md:mb-10">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600 text-white rounded-lg md:rounded-[1.5rem] flex items-center justify-center shadow-lg flex-shrink-0"><User size={20} className="md:w-[28px]" /></div>
                    <h3 className="text-lg md:text-2xl font-black uppercase tracking-tighter italic">Professional <span className="text-blue-600">Identity</span></h3>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full sm:w-auto">
                    <button onClick={handleRefreshProfile} className="bg-slate-600 text-white px-4 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-slate-700 shadow-xl shadow-slate-100 transition-all text-center md:text-left whitespace-nowrap">Refresh Data</button>
                    {!isEditable ? (
                      <button onClick={() => handleActionWithPassword("ALL")} className="bg-blue-600 text-white px-4 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all text-center md:text-left whitespace-nowrap">Update All Information</button>
                    ) : (
                      <button onClick={handleSaveAll} className="bg-green-600 text-white px-4 md:px-8 py-2 md:py-4 rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest hover:bg-green-700 shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-1 md:gap-2 whitespace-nowrap">
                          <CheckCircle2 size={12} className="md:w-[14px]"/> Save Information
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                  <ProfileInput label="Company Name" value={builderData?.companyName} editable={isEditable} onChange={(v) => handleInputChange('companyName', v)} />
                  <ProfileInput label="Owner Name" value={builderData?.name} editable={isEditable} onChange={(v) => handleInputChange('name', v)} />
                  <div className="col-span-2"><ProfileInput label="Registered Address" value={builderData?.companyAddress} editable={isEditable} onChange={(v) => handleInputChange('companyAddress', v)} /></div>
                  <ProfileInput label="Contact Number" value={builderData?.phone} editable={isEditable} onChange={(v) => handleInputChange('phone', v)} />
                  <ProfileInput label="Professional Email" value={builderData?.email} editable={isEditable} onChange={(v) => handleInputChange('email', v)} />
                  <ProfileInput label="Working Since" value={builderData?.since} editable={isEditable} onChange={(v) => handleInputChange('since', v)} />                  {/* Custom Change Password Box - Same style as ProfileInput */}
                  <div className="relative group">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                      Security Settings
                    </label>
                    
                    {!isPasswordMode ? (
                      <div 
                        onClick={() => setIsPasswordMode(true)}
                        className="w-full p-4 md:p-5 bg-slate-50/50 border border-slate-100 rounded-2xl md:rounded-3xl cursor-pointer hover:border-blue-200 hover:bg-white transition-all flex justify-between items-center"
                      >
                        <span className="text-xs md:text-sm font-bold text-slate-800 uppercase tracking-tight italic">Change Account Password</span>
                        <Lock size={14} className="md:w-[16px] text-blue-600 flex-shrink-0" />
                      </div>
                    ) : (
                      <div className="p-4 md:p-6 bg-white border-2 border-blue-100 rounded-xl md:rounded-[2rem] shadow-xl shadow-blue-50 space-y-3 md:space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] md:text-[10px] font-black text-blue-600 uppercase">Update Password</span>
                          <X size={14} className="md:w-[16px] cursor-pointer text-slate-400 hover:text-rose-500" onClick={() => setIsPasswordMode(false)} />
                        </div>
                        
                        <input 
                          type="password" 
                          placeholder="Current Password"
                          className="w-full p-2.5 md:p-3.5 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl text-xs outline-none focus:ring-2 ring-blue-50"
                          value={passData.oldPassword}
                          onChange={(e) => setPassData({...passData, oldPassword: e.target.value})}
                        />
                        <input 
                          type="password" 
                          placeholder="New Password"
                          className="w-full p-2.5 md:p-3.5 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl text-xs outline-none focus:ring-2 ring-blue-50"
                          value={passData.newPassword}
                          onChange={(e) => setPassData({...passData, newPassword: e.target.value})}
                        />
                        <input 
                          type="password" 
                          placeholder="Confirm New Password"
                          className="w-full p-2.5 md:p-3.5 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl text-xs outline-none focus:ring-2 ring-blue-50"
                          value={passData.confirmPassword}
                          onChange={(e) => setPassData({...passData, confirmPassword: e.target.value})}
                        />
                        
                        <button 
                          onClick={handleUpdatePassword}
                          className="w-full bg-blue-600 text-white py-2 md:py-3 rounded-lg md:rounded-xl font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-blue-700 transition-all"
                        >
                          Update Password
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Full Width About Firm Section */}
                <div className="mt-6 md:mt-8">
                  <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">About Firm</label>
                  <textarea 
                      readOnly={!isEditable}
                      onChange={(e) => handleInputChange('about', e.target.value)}
                      className={`w-full p-3 md:p-5 border rounded-lg md:rounded-3xl outline-none min-h-[150px] md:min-h-[200px] text-xs md:text-sm font-medium transition-all ${isEditable ? 'bg-white border-blue-200 ring-4 ring-blue-50' : 'bg-slate-50/50 border-slate-100'}`} 
                      value={builderData?.about || ""}>
                  </textarea>
                </div>
              </div>

              {/* Saved Data Summary */}
              <div className="bg-blue-50/50 rounded-2xl md:rounded-[3rem] border border-blue-100 shadow-sm p-5 md:p-10">
                <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
                  <ShieldCheck size={20} className="md:w-[24px] text-blue-600 flex-shrink-0" />
                  <h4 className="text-sm md:text-lg font-black uppercase tracking-tighter text-blue-900">Verified <span className="text-blue-600">Data Summary</span></h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Company Name</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{builderData?.companyName || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Owner Name</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{builderData?.name || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Contact Number</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{builderData?.phone || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Email</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{builderData?.email || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Since</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 truncate">{builderData?.since || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Role</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 capitalize truncate">{builderData?.role || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100 col-span-1 sm:col-span-2 lg:col-span-1">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Address</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800 line-clamp-2">{builderData?.companyAddress || "N/A"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Cover Image</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800">{builderData?.coverImage ? "✓ Uploaded" : "Not Set"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100 col-span-1 sm:col-span-2 lg:col-span-3">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">About Firm</p>
                    <p className="text-xs md:text-sm text-slate-700 line-clamp-2">{builderData?.about || "No description added"}</p>
                  </div>
                  <div className="bg-white rounded-lg md:rounded-2xl p-3 md:p-4 border border-blue-100 col-span-1 sm:col-span-2 lg:col-span-3">
                    <p className="text-[8px] md:text-[9px] font-black text-blue-600 uppercase mb-1">Total Q&A Saved</p>
                    <p className="text-xs md:text-sm font-bold text-slate-800">{qaList?.length || 0} Questions</p>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm p-5 md:p-10">
                <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block mb-4">Brand Presence (Cover Image)</label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                  {/* Image Preview */}
                  <div className="relative w-full h-40 md:h-48 bg-slate-50 rounded-lg md:rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group overflow-hidden">
                    {builderData?.coverImage ? (
                      <img src={builderData.coverImage} className="w-full h-full object-cover" alt="Cover" />
                    ) : (
                      <>
                        <Upload className="text-slate-300 mb-2" size={24} className="md:w-[32px]" />
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">No cover image</p>
                      </>
                    )}
                  </div>

                  {/* Upload Section */}
                  <div className="flex flex-col gap-3 md:gap-4">
                    <div className="relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        id="cover-image-input"
                      />
                      <label 
                        htmlFor="cover-image-input"
                        className="block w-full h-28 md:h-32 bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg md:rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-all group"
                      >
                        <Upload className="text-blue-400 mb-1 md:mb-2 group-hover:scale-110 transition-transform" size={22} className="md:w-[28px]" />
                        <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase text-center px-2">Click to select image</p>
                        <p className="text-[7px] md:text-[8px] text-blue-400 mt-0.5 md:mt-1">PNG, JPG, WEBP</p>
                      </label>
                    </div>

                    {coverImageFile && (
                      <div className="p-2 md:p-3 bg-green-50 border border-green-200 rounded-lg md:rounded-xl">
                        <p className="text-[8px] md:text-[9px] font-black text-green-600 uppercase truncate">Selected: {coverImageFile.name}</p>
                      </div>
                    )}

                    <button 
                      onClick={handleUploadCoverImage}
                      disabled={uploadingCover || !coverImageFile}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 md:px-6 py-2.5 md:py-4 rounded-lg md:rounded-2xl font-black uppercase text-[8px] md:text-[10px] tracking-widest shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
                    >
                      {uploadingCover ? (
                        <>
                          <Loader2 size={12} className="md:w-[14px] animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={12} className="md:w-[14px]" />
                          <span className="hidden sm:inline">Upload to Cloudinary</span>
                          <span className="sm:hidden">Upload</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats and Cities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm p-5 md:p-10 flex flex-col">
                  <div className="flex justify-between items-center mb-4 md:mb-6">
                    <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Work in Cities</label>
                    <button className="text-blue-600"><PlusCircle size={16} className="md:w-[20px]"/></button>
                  </div>
                  <div className="flex-1 max-h-40 overflow-y-auto pr-2 no-scrollbar grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                    {stats.cities.map((city, i) => (
                      <div key={i} className="p-2 md:p-3 bg-slate-50 rounded-lg md:rounded-xl border border-slate-100 text-center">
                        <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-600 truncate">{city}</p>
                      </div>
                    ))}
                    {stats.cities.length === 0 && <p className="col-span-2 md:col-span-3 text-center py-6 md:py-10 text-slate-300 uppercase font-black text-[9px] md:text-[10px]">No cities added</p>}
                  </div>
                </div>

                <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm p-5 md:p-10">
                  <label className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 md:mb-6">Live Inventory Stats</label>
                  <div className="flex items-center gap-3 md:gap-6">
                    <div className="flex-1 bg-blue-50 p-3 md:p-6 rounded-lg md:rounded-[2rem] text-center border border-blue-100">
                      <p className="text-2xl md:text-3xl font-black text-blue-600 italic">{stats.total}</p>
                      <p className="text-[8px] md:text-[9px] font-black uppercase text-blue-400 mt-1">Total Projects</p>
                    </div>
                    <div className="flex-1 bg-slate-50 p-3 md:p-6 rounded-lg md:rounded-[2rem] text-center border border-slate-100">
                      <p className="text-2xl md:text-3xl font-black text-slate-800 italic">4.8</p>
                      <p className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 mt-1">Avg Rating</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Q&A Section */}
              <div className="bg-white rounded-2xl md:rounded-[3rem] border border-slate-100 shadow-sm p-5 md:p-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-0 mb-6 md:mb-8">
                  <h4 className="text-xs md:text-sm font-black uppercase tracking-widest italic text-slate-900">Builder <span className="text-blue-600">Q&A</span></h4>
                  <button onClick={() => setShowAllQa(!showAllQa)} className="flex items-center gap-1 md:gap-2 text-blue-600 font-black uppercase text-[8px] md:text-[10px] tracking-widest whitespace-nowrap">
                    <Eye size={14} className="md:w-[16px]"/> {showAllQa ? "Hide List" : "View All Questions"}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4 mb-6 md:mb-8">
                  <input 
                    value={newQ.question} 
                    onChange={e => setNewQ({...newQ, question: e.target.value})} 
                    placeholder="Write a common question..." 
                    className="p-2.5 md:p-4 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm font-medium" 
                  />
                  <div className="flex gap-1 md:gap-2">
                    <input 
                      value={newQ.answer} 
                      onChange={e => setNewQ({...newQ, answer: e.target.value})} 
                      placeholder="Provide the answer..." 
                      className="flex-1 p-2.5 md:p-4 bg-slate-50 border border-slate-100 rounded-lg md:rounded-2xl outline-none text-xs md:text-sm font-medium min-w-0" 
                    />
                    <button 
                      onClick={handleAddQaToDB} 
                      className="bg-green-600 hover:bg-green-700 text-white px-3 md:px-6 rounded-lg md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all flex items-center gap-1 md:gap-2 flex-shrink-0"
                    >
                      <Plus size={12} className="md:w-[14px]" />
                      <span className="hidden sm:inline">Add</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {!showAllQa && qaList.length > 0 && (
                    <div className="p-4 md:p-6 bg-blue-50/50 border border-blue-100 rounded-lg md:rounded-3xl">
                      <p className="text-[8px] md:text-[10px] font-black text-blue-600 uppercase mb-2">Latest Q&A</p>
                      <p className="text-xs md:text-sm font-bold text-slate-800">Q: {qaList[0].question}</p>
                      <p className="text-xs md:text-sm text-slate-500 mt-1">A: {qaList[0].answer}</p>
                    </div>
                  )}
                  {showAllQa && qaList.map((qa, i) => (
                    <div key={i} className="p-4 md:p-6 bg-slate-50 border border-slate-100 rounded-lg md:rounded-3xl flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-bold text-slate-800 break-words">Q: {qa.question}</p>
                        <p className="text-xs md:text-sm text-slate-500 mt-1 break-words">A: {qa.answer}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteQa(i)}
                        className="text-rose-400 hover:text-rose-600 p-1 md:p-2 hover:bg-rose-50 rounded-lg md:rounded-xl transition-all flex-shrink-0"
                      >
                        <Trash2 size={14} className="md:w-[16px]"/>
                      </button>
                    </div>
                  ))}
                  {qaList.length === 0 && <p className="text-center py-8 md:py-10 text-slate-300 font-black uppercase text-[9px] md:text-[10px]">No questions added yet</p>}
                </div>
              </div>
            </div>
          )}
          {activeTab === "appointments" && (
            <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 1. TOP STATISTICS CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
                <StatsCard title="Total Appointments" count={appointments.length} icon={<Calendar className="text-blue-600"/>} color="bg-blue-50" />
                <StatsCard title="Today's Bookings" count={appointments.filter(a => isToday(a.date)).length} icon={<CheckCircle2 className="text-emerald-600"/>} color="bg-emerald-50" />
                <StatsCard title="Tomorrow" count={appointments.filter(a => isTomorrow(a.date)).length} icon={<Loader2 className="text-amber-600"/>} color="bg-amber-50" />
                <StatsCard 
                  title="Rescheduled" 
                  count={appointments.filter(a => a.status === 'rescheduled' && a.isNewForBuilder).length} 
                  icon={<AlertTriangle className="text-orange-600"/>} 
                  color="bg-orange-50"
                  hasNotification={appointments.filter(a => a.status === 'rescheduled' && a.isNewForBuilder).length > 0}
                />
              </div>

              {/* 2. FILTERS & SEARCH */}
              <div className="flex flex-wrap gap-2 md:gap-3 bg-white p-3 md:p-4 rounded-lg md:rounded-[2rem] border border-slate-100 shadow-sm overflow-x-auto">
                {['all', 'today', 'tomorrow', 'week', 'rescheduled'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setApptFilter(f)}
                    className={`px-3 md:px-6 py-1.5 md:py-2.5 rounded-lg md:rounded-xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all flex-shrink-0 ${apptFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {f === 'all' ? 'All' : f === 'rescheduled' ? 'Rescheduled' : `${f.charAt(0).toUpperCase() + f.slice(1)}`}
                  </button>
                ))}
              </div>

              {/* 3. APPOINTMENT LIST CONTAINER */}
              <div className="bg-white rounded-xl md:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                
                {/* SECTION A: NEW RESCHEDULE REQUESTS (Urgent) */}
                {appointments.filter(a => a.status === 'rescheduled' && a.isNewForBuilder).length > 0 && (
                  <>
                    <div className="p-6 border-b bg-orange-50/30 flex justify-between items-center">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-orange-600 flex items-center gap-2">
                        <AlertTriangle size={14} />
                        New Reschedule Requests ({appointments.filter(a => a.status === 'rescheduled' && a.isNewForBuilder).length})
                      </h4>
                      <button 
                        onClick={() => markAllRescheduledAsRead()}
                        className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700"
                      >
                        Mark All Read
                      </button>
                    </div>
                    <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto no-scrollbar">
                      {appointments.filter(a => a.status === 'rescheduled' && a.isNewForBuilder).map((appt) => (
                        <AppointmentItem 
                          key={appt._id} 
                          appt={appt} 
                          isOpen={selectedAppt === appt._id}
                          onClick={() => setSelectedAppt(selectedAppt === appt._id ? null : appt._id)}
                          onAction={handleApptAction}
                          reason={reason}
                          setReason={setReason}
                          isRescheduled={true}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* SECTION B: PENDING, CONFIRMED & ACTIVE APPOINTMENTS */}
                <div className="p-6 border-b bg-slate-50/30 flex justify-between items-center">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500 italic">
                    Active Appointments (Pending & Confirmed)
                  </h4>
                </div>

                <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto no-scrollbar">
                  {getFilteredAppointments(appointments)
                    .filter(a => (['pending', 'confirmed'].includes(a.status) || (a.status === 'rescheduled' && !a.isNewForBuilder)))
                    .length > 0 ? (
                      getFilteredAppointments(appointments)
                        .filter(a => (['pending', 'confirmed'].includes(a.status) || (a.status === 'rescheduled' && !a.isNewForBuilder)))
                        .map((appt) => (
                          <AppointmentItem 
                            key={appt._id} 
                            appt={appt} 
                            isOpen={selectedAppt === appt._id}
                            onClick={() => setSelectedAppt(selectedAppt === appt._id ? null : appt._id)}
                            onAction={handleApptAction}
                            reason={reason}
                            setReason={setReason}
                            isRescheduled={appt.status === 'rescheduled'}
                          />
                        ))
                    ) : (
                      <div className="p-10 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                        No active appointments found
                      </div>
                    )}
                </div>

                {/* SECTION C: HISTORY (COMPLETED & CANCELLED) */}
                <div className="p-6 border-t border-b bg-slate-50/20 flex justify-between items-center mt-4 shadow-inner">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    History (Completed & Cancelled)
                  </h4>
                </div>

                <div className="divide-y divide-slate-50 bg-slate-50/5">
                  {getFilteredAppointments(appointments)
                    .filter(a => ['completed', 'cancelled'].includes(a.status))
                    .length > 0 ? (
                      getFilteredAppointments(appointments)
                        .filter(a => ['completed', 'cancelled'].includes(a.status))
                        .map((appt) => (
                          <AppointmentItem 
                            key={appt._id} 
                            appt={appt} 
                            isOpen={selectedAppt === appt._id}
                            onClick={() => setSelectedAppt(selectedAppt === appt._id ? null : appt._id)}
                            isCompact={false}
                            isHistory={true} 
                          />
                        ))
                    ) : (
                      <div className="p-10 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest italic">
                        History is empty
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
         {activeTab === "reviews" && (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
    
    {/* १. STATISTICS CARDS */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      <div 
        onClick={() => setReviewType("property")}
        className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer shadow-sm ${reviewType === "property" ? 'border-blue-600 bg-white ring-4 ring-blue-50' : 'border-slate-100 bg-slate-50/50 hover:border-blue-200'}`}
      >
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Property Reviews</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black italic text-slate-900">{reviewData?.stats?.totalPropertyReviews ?? propertyReviewsRaw.reduce((count, prop) => count + (prop.reviews?.length || 0), 0)}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Listed</span>
        </div>
      </div>

      <div 
        onClick={() => setReviewType("builder")}
        className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer shadow-sm ${reviewType === "builder" ? 'border-blue-600 bg-white ring-4 ring-blue-50' : 'border-slate-100 bg-slate-50/50 hover:border-blue-200'}`}
      >
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Builder Reviews</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-black italic text-slate-900">{builderReviewsRaw.length}</h3>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
        </div>
      </div>

      <div className="p-6 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Avg. Property Rating</p>
        <div className="flex items-center gap-2">
          <h3 className="text-3xl font-black italic text-yellow-500">{reviewData?.stats?.avgPropertyRating || "0.0"}</h3>
          <Star size={20} className="fill-yellow-500 text-yellow-500" />
        </div>
      </div>

      <div className="p-6 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Feedback</p>
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-3xl font-black italic text-blue-600">{avgBuilderRating}</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Avg Builder Rating</p>
          </div>
          <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
            {reviewData?.stats?.totalBuilderReviews || builderReviewsRaw.length || 0} Reviews
          </div>
        </div>
      </div>
    </div>

    {/* २. SEARCH & FILTERS (फक्त Property साठी) */}
    {reviewType === "property" && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 text-slate-300" size={18} />
          <input 
            type="text" 
            placeholder="Search property reviews..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50/50 border border-slate-100 rounded-2xl outline-none text-sm font-medium focus:ring-2 ring-blue-50"
            onChange={(e) => handleReviewSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["All", "Residential", "Commercial", "Plot"].map((type) => (
            <button 
              key={type}
              onClick={() => setSubtypeFilter(type)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${subtypeFilter === type ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    )}

    {/* ३. DATA LIST AREA */}
    <div className="space-y-4">
      {loadingReviews ? (
        <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>
      ) : reviewType === "property" ? (
        filteredReviewsList.length > 0 ? (
          filteredReviewsList.map((prop) => {
            const avgRating = prop.reviews.length > 0 ? (prop.reviews.reduce((sum, r) => sum + r.rating, 0) / prop.reviews.length).toFixed(1) : "0.0";
            return (
            <div key={prop._id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm mb-4">
              <div className="p-6 flex justify-between items-center bg-slate-50/30 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-200 rounded-2xl flex items-center justify-center">
                    <Building2 className="text-slate-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < Math.floor(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-yellow-600">{avgRating}</span>
                    </div>
                    <h4 className="font-black text-slate-800 uppercase italic tracking-tighter">{prop.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{prop.location?.city || prop.city}</p>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                  {prop.reviews?.length || 0} Reviews
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                <div className="max-h-[500px] overflow-y-auto pr-2">
                  <div className="space-y-3 md:space-y-4">
                    {prop.reviews && prop.reviews.length > 0 ? (
                        prop.reviews.map((rev, idx) => (
                            <div key={idx} className="p-4 md:p-5 bg-slate-50/50 rounded-xl md:rounded-2xl border border-slate-100 hover:shadow-md transition-all">
                              <div className="flex justify-between items-start gap-3 mb-2">
                                <div className="flex gap-0.5">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} className={i < rev.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                                  ))}
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold whitespace-nowrap">{rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}</p>
                              </div>
                              <p className="text-xs md:text-sm text-slate-700 italic mb-3 leading-relaxed">"{rev.comment || rev.message || "No comment"}"</p>
                              <p className="text-[9px] md:text-[10px] font-black text-slate-900 uppercase tracking-tight">— {rev.user?.name || rev.username || "Anonymous"}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-[10px] text-slate-400 italic p-8 text-center">No specific reviews for this property.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })
        ) : (
          <div className="p-20 text-center bg-white rounded-[2.5rem] border border-dashed text-slate-400 font-bold uppercase italic">
            No properties found matching your search.
          </div>
        )
      ) : (
        /* BUILDER REVIEWS GRID */
        <div className="w-full">
  {/* Header Section */}
  <div 
    className="p-6 flex justify-between items-center bg-slate-50/30 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-all rounded-t-2xl"
    onClick={() => setExpandedBuilder(!expandedBuilder)}
  >
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
        <ShieldCheck className="text-blue-600" />
      </div>
      <div>
        <h4 className="font-black text-slate-800 uppercase italic tracking-tighter">Builder Feedback</h4>
        <p className="text-[10px] font-bold text-slate-400 uppercase">Direct reviews from users</p>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      <div className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
        {builderReviewsRaw.length} Reviews
      </div>
      <ChevronRight className={`text-slate-400 transition-transform ${expandedBuilder ? 'rotate-90' : ''}`} size={16} />
    </div>
  </div>

  {/* Reviews Vertical Section - Show 3 reviews with scrollbar for more */}
  {expandedBuilder && (
    <div className="p-4 md:p-6 bg-white border border-t-0 border-slate-100 rounded-b-2xl">
      {/* Vertical Scrollable Container - Max 3 reviews visible */}
      <div className="max-h-[750px] overflow-y-auto pr-2">
        <div className="space-y-3 md:space-y-4">
          {builderReviewsRaw.length > 0 ? (
            builderReviewsRaw.map((rev, idx) => (
              <div 
                key={idx} 
                className="w-full bg-slate-50 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 md:h-10 md:w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xs flex-shrink-0">
                      {(rev.user?.name || rev.username || "U").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-900 truncate">
                        {rev.user?.name || rev.username || "Anonymous"}
                      </p>
                      <p className="text-[8px] md:text-[9px] font-bold text-slate-400">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < rev.rating ? "fill-blue-600 text-blue-600" : "text-slate-200"} 
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-700 font-medium leading-relaxed italic">
                  "{rev.comment || rev.message}"
                </p>
              </div>
            ))
          ) : (
            <div className="w-full py-8 md:py-10 text-center">
              <p className="text-[12px] text-slate-400 italic">No direct builder feedback yet.</p>
            </div>
          )}
        </div>
      </div>
      
      {builderReviewsRaw.length > 3 && (
        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 text-center">
          <p className="text-[9px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            ↓ Scroll to see more reviews ({builderReviewsRaw.length - 3} more)
          </p>
        </div>
      )}
    </div>
  )}
</div>
      )}
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
            <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••" 
                className={`w-full mt-8 p-5 bg-slate-50 border rounded-2xl outline-none text-center font-bold tracking-widest ${passError ? 'border-rose-500 text-rose-500' : 'border-slate-100'}`} 
            />
            {passError && <p className="text-[10px] font-black text-rose-500 uppercase mt-2 text-center">{passError}</p>}
            <div className="grid grid-cols-2 gap-4 mt-10">
              <button onClick={() => {setShowPassModal(false); setPassError(""); setPasswordInput("");}} className="py-4 px-4 font-black text-[10px] uppercase tracking-widest text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100">Cancel</button>
              <button onClick={handleConfirmPassword} className="py-4 px-4 font-black text-[10px] uppercase tracking-widest text-white bg-blue-600 rounded-2xl hover:bg-blue-700">Confirm</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
    </div>
  );
};

const MenuLink = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-400 hover:bg-blue-50 hover:text-blue-600'}`}>
    <span>{icon}</span>
    <span className="font-black text-[11px] uppercase tracking-widest">{label}</span>
    {active && <ChevronRight className="ml-auto opacity-50" size={14} strokeWidth={3} />}
  </button>
);

const ProfileInput = ({ label, value, editable, onChange }) => (
  <div className="flex flex-col gap-2 relative group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <input 
        type="text" 
        readOnly={!editable} 
        value={value || ""} 
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-4 border rounded-2xl outline-none font-bold text-sm tracking-tight transition-all ${editable ? 'bg-white border-blue-200 ring-4 ring-blue-50 text-blue-600' : 'bg-slate-50/50 border-slate-100 text-slate-700'}`} 
      />
      {editable && <Check className="absolute right-4 top-4 text-blue-400" size={16} />}
    </div>
  </div>
);

const AppointmentItem = ({ appt, isOpen, onClick, onAction, reason, setReason, isCompact, isRescheduled, isHistory }) => (
  <div className="group">
    <div 
      onClick={onClick}
      className={`grid grid-cols-6 items-center p-6 cursor-pointer transition-all ${isOpen ? 'bg-blue-50/50' : isRescheduled ? 'bg-orange-50/50 hover:bg-orange-50' : 'hover:bg-slate-50'}`}
    >
      <div className="col-span-2 flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs ${isRescheduled ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-blue-600'}`}>
          {appt.userName?.charAt(0) || "U"}
          {isRescheduled && <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>}
        </div>
        <div>
          <p className="font-black text-sm uppercase tracking-tighter text-slate-800">{appt.userName}</p>
          <p className="text-[9px] text-slate-400 font-bold uppercase">{appt.property?.title || "N/A"}</p>
          {isRescheduled && appt.oldDate && (
            <p className="text-[8px] text-orange-600 font-bold">Rescheduled from {appt.oldDate}</p>
          )}
        </div>
      </div>
      <div className="text-[10px] font-black uppercase italic text-slate-500">{appt.property?.location?.city || "N/A"}</div>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-slate-800">{new Date(appt.date).toLocaleDateString()}</span>
        <span className="text-[9px] font-bold text-blue-600">{appt.timeSlot}</span>
        {appt.oldTimeSlot && (
          <span className="text-[8px] font-bold text-orange-600">Was: {appt.oldTimeSlot}</span>
        )}
      </div>
      <div>
        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
          appt.status === 'completed' ? 'bg-green-100 text-green-600' : 
          appt.status === 'cancelled' ? 'bg-rose-100 text-rose-600' : 
          appt.oldDate ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
        }`}>
          {appt.status}
        </span>
      </div>
      <div className="text-right">
        <ChevronRight size={16} className={`inline transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>
    </div>

    {isOpen && !isCompact && (
      <div className="px-20 py-8 bg-white border-y border-slate-100 animate-in slide-in-from-top-2 duration-300">
        <div className="grid grid-cols-2 gap-10">
          <div className="space-y-4">
            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Customer Information</h5>
            <div className="grid grid-cols-2 gap-4">
               <InfoBox label="Name" value={appt.userName} />
               <InfoBox label="Phone" value={appt.userPhone} />
               <InfoBox label="User Status" value={(appt.userStatus || 'active').charAt(0).toUpperCase() + (appt.userStatus || 'active').slice(1)} />
               <div className="col-span-2">
                 <InfoBox label="Customer Note" value={appt.message || "No message provided"} />
               </div>
            </div>
            <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-6">Property Information</h5>
            <div className="grid grid-cols-2 gap-4">
               <InfoBox label="Property Title" value={appt.property?.title || "N/A"} />
               <InfoBox label="Type" value={appt.property?.propertyType || "N/A"} />
               <InfoBox label="Location" value={appt.property?.location?.area ? `${appt.property.location.area}, ${appt.property.location.city}` : "N/A"} />
               <InfoBox label="Variant" value={appt.variant || "N/A"} />
            </div>
            {appt.actionReason && (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                <h6 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Action Reason</h6>
                <p className="text-sm text-orange-800">{appt.actionReason}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <a href={`tel:${appt.userPhone}`} className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-slate-800">
                Contact Customer
              </a>
              <a href={`https://wa.me/${appt.userPhone}`} target="_blank" className="flex-1 flex items-center justify-center gap-2 border-2 border-slate-100 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-slate-50">
                Message (WhatsApp)
              </a>
            </div>
          </div>

          <div className="space-y-4 border-l border-slate-100 pl-10">
            <h5 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Appointment Status</h5>
            
            {isHistory ? (
              <div className={`p-6 rounded-3xl border text-center ${appt.status === 'completed' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                <span className={`text-[10px] font-black uppercase tracking-widest ${appt.status === 'completed' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {appt.status}
                </span>
                <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase italic">This appointment is already {appt.status}</p>
              </div>
            ) : (
              <>
                {appt.status === 'completed' ? (
                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-200 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Completed</span>
                  </div>
                ) : appt.status === 'cancelled' ? (
                  <div className="p-6 bg-rose-50 rounded-3xl border border-rose-200 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-700">Cancelled</span>
                  </div>
                ) : appt.oldDate && isRescheduled ? (
                  <div className="space-y-4">
                    <div className="bg-orange-50 p-4 rounded-xl">
                      <p className="text-sm text-orange-800 mb-2">This appointment was rescheduled by the customer.</p>
                      <p className="text-xs text-orange-600">Previous: {appt.oldDate} at {appt.oldTimeSlot}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => onAction(appt._id, 'pending')} className="bg-emerald-500 text-white p-3 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-600">Confirm New Time</button>
                      <button onClick={() => onAction(appt._id, 'cancelled')} className="bg-rose-500 text-white p-3 rounded-xl font-black text-[9px] uppercase hover:bg-rose-600">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea 
                      placeholder="Reason for Reschedule / Cancellation..."
                      className="w-full p-4 bg-slate-50 border rounded-2xl text-xs outline-none focus:ring-2 ring-blue-50"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => onAction(appt._id, 'completed')} className="bg-emerald-500 text-white p-3 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-600">Complete</button>
                      <button onClick={() => onAction(appt._id, 'rescheduled')} className="bg-amber-500 text-white p-3 rounded-xl font-black text-[9px] uppercase hover:bg-amber-600">Reschedule</button>
                      <button onClick={() => onAction(appt._id, 'cancelled')} className="bg-rose-500 text-white p-3 rounded-xl font-black text-[9px] uppercase hover:bg-rose-600">Cancel</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
);

const InfoBox = ({ label, value }) => (
  <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
    <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{label}</p>
    <p className="text-xs font-bold text-slate-800">{value}</p>
  </div>
);

const StatsCard = ({ title, count, icon, color, hasNotification }) => (
  <div className={`p-4 md:p-6 rounded-lg md:rounded-[2rem] border border-slate-100 shadow-sm ${color} flex items-center justify-between relative`}>
    <div>
      <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-xl md:text-2xl font-black text-slate-900">{count}</h3>
    </div>
    <div className="p-2 md:p-4 bg-white rounded-lg md:rounded-2xl shadow-sm relative">
      {icon}
      {hasNotification && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
      )}
    </div>
  </div>
);

const MobileMenuLink = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-black text-[9px] uppercase tracking-tighter ${
      active 
        ? "bg-blue-600 text-white shadow-md" 
        : "text-slate-600 hover:bg-blue-50"
    }`}
  >
    {icon}
    <span>{label}</span>
    {active && <ChevronRight size={14} className="ml-auto" />}
  </button>
);

export default BuilderDashboard;
