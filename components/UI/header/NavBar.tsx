"use client";
import React, { useState, useRef, useEffect } from "react";
import { IoMdMenu } from "react-icons/io";
import { IoCloseOutline } from "react-icons/io5";
import Link from "next/link";
import { MdDarkMode, MdLightMode } from "react-icons/md";
import { deleteCookie } from "cookies-next";
import { usePathname, useRouter } from "next/navigation";
import { menuItems } from "@/constant";
import { useTheme } from "@/provider/ThemeProvider";

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/login");
  };

  return (
    <>
      <nav className="bg-gray-800 text-white p-4 flex justify-between items-center relative z-50">
        
        <div ref={menuButtonRef} className="block md:hidden">
          <IoMdMenu
            size={30}
            className="cursor-pointer transition-all duration-300 hover:text-blue-400"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div> 

        <h1 className="text-2xl font-bold cursor-pointer hover:scale-125 transition-transform">
          <Link href={"/"}>TREX</Link>
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-muted transition-colors duration-300"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <MdLightMode
                className="cursor-pointer hover:scale-125 text-yellow-300"
                size={24}
              />
            ) : (
              <MdDarkMode
                className="cursor-pointer hover:scale-125 text-slate-300"
                size={24}
              />
            )}
          </button>
          
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg bg-destructive text-destructive-foreground font-medium transition-all duration-300 ease-in-out hover:opacity-90"
          >
            Logout
          </button>
        </div>
       
        
        {/* {theme.darkMode ? (
          <MdLightMode
            className="mr-3 cursor-pointer hover:scale-125 text-white"
            size={28}
          />
        ) : (
          <MdDarkMode
            className="mr-3 cursor-pointer hover:scale-125 text-white"
            size={28}
          />
        )} */}
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 xl:hidden min-h-screen z-50">
          <div
            ref={sidebarRef}
            className={`w-64 h-full text-white p-5 transform transition-transform bg-gradient-to-b from-slate-800 to-slate-900 z-50
                 `}
          >
            <div className="flex justify-between">
              <h2 className="text-3xl font-bold mb-5">Dashboard</h2>
              <div ref={menuButtonRef} className="closeSideBar">
                <IoCloseOutline
                  size={25}
                  className="cursor-pointer transition-all duration-300 hover:text-blue-400"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                />
              </div>
            </div>
            <div className="h-full flex flex-col justify-between ml-2 ">
              <div className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive =
                    pathname === item.url ||
                    pathname.startsWith(`${item.url}/`);
                  return (
                    <Link
                      href={`${item.url}`}
                      className="w-[92%] mx-auto my-1.5"
                      key={item.id}
                    >
                      <div
                        className={`flex flex-row gap-3 items-center p-2 px-3 rounded-lg transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? "bg-indigo-600 shadow-lg shadow-indigo-500/30"
                        : "hover:bg-slate-700/50 hover:translate-x-1"
                    }`}
                      >
                        <div
                          className={`transition-transform duration-300 ${
                            isActive ? "scale-110" : "text-slate-400"
                          }`}
                        >
                          {React.isValidElement(item.icon) &&
                            React.cloneElement(
                              item.icon as React.ReactElement<
                                React.SVGProps<SVGSVGElement>
                              >,
                              {
                                className: `w-5 h-5 ${
                                  isActive ? "text-white" : "text-slate-400"
                                }`,
                              }
                            )}
                        </div>
                        <div
                          className={`text-sm font-medium text-nowrap transition-colors duration-300
                      ${
                        isActive
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                        >
                          {item.name}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
