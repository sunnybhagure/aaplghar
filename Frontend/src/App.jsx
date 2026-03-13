
import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/Home'
import Navbar from './Components/Navbar'
import LoginPage from './Pages/LoginPage'
import RegisterPage from './Pages/RegisterPage'
import AdminLogin from './Pages/AdminLogin'
import AdminRegister from './Pages/AdminRegister'

function App() {
  

  return (
    <>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/AdminLogin" element={<AdminLogin />} />
        <Route path="/AdminRegister" element={<AdminRegister />} />


      </Routes>
    </Router>
    </>
  )
}

export default App
