import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const userToken = localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav className="w-full bg-[#0F172A] text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide text-[#D4AF37]"
        >
          AAPL-GHAR
        </Link>

        {/* Mobile Menu Icon */}
        <div
          className="md:hidden cursor-pointer text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>

        {/* Menu */}
        <ul
          className={`${
            isOpen ? "block" : "hidden"
          } md:flex items-center gap-8 absolute md:static top-20 left-0 w-full md:w-auto bg-[#0F172A] md:bg-transparent p-6 md:p-0`}
        >
          {/* Common Links */}
          <li>
            <Link to="/" className="hover:text-[#D4AF37]">
              Home
            </Link>
          </li>

          <li>
            <Link to="/properties" className="hover:text-[#D4AF37]">
              Properties
            </Link>
          </li>

          {/* USER LOGIN */}
          {userToken && !adminToken && (
            <>
              <li>
                <Link to="/profile" className="hover:text-[#D4AF37]">
                  Profile
                </Link>
              </li>

              <li>
                <Link to="/appointment" className="hover:text-[#D4AF37]">
                  Appointment
                </Link>
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className="border border-[#D4AF37] text-[#D4AF37] px-5 py-2 rounded-xl hover:bg-[#D4AF37] hover:text-black transition duration-300"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {/* ADMIN LOGIN */}
          {adminToken && (
            <>
               <li>
                <Link
                  to="/my-properties"
                  className="hover:text-[#D4AF37]"
                >
                  Your Properties
                </Link>
              </li>
               <li>
                <Link
                  to="/add-property"
                  className="hover:text-[#D4AF37]"
                >
                  Add Property
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-dashboard"
                  className="bg-[#D4AF37] text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 transition duration-300"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className="border border-[#D4AF37] text-[#D4AF37] px-5 py-2 rounded-xl hover:bg-[#D4AF37] hover:text-black transition duration-300"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {/* GUEST USER */}
          {!userToken && !adminToken && (
            <>
              <li>
                <Link to="/login" className="hover:text-[#D4AF37]">
                  Login
                </Link>
              </li>

              <li>
                <Link to="/register" className="hover:text-[#D4AF37]">
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/AdminLogin"
                  className="bg-[#D4AF37] text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 transition duration-300"
                >
                  Add Your Property
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;