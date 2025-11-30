import { useEffect, useState } from "react";
import logo from "../logo.png";
import {
  AiFillHome,
  AiOutlineLineChart,
  AiFillBell,
  AiFillSetting,
} from "react-icons/ai";

export default function Sidebar({
  override,
  setOverride,
  sidebarOpen,
  setSidebarOpen,
  activePage,
  setActivePage,
  handleOverrideClick,
}) {
  const [logoBounce, setLogoBounce] = useState(false);

  const navItems = [
    { name: "Home", icon: <AiFillHome /> },
    { name: "Charts", icon: <AiOutlineLineChart /> },
    { name: "Alerts", icon: <AiFillBell /> },
    { name: "Settings", icon: <AiFillSetting /> },
  ];

  const handleNavClick = (name) => {
    if (setActivePage) setActivePage(name);
    if (window.innerWidth < 768) setSidebarOpen(false);
  };

  useEffect(() => {
    setLogoBounce(true);
    const interval = setInterval(() => {
      setLogoBounce((prev) => !prev);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 min-h-screen h-full w-56 bg-black text-white p-4 flex flex-col items-center gap-6
                    z-50 transform transition-transform duration-500 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
                    md:translate-x-0 md:relative`}
      >
        <img
          src={logo}
          alt="Logo"
          className={`w-24 h-24 rounded-full mb-2 transition-transform duration-500 ${
            logoBounce ? "scale-105" : "scale-95"
          }`}
        />

        <h1 className="text-xl font-bold">Flood Dashboard</h1>

        {/* Manual Override */}
        <div
          className={`w-full text-center p-2 rounded-lg cursor-pointer border border-purple-600
                      ${
                        override ? "bg-purple-600" : "bg-transparent"
                      } transition-colors duration-300`}
          onClick={() => {
            handleOverrideClick
              ? handleOverrideClick()
              : setOverride((prev) => !prev);

            if (window.innerWidth < 768) setSidebarOpen(false);
          }}
        >
          {override ? "Override ON" : "Override OFF"}
        </div>

        {/* Navigation */}
        <div className="flex flex-col w-full mt-6 gap-2 relative">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-transform duration-300 ${
                activePage === item.name
                  ? "bg-purple-600 text-white font-bold scale-105"
                  : "text-white"
              }`}
              onClick={() => handleNavClick(item.name)}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
