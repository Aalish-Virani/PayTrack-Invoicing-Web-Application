import React from "react";
import logo from "../../assets/logo.svg";
import ThemeToggle from "../ThemeToggle/ThemeToggle.jsx";
import UserProfile from "../UserProfileBtn/UserProfileBtn.jsx";

const Header = () => {
  return (
    <div>
      <header className=" z-50 bg-[#252945] | w-screen flex justify-between items-center | xl:fixed xl:h-screen xl:w-fit xl:flex-col xl:rounded-e-2xl | ">
        <span className=" bg-[#7f5cf8] hover:bg-[#9576fd] cursor-pointer | px-[22px] py-6 aspect-square rounded-e-2xl | xl:p-8 | ">
          <img src={logo} />
        </span>

        <span className="flex items-center pt-2 px-4 gap-x-8 | xs:px-6 xs:gap-x-10 | sm:px-10 sm:gap-x-12 | md:px-12 | xl:flex-col xl:w-full xl:p-0 xl:gap-x-0  ">
          <div className="xl:p-7">
            <ThemeToggle />
          </div>

          <div className="xl:p-7 xl:border-t">
            <UserProfile />
          </div>
        </span>
      </header>
    </div>
  );
};

export default Header;
