"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { deleteCookie } from "cookies-next";
import { menuItems } from "@/constant";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    deleteCookie("token");
    router.push("/login");
  };

  return (
    <div className="flex-none sticky top-0 w-64 bg-gradient-to-b from-slate-800 to-slate-900 pb-4 h-screen pt-4 shadow-xl">
      <div className="h-full flex flex-col justify-between ml-2">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(`${item.url}/`);
            return (
              <Link
                href={`${item.url}`}
                className="w-[92%] mx-auto my-1.5"
                key={item.id}
              >
                <div
                  className={`flex flex-row gap-3 items-center p-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out
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
                    className={`text-base font-medium text-nowrap transition-colors duration-300
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
        <button
          onClick={handleLogout}
          className="w-[92%] mx-auto  my-1.5 p-2.5 px-4 rounded-lg bg-red-600 text-white font-medium transition-all duration-300 ease-in-out hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
