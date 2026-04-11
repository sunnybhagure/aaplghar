import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Calendar, MapPin, Phone, MessageSquare, X,
  Clock, ChevronRight, Loader2, Lock, ShieldCheck, Info,
  Star, Trash2, Building2, Home
} from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appointments");
  const [reviewFilter, setReviewFilter] = useState("property");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [propertyReviews, setPropertyReviews] = useState([]);
  const [builderReviews, setBuilderReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Appointment States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "" });
  const [verifyPassword, setVerifyPassword] = useState("");

  const [oldPasswordForPassChange, setOldPasswordForPassChange] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const fetchUserData = async () => {
  const token = localStorage.getItem("token");
  const savedUserRaw = localStorage.getItem("user");
  
  let savedUser = null;
  try {
    if (savedUserRaw) savedUser = JSON.parse(savedUserRaw);
  } catch (e) {
    console.error("User parsing error", e);
  }

  if (!savedUser) {
    navigate("/login");
    return;
  }

  setUser(savedUser);
  const userId = savedUser.id || savedUser._id;
  setProfileData({
    name: savedUser.name || "",
    email: savedUser.email || "",
    phone: savedUser.phone || ""
  });

  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };

    // API Calls
    const [resAppt, resPropRev, resBuildRev] = await Promise.all([
      axios.get(`http://localhost:5000/api/appointments/user/${userId}`, config),
      axios.get(`http://localhost:5000/api/reviews/user/${userId}`, config),
      axios.get(`http://localhost:5000/api/builder-reviews/user/${userId}`, config)
    ]);

    // --- इथे लक्ष दे ---
    console.log("Frontend Appointment Data:", resAppt.data); 
    
    // जर डेटा डायरेक्ट एरे (Array) असेल तर:
    setAppointments(resAppt.data); 
    
    // जर डेटा { success: true, data: [...] } असा येत असेल तर:
    // setAppointments(resAppt.data.data || []);

    if (resPropRev.data.success) setPropertyReviews(resPropRev.data.data);
    if (resBuildRev.data.success) setBuilderReviews(resBuildRev.data.data);

  } catch (err) {
    console.error("Error fetching data:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // Review Deletion Logic (Alerts in English)
  const handleDeleteReview = async (id, type) => {
    if (!window.confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please login again.");
        return;
      }

      const url = type === 'property'
        ? `http://localhost:5000/api/reviews/delete/${id}`
        : `http://localhost:5000/api/builder-reviews/${id}`;

      const res = await axios.delete(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        if (type === 'property') {
          setPropertyReviews(prev => prev.filter(r => r._id !== id));
        } else {
          setBuilderReviews(prev => prev.filter(r => r._id !== id));
        }
        alert("Review deleted successfully!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed!");
    }
  };

  const handleSaveProfile = async () => {
    setProfileError(""); setProfileSuccess("");
    if (!verifyPassword.trim()) { setProfileError("Please enter your password to save changes."); return; }
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/userprofile/${user?.id || user?._id}`, { ...profileData, currentPassword: verifyPassword });
      if (res.data.success) {
        const updatedUser = res.data.user;
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfileSuccess("Profile updated successfully!");
        setIsEditingProfile(false); setVerifyPassword("");
      }
    } catch (err) { setProfileError(err.response?.data?.message || "Profile update failed."); }
  };

  const handleChangePassword = async () => {
    setProfileError(""); setProfileSuccess("");
    if (!oldPasswordForPassChange || !newPassword || !confirmPassword) { setProfileError("All fields are required."); return; }
    if (newPassword !== confirmPassword) { setProfileError("Passwords do not match."); return; }
    try {
      const res = await axios.put(`http://localhost:5000/api/auth/userprofile/${user?.id || user?._id}`, { currentPassword: oldPasswordForPassChange, newPassword });
      if (res.data.success) { setProfileSuccess("Password updated successfully!"); setOldPasswordForPassChange(""); setNewPassword(""); setConfirmPassword(""); }
    } catch (err) { setProfileError(err.response?.data?.message || "Incorrect old password."); }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${selectedAppointment._id}/user-reschedule`, { date: rescheduleData.date, timeSlot: rescheduleData.time });
      if (res.data.success) { setShowRescheduleModal(false); fetchUserData(); }
    } catch (err) { alert(err.response?.data?.message || "Reschedule failed"); }
  };

  const handleCancel = async (apptId) => {
    if (!window.confirm("Do you want to cancel this visit?")) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${apptId}/user-cancel`);
      if (res.data.success) fetchUserData();
    } catch (err) { alert(err.response?.data?.message || "Cancel failed"); }
  };

  const markAsRead = async (apptId) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${apptId}/mark-read-user`);
      setAppointments(prev => prev.map(appt => appt._id === apptId ? { ...appt, isNewForUser: false } : appt));
    } catch (err) { console.error("Error marking read", err); }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'rescheduled');
  const pastAppointments = appointments.filter(a => a.status === 'confirmed' || a.status === 'cancelled' || a.status === 'completed');

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-8 flex items-center gap-6">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">{user?.name}</h1>
            <p className="text-slate-500 font-medium tracking-wide">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-10 bg-white border border-slate-200 p-1 rounded-2xl w-fit mx-auto overflow-x-auto">
          <TabButton active={activeTab === 'appointments'} label="Visits" onClick={() => setActiveTab("appointments")} count={appointments.filter(a => a.isNewForUser).length} />
          <TabButton active={activeTab === 'reviews'} label="Reviews" onClick={() => setActiveTab("reviews")} />
          <TabButton active={activeTab === 'profile'} label="My Profile" onClick={() => setActiveTab("profile")} />
        </div>

        {/* --- APPOINTMENTS TAB --- */}
        {activeTab === "appointments" && (
          <div className="max-w-4xl mx-auto space-y-12">
            <section>
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-6 flex items-center gap-2">
                Active <span className="text-blue-600">Requests</span>
                <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full not-italic">{pendingAppointments.length}</span>
              </h2>
              <div className="space-y-4">
                {pendingAppointments.length === 0 ? (
                  <p className="text-slate-400 text-xs font-bold uppercase py-10 text-center border-2 border-dashed border-slate-200 rounded-[2rem]">No active visits</p>
                ) : (
                  pendingAppointments.map((appt) => (
                    <AppointmentCard key={appt._id} appt={appt} onMarkRead={() => markAsRead(appt._id)} onReschedule={() => { setSelectedAppointment(appt); setRescheduleData({ date: appt.date, time: appt.timeSlot }); setShowRescheduleModal(true); }} onCancel={() => handleCancel(appt._id)} />
                  ))
                )}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-black text-slate-400 uppercase italic tracking-tight mb-6 flex items-center gap-2">
                History <span className="text-slate-300">Section</span>
              </h2>
              <div className="space-y-4 opacity-80">
                {pastAppointments.map((appt) => (
                  <AppointmentCard key={appt._id} appt={appt} onMarkRead={() => markAsRead(appt._id)} />
                ))}
              </div>
            </section>
          </div>
        )}

        {/* --- REVIEWS TAB --- */}
        {activeTab === "reviews" && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center gap-4 mb-8">
               <button onClick={() => setReviewFilter("property")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reviewFilter === 'property' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                 <Home size={14}/> Property Reviews
               </button>
               <button onClick={() => setReviewFilter("builder")} className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${reviewFilter === 'builder' ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                 <Building2 size={14}/> Builder Reviews
               </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewFilter === "property" ? (
                propertyReviews.length === 0 ? <EmptyState msg="No Property Reviews Found" /> :
                propertyReviews.map(rev => (
                  <ReviewCard key={rev._id} review={rev} type="property" onDelete={() => handleDeleteReview(rev._id, 'property')} />
                ))
              ) : (
                builderReviews.length === 0 ? <EmptyState msg="No Builder Reviews Found" /> :
                builderReviews.map(rev => (
                  <ReviewCard key={rev._id} review={rev} type="builder" onDelete={() => handleDeleteReview(rev._id, 'builder')} />
                ))
              )}
            </div>
          </div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === "profile" && (
          <div className="flex flex-col items-center space-y-8">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Account <span className="text-blue-600">Details</span></h2>
                <button onClick={() => { setIsEditingProfile(!isEditingProfile); setProfileError(""); }}
                  className={`text-[10px] font-black uppercase tracking-widest py-3 px-5 rounded-2xl transition-all ${isEditingProfile ? 'bg-slate-100 text-slate-500' : 'bg-blue-600 text-white shadow-lg'}`}>
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <div className="space-y-4">
                <ProfileStaticField icon={<User size={18}/>} label="Name" value={profileData.name} editable={isEditingProfile} onChange={(val) => setProfileData({...profileData, name: val})} />
                <ProfileStaticField icon={<MessageSquare size={18}/>} label="Email" value={profileData.email} editable={isEditingProfile} onChange={(val) => setProfileData({...profileData, email: val})} />
                <ProfileStaticField icon={<Phone size={18}/>} label="Phone" value={profileData.phone} editable={isEditingProfile} onChange={(val) => setProfileData({...profileData, phone: val})} />
                {isEditingProfile && (
                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-4">
                    <div className="bg-blue-50/50 p-4 rounded-2xl">
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block text-center">Confirm Password</label>
                      <input type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} placeholder="Current Password" 
                        className="w-full p-4 bg-white border border-blue-100 rounded-2xl outline-none" />
                    </div>
                    <button onClick={handleSaveProfile} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Save Profile</button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-8">Change <span className="text-rose-600">Password</span></h2>
              <div className="space-y-4">
                <input type="password" value={oldPasswordForPassChange} onChange={(e) => setOldPasswordForPassChange(e.target.value)} placeholder="Old Password" 
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm" className="p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                </div>
                <button onClick={handleChangePassword} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Update Password</button>
              </div>
              {profileError && <p className="mt-4 text-rose-600 text-[9px] font-black uppercase text-center">{profileError}</p>}
              {profileSuccess && <p className="mt-4 text-emerald-600 text-[9px] font-black uppercase text-center">{profileSuccess}</p>}
            </div>
          </div>
        )}
      </div>

      {showRescheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between">
              <h3 className="font-black uppercase tracking-widest text-xs">Reschedule Visit</h3>
              <button onClick={() => setShowRescheduleModal(false)}><X size={18}/></button>
            </div>
            <div className="p-8 space-y-4">
              <input type="date" value={rescheduleData.date} onChange={(e) => setRescheduleData({...rescheduleData, date: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl outline-none" min={new Date().toISOString().split('T')[0]} />
              <input type="time" value={rescheduleData.time} onChange={(e) => setRescheduleData({...rescheduleData, time: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl outline-none" />
              <button onClick={handleReschedule} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Confirm New Slot</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ReviewCard = ({ review, type, user, onDelete }) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative group overflow-hidden flex flex-col justify-between">
    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <button onClick={onDelete} className="p-2 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
        <Trash2 size={16} />
      </button>
    </div>
    
    <div>
      <div className="mb-3">
        {type === 'property' ? (
          <div>
            <h4 className="text-[9px] font-black text-blue-600 uppercase tracking-tighter italic">Property Review</h4>
            <p className="text-sm font-black text-slate-900 uppercase italic leading-none">
              {review.property?.title || "Property Deleted"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
              <MapPin size={10}/> {review.property?.location?.city || "N/A"}
            </p>
          </div>
        ) : (
          // ReviewCard मधील बिल्डर सेक्शन असा अपडेट करा:
          <div>
            <h4 className="text-[9px] font-black text-orange-600 uppercase tracking-tighter italic">Builder Review</h4>
            <p className="text-sm font-black text-slate-900 uppercase italic leading-none">
              {/* आता आपण builderId पॉप्युलेट केला आहे */}
              {review.builderId?.name || "Official Builder"}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1 flex items-center gap-1">
              <Building2 size={10}/> {review.builderId?.companyName || "Real Estate Group"}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 mb-3">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={12} className={i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
        ))}
      </div>
      <p className="text-slate-700 font-medium text-xs leading-relaxed mb-4 italic">"{review.comment}"</p>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-black text-[9px]">
          {user?.name ? user.name[0] : "U"}
        </div>
        <div>
          <p className="text-[9px] font-black text-slate-800 uppercase leading-none">{user?.name || "User"}</p>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
            {new Date(review.createdAt).toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const EmptyState = ({ msg }) => (
  <div className="col-span-full py-20 bg-white border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center">
    <MessageSquare className="text-slate-200 mb-4" size={40} />
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{msg}</p>
  </div>
);

const TabButton = ({ active, label, onClick, count }) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
    {label} {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>}
  </button>
);

const ProfileStaticField = ({ icon, label, value, editable, onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${editable ? 'bg-white border-blue-200 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-50'}`}>
      <div className={editable ? 'text-blue-600' : 'text-slate-400'}>{icon}</div>
      {editable ? <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-bold text-slate-800 outline-none" /> : <span className="font-bold text-slate-700">{value || "Not provided"}</span>}
    </div>
  </div>
);

const AppointmentCard = ({ appt, onReschedule, onCancel, onMarkRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isRescheduledByBuilder = appt.status === 'rescheduled';
  const handleToggle = () => { setIsOpen(!isOpen); if (!isOpen && appt.isNewForUser) onMarkRead(); };
  return (
    <div className={`bg-white rounded-[2rem] border transition-all overflow-hidden ${appt.isNewForUser ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-100 shadow-sm'}`}>
      <div onClick={handleToggle} className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-50/50">
        <div className="flex items-center gap-5">
          <div className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center font-black ${appt.status === 'cancelled' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-600'}`}>
            <span className="text-[9px] uppercase leading-none">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
            <span className="text-xl">{new Date(appt.date).getDate()}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-slate-900 tracking-tight uppercase italic">{appt.property?.title || "Property Visit"}</h4>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md border ${appt.status === 'rescheduled' ? 'bg-orange-50 text-orange-600 border-orange-100' : appt.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : (appt.status === 'confirmed' || appt.status === 'completed') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-600'}`}>{appt.status}</span>
            </div>
            <div className="flex gap-3 mt-1 text-[9px] font-bold text-slate-400 uppercase">
               <span className="flex items-center gap-1"><Clock size={10}/> {appt.timeSlot}</span>
               <span className="flex items-center gap-1"><MapPin size={10}/> {appt.property?.location?.city || 'Unknown'}</span>
            </div>
          </div>
        </div>
        <ChevronRight size={20} className={`text-slate-300 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      {isOpen && (
        <div className="px-6 pb-6 pt-4 border-t border-slate-50 bg-slate-50/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 text-[11px]">
              <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest border-b border-slate-200 pb-1">Appointment Details</p>
              <p className="text-slate-500">Visitor: <span className="text-slate-900 font-bold">{appt.userName}</span></p>
              <p className="text-slate-500">Contact: <span className="text-slate-900 font-bold">{appt.userPhone}</span></p>
              <p className="text-slate-500">Variant: <span className="text-blue-600 font-bold uppercase">{appt.variant}</span></p>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-900 uppercase italic tracking-widest border-b border-slate-200 pb-1">Builder Contact</p>
              <a href={`tel:${appt.builder?.phone}`} className="flex items-center justify-between w-full p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-300 transition-colors">
                 <span className="text-[11px] font-bold text-slate-700">{appt.builder?.companyName || "Contact Builder"}</span>
                 <Phone size={14} className="text-blue-600" />
              </a>
              {appt.actionReason && (
                <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl flex gap-3 text-[11px]">
                  <Info size={14} className="text-orange-500 mt-0.5 shrink-0" />
                  <div><p className="text-[9px] font-black text-orange-600 uppercase mb-1">Builder's Note:</p><p className="text-orange-800 leading-relaxed font-medium">{appt.actionReason}</p></div>
                </div>
              )}
            </div>
          </div>
          {appt.status !== 'cancelled' && appt.status !== 'confirmed' && appt.status !== 'completed' && (
            <div className="mt-6 flex gap-3">
              <button onClick={(e) => { e.stopPropagation(); onReschedule(); }} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm ${isRescheduledByBuilder ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'}`}>{isRescheduledByBuilder ? 'Accept / Re-Reschedule' : 'Reschedule'}</button>
              <button onClick={(e) => { e.stopPropagation(); onCancel(); }} className="px-6 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest">Cancel Visit</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;