"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../assets/images/AppLogo.png";
import { FiMenu, FiX, FiChevronDown } from "react-icons/fi";
import menuItems from "@/constants/menuItems";
import { InputText } from "primereact/inputtext";
import { Badge } from "primereact/badge";
// import "./index.css";

const Header = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpenMobile, setDropdownOpenMobile] = useState(null);
  const [dropdownOpenDesktop, setDropdownOpenDesktop] = useState(null);
  const [searchValue, setSearchValue] = useState("");

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("nav")) setDropdownOpenDesktop(null);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      {/* HEADER */}
      <header className="bg-white shadow-sm sticky top-0 z-50 px-4 md:px-10 py-3">
        {/* DESKTOP — xl+ ONLY */}
        <div className="hidden lg:grid grid-cols-[auto_1fr] grid-rows-[auto_auto] gap-y-3 items-center">
          {/* LOGO (spans 2 rows) */}
          <Link href="/" className="row-span-2 flex items-center">
            <Image src={Logo} width={120} height={90} alt="Logo" />
          </Link>

          {/* ROW 1 — SEARCH + ICONS */}
          <div className="w-full flex items-center">
            {/* COLUMN 1 — placeholder to keep balance */}
            <div className="flex-1"></div>

            {/* COLUMN 2 — CENTER SEARCHBOX */}
            <div className="flex justify-center flex-1">
              <div
                className="
        relative
        w-[42rem] lg:w-[42rem] xl:w-[50rem] 2xl:w-[52.5rem]
      "
              >
                <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#2c665e]" />
                <InputText
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search"
                  className="
          w-full outline-none border border-[#cfe2e0]
          rounded-[10px] pl-10 text-[#0d1d2c]
          h-[46px] text-[0.9rem]
        "
                />
              </div>
            </div>

            {/* COLUMN 3 — ICONS RIGHT */}
            <div className="flex items-center gap-8 flex-1 justify-center shrink-0">
              <div className="relative cursor-pointer icon-btn">
                <i className="pi pi-heart text-2xl"></i>
                <Badge
                  value="2"
                  className="custom-badge absolute -top-5 -right-5"
                />
              </div>

              <div className="relative cursor-pointer icon-btn">
                <i className="pi pi-user text-2xl"></i>
              </div>

              <div className="relative cursor-pointer icon-btn">
                <i className="pi pi-shopping-cart text-2xl"></i>
                <Badge
                  value="2"
                  className="custom-badge absolute -top-5 -right-5"
                />
              </div>

              <button
                className="join-btn flex items-center text-sm font-semibold bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition xs:hidden sm:hidden xl:block
               xl:w-44"
              >
                <i className="pi pi-user-plus mr-2"></i>{" "}
                <span className="xl:text-xs">Join Nana Organics</span>
              </button>
            </div>
          </div>

          {/* ROW 2 — MENU (ALIGNED TO SEARCHBOX) */}
          <div className="w-full flex justify-center ">
            <nav
              className="
              w-2xl lg:w-2xl xl:w-200 2xl:w-210
              flex justify-between font-medium text-[15px] text-[#0D1D2C]
            "
            >
              {menuItems.map((item, index) => (
                <div key={index} className="relative">
                  {item.hasDropdown ? (
                    <>
                      <button
                        onClick={() =>
                          setDropdownOpenDesktop(
                            dropdownOpenDesktop === index ? null : index
                          )
                        }
                        className="hover:text-green-700 flex items-center gap-1"
                      >
                        {item.label}
                        <FiChevronDown
                          className={`transition-transform ${
                            dropdownOpenDesktop === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {dropdownOpenDesktop === index && (
                        <div className="absolute top-full left-0 bg-white shadow-md rounded-md py-3 min-w-[200px] z-50">
                          {item.items.map((sub, subIndex) => (
                            <Link
                              key={subIndex}
                              href={sub.url}
                              onClick={() => setDropdownOpenDesktop(null)}
                              className="block px-4 py-2 hover:bg-gray-100 whitespace-nowrap"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href={item.url} className="hover:text-green-700">
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* MOBILE + TABLET (md & lg) */}
        <div className="flex lg:hidden items-center gap-3">
          {" "}
          {/* HAMBURGER */}
          <button className="text-3xl" onClick={() => setSidebarOpen(true)}>
            <FiMenu />
          </button>
          {/* SEARCH (full width mobile/tablet) */}
          <div className="relative flex-1">
            <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-[#2c665e]" />
            <InputText
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search"
              className="
                w-full outline-none border border-[#cfe2e0]
                rounded-[10px] pl-10 text-[#0d1d2c]
                h-[38px] text-[0.8rem]
              "
            />
          </div>
          {/* ICONS */}
          {/* <div className="flex items-center gap-2 text-2xl text-[#0D1D2C] shrink-0">
            <div className="relative cursor-pointer icon-btn">
              <i className="pi pi-heart text-2xl"></i>
              <Badge
                value="23"
                className="custom-badge absolute -top-3 -right-4"
              />
            </div>
            <div className="relative cursor-pointer icon-btn">
              <i className="pi pi-heart text-2xl"></i>
              <Badge
                value="2"
                className="custom-badge absolute -top-3 -right-4"
              />
            </div>
          </div> */}
        </div>
      </header>

      {/* SIDEBAR FOR MOBILE + TABLET */}
      <aside
        className={`fixed top-0 left-0 h-full w-[72%] sm:w-[55%] bg-white shadow-xl z-[999] px-5 py-5 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-lg">Menu</h2>
          <button onClick={() => setSidebarOpen(false)} className="text-3xl">
            <FiX />
          </button>
        </div>

        <ul className="flex flex-col gap-4 mt-6">
          {menuItems.map((item, index) => (
            <li key={index}>
              {item.hasDropdown ? (
                <>
                  <button
                    className="flex justify-between items-center w-full font-medium text-[16px]"
                    onClick={() =>
                      setDropdownOpenMobile(
                        dropdownOpenMobile === index ? null : index
                      )
                    }
                  >
                    {item.label}
                    <FiChevronDown
                      className={`transition-transform ${
                        dropdownOpenMobile === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {dropdownOpenMobile === index && (
                    <ul className="ml-3 mt-2 flex flex-col gap-3 border-l pl-3">
                      {item.items.map((sub, subIndex) => (
                        <Link
                          key={subIndex}
                          href={sub.url}
                          onClick={() => setSidebarOpen(false)}
                          className="text-[15px] text-gray-700 hover:text-green-700"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.url}
                  onClick={() => setSidebarOpen(false)}
                  className="font-medium text-[16px] hover:text-green-700 block"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </aside>

      {/* OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-[998] xl:hidden"
        ></div>
      )}
    </>
  );
};

export default Header;
