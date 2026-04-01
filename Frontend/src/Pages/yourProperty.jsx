import { useState, useEffect } from "react";
import axios from "axios";
import { PropertyCard } from "../Components/propertyCard";
import { Loader2, MapPin, Building2, AlertCircle } from "lucide-react";

export default function YourProperties() {
  const [groupedProperties, setGroupedProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(""); // Debugging sathi

  useEffect(() => {
    const getBuilderId = () => {
      const userDataRaw = localStorage.getItem("user");
      const adminIdRaw = localStorage.getItem("adminId");
      const builderIdRaw = localStorage.getItem("builderId");

      // Debugging string banvane
      setDebugInfo(`UserKey: ${userDataRaw ? "Found" : "Null"}, AdminKey: ${adminIdRaw ? "Found" : "Null"}`);

      if (userDataRaw) {
        try {
          const userObj = JSON.parse(userDataRaw);
          return userObj._id || userObj.id;
        } catch (e) { return null; }
      }
      return (adminIdRaw || builderIdRaw)?.replace(/"/g, '');
    };

    const builderId = getBuilderId();

    const fetchMyProperties = async () => {
      if (!builderId) {
        setError("Builder ID sapdali nahi. LocalStorage check kara.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:5000/api/property/builder/${builderId}`);
        const data = res.data.data || res.data || [];
        
        if (data.length === 0) {
          setGroupedProperties({});
        } else {
          const groups = data.reduce((acc, property) => {
            const city = property.location?.city || property.city || "Other";
            if (!acc[city]) acc[city] = [];
            acc[city].push(property);
            return acc;
          }, {});
          setGroupedProperties(groups);
        }
      } catch (err) {
        setError(err.response?.data?.message || "API Error: Properties bhetlya nahit.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* DEBUG PANEL - He kaam jhalya var kadhun taka */}
        <div className="mb-4 p-2 bg-black text-green-400 text-[10px] font-mono rounded-lg">
          DEBUG: {debugInfo} | LS_KEYS: {Object.keys(localStorage).join(", ")}
        </div>

        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Your Properties</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>
        ) : error ? (
          <div className="bg-rose-50 p-6 rounded-3xl text-rose-600 flex items-center gap-3">
            <AlertCircle /> {error}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(groupedProperties).length === 0 ? (
              <p className="text-center text-slate-400">No properties found for this ID.</p>
            ) : (
              Object.keys(groupedProperties).map(city => (
                <div key={city}>
                  <h2 className="text-2xl font-bold mb-4">{city}</h2>
                  <div className="flex gap-6 overflow-x-auto pb-4">
                    {groupedProperties[city].map(p => (
                      <PropertyCard key={p._id} property={p} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}