import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "../aap";

const BuilderProjectCount = ({ builderId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchProjectCount = async () => {
      if (!builderId) return;
      try {
        
        const res = await axios.get(`${API}/api/admin/builder-details/${builderId}`);
        
        
        if (res.data.success && res.data.data.stats) {
          setCount(res.data.data.stats.totalProjects);
        } else {
          setCount(0);
        }
      } catch (err) {
        console.error("Error fetching project count:", err);
        setCount(0);
      }
    };

    fetchProjectCount();
  }, [builderId]);

  return <span>{count}</span>;
};

export default BuilderProjectCount;