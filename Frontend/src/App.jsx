import React, { useState } from 'react';
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import LoginPage from './Pages/LoginPage'
import RegisterPage from './Pages/RegisterPage'
import AdminLogin from './Pages/AdminLogin'
import AdminRegister from './Pages/AdminRegister'
import AdminDashboard from './Pages/AdminDashboard'
import PropertyForm from './Pages/addProperty.jsx'
import PropertyShow from './Pages/propertyShow.jsx'
import YourProperties from './Pages/yourProperty.jsx'
import UpdateProperty from './Pages/updateProperty.jsx'
import UserProfile from './Pages/userProfile.jsx'
import BuilderDetails from './Pages/builderDetails.jsx'
import Alert from './Components/alert.jsx'

function App() {
  
const [flash, setFlash] = useState(null);

  const showAlert = (type, message) => {
    setFlash({ type, message });
  };

  const closeAlert = () => {
    setFlash(null);
  };
  

  return (
    <>
    <Router>
      <Navbar />
      {flash && (
          <Alert 
            type={flash.type} 
            message={flash.message} 
            onClose={closeAlert} 
          />
        )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage showAlert={showAlert} />} />
        <Route path="/register" element={<RegisterPage showAlert={showAlert} />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminRegister" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/add-property" element={<PropertyForm />} />
        <Route path="/property/:id" element={<PropertyShow />} />
        <Route path="/my-properties" element={<YourProperties />} />
        <Route path="/update-property/:id" element={<UpdateProperty />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/builder-info/:id" element={<BuilderDetails />} />
        
       

      </Routes>
    </Router>
    </>
  )
}

export default App
