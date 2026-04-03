import { useState, useEffect } from "react";
import axios from "axios";
import { PropertyCard } from "../Components/propertyCard";
import { Loader2, AlertCircle } from "lucide-react";

export default function YourProperties() {
  const [groupedProperties, setGroupedProperties] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

    const fetchMyProperties = async () => {
      if (!builderId) {
        setError("Builder ID sapdali nahi. Please login parat kara.");
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
        setError(err.response?.data?.message || "Properties fetch karta aalya nahit.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyProperties();
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="mb-12">
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Your Properties</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : error ? (
          <div className="bg-rose-50 p-6 rounded-3xl text-rose-600 flex items-center gap-3 border border-rose-100">
            <AlertCircle /> {error}
          </div>
        ) : (
          <div className="space-y-10">
            {Object.keys(groupedProperties).length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No properties found.</p>
              </div>
            ) : (
              Object.keys(groupedProperties).map(city => (
                <div key={city} className="space-y-4">
                  <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                    <span className="w-8 h-[2px] bg-blue-600"></span> {city}
                  </h2>
                  <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                    {groupedProperties[city].map(p => (
                      <div key={p._id} className="min-w-[300px]">
                        <PropertyCard property={p} />
                      </div>
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