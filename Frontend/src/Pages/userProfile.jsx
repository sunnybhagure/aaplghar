import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Calendar, MapPin, Phone, MessageSquare, X,
  Clock, ChevronRight, Loader2, Lock, ShieldCheck
} from "lucide-react";

const UserProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("appointments");
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Appointment States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({ name: "", email: "", phone: "" });
  const [verifyPassword, setVerifyPassword] = useState(""); // प्रोफाइल सेव्ह करण्यासाठी

  // Password Change States
  const [oldPasswordForPassChange, setOldPasswordForPassChange] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const fetchUserData = async () => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      navigate("/login");
      return;
    }
    setUser(savedUser);
    setProfileData({
      name: savedUser.name || "",
      email: savedUser.email || "",
      phone: savedUser.phone || ""
    });

    try {
      const res = await axios.get(`http://localhost:5000/api/appointments/user/${savedUser.id || savedUser._id}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  // १. प्रोफाइल माहिती अपडेट लॉजिक
 const handleSaveProfile = async () => {
  setProfileError("");
  setProfileSuccess("");

  if (!verifyPassword.trim()) {
    setProfileError("बदल सेव्ह करण्यासाठी कृपया तुमचा पासवर्ड टाका.");
    return;
  }

  try {
    const res = await axios.put(
      `http://localhost:5000/api/auth/userprofile/${user?.id || user?._id}`,
      { 
        ...profileData, 
        currentPassword: verifyPassword // खात्री कर की इथे key 'currentPassword' च आहे
      }
    );

    if (res.data.success) {
      const updatedUser = res.data.user;
      
      // १. स्टेट अपडेट करा
      setUser(updatedUser);
      
      // २. लोकल स्टोरेज अपडेट करा (सर्वात महत्त्वाचे)
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // ३. प्रोफाइल डेटा रिसेट करा जेणेकरून नवीन व्हॅल्यूज दिसतील
      setProfileData({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || ""
      });

      setProfileSuccess("प्रोफाइल माहिती यशस्वीरित्या अपडेट झाली.");
      setIsEditingProfile(false);
      setVerifyPassword("");
    }
  } catch (err) {
    setProfileError(err.response?.data?.message || "प्रोफाइल अपडेट करताना अडचण आली.");
  }
};

  // २. पासवर्ड बदलण्याचे लॉजिक
  const handleChangePassword = async () => {
    setProfileError("");
    setProfileSuccess("");

    if (!oldPasswordForPassChange || !newPassword || !confirmPassword) {
      setProfileError("कृपया सर्व पासवर्ड फील्ड्स भरा.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setProfileError("नवीन पासवर्ड मॅच होत नाहीत.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/auth/userprofile/${user?.id || user?._id}`,
        { currentPassword: oldPasswordForPassChange, newPassword }
      );

      if (res.data.success) {
        setProfileSuccess("पासवर्ड यशस्वीरित्या बदलला.");
        setOldPasswordForPassChange("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "जुना पासवर्ड चुकीचा आहे.");
    }
  };

  // Appointment Logic
  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${selectedAppointment._id}/user-reschedule`,
        { date: rescheduleData.date, timeSlot: rescheduleData.time });
      if (res.data.success) {
        setShowRescheduleModal(false);
        fetchUserData();
      }
    } catch (err) { alert("Reschedule failed"); }
  };

  const handleCancel = async (apptId) => {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/appointments/${apptId}/user-cancel`);
      if (res.data.success) fetchUserData();
    } catch (err) { alert("Cancel failed"); }
  };

  const markAsRead = async (apptId) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${apptId}/mark-read-user`);
      setAppointments(appointments.map(appt => appt._id === apptId ? { ...appt, isNewForUser: false } : appt));
    } catch (err) { console.error("Error marking read", err); }
  };

  const canReschedule = (date, timeSlot) => {
    const apptDate = new Date(`${date} ${timeSlot || "00:00"}`);
    return (apptDate - new Date()) > 24 * 60 * 60 * 1000;
  };

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
        <div className="flex gap-1 mb-10 bg-white border border-slate-200 p-1 rounded-2xl w-fit mx-auto">
          <TabButton active={activeTab === 'appointments'} label="Appointments" onClick={() => setActiveTab("appointments")} count={appointments.filter(a => a.isNewForUser).length} />
          <TabButton active={activeTab === 'profile'} label="My Profile" onClick={() => setActiveTab("profile")} />
        </div>

        {activeTab === "appointments" && (
          <div className="max-w-4xl mx-auto space-y-6">
             <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-4">Your <span className="text-blue-600">Visits</span></h2>
             {appointments.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center border border-dashed border-slate-300">
                  <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">No visits scheduled</p>
                </div>
             ) : (
               appointments.map(appt => (
                 <AppointmentCard key={appt._id} appt={appt} onMarkRead={() => markAsRead(appt._id)}
                   onReschedule={() => {
                     setSelectedAppointment(appt);
                     setRescheduleData({ date: appt.date, time: appt.timeSlot });
                     setShowRescheduleModal(true);
                   }} 
                   onCancel={() => handleCancel(appt._id)}
                   canModify={canReschedule(appt.date, appt.timeSlot)} 
                 />
               ))
             )}
          </div>
        )}

        {activeTab === "profile" && (
          <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-500">
            {/* PROFILE CARD */}
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
                      <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 block text-center">Enter Password to Confirm Changes</label>
                      <input type="password" value={verifyPassword} onChange={(e) => setVerifyPassword(e.target.value)} placeholder="Current Password" 
                        className="w-full p-4 bg-white border border-blue-100 rounded-2xl outline-none focus:ring-2 ring-blue-500/20" />
                    </div>
                    <button onClick={handleSaveProfile} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">Save Profile</button>
                  </div>
                )}
              </div>
            </div>

            {/* PASSWORD CARD */}
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tight mb-8">Change <span className="text-rose-600">Password</span></h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                  <input type="password" value={oldPasswordForPassChange} onChange={(e) => setOldPasswordForPassChange(e.target.value)} placeholder="Verify old password" 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-rose-500/10" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none" />
                  </div>
                </div>
                <button onClick={handleChangePassword} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest mt-2">Update Password</button>
              </div>
              {profileError && <p className="mt-4 p-4 bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest rounded-xl text-center">{profileError}</p>}
              {profileSuccess && <p className="mt-4 p-4 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-xl text-center">{profileSuccess}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
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

// Sub-Components
const TabButton = ({ active, label, onClick, count }) => (
  <button onClick={onClick} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative ${active ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
    {label} {count > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">{count}</span>}
  </button>
);

const ProfileStaticField = ({ icon, label, value, editable, onChange }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${editable ? 'bg-white border-blue-200 ring-4 ring-blue-50' : 'bg-slate-50 border-slate-50'}`}>
      <div className={editable ? 'text-blue-600' : 'text-slate-400'}>{icon}</div>
      {editable ? (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent font-bold text-slate-800 outline-none" />
      ) : (
        <span className="font-bold text-slate-700">{value || "Not provided"}</span>
      )}
    </div>
  </div>
);

const AppointmentCard = ({ appt, onReschedule, onCancel, canModify, onMarkRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && appt.isNewForUser) onMarkRead();
  };
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="h-14 w-14 bg-blue-50 rounded-2xl flex flex-col items-center justify-center text-blue-600">
            <span className="text-[9px] font-black uppercase leading-none">{new Date(appt.date).toLocaleString('default', { month: 'short' })}</span>
            <span className="text-xl font-black">{new Date(appt.date).getDate()}</span>
          </div>
          <div>
            <h4 className="font-black text-slate-900 tracking-tight uppercase italic">{appt.property?.title || "Property Visit"}</h4>
            <div className="flex gap-3 mt-1">
               <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><Clock size={10}/> {appt.timeSlot}</span>
               <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1"><MapPin size={10}/> {appt.property?.location?.city}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {appt.isNewForUser && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
          <button onClick={handleToggle} className={`p-2 rounded-xl bg-slate-50 text-slate-400 ${isOpen ? 'rotate-90 text-blue-600' : ''}`}><ChevronRight size={20}/></button>
        </div>
      </div>
      {isOpen && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-50 bg-slate-50/20 animate-in slide-in-from-top-2">
           <div className="flex justify-between items-end mt-4">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${appt.status === 'cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>{appt.status}</span>
              </div>
              <div className="flex gap-2">
                {canModify && appt.status !== 'cancelled' && (
                  <>
                    <button onClick={onReschedule} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-black text-[9px] uppercase tracking-widest">Reschedule</button>
                    <button onClick={onCancel} className="px-5 py-3 bg-white text-rose-600 border border-rose-100 rounded-xl font-black text-[9px] uppercase tracking-widest">Cancel</button>
                  </>
                )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;