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
    <nav className="w-full bg-[#0F172A] text-white shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-wide text-[#D4AF37] whitespace-nowrap"
        >
          AAPL-GHAR
        </Link>

        {/* Mobile Menu Icon (SVG for guaranteed visibility) */}
        <div
          className="md:hidden cursor-pointer text-[#D4AF37] p-2"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          )}
        </div>

        {/* Menu */}
        <ul
          className={`${
            isOpen ? "flex" : "hidden"
          } md:flex flex-col md:flex-row items-center gap-6 md:gap-8 absolute md:static top-[68px] left-0 w-full md:w-auto bg-[#0F172A] md:bg-transparent p-8 md:p-0 border-t border-gray-800 md:border-none shadow-2xl z-50`}
        >
          {/* Common Links */}
          <li>
            <Link to="/" className="hover:text-[#D4AF37] block" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>

          {/* USER LOGIN */}
          {userToken && !adminToken && (
            <>
              <li>
                <Link to="/profile" className="hover:text-[#D4AF37] block" onClick={() => setIsOpen(false)}>
                  Profile
                </Link>
              </li>

              <li>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full md:w-auto border border-[#D4AF37] text-[#D4AF37] px-5 py-2 rounded-xl hover:bg-[#D4AF37] hover:text-black transition duration-300"
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
                  className="hover:text-[#D4AF37] block"
                  onClick={() => setIsOpen(false)}
                >
                  Your Properties
                </Link>
              </li>
               <li>
                <Link
                  to="/add-property"
                  className="hover:text-[#D4AF37] block"
                  onClick={() => setIsOpen(false)}
                >
                  Add Property
                </Link>
              </li>
              <li>
                <Link
                  to="/admin-dashboard"
                  className="block bg-[#D4AF37] text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 transition duration-300 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="w-full md:w-auto border border-[#D4AF37] text-[#D4AF37] px-5 py-2 rounded-xl hover:bg-[#D4AF37] hover:text-black transition duration-300"
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
                <Link to="/login" className="hover:text-[#D4AF37] block" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
              </li>

              <li>
                <Link to="/register" className="hover:text-[#D4AF37] block" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/AdminLogin"
                  className="block bg-[#D4AF37] text-black px-5 py-2 rounded-xl font-semibold hover:bg-yellow-500 transition duration-300 text-center"
                  onClick={() => setIsOpen(false)}
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