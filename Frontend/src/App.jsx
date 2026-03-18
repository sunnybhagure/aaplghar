
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import LoginPage from './Pages/LoginPage'
import RegisterPage from './Pages/RegisterPage'
import AdminLogin from './Pages/AdminLogin'
import AdminRegister from './Pages/AdminRegister'
import AddProperty from './Pages/Addproperties'
import Properties from './Pages/properties'
import PropertyShowPage from './Pages/propertyShowPage'
import YourProperties from './Pages/yourProperties'

function App() {
  

  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminRegister" element={<AdminRegister />} />
        <Route path="/admin-add-property" element={<AddProperty />} />
        <Route path="/property/:id" element={<PropertyShowPage />} />
        <Route path="/my-properties" element={<YourProperties />} />
        


      </Routes>
    </Router>
    </>
  )
}

export default App
